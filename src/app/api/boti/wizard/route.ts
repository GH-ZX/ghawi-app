import { generateDeployKey, randomBase64Key, randomToken } from "@/lib/boti/crypto";
import { readClients, type ClientEntry } from "@/lib/boti/github";
import { setJsoncName, setJsoncVar } from "@/lib/boti/jsonc";
import { botiGuard, CLIENT_NAME, errorText, githubFor, json, logEvent } from "@/lib/boti/server";

export const dynamic = "force-dynamic";

type WizardInput = {
  step?: "deploy_key" | "register" | "branch" | "keys" | "sync";
  name?: string;
  repo?: string;
  domain?: string;
  worker_name?: string;
  supabase_ref?: string;
  supabase_url?: string;
  telegram_bot?: string;
};

const REPO = /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/;
const WORKER = /^[a-z0-9][a-z0-9-]{0,62}$/;

const secretName = (name: string) => `DEPLOY_KEY_${name.toUpperCase().replace(/-/g, "_")}`;

/**
 * The new-client wizard, one step per call so each can be retried:
 *   deploy_key → a fresh Ed25519 pair; the private key goes straight into the
 *                repo secret DEPLOY_KEY_<NAME>, only the public key comes back.
 *   register   → adds the client to .github/clients.json on main (+ boti row).
 *   branch     → client/<name> from main, with the Worker name and SUPABASE_URL.
 *   keys       → ENCRYPTION_KEY and TELEGRAM_WEBHOOK_SECRET, returned once
 *                (nothing is stored).
 *   sync       → runs "Sync client repo" for the branch (once the client has
 *                added the deploy key to their repo).
 */
export async function POST(request: Request) {
  const auth = await botiGuard();
  if ("response" in auth) return auth.response;
  const gh = githubFor(auth.env);
  if (!("repo" in gh)) return gh;
  const db = auth.env.CONTACT_DB;

  const input = (await request.json().catch(() => ({}))) as WizardInput;
  const name = String(input.name ?? "");
  if (!CLIENT_NAME.test(name)) return json({ error: "Name: 2–31 characters, a-z, 0-9 and -" }, 400);
  const branch = `client/${name}`;

  try {
    switch (input.step) {
      case "deploy_key": {
        const key = generateDeployKey(`plus-store-x deploy ${name}`);
        await gh.putSecret(secretName(name), key.privateKey);
        await logEvent(auth.env, "wizard.deploy_key", name, { secret: secretName(name) });
        return json({ ok: true, secret: secretName(name), public_key: key.publicKey });
      }

      case "register": {
        const repo = String(input.repo ?? "").trim();
        if (!REPO.test(repo)) return json({ error: "Client repo: owner/name" }, 400);
        const domain = String(input.domain ?? "").trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || null;
        const bot = String(input.telegram_bot ?? "").trim().replace(/^@/, "") || null;
        const ref = String(input.supabase_ref ?? "").trim() || null;

        const { clients, sha } = await readClients(gh);
        const entry: ClientEntry = { name, branch, repo, deploy_key_secret: secretName(name) };
        const existing = clients.find((c) => c.name === name);
        let commit: string | null = null;
        if (!existing || JSON.stringify(existing) !== JSON.stringify(entry)) {
          const next = existing ? clients.map((c) => (c.name === name ? entry : c)) : [...clients, entry];
          commit = await gh.writeFile(".github/clients.json", "main", `${JSON.stringify(next, null, 2)}\n`, `Register client ${name} (boti.ghawi.app)`, sha ?? undefined);
        }
        await db
          ?.prepare(
            `INSERT INTO boti_clients (name, domain, supabase_ref, telegram_bot) VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(name) DO UPDATE SET domain = COALESCE(?2, domain), supabase_ref = COALESCE(?3, supabase_ref), telegram_bot = COALESCE(?4, telegram_bot)`,
          )
          .bind(name, domain, ref, bot)
          .run();
        await logEvent(auth.env, "wizard.register", name, { repo, commit });
        return json({ ok: true, commit, already: !commit });
      }

      case "branch": {
        const worker = String(input.worker_name ?? "plus-store-x").trim();
        if (!WORKER.test(worker)) return json({ error: "Worker name: a-z, 0-9 and -" }, 400);
        const supabaseUrl = String(input.supabase_url ?? "").trim();
        if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(supabaseUrl)) return json({ error: "Supabase URL: https://<ref>.supabase.co" }, 400);

        let created = false;
        if (!(await gh.branchSha(branch))) {
          const mainSha = await gh.branchSha("main");
          if (!mainSha) return json({ error: "main branch not found" }, 502);
          await gh.createBranch(branch, mainSha);
          created = true;
        }
        const file = await gh.readFile("wrangler.jsonc", branch);
        if (!file) return json({ error: "wrangler.jsonc not found on the branch" }, 502);
        const next = setJsoncVar(setJsoncName(file.text, worker), "SUPABASE_URL", supabaseUrl.replace(/\/$/, ""));
        let commit: string | null = null;
        if (next !== file.text) {
          commit = await gh.writeFile("wrangler.jsonc", branch, next, `${name}: Worker name and Supabase URL (boti.ghawi.app)`, file.sha);
        }
        await logEvent(auth.env, "wizard.branch", name, { created, commit });
        return json({ ok: true, created, commit, branch });
      }

      case "keys": {
        await logEvent(auth.env, "wizard.keys", name, {});
        return json({
          ok: true,
          ENCRYPTION_KEY: randomBase64Key(32),
          TELEGRAM_WEBHOOK_SECRET: randomToken(48),
        });
      }

      case "sync": {
        // After the client added the deploy key: mirror the branch to their repo now.
        if (!(await gh.branchSha(branch))) return json({ error: `${branch} does not exist yet` }, 400);
        await gh.dispatch("sync-client.yml", "main", { branch });
        await logEvent(auth.env, "wizard.sync", name, { branch });
        return json({ ok: true, branch });
      }

      default:
        return json({ error: "unknown_step" }, 400);
    }
  } catch (error) {
    return json({ error: errorText(error) }, 502);
  }
}
