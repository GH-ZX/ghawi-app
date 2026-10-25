/**
 * Adapter specs: a provider or payment API described as data, so a new API
 * reaches every Plus Store X client bot without a code change. boti.ghawi.app
 * stores them (Library) as the coder's private catalog; a spec's JSON is copied
 * into a client's panel by hand (boti never talks to client bots). The
 * bot implements the same format. The README's "Adapter spec" section is the
 * human version of this file — keep the two in step.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type SpecAuth =
  | { type: "header"; name: string; format: string }
  | { type: "query"; name: string }
  | { type: "none" };

/** One call. `path`, `query` values, `body` strings and auth `format` take "{var}" templates. */
export type SpecEndpoint = {
  method: HttpMethod;
  path: string;
  query?: Record<string, string>;
  body?: unknown;
  /** For lists: the path of the array to iterate ("$" = the whole body). */
  list?: string;
  /** field → JSON path (relative to each list item, or to the body when there is no list). */
  map: Record<string, string>;
};

type SpecCommon = {
  id: string;
  name: string;
  version: number;
  /** Default base URL; a client may override it in their panel. */
  base_url: string;
  auth: SpecAuth;
};

export type ProviderSpec = SpecCommon & {
  kind: "provider";
  endpoints: {
    balance: SpecEndpoint;
    products: SpecEndpoint;
    order: SpecEndpoint;
    status: SpecEndpoint;
  };
  status_map: { delivered: string[]; pending: string[]; failed: string[] };
  price_currency?: string;
  requires?: { key: string; label_en: string; label_ar: string }[];
};

export type PaymentSpec = SpecCommon & {
  kind: "payment";
  create: SpecEndpoint;
  status: SpecEndpoint;
  status_map: { paid: string[]; pending: string[]; expired: string[]; failed: string[] };
  webhook?: {
    signature: { type: "hmac-sha256" | "hmac-sha512" | "none"; header?: string; encoding?: "hex" | "base64" };
    map: { id: string; status: string };
  };
};

export type AdapterSpec = ProviderSpec | PaymentSpec;

/** Map keys each endpoint must have; the others are optional. */
export const REQUIRED_MAP: Record<string, string[]> = {
  "provider.balance": ["amount"],
  "provider.products": ["id", "name", "price"],
  "provider.order": ["order_id", "status"],
  "provider.status": ["status"],
  "payment.create": ["id"],
  "payment.status": ["status"],
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const PATH_RE = /^\$((\.[A-Za-z_][A-Za-z0-9_-]*)|(\[\d+\]))*$/;

/* ------------------------------------------------------------------ *
 *  JSON paths: "$", "$.a.b", "$.items[0].code"
 * ------------------------------------------------------------------ */

export function isJsonPath(path: string): boolean {
  return PATH_RE.test(path);
}

/** Reads a JSON path; undefined when any step is missing. */
export function getPath(value: unknown, path: string): unknown {
  if (!isJsonPath(path)) return undefined;
  let current: unknown = value;
  for (const match of path.slice(1).matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)|\[(\d+)\]/g)) {
    if (current === null || current === undefined) return undefined;
    if (match[1] !== undefined) {
      if (typeof current !== "object" || Array.isArray(current)) return undefined;
      current = (current as Record<string, unknown>)[match[1]];
    } else {
      if (!Array.isArray(current)) return undefined;
      current = current[Number(match[2])];
    }
  }
  return current;
}

/** Applies an endpoint's map: one object per list item, or one object for the body. */
export function applyMap(body: unknown, endpoint: Pick<SpecEndpoint, "list" | "map">): Record<string, unknown>[] {
  const pick = (source: unknown) =>
    Object.fromEntries(Object.entries(endpoint.map).map(([field, path]) => [field, getPath(source, path)]));
  if (!endpoint.list) return [pick(body)];
  const items = getPath(body, endpoint.list);
  return Array.isArray(items) ? items.map(pick) : [];
}

/* ------------------------------------------------------------------ *
 *  Templates: "{var}"
 * ------------------------------------------------------------------ */

/** Fills "{var}" from vars; an unknown var becomes "". */
export function fillTemplate(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : ""));
}

/** Fills templates in every string inside a JSON value (bodies, queries). */
export function fillDeep(value: unknown, vars: Record<string, string | number>): unknown {
  if (typeof value === "string") {
    // A body value that is exactly one var keeps the var's own type (numbers stay numbers).
    const only = /^\{([A-Za-z_][A-Za-z0-9_]*)\}$/.exec(value);
    if (only && only[1] in vars) return vars[only[1]];
    return fillTemplate(value, vars);
  }
  if (Array.isArray(value)) return value.map((item) => fillDeep(item, vars));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillDeep(item, vars)]));
  }
  return value;
}

/* ------------------------------------------------------------------ *
 *  Validation
 * ------------------------------------------------------------------ */

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function checkEndpoint(errors: string[], where: string, value: unknown, required: string[]) {
  if (!isObject(value)) {
    errors.push(`${where}: missing`);
    return;
  }
  if (!METHODS.includes(value.method as HttpMethod)) errors.push(`${where}.method: one of ${METHODS.join(", ")}`);
  if (typeof value.path !== "string" || !value.path.startsWith("/")) errors.push(`${where}.path: must start with "/"`);
  if (value.query !== undefined && (!isObject(value.query) || !Object.values(value.query).every((v) => typeof v === "string"))) {
    errors.push(`${where}.query: an object of strings`);
  }
  if (value.list !== undefined && (typeof value.list !== "string" || !isJsonPath(value.list))) {
    errors.push(`${where}.list: a JSON path like "$.data"`);
  }
  if (!isObject(value.map)) {
    errors.push(`${where}.map: missing`);
    return;
  }
  for (const [field, path] of Object.entries(value.map)) {
    if (typeof path !== "string" || !isJsonPath(path)) errors.push(`${where}.map.${field}: a JSON path like "$.id"`);
  }
  for (const field of required) if (!(field in value.map)) errors.push(`${where}.map.${field}: required`);
}

function checkStatusMap(errors: string[], value: unknown, keys: string[]) {
  if (!isObject(value)) {
    errors.push("status_map: missing");
    return;
  }
  for (const key of keys) if (!isStringArray(value[key])) errors.push(`status_map.${key}: a list of status values`);
}

export type Validation = { ok: true; spec: AdapterSpec } | { ok: false; errors: string[] };

/** Checks a parsed spec against the format; returns every problem at once. */
export function validateSpec(value: unknown): Validation {
  const errors: string[] = [];
  if (!isObject(value)) return { ok: false, errors: ["The spec must be a JSON object."] };

  if (value.kind !== "provider" && value.kind !== "payment") errors.push('kind: "provider" or "payment"');
  if (typeof value.id !== "string" || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(value.id)) errors.push("id: a slug (a-z, 0-9, -)");
  if (typeof value.name !== "string" || !value.name.trim()) errors.push("name: required");
  if (!Number.isInteger(value.version) || (value.version as number) < 1) errors.push("version: a whole number from 1");
  if (typeof value.base_url !== "string" || !/^https:\/\/[^\s/]+/.test(value.base_url)) errors.push("base_url: an https:// URL");

  const auth = value.auth;
  if (!isObject(auth)) errors.push("auth: missing");
  else if (auth.type === "header") {
    if (typeof auth.name !== "string" || !auth.name) errors.push("auth.name: the header name");
    if (typeof auth.format !== "string" || !auth.format.includes("{token}")) errors.push('auth.format: must contain "{token}"');
  } else if (auth.type === "query") {
    if (typeof auth.name !== "string" || !auth.name) errors.push("auth.name: the query parameter");
  } else if (auth.type !== "none") errors.push('auth.type: "header", "query" or "none"');

  if (value.kind === "provider") {
    const endpoints = value.endpoints;
    if (!isObject(endpoints)) errors.push("endpoints: missing");
    else {
      for (const name of ["balance", "products", "order", "status"]) {
        checkEndpoint(errors, `endpoints.${name}`, endpoints[name], REQUIRED_MAP[`provider.${name}`]);
      }
      if (isObject(endpoints.products) && !endpoints.products.list) errors.push("endpoints.products.list: the array of products");
    }
    checkStatusMap(errors, value.status_map, ["delivered", "pending", "failed"]);
    if (value.price_currency !== undefined && (typeof value.price_currency !== "string" || !/^[A-Z]{3}$/.test(value.price_currency))) {
      errors.push('price_currency: a 3-letter code like "USD"');
    }
    if (value.requires !== undefined) {
      const ok = Array.isArray(value.requires) && value.requires.every(
        (r) => isObject(r) && typeof r.key === "string" && typeof r.label_en === "string" && typeof r.label_ar === "string",
      );
      if (!ok) errors.push("requires: a list of {key, label_en, label_ar}");
    }
  }

  if (value.kind === "payment") {
    checkEndpoint(errors, "create", value.create, REQUIRED_MAP["payment.create"]);
    checkEndpoint(errors, "status", value.status, REQUIRED_MAP["payment.status"]);
    checkStatusMap(errors, value.status_map, ["paid", "pending", "expired", "failed"]);
    if (value.webhook !== undefined) {
      const hook = value.webhook;
      if (!isObject(hook) || !isObject(hook.signature) || !isObject(hook.map)) errors.push("webhook: {signature, map}");
      else {
        const sig = hook.signature;
        if (!["hmac-sha256", "hmac-sha512", "none"].includes(sig.type as string)) errors.push('webhook.signature.type: "hmac-sha256", "hmac-sha512" or "none"');
        if (sig.type !== "none" && (typeof sig.header !== "string" || !sig.header)) errors.push("webhook.signature.header: the header carrying the signature");
        if (sig.encoding !== undefined && sig.encoding !== "hex" && sig.encoding !== "base64") errors.push('webhook.signature.encoding: "hex" or "base64"');
        for (const field of ["id", "status"]) {
          const path = hook.map[field];
          if (typeof path !== "string" || !isJsonPath(path)) errors.push(`webhook.map.${field}: a JSON path`);
        }
      }
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, spec: value as unknown as AdapterSpec };
}

/** The endpoints "Try it" can run for a spec. */
export function specEndpoints(spec: AdapterSpec): { name: string; endpoint: SpecEndpoint }[] {
  if (spec.kind === "provider") {
    return (Object.keys(spec.endpoints) as (keyof ProviderSpec["endpoints"])[]).map((name) => ({ name, endpoint: spec.endpoints[name] }));
  }
  return [
    { name: "create", endpoint: spec.create },
    { name: "status", endpoint: spec.status },
  ];
}

/** Builds the request for one endpoint (auth, templates); the caller sends it. */
export function buildRequest(
  spec: AdapterSpec,
  endpoint: SpecEndpoint,
  token: string,
  vars: Record<string, string | number>,
  baseUrl = spec.base_url,
): { url: string; init: RequestInit } {
  const url = new URL(fillTemplate(endpoint.path, vars).replace(/^\/+/, ""), baseUrl.replace(/\/+$/, "") + "/");
  for (const [key, value] of Object.entries(endpoint.query ?? {})) url.searchParams.set(key, fillTemplate(value, vars));
  const headers: Record<string, string> = { accept: "application/json" };
  if (spec.auth.type === "header") headers[spec.auth.name] = fillTemplate(spec.auth.format, { ...vars, token });
  if (spec.auth.type === "query") url.searchParams.set(spec.auth.name, token);
  const init: RequestInit = { method: endpoint.method, headers };
  if (endpoint.body !== undefined && endpoint.method !== "GET") {
    headers["content-type"] = "application/json";
    init.body = JSON.stringify(fillDeep(endpoint.body, vars));
  }
  return { url: url.toString(), init };
}
