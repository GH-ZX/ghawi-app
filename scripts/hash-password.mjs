/**
 * Generates the PBKDF2 hash stored in the ADMIN_PASSWORD_HASH Worker secret.
 *
 *   node scripts/hash-password.mjs "your-password"
 *
 * The plaintext is never written anywhere — only the derived hash is printed,
 * and that hash is what gets stored as a secret. Running this again with a
 * different password rotates the credential.
 */
import { randomBytes, pbkdf2Sync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('usage: node scripts/hash-password.mjs "<password>"');
  process.exit(1);
}

/**
 * 100,000 is Cloudflare Workers' hard ceiling for Web Crypto PBKDF2.
 * `crypto.subtle.deriveBits` throws above it ("iteration counts above
 * 100000 are not supported"), so this is the strongest count the Worker
 * runtime will accept.
 */
const ITERATIONS = 100_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");

const encoded = `pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`;

console.log(encoded);
console.error(`\niterations: ${ITERATIONS}`);
console.error(`salt: ${salt.toString("base64")}`);
console.error("\nPipe the single line above into: wrangler secret put ADMIN_PASSWORD_HASH");