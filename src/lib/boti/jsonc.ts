/**
 * Small, comment-preserving edits to a wrangler.jsonc: set a string in the
 * top-level "vars" object, or the top-level "name". The rest of the file —
 * comments, order, formatting — is left exactly as it was.
 */

type Member = { key: string; keyStart: number; valueStart: number; valueEnd: number };

function skipSpace(text: string, i: number): number {
  for (;;) {
    while (i < text.length && /\s/.test(text[i])) i += 1;
    if (text.startsWith("//", i)) {
      const nl = text.indexOf("\n", i);
      i = nl < 0 ? text.length : nl + 1;
    } else if (text.startsWith("/*", i)) {
      const close = text.indexOf("*/", i + 2);
      i = close < 0 ? text.length : close + 2;
    } else return i;
  }
}

/** Index just past the string that starts at `i` (a `"`). */
function stringEnd(text: string, i: number): number {
  let j = i + 1;
  while (j < text.length) {
    if (text[j] === "\\") j += 2;
    else if (text[j] === '"') return j + 1;
    else j += 1;
  }
  throw new Error("Unterminated string in JSONC");
}

/** Index just past the value that starts at `i`. */
function valueEnd(text: string, i: number): number {
  const c = text[i];
  if (c === '"') return stringEnd(text, i);
  if (c === "{" || c === "[") {
    let depth = 0;
    let j = i;
    while (j < text.length) {
      j = skipSpace(text, j);
      const ch = text[j];
      if (ch === '"') {
        j = stringEnd(text, j);
        continue;
      }
      if (ch === "{" || ch === "[") depth += 1;
      if (ch === "}" || ch === "]") {
        depth -= 1;
        if (depth === 0) return j + 1;
      }
      j += 1;
    }
    throw new Error("Unbalanced brackets in JSONC");
  }
  let j = i;
  while (j < text.length && !/[,}\]\s/]/.test(text[j])) j += 1;
  return j;
}

/** Direct members of the object whose "{" is at `open`, and the index of its "}". */
function members(text: string, open: number): { list: Member[]; close: number } {
  const list: Member[] = [];
  let i = open + 1;
  for (;;) {
    i = skipSpace(text, i);
    if (text[i] === "}") return { list, close: i };
    if (text[i] === ",") {
      i += 1;
      continue;
    }
    if (text[i] !== '"') throw new Error(`Unexpected "${text[i] ?? "end"}" in JSONC object`);
    const keyStart = i;
    const keyEnd = stringEnd(text, i);
    const key = JSON.parse(text.slice(keyStart, keyEnd)) as string;
    i = skipSpace(text, keyEnd);
    if (text[i] !== ":") throw new Error("Expected ':' in JSONC object");
    const valueStart = skipSpace(text, i + 1);
    const end = valueEnd(text, valueStart);
    list.push({ key, keyStart, valueStart, valueEnd: end });
    i = end;
  }
}

function rootOpen(text: string): number {
  const i = skipSpace(text, 0);
  if (text[i] !== "{") throw new Error("JSONC root must be an object");
  return i;
}

/** The indentation of the line containing `index`. */
function indentAt(text: string, index: number): string {
  const lineStart = text.lastIndexOf("\n", index - 1) + 1;
  return /^[ \t]*/.exec(text.slice(lineStart))?.[0] ?? "";
}

/** Sets vars[key] = value (a string), adding "vars" or the key when missing. */
export function setJsoncVar(text: string, key: string, value: string): string {
  const open = rootOpen(text);
  const root = members(text, open);
  const vars = root.list.find((m) => m.key === "vars");
  const literal = JSON.stringify(value);

  if (!vars) {
    const at = root.list[0]?.keyStart ?? root.close;
    const pad = root.list[0] ? indentAt(text, root.list[0].keyStart) : "  ";
    const block = `"vars": {\n${pad}  ${JSON.stringify(key)}: ${literal}\n${pad}}`;
    return root.list.length ? `${text.slice(0, at)}${block},\n${pad}${text.slice(at)}` : `${text.slice(0, at)}\n${pad}${block}\n${text.slice(at)}`;
  }
  if (text[vars.valueStart] !== "{") throw new Error('"vars" is not an object');

  const inner = members(text, vars.valueStart);
  const existing = inner.list.find((m) => m.key === key);
  if (existing) return text.slice(0, existing.valueStart) + literal + text.slice(existing.valueEnd);

  // Add it as the first entry so no trailing comma or comment placement is disturbed.
  const first = inner.list[0];
  if (first) {
    const pad = indentAt(text, first.keyStart);
    return `${text.slice(0, first.keyStart)}${JSON.stringify(key)}: ${literal},\n${pad}${text.slice(first.keyStart)}`;
  }
  const pad = indentAt(text, vars.keyStart);
  return `${text.slice(0, vars.valueStart + 1)}\n${pad}  ${JSON.stringify(key)}: ${literal}\n${pad}${text.slice(inner.close)}`;
}

/** Sets the top-level "name" (the Worker name). */
export function setJsoncName(text: string, name: string): string {
  const open = rootOpen(text);
  const root = members(text, open);
  const member = root.list.find((m) => m.key === "name");
  if (!member) throw new Error('No top-level "name" in wrangler.jsonc');
  return text.slice(0, member.valueStart) + JSON.stringify(name) + text.slice(member.valueEnd);
}
