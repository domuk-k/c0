import React from 'react';

import type { C0Action } from '../../types.js';

interface CompositionNode {
  type: 'row' | 'column' | 'stack';
  children: Array<CompositionChild>;
}

interface CompositionChild {
  artifactType?: string;
  data?: Record<string, unknown>;
  composition?: CompositionNode;
}

export interface DefaultComposedProps {
  composition?: CompositionNode;
  onAction?: (action: C0Action) => void;
}

export function DefaultComposed({ composition }: DefaultComposedProps) {
  if (!composition) return <div className="c0-composed-empty">No composition</div>;
  return (
    <div className="c0-composed">
      <CompositionLayout node={composition} />
    </div>
  );
}

function CompositionLayout({ node }: { node: CompositionNode }) {
  const style: React.CSSProperties =
    node.type === 'row'
      ? { display: 'flex', gap: '8px', flexWrap: 'wrap' }
      : node.type === 'column'
        ? { display: 'flex', flexDirection: 'column', gap: '8px' }
        : { position: 'relative' };

  return (
    <div className={`c0-composed-${node.type}`} style={style}>
      {node.children.map((child, i) => (
        <div key={i} className="c0-composed-child" style={{ flex: '1 1 0' }}>
          {child.composition ? (
            <CompositionLayout node={child.composition} />
          ) : (
            <div className="c0-composed-leaf">
              {child.artifactType && <div className="c0-composed-leaf-type">{child.artifactType}</div>}
              {child.data && <pre>{JSON.stringify(child.data, null, 2)}</pre>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
