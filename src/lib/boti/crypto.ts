/**
 * The crypto boti needs, in pure JS so it runs the same in workerd and tests:
 * - GitHub's secrets API wants values in a libsodium sealed box
 *   (crypto_box_seal) for the repo's public key;
 * - each client gets an Ed25519 deploy key in OpenSSH format;
 * - one-time random keys for a new client.
 */
import nacl from "tweetnacl";
import { blake2b } from "blakejs";

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/* ------------------------------------------------------------------ *
 *  Sealed box (libsodium crypto_box_seal)
 * ------------------------------------------------------------------ */

/** nonce = BLAKE2b-192(ephemeral_pk ‖ recipient_pk), as libsodium does. */
function sealNonce(ephemeralPk: Uint8Array, recipientPk: Uint8Array): Uint8Array {
  return blake2b(concat(ephemeralPk, recipientPk), undefined, nacl.box.nonceLength);
}

/** Encrypts `message` for `recipientPk` (32 bytes): ephemeral_pk ‖ box. */
export function sealBox(message: Uint8Array, recipientPk: Uint8Array): Uint8Array {
  const ephemeral = nacl.box.keyPair();
  const box = nacl.box(message, sealNonce(ephemeral.publicKey, recipientPk), recipientPk, ephemeral.secretKey);
  return concat(ephemeral.publicKey, box);
}

/** The inverse, for tests: null when the box does not open. */
export function openSealedBox(sealed: Uint8Array, recipientPk: Uint8Array, recipientSk: Uint8Array): Uint8Array | null {
  const ephemeralPk = sealed.slice(0, nacl.box.publicKeyLength);
  const box = sealed.slice(nacl.box.publicKeyLength);
  return nacl.box.open(box, sealNonce(ephemeralPk, recipientPk), ephemeralPk, recipientSk);
}

/** A secret value encrypted for GitHub's repo public key (both base64). */
export function encryptGithubSecret(value: string, repoPublicKeyB64: string): string {
  return toBase64(sealBox(new TextEncoder().encode(value), fromBase64(repoPublicKeyB64)));
}

/* ------------------------------------------------------------------ *
 *  OpenSSH Ed25519 keys
 * ------------------------------------------------------------------ */

function sshString(data: Uint8Array | string): Uint8Array {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return concat(uint32(bytes.length), bytes);
}

function uint32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}

export type DeployKey = { publicKey: string; privateKey: string };

/**
 * A new Ed25519 key pair: "ssh-ed25519 AAAA… comment" and an unencrypted
 * "-----BEGIN OPENSSH PRIVATE KEY-----" block, the same as
 * `ssh-keygen -t ed25519 -N ""` writes.
 */
export function generateDeployKey(comment: string): DeployKey {
  const pair = nacl.sign.keyPair(); // secretKey = seed ‖ public key (64 bytes)
  const pubBlob = concat(sshString("ssh-ed25519"), sshString(pair.publicKey));

  const check = crypto.getRandomValues(new Uint32Array(1))[0];
  let privatePart = concat(
    uint32(check),
    uint32(check),
    sshString("ssh-ed25519"),
    sshString(pair.publicKey),
    sshString(pair.secretKey),
    sshString(comment),
  );
  // Pad to the cipher block size (8 for "none") with 1, 2, 3, …
  const pad = (8 - (privatePart.length % 8)) % 8;
  privatePart = concat(privatePart, Uint8Array.from({ length: pad }, (_, i) => i + 1));

  const body = concat(
    new TextEncoder().encode("openssh-key-v1\0"),
    sshString("none"),
    sshString("none"),
    sshString(""),
    uint32(1),
    sshString(pubBlob),
    sshString(privatePart),
  );
  const b64 = toBase64(body);
  const lines = b64.match(/.{1,70}/g) ?? [];
  return {
    publicKey: `ssh-ed25519 ${toBase64(pubBlob)} ${comment}`,
    privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----\n${lines.join("\n")}\n-----END OPENSSH PRIVATE KEY-----\n`,
  };
}

/* ------------------------------------------------------------------ *
 *  Random keys
 * ------------------------------------------------------------------ */

/** 32 random bytes, base64: Plus Store X's ENCRYPTION_KEY. */
export function randomBase64Key(bytes = 32): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(bytes)));
}

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Letters and digits only (Telegram's webhook secret allows A-Z a-z 0-9 _ -). */
export function randomToken(length = 40): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  // 256 % 62 bias is ~0.4% per char — fine for secrets of this length.
  return Array.from(bytes, (b) => ALPHANUM[b % ALPHANUM.length]).join("");
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
