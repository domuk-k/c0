import { describe, expect, it } from 'vitest';

import { repairJson } from './repair.js';

describe('repairJson', () => {
  // ─── Trailing Commas ───────────────────────────────────

  it('removes trailing comma before }', () => {
    const input = '{"name": "Alice", "age": 30,}';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ name: 'Alice', age: 30 });
  });

  it('removes trailing comma before ]', () => {
    const input = '{"items": [1, 2, 3,]}';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ items: [1, 2, 3] });
  });

  it('removes multiple trailing commas', () => {
    const input = '{"a": [1, 2,], "b": {"c": 3,},}';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ a: [1, 2], b: { c: 3 } });
  });

  // ─── Single Quotes ────────────────────────────────────

  it('converts single-quoted keys and values to double quotes', () => {
    const input = "{'name': 'Alice', 'age': 30}";
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ name: 'Alice', age: 30 });
  });

  it('handles mixed single and double quotes', () => {
    const input = `{'name': "Alice", "age": 30}`;
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ name: 'Alice', age: 30 });
  });

  // ─── Missing Closing Brackets ─────────────────────────

  it('closes missing }', () => {
    const input = '{"name": "Alice"';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ name: 'Alice' });
  });

  it('closes missing ]', () => {
    const input = '{"items": [1, 2, 3';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ items: [1, 2, 3] });
  });

  it('closes deeply nested missing brackets', () => {
    const input = '{"a": {"b": [1, 2, {"c": 3';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    const parsed = JSON.parse(result!);
    expect(parsed.a.b[2].c).toBe(3);
  });

  // ─── Truncated JSON ───────────────────────────────────

  it('handles truncated string value', () => {
    const input = '{"name": "Ali';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!).name).toBe('Ali');
  });

  it('handles truncated array with trailing comma', () => {
    const input = '{"data": [1, 2,';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!).data).toEqual([1, 2]);
  });

  // ─── JavaScript Comments ──────────────────────────────

  it('strips line comments', () => {
    const input = `{
  "name": "Alice" // this is a name
}`;
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ name: 'Alice' });
  });

  it('strips block comments', () => {
    const input = '{"name": /* the name */ "Alice"}';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ name: 'Alice' });
  });

  // ─── Already Valid JSON ───────────────────────────────

  it('returns valid JSON as-is', () => {
    const input = '{"name":"Alice","age":30}';
    const result = repairJson(input);
    expect(result).toBe(input);
  });

  it('returns valid JSON array as-is', () => {
    const input = '[1, 2, 3]';
    const result = repairJson(input);
    expect(result).toBe(input);
  });

  // ─── Unrecoverable Input ──────────────────────────────

  it('returns null for empty input', () => {
    expect(repairJson('')).toBeNull();
    expect(repairJson('  ')).toBeNull();
  });

  it('returns null for completely invalid input', () => {
    expect(repairJson('not json at all')).toBeNull();
  });

  // ─── Combined Issues ──────────────────────────────────

  it('handles trailing comma + missing bracket', () => {
    const input = '{"items": [1, 2, 3,';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ items: [1, 2, 3] });
  });

  it('handles single quotes + trailing comma + missing bracket', () => {
    const input = "{'items': [1, 2,";
    const result = repairJson(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ items: [1, 2] });
  });

  // ─── Real-world LLM output scenarios ──────────────────

  it('repairs typical weak-model chart artifact', () => {
    const input = `{'chartType': 'bar', 'labels': ['Q1', 'Q2',], 'datasets': [{'label': 'Revenue', 'values': [100, 200,],}]}`;
    const result = repairJson(input);
    expect(result).not.toBeNull();
    const parsed = JSON.parse(result!);
    expect(parsed.chartType).toBe('bar');
    expect(parsed.labels).toEqual(['Q1', 'Q2']);
    expect(parsed.datasets[0].values).toEqual([100, 200]);
  });

  it('repairs truncated table artifact', () => {
    const input = '{"columns":[{"key":"name","label":"Name"}],"rows":[{"name":"Alice"},{"name":"Bob"';
    const result = repairJson(input);
    expect(result).not.toBeNull();
    const parsed = JSON.parse(result!);
    expect(parsed.columns[0].key).toBe('name');
    expect(parsed.rows).toHaveLength(2);
  });
});
