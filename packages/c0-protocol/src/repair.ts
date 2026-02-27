/**
 * Lightweight JSON repair for malformed LLM output.
 *
 * Handles common issues from weak/small models:
 * - Trailing commas before } or ]
 * - Single quotes → double quotes (outside of values)
 * - Missing closing brackets/braces
 * - Truncated JSON (best-effort bracket closing)
 * - JavaScript comments (// and /* *‌/)
 *
 * Zero external dependencies — intentionally kept small.
 */

/**
 * Attempt to repair a malformed JSON string.
 * Returns the repaired string if successful, or `null` if unrecoverable.
 */
export function repairJson(input: string): string | null {
  if (!input || !input.trim()) return null;

  let json = input.trim();

  // 1. Strip JavaScript-style comments
  json = stripComments(json);

  // 2. Fix single quotes to double quotes (for keys and string values)
  json = fixQuotes(json);

  // 3. Close unclosed brackets/braces (must run before trailing comma removal
  //    so that `,` followed by the newly-added `]`/`}` can be cleaned up)
  json = closeBrackets(json);

  // 4. Remove trailing commas before } or ]
  json = removeTrailingCommas(json);

  // 5. Validate
  try {
    JSON.parse(json);
    return json;
  } catch {
    return null;
  }
}

// ─── Internals ───────────────────────────────────────────

/** Strip // line comments and /* block comments *‌/ outside of strings. */
function stripComments(json: string): string {
  let result = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (escape) {
      result += ch;
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      result += ch;
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (!inString) {
      // Line comment
      if (ch === '/' && json[i + 1] === '/') {
        const newline = json.indexOf('\n', i);
        i = newline === -1 ? json.length : newline;
        continue;
      }
      // Block comment
      if (ch === '/' && json[i + 1] === '*') {
        const end = json.indexOf('*/', i + 2);
        i = end === -1 ? json.length : end + 1;
        continue;
      }
    }

    result += ch;
  }

  return result;
}

/**
 * Replace single-quoted strings with double-quoted strings.
 * Only operates outside of double-quoted strings.
 */
function fixQuotes(json: string): string {
  let result = '';
  let inDouble = false;
  let inSingle = false;
  let escape = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (escape) {
      // If we're converting a single-quoted string to double-quoted,
      // unescape escaped single quotes and escape unescaped double quotes
      if (inSingle) {
        if (ch === "'") {
          result += "'";
        } else if (ch === '"') {
          result += '\\"';
        } else {
          result += '\\' + ch;
        }
      } else {
        result += '\\' + ch;
      }
      escape = false;
      continue;
    }

    if (ch === '\\' && (inDouble || inSingle)) {
      escape = true;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      result += ch;
      continue;
    }

    if (ch === "'" && !inDouble) {
      // Toggle single-quote string, but emit double quote
      inSingle = !inSingle;
      result += '"';
      continue;
    }

    // Inside a single-quoted string, escape any literal double quotes
    if (inSingle && ch === '"') {
      result += '\\"';
      continue;
    }

    result += ch;
  }

  return result;
}

/** Remove trailing commas: `,}` → `}`, `,]` → `]` */
function removeTrailingCommas(json: string): string {
  // Match comma followed by optional whitespace then closing bracket/brace
  return json.replace(/,\s*([}\]])/g, '$1');
}

/**
 * Close unclosed brackets and braces.
 * Walks the string tracking open/close while respecting string boundaries.
 */
function closeBrackets(json: string): string {
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (const ch of json) {
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }

  // If we're inside an unclosed string, close it first
  if (inString) {
    json += '"';
  }

  // Close remaining open brackets in reverse order
  while (stack.length > 0) {
    json += stack.pop();
  }

  return json;
}
