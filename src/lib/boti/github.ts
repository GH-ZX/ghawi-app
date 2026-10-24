/**
 * The few GitHub REST calls boti makes against the Plus Store X repo
 * (BOTI_REPO, e.g. GH-ZX/plus-store-x) with the GITHUB_TOKEN secret.
 * Errors carry GitHub's status and message, never the token.
 */
import { encryptGithubSecret } from "./crypto";

export class GithubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type Github = ReturnType<typeof github>;

/** Client entry in .github/clients.json. */
export type ClientEntry = { name: string; branch: string; repo: string; deploy_key_secret: string };

export type WorkflowRun = {
  id: number;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  head_branch: string;
  head_sha: string;
};

function b64encodeUtf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function b64decodeUtf8(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function github(token: string, repo: string) {
  async function call<T>(path: string, init: RequestInit = {}, okStatuses: number[] = []): Promise<{ status: number; body: T }> {
    const response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "boti.ghawi.app",
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(15_000),
    });
    const text = await response.text();
    const body = (text ? JSON.parse(text) : null) as T;
    if (!response.ok && !okStatuses.includes(response.status)) {
      const message = (body as { message?: string } | null)?.message ?? `HTTP ${response.status}`;
      throw new GithubError(`GitHub ${response.status}: ${message}`, response.status);
    }
    return { status: response.status, body };
  }

  const r = `/repos/${repo}`;

  return {
    repo,

    /** A file's text and blob sha on a branch; null when it doesn't exist. */
    async readFile(path: string, ref: string): Promise<{ text: string; sha: string } | null> {
      const res = await call<{ content?: string; sha: string }>(`${r}/contents/${path}?ref=${encodeURIComponent(ref)}`, {}, [404]);
      if (res.status === 404 || !res.body.content) return null;
      return { text: b64decodeUtf8(res.body.content), sha: res.body.sha };
    },

    /** Creates or updates a file with one commit; returns the commit sha. */
    async writeFile(path: string, branch: string, text: string, message: string, sha?: string): Promise<string> {
      const res = await call<{ commit: { sha: string } }>(`${r}/contents/${path}`, {
        method: "PUT",
        body: JSON.stringify({ message, content: b64encodeUtf8(text), branch, ...(sha ? { sha } : {}) }),
      });
      return res.body.commit.sha;
    },

    async branchSha(branch: string): Promise<string | null> {
      const res = await call<{ object: { sha: string } }>(`${r}/git/ref/heads/${encodeURIComponent(branch)}`, {}, [404]);
      return res.status === 404 ? null : res.body.object.sha;
    },

    async createBranch(branch: string, sha: string): Promise<void> {
      await call(`${r}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }) });
    },

    /** How far `head` is ahead of / behind `base`. */
    async compare(base: string, head: string): Promise<{ ahead: number; behind: number; url: string }> {
      const res = await call<{ ahead_by: number; behind_by: number; html_url: string }>(
        `${r}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
      );
      return { ahead: res.body.ahead_by, behind: res.body.behind_by, url: res.body.html_url };
    },

    /** Merges `head` into `base`: merged (sha), already up to date, or a conflict. */
    async merge(base: string, head: string, message: string): Promise<{ result: "merged" | "up_to_date" | "conflict"; sha?: string }> {
      const res = await call<{ sha?: string } | null>(`${r}/merges`, { method: "POST", body: JSON.stringify({ base, head, commit_message: message }) }, [204, 409]);
      if (res.status === 204) return { result: "up_to_date" };
      if (res.status === 409) return { result: "conflict" };
      return { result: "merged", sha: res.body?.sha };
    },

    /** Latest runs of one workflow file for a branch. */
    async runs(workflowFile: string, branch: string, perPage = 3): Promise<WorkflowRun[]> {
      const res = await call<{ workflow_runs: WorkflowRun[] }>(
        `${r}/actions/workflows/${workflowFile}/runs?branch=${encodeURIComponent(branch)}&per_page=${perPage}`,
        {},
        [404],
      );
      return res.status === 404 ? [] : res.body.workflow_runs;
    },

    /** Starts a workflow_dispatch run (e.g. "Sync client repo" for one branch). */
    async dispatch(workflowFile: string, ref: string, inputs: Record<string, string>): Promise<void> {
      await call(`${r}/actions/workflows/${workflowFile}/dispatches`, { method: "POST", body: JSON.stringify({ ref, inputs }) }, [204]);
    },

    /** Creates or replaces a repository Actions secret. */
    async putSecret(name: string, value: string): Promise<void> {
      const key = await call<{ key_id: string; key: string }>(`${r}/actions/secrets/public-key`);
      await call(`${r}/actions/secrets/${name}`, {
        method: "PUT",
        body: JSON.stringify({ encrypted_value: encryptGithubSecret(value, key.body.key), key_id: key.body.key_id }),
      });
    },

    async hasSecret(name: string): Promise<boolean> {
      const res = await call(`${r}/actions/secrets/${name}`, {}, [404]);
      return res.status !== 404;
    },
  };
}

/** Reads .github/clients.json from main. */
export async function readClients(gh: Github): Promise<{ clients: ClientEntry[]; sha: string | null }> {
  const file = await gh.readFile(".github/clients.json", "main");
  if (!file) return { clients: [], sha: null };
  const parsed = JSON.parse(file.text) as unknown;
  return { clients: Array.isArray(parsed) ? (parsed as ClientEntry[]) : [], sha: file.sha };
}
