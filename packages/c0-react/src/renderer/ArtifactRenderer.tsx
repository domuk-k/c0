import React from 'react';

import type { ArtifactRendererProps } from '../types.js';
import { DEFAULT_RENDERERS } from './registry.js';

/**
 * Renders artifact components via registry lookup.
 *
 * Dispatch flow:
 * 1. Parse JSON data (supports both direct and legacy { component, props } format)
 * 2. Convert kebab-case artifactType to PascalCase component name
 * 3. Merge DEFAULT_RENDERERS with consumer `components` prop (consumer wins)
 * 4. Look up component → render, or fall back to JSON display
 */
export function ArtifactRenderer({
  data,
  artifactType,
  id,
  components,
  onAction,
}: ArtifactRendererProps) {
  let parsed: Record<string, unknown> | null = null;

  try {
    const raw = JSON.parse(data);
    // Support legacy { component, props } wrapper for backward compat
    if (raw?.component && raw?.props && typeof raw.props === 'object') {
      parsed = raw.props as Record<string, unknown>;
    } else {
      parsed = raw;
    }
  } catch {
    // Not valid JSON — will render as code block below
  }

  if (parsed) {
    const componentName = toPascalCase(artifactType);
    const merged = { ...DEFAULT_RENDERERS, ...components };
    const Component = merged[componentName];

    if (Component) {
      return (
        <div className="c0-artifact" data-type={artifactType} data-id={id}>
          <Component {...parsed} onAction={onAction} />
        </div>
      );
    }

    // JSON fallback for unknown artifact types
    return (
      <div className="c0-artifact c0-artifact-fallback" data-type={artifactType} data-id={id}>
        <div className="c0-artifact-header">{artifactType}</div>
        <pre>{JSON.stringify(parsed, null, 2)}</pre>
      </div>
    );
  }

  // Raw data fallback (non-JSON)
  return (
    <div className="c0-artifact c0-artifact-raw" data-type={artifactType} data-id={id}>
      <pre className="c0-artifact-code">
        <code>{data}</code>
      </pre>
    </div>
  );
}

function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}
