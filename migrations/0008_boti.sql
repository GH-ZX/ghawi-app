-- boti.ghawi.app: the coder's control panel for the Plus Store X client bots.

-- What GitHub doesn't know about a client (clients.json has name, branch, repo, deploy key secret).
CREATE TABLE IF NOT EXISTS boti_clients (
  name              TEXT PRIMARY KEY,
  domain            TEXT,
  supabase_ref      TEXT,
  telegram_bot      TEXT,
  notes             TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Provider / payment API specs: the coder's private catalog (copied into a client's panel by hand).
CREATE TABLE IF NOT EXISTS boti_adapters (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('provider', 'payment')),
  name        TEXT NOT NULL,
  version     INTEGER NOT NULL DEFAULT 1,
  spec        TEXT NOT NULL,
  enabled     INTEGER NOT NULL DEFAULT 0,
  notes       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Activity log: new clients, shipped updates, library changes.
CREATE TABLE IF NOT EXISTS boti_events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  kind    TEXT NOT NULL,
  client  TEXT,
  data    TEXT
);
CREATE INDEX IF NOT EXISTS idx_boti_events_at ON boti_events (id DESC);
