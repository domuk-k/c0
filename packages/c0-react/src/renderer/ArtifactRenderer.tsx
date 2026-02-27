import React from 'react';

import type { ArtifactRendererProps } from '../types.js';

/**
 * Renders artifact components.
 *
 * Tries to parse the artifact data as JSON and render the appropriate
 * component from the component library. Falls back to a code block
 * if parsing fails or no matching component is found.
 */
export function ArtifactRenderer({
  data,
  artifactType,
  id,
  components,
  onAction,
}: ArtifactRendererProps) {
  // Try to parse the artifact data as a component spec
  let spec: { component: string; props: Record<string, unknown> } | null =
    null;

  try {
    spec = JSON.parse(data);
  } catch {
    // Not valid JSON — render as code block
  }

  // Look up custom component
  if (spec?.component && components?.[spec.component]) {
    const Component = components[spec.component];
    return (
      <div className="c0-artifact" data-type={artifactType} data-id={id}>
        <Component {...spec.props} onAction={onAction} />
      </div>
    );
  }

  // Fallback: render default artifacts based on type
  if (spec) {
    return (
      <div className="c0-artifact c0-artifact-default" data-type={artifactType} data-id={id}>
        <DefaultArtifact spec={spec} type={artifactType} />
      </div>
    );
  }

  // Raw data fallback
  return (
    <div className="c0-artifact c0-artifact-raw" data-type={artifactType} data-id={id}>
      <pre className="c0-artifact-code">
        <code>{data}</code>
      </pre>
    </div>
  );
}

/**
 * Default rendering for common artifact types.
 * This provides basic rendering when no custom component is registered.
 */
function DefaultArtifact({
  spec,
  type,
}: {
  spec: { component: string; props: Record<string, unknown> };
  type: string;
}) {
  const { props } = spec;

  switch (spec.component) {
    case 'Table':
      return <DefaultTable {...(props as any)} />;
    case 'Card':
      return <DefaultCard {...(props as any)} />;
    case 'List':
      return <DefaultList {...(props as any)} />;
    case 'Chart':
      return <DefaultChart {...(props as any)} />;
    case 'Form':
      return <DefaultForm {...(props as any)} />;
    default:
      return (
        <div className="c0-artifact-fallback">
          <div className="c0-artifact-header">
            {spec.component} ({type})
          </div>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </div>
      );
  }
}

// ─── Default Components ───────────────────────────────────

function DefaultTable({
  title,
  columns,
  rows,
}: {
  title?: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, unknown>>;
}) {
  return (
    <div className="c0-table">
      {title && <h3 className="c0-table-title">{title}</h3>}
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>{String(row[col.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DefaultCard({
  title,
  description,
  items,
}: {
  title?: string;
  description?: string;
  items?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="c0-card">
      {title && <h3 className="c0-card-title">{title}</h3>}
      {description && <p className="c0-card-desc">{description}</p>}
      {items && (
        <dl className="c0-card-items">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
    </div>
  );
}

function DefaultList({
  title,
  items,
  ordered,
}: {
  title?: string;
  items: Array<{ title: string; description?: string }>;
  ordered?: boolean;
}) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <div className="c0-list">
      {title && <h3 className="c0-list-title">{title}</h3>}
      <Tag>
        {items.map((item, i) => (
          <li key={i}>
            <strong>{item.title}</strong>
            {item.description && <span> — {item.description}</span>}
          </li>
        ))}
      </Tag>
    </div>
  );
}

function DefaultChart({
  title,
  type,
  data,
}: {
  title?: string;
  type: string;
  data: Array<{ label: string; value: number }>;
}) {
  // Simple bar chart using CSS — no chart library needed
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="c0-chart">
      {title && <h3 className="c0-chart-title">{title}</h3>}
      <div className="c0-chart-type">{type}</div>
      <div className="c0-chart-bars">
        {data.map((d, i) => (
          <div key={i} className="c0-chart-bar-row">
            <span className="c0-chart-label">{d.label}</span>
            <div className="c0-chart-bar-container">
              <div
                className="c0-chart-bar"
                style={{ width: `${(d.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="c0-chart-value">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultForm({
  title,
  fields,
  submitLabel,
}: {
  title?: string;
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  submitLabel?: string;
}) {
  return (
    <div className="c0-form">
      {title && <h3 className="c0-form-title">{title}</h3>}
      <div className="c0-form-fields">
        {fields.map((field) => (
          <div key={field.name} className="c0-form-field">
            <label className="c0-form-label">
              {field.label}
              {field.required && <span className="c0-form-required">*</span>}
            </label>
            {field.type === 'select' || field.options ? (
              <select className="c0-form-select" disabled>
                <option>{field.placeholder || `Select ${field.label}`}</option>
                {field.options?.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                className="c0-form-textarea"
                placeholder={field.placeholder || field.label}
                disabled
              />
            ) : (
              <input
                className="c0-form-input"
                type={field.type === 'password' ? 'password' : 'text'}
                placeholder={field.placeholder || field.label}
                disabled
              />
            )}
          </div>
        ))}
      </div>
      {submitLabel && (
        <button className="c0-form-submit" type="button" disabled>
          {submitLabel}
        </button>
      )}
    </div>
  );
}
