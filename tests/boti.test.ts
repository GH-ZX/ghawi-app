import { describe, expect, it } from "vitest";
import nacl from "tweetnacl";
import { encryptGithubSecret, fromBase64, generateDeployKey, openSealedBox, randomBase64Key, randomToken, sealBox, toBase64 } from "../src/lib/boti/crypto";
import { EXAMPLE_PAYMENT, EXAMPLE_PROVIDER } from "../src/lib/boti/examples";
import { setJsoncName, setJsoncVar } from "../src/lib/boti/jsonc";
import { applyMap, buildRequest, fillDeep, getPath, isJsonPath, validateSpec } from "../src/lib/boti/spec";

describe("sealed box (GitHub secrets)", () => {
  it("round-trips with the recipient key pair", () => {
    const recipient = nacl.box.keyPair();
    const message = new TextEncoder().encode("-----BEGIN OPENSSH PRIVATE KEY-----\nabc\n");
    const sealed = sealBox(message, recipient.publicKey);
    expect(sealed.length).toBe(32 + 16 + message.length);
    const opened = openSealedBox(sealed, recipient.publicKey, recipient.secretKey);
    expect(opened && new TextDecoder().decode(opened)).toBe("-----BEGIN OPENSSH PRIVATE KEY-----\nabc\n");
  });

  it("does not open with another key", () => {
    const recipient = nacl.box.keyPair();
    const other = nacl.box.keyPair();
    const sealed = sealBox(new Uint8Array([1, 2, 3]), recipient.publicKey);
    expect(openSealedBox(sealed, other.publicKey, other.secretKey)).toBeNull();
  });

  it("encrypts a string for a base64 repo key", () => {
    const recipient = nacl.box.keyPair();
    const b64 = encryptGithubSecret("secret value", toBase64(recipient.publicKey));
    const opened = openSealedBox(fromBase64(b64), recipient.publicKey, recipient.secretKey);
    expect(opened && new TextDecoder().decode(opened)).toBe("secret value");
  });
});

describe("deploy keys", () => {
  it("writes OpenSSH public and private keys", () => {
    const key = generateDeployKey("plus-store-x deploy owner2");
    expect(key.publicKey).toMatch(/^ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI[A-Za-z0-9+/=]+ plus-store-x deploy owner2$/);
    expect(key.privateKey.startsWith("-----BEGIN OPENSSH PRIVATE KEY-----\n")).toBe(true);
    expect(key.privateKey.endsWith("-----END OPENSSH PRIVATE KEY-----\n")).toBe(true);
    const body = fromBase64(key.privateKey.split("\n").slice(1, -2).join(""));
    expect(new TextDecoder().decode(body.slice(0, 15))).toBe("openssh-key-v1\0");
  });

  it("puts the same public key in both files", () => {
    const key = generateDeployKey("x");
    const pubBlob = fromBase64(key.publicKey.split(" ")[1]);
    const priv = fromBase64(key.privateKey.split("\n").slice(1, -2).join(""));
    const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    expect(hex(priv)).toContain(hex(pubBlob));
  });
});

describe("random keys", () => {
  it("makes a 32-byte base64 key and alphanumeric tokens", () => {
    expect(fromBase64(randomBase64Key()).length).toBe(32);
    expect(randomToken(48)).toMatch(/^[A-Za-z0-9]{48}$/);
  });
});

describe("JSON paths", () => {
  const body = { data: { items: [{ code: "A1" }, { code: "B2" }], balance: 12.5 }, ok: true };
  it("reads the supported subset", () => {
    expect(isJsonPath("$")).toBe(true);
    expect(isJsonPath("$.data.items[1].code")).toBe(true);
    expect(isJsonPath("data.items")).toBe(false);
    expect(isJsonPath("$..items")).toBe(false);
    expect(getPath(body, "$")).toBe(body);
    expect(getPath(body, "$.data.balance")).toBe(12.5);
    expect(getPath(body, "$.data.items[1].code")).toBe("B2");
    expect(getPath(body, "$.data.missing.deep")).toBeUndefined();
    expect(getPath(body, "$.data.items.code")).toBeUndefined();
  });

  it("maps list items and plain bodies", () => {
    expect(applyMap(body, { list: "$.data.items", map: { id: "$.code" } })).toEqual([{ id: "A1" }, { id: "B2" }]);
    expect(applyMap(body, { map: { amount: "$.data.balance" } })).toEqual([{ amount: 12.5 }]);
  });

  it("fills templates and keeps a lone var's type", () => {
    expect(fillDeep({ qty: "{quantity}", note: "order {ref}", list: ["{ref}"] }, { quantity: 2, ref: "R1" })).toEqual({ qty: 2, note: "order R1", list: ["R1"] });
  });
});

describe("spec validator", () => {
  it("accepts both examples", () => {
    expect(validateSpec(EXAMPLE_PROVIDER)).toMatchObject({ ok: true });
    expect(validateSpec(EXAMPLE_PAYMENT)).toMatchObject({ ok: true });
  });

  it("lists every problem", () => {
    const bad = { ...EXAMPLE_PROVIDER, id: "Bad Id", base_url: "http://x", auth: { type: "header", name: "Authorization", format: "Bearer" } };
    const result = validateSpec(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join("\n")).toMatch(/id:/);
      expect(result.errors.join("\n")).toMatch(/base_url/);
      expect(result.errors.join("\n")).toMatch(/\{token\}/);
    }
  });

  it("requires the core map fields", () => {
    const spec = structuredClone(EXAMPLE_PROVIDER);
    delete (spec.endpoints.products.map as Record<string, string>).price;
    const result = validateSpec(spec);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("endpoints.products.map.price: required");
  });

  it("builds a request with auth and templates", () => {
    const { url, init } = buildRequest(EXAMPLE_PROVIDER, EXAMPLE_PROVIDER.endpoints.status, "tok", { order_id: "42" });
    expect(url).toBe("https://api.example-store.com/v1/orders/42");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    const order = buildRequest(EXAMPLE_PROVIDER, EXAMPLE_PROVIDER.endpoints.order, "tok", { product_id: "p1", quantity: 3, reference: "R", email: "a@b.c" });
    expect(JSON.parse(String(order.init.body))).toEqual({ product_id: "p1", quantity: 3, reference: "R", email: "a@b.c" });
  });
});

describe("wrangler.jsonc editor", () => {
  const file = `{
  "$schema": "node_modules/wrangler/config-schema.json",
  // Each client deployment (branch) only needs to change "name".
  "name": "plus-store-x",
  "main": "src/index.ts",
  "assets": { "directory": "./public" }, // trailing comment, with "quotes" and // slashes
  /* a block comment: "vars": { } */
  "vars": {
    "APP_ENV": "production"
  }
  // ── Optional ──
  // "queues": { }
}
`;

  it("adds a var and keeps comments", () => {
    const out = setJsoncVar(file, "SUPABASE_URL", "https://abc.supabase.co");
    expect(out).toContain(`"SUPABASE_URL": "https://abc.supabase.co",\n    "APP_ENV": "production"`);
    expect(out).toContain("// trailing comment, with \"quotes\" and // slashes");
    expect(out).toContain('/* a block comment: "vars": { } */');
    expect(out).toContain('// "queues": { }');
  });

  it("replaces an existing var", () => {
    const once = setJsoncVar(file, "SUPABASE_URL", "https://a.supabase.co");
    const twice = setJsoncVar(once, "SUPABASE_URL", "https://b.supabase.co");
    expect(twice).toContain('"SUPABASE_URL": "https://b.supabase.co"');
    expect(twice).not.toContain("https://a.supabase.co");
    expect(twice.match(/SUPABASE_URL/g)?.length).toBe(1);
  });

  it("creates vars when missing and sets the name", () => {
    const bare = `{\n  "name": "plus-store-x",\n  "main": "src/index.ts"\n}\n`;
    const out = setJsoncName(setJsoncVar(bare, "SUPABASE_URL", "https://c.supabase.co"), "store-two");
    expect(out).toContain('"name": "store-two"');
    expect(out).toContain('"vars": {\n    "SUPABASE_URL": "https://c.supabase.co"\n  },');
    const json = JSON.parse(out) as { vars: Record<string, string>; name: string };
    expect(json.vars.SUPABASE_URL).toBe("https://c.supabase.co");
  });

  it("handles an empty vars object", () => {
    const out = setJsoncVar(`{\n  "name": "x",\n  "vars": {}\n}\n`, "K", "v");
    expect(JSON.parse(out)).toEqual({ name: "x", vars: { K: "v" } });
  });
});
