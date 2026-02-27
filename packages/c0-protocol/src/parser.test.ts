import { describe, expect, it } from 'vitest';

import { createStreamParser, parseResponse } from './parser.js';
import { serializeResponse } from './serializer.js';
import { wrapContent, wrapThinkItem, wrapArtifact, wrapContext, wrapCustomMarkdown } from './tags.js';

describe('parseResponse (one-shot)', () => {
  it('parses content tag', () => {
    const xml = wrapContent('Hello world');
    const result = parseResponse(xml);

    expect(result.parts).toHaveLength(1);
    expect(result.parts[0]).toEqual({ type: 'content', data: 'Hello world' });
  });

  it('parses think items', () => {
    const xml = wrapThinkItem('Analyzing', 'Looking at the data...', true);
    const result = parseResponse(xml);

    expect(result.think).toHaveLength(1);
    expect(result.think[0]).toEqual({
      title: 'Analyzing',
      content: 'Looking at the data...',
      ephemeral: true,
    });
  });

  it('parses non-ephemeral think items', () => {
    const xml = wrapThinkItem('Step 1', 'Doing something', false);
    const result = parseResponse(xml);

    expect(result.think[0].ephemeral).toBe(false);
  });

  it('parses artifact', () => {
    const data = '{"component":"Chart","props":{"type":"bar"}}';
    const xml = wrapArtifact(data, { type: 'chart', id: 'test-1', version: 1 });
    const result = parseResponse(xml);

    expect(result.parts).toHaveLength(1);
    const artifact = result.parts[0];
    expect(artifact.type).toBe('artifact');
    if (artifact.type === 'artifact') {
      expect(artifact.artifactType).toBe('chart');
      expect(artifact.id).toBe('test-1');
      expect(artifact.version).toBe(1);
      // Data is HTML-escaped then decoded by parser
      expect(artifact.data).toBe(data);
    }
  });

  it('parses context', () => {
    const xml = wrapContext('{"key":"value"}');
    const result = parseResponse(xml);

    expect(result.context).toBe('{"key":"value"}');
  });

  it('parses custom markdown', () => {
    const xml = wrapCustomMarkdown('# Hello\n\nSome **bold** text');
    const result = parseResponse(xml);

    expect(result.parts).toHaveLength(1);
    expect(result.parts[0].type).toBe('customMarkdown');
    if (result.parts[0].type === 'customMarkdown') {
      expect(result.parts[0].data.content).toBe('# Hello\n\nSome **bold** text');
    }
  });

  it('parses complex multi-part response', () => {
    const xml = [
      wrapThinkItem('Step 1', 'Analyzing request', true),
      wrapContent('Here is your chart:'),
      wrapArtifact('{"component":"Chart"}', { type: 'chart', id: 'c-1', version: 1 }),
      wrapContext('{"source":"api"}'),
    ].join('');

    const result = parseResponse(xml);

    expect(result.think).toHaveLength(1);
    expect(result.parts).toHaveLength(2); // content + artifact
    expect(result.context).toBe('{"source":"api"}');
  });
});

describe('createStreamParser (streaming)', () => {
  it('incrementally parses content chunks', () => {
    const parser = createStreamParser();

    parser.write('<content thesys="true">Hel');
    let result = parser.getResult();
    expect(result.parts).toHaveLength(1);
    expect(result.parts[0].type).toBe('content');
    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('Hel');
    }

    parser.write('lo world');
    result = parser.getResult();
    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('Hello world');
    }

    parser.write('</content>');
    result = parser.getResult();
    expect(result.isContentClosed).toBe(true);
  });

  it('handles interleaved think and content', () => {
    const parser = createStreamParser();

    parser.write('<thinkitem ephemeral="true">');
    parser.write('<thinkitemtitle>Thinking</thinkitemtitle>');
    parser.write('<thinkitemcontent>Processing...</thinkitemcontent>');
    parser.write('</thinkitem>');

    let result = parser.getResult();
    expect(result.think).toHaveLength(1);
    expect(result.think[0].title).toBe('Thinking');

    parser.write('<content thesys="true">Result here</content>');
    result = parser.getResult();
    expect(result.parts).toHaveLength(1);
    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('Result here');
    }
  });

  it('resets cleanly', () => {
    const parser = createStreamParser();
    parser.write('<content thesys="true">Some data</content>');
    expect(parser.getResult().parts).toHaveLength(1);

    parser.reset();
    const result = parser.getResult();
    expect(result.parts).toHaveLength(0);
    expect(result.think).toHaveLength(0);
    expect(result.context).toBe('');
  });

  it('handles text outside tags as content', () => {
    const parser = createStreamParser();
    parser.write('Plain text without tags');
    const result = parser.getResult();

    expect(result.parts).toHaveLength(1);
    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('Plain text without tags');
    }
  });
});

describe('serializeResponse (round-trip)', () => {
  it('round-trips content correctly', () => {
    const original = wrapContent('Hello world');
    const parsed = parseResponse(original);
    const serialized = serializeResponse(parsed);
    const reparsed = parseResponse(serialized);

    expect(reparsed.parts).toHaveLength(1);
    if (reparsed.parts[0].type === 'content') {
      expect(reparsed.parts[0].data).toBe('Hello world');
    }
  });

  it('round-trips complex response', () => {
    const original = [
      wrapThinkItem('Step', 'Details', true),
      wrapContent('Main text'),
      wrapArtifact('{"a":1}', { type: 'chart', id: 'id-1', version: 2 }),
      wrapContext('ctx'),
    ].join('');

    const parsed = parseResponse(original);
    const serialized = serializeResponse(parsed);
    const reparsed = parseResponse(serialized);

    expect(reparsed.think).toHaveLength(1);
    expect(reparsed.think[0].title).toBe('Step');
    expect(reparsed.parts).toHaveLength(2);
    expect(reparsed.context).toBe('ctx');
  });
});

// ─── StreamParserOptions callbacks ────────────────────────

describe('createStreamParser with options (callbacks)', () => {
  it('calls onArtifact when </artifact> closes', () => {
    const artifacts: any[] = [];
    const parser = createStreamParser({
      onArtifact: (a) => artifacts.push(a),
    });

    parser.write('<artifact type="chart" id="cb-1" version="1">');
    expect(artifacts).toHaveLength(0);

    parser.write('{"component":"Chart"}</artifact>');
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].type).toBe('artifact');
    expect(artifacts[0].artifactType).toBe('chart');
    expect(artifacts[0].id).toBe('cb-1');
    expect(artifacts[0].data).toBe('{"component":"Chart"}');
  });

  it('calls onThink when </thinkitemcontent> closes', () => {
    const thinks: any[] = [];
    const parser = createStreamParser({
      onThink: (item) => thinks.push(item),
    });

    parser.write('<thinkitem ephemeral="true">');
    parser.write('<thinkitemtitle>Analyzing</thinkitemtitle>');
    expect(thinks).toHaveLength(0);

    parser.write('<thinkitemcontent>Deep thought</thinkitemcontent>');
    expect(thinks).toHaveLength(1);
    expect(thinks[0].title).toBe('Analyzing');
    expect(thinks[0].content).toBe('Deep thought');
    expect(thinks[0].ephemeral).toBe(true);
  });

  it('calls onContent when </content> closes', () => {
    const contents: string[] = [];
    const parser = createStreamParser({
      onContent: (c) => contents.push(c),
    });

    parser.write('<content thesys="true">Hello ');
    expect(contents).toHaveLength(0);

    parser.write('world</content>');
    expect(contents).toHaveLength(1);
    expect(contents[0]).toBe('Hello world');
  });

  it('works without options (backward compat)', () => {
    const parser = createStreamParser();
    parser.write('<content thesys="true">Hi</content>');
    const result = parser.getResult();
    expect(result.parts[0].type).toBe('content');
    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('Hi');
    }
  });

  it('fires multiple callbacks for a complex response', () => {
    const artifacts: any[] = [];
    const thinks: any[] = [];
    const contents: string[] = [];

    const parser = createStreamParser({
      onArtifact: (a) => artifacts.push(a),
      onThink: (t) => thinks.push(t),
      onContent: (c) => contents.push(c),
    });

    parser.write('<thinkitem ephemeral="true">');
    parser.write('<thinkitemtitle>Step 1</thinkitemtitle>');
    parser.write('<thinkitemcontent>Thinking...</thinkitemcontent>');
    parser.write('</thinkitem>');
    parser.write('<content thesys="true">Here is the chart:</content>');
    parser.write('<artifact type="chart" id="a1" version="1">{"c":"Chart"}</artifact>');

    expect(thinks).toHaveLength(1);
    expect(contents).toHaveLength(1);
    expect(artifacts).toHaveLength(1);
    expect(contents[0]).toBe('Here is the chart:');
  });
});

// ─── getState alias ──────────────────────────────────────

describe('getState() alias', () => {
  it('returns the same result as getResult()', () => {
    const parser = createStreamParser();
    parser.write('<content thesys="true">Hello</content>');

    const fromGetResult = parser.getResult();
    const fromGetState = parser.getState();

    expect(fromGetState).toEqual(fromGetResult);
  });

  it('reflects current state during streaming', () => {
    const parser = createStreamParser();
    parser.write('<content thesys="true">Partial');

    const state = parser.getState();
    expect(state.parts).toHaveLength(1);
    expect(state.isContentClosed).toBe(false);
  });
});

// ─── Edge Cases ───────────────────────────────────────────

describe('edge cases', () => {
  it('handles HTML entities in content', () => {
    const xml = wrapContent('Price: $100 < $200 & "quoted"');
    const result = parseResponse(xml);

    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('Price: $100 < $200 & "quoted"');
    }
  });

  it('handles multiple think items', () => {
    const xml = [
      wrapThinkItem('Step 1', 'First', true),
      wrapThinkItem('Step 2', 'Second', false),
      wrapThinkItem('Step 3', 'Third', true),
    ].join('');
    const result = parseResponse(xml);

    expect(result.think).toHaveLength(3);
    expect(result.think[0].title).toBe('Step 1');
    expect(result.think[1].title).toBe('Step 2');
    expect(result.think[2].title).toBe('Step 3');
    expect(result.think[1].ephemeral).toBe(false);
  });

  it('handles empty content tag', () => {
    const result = parseResponse('<content thesys="true"></content>');
    expect(result.parts).toHaveLength(1);
    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('');
    }
  });

  it('handles streaming with very small chunks (1 char at a time)', () => {
    const parser = createStreamParser();
    const xml = '<content thesys="true">ABC</content>';

    for (const char of xml) {
      parser.write(char);
    }

    const result = parser.getResult();
    if (result.parts[0].type === 'content') {
      expect(result.parts[0].data).toBe('ABC');
    }
    expect(result.isContentClosed).toBe(true);
  });

  it('simulates realistic LLM streaming with mixed tags', () => {
    const parser = createStreamParser();

    // LLM starts with thinking
    parser.write('<thinkitem ephemeral="true"><thinkitemtitle>Ana');
    parser.write('lyzing</thinkitemtitle><thinkitemcontent>Processing');
    parser.write(' the request...</thinkitemcontent></thinkitem>');

    expect(parser.getResult().think).toHaveLength(1);
    expect(parser.getResult().think[0].title).toBe('Analyzing');

    // Then content
    parser.write('<content thesys="true">Here is ');
    parser.write('your **dashboard**:');
    parser.write('</content>');

    // Then artifact
    parser.write('<artifact type="chart" id="rev-chart" version="1">');
    parser.write('{"component":"Chart","props":{');
    parser.write('"type":"bar","data":[{"label":"Q1","value":100}]');
    parser.write('}}</artifact>');

    const result = parser.getResult();
    expect(result.think).toHaveLength(1);
    expect(result.parts).toHaveLength(2);
    expect(result.parts[0].type).toBe('content');
    expect(result.parts[1].type).toBe('artifact');

    if (result.parts[1].type === 'artifact') {
      expect(result.parts[1].artifactType).toBe('chart');
      expect(result.parts[1].id).toBe('rev-chart');
      const data = JSON.parse(result.parts[1].data);
      expect(data.component).toBe('Chart');
      expect(data.props.data[0].value).toBe(100);
    }
  });

  it('handles multiple artifacts with separate data', () => {
    const xml = [
      '<content thesys="true">Here are two components:</content>',
      '<artifact type="form" id="form-1" version="1">{"component":"Form","props":{"title":"Register"}}</artifact>',
      '<artifact type="card" id="card-1" version="1">{"component":"Card","props":{"title":"Summary"}}</artifact>',
    ].join('');

    const result = parseResponse(xml);

    expect(result.parts).toHaveLength(3);
    expect(result.parts[0].type).toBe('content');
    expect(result.parts[1].type).toBe('artifact');
    expect(result.parts[2].type).toBe('artifact');

    if (result.parts[1].type === 'artifact') {
      expect(result.parts[1].id).toBe('form-1');
      const data1 = JSON.parse(result.parts[1].data);
      expect(data1.component).toBe('Form');
    }
    if (result.parts[2].type === 'artifact') {
      expect(result.parts[2].id).toBe('card-1');
      const data2 = JSON.parse(result.parts[2].data);
      expect(data2.component).toBe('Card');
    }
  });

  it('streams multiple artifacts correctly', () => {
    const parser = createStreamParser();

    parser.write('<artifact type="table" id="t1" version="1">');
    parser.write('{"component":"Table","props":{"title":"T1"}}');
    parser.write('</artifact>');

    parser.write('<artifact type="chart" id="c1" version="1">');
    parser.write('{"component":"Chart","props":{"title":"C1"}}');
    parser.write('</artifact>');

    const result = parser.getResult();
    expect(result.parts).toHaveLength(2);

    if (result.parts[0].type === 'artifact') {
      expect(result.parts[0].id).toBe('t1');
      expect(JSON.parse(result.parts[0].data).component).toBe('Table');
    }
    if (result.parts[1].type === 'artifact') {
      expect(result.parts[1].id).toBe('c1');
      expect(JSON.parse(result.parts[1].data).component).toBe('Chart');
    }
  });
});

// ─── repairJson integration ───────────────────────────────

describe('createStreamParser with repairJson option', () => {
  it('repairs trailing commas in artifact data', () => {
    const parser = createStreamParser({ repairJson: true });
    parser.write('<artifact type="chart" id="r1" version="1">');
    parser.write('{"chartType":"bar","labels":["Q1","Q2",],}');
    parser.write('</artifact>');

    const result = parser.getResult();
    const artifact = result.parts[0];
    expect(artifact.type).toBe('artifact');
    if (artifact.type === 'artifact') {
      const data = JSON.parse(artifact.data);
      expect(data.chartType).toBe('bar');
      expect(data.labels).toEqual(['Q1', 'Q2']);
    }
  });

  it('repairs single quotes in artifact data', () => {
    const parser = createStreamParser({ repairJson: true });
    parser.write(`<artifact type="table" id="r2" version="1">`);
    parser.write(`{'columns':[{'key':'name'}],'rows':[]}`);
    parser.write('</artifact>');

    const result = parser.getResult();
    const artifact = result.parts[0];
    if (artifact.type === 'artifact') {
      const data = JSON.parse(artifact.data);
      expect(data.columns[0].key).toBe('name');
    }
  });

  it('does not repair when option is false (default)', () => {
    const parser = createStreamParser();
    parser.write('<artifact type="chart" id="r3" version="1">');
    parser.write('{"chartType":"bar",}');
    parser.write('</artifact>');

    const result = parser.getResult();
    if (result.parts[0].type === 'artifact') {
      // Data should be the raw malformed JSON
      expect(() => JSON.parse(result.parts[0].data)).toThrow();
    }
  });

  it('fires onArtifact callback with repaired data', () => {
    const artifacts: any[] = [];
    const parser = createStreamParser({
      repairJson: true,
      onArtifact: (a) => artifacts.push(a),
    });

    parser.write('<artifact type="chart" id="r4" version="1">');
    parser.write('{"values":[1,2,3,]}');
    parser.write('</artifact>');

    expect(artifacts).toHaveLength(1);
    expect(JSON.parse(artifacts[0].data)).toEqual({ values: [1, 2, 3] });
  });

  it('leaves valid JSON untouched when repair is enabled', () => {
    const parser = createStreamParser({ repairJson: true });
    const validJson = '{"chartType":"bar","labels":["Q1","Q2"]}';

    parser.write('<artifact type="chart" id="r5" version="1">');
    parser.write(validJson);
    parser.write('</artifact>');

    const result = parser.getResult();
    if (result.parts[0].type === 'artifact') {
      expect(result.parts[0].data).toBe(validJson);
    }
  });
});
