import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultFormProps {
  fields?: Array<{
    key: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  submitLabel?: string;
  onAction?: (action: C0Action) => void;
}

export function DefaultForm({ fields, submitLabel }: DefaultFormProps) {
  if (!fields?.length) return null;
  return (
    <div className="c0-form">
      <div className="c0-form-fields">
        {fields.map((field) => (
          <div key={field.key} className="c0-form-field">
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
            ) : field.type === 'checkbox' || field.type === 'toggle' ? (
              <label className="c0-form-checkbox-label">
                <input className="c0-form-checkbox" type="checkbox" disabled />
                <span>{field.placeholder || field.label}</span>
              </label>
            ) : field.type === 'textarea' ? (
              <textarea className="c0-form-textarea" placeholder={field.placeholder || field.label} disabled />
            ) : (
              <input className="c0-form-input" type="text" placeholder={field.placeholder || field.label} disabled />
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
