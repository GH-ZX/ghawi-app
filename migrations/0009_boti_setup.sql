-- boti.ghawi.app Quick setup: progress per client being onboarded.
-- state holds step statuses, ticked tasks and NON-secret inputs only
-- (see src/lib/boti/setup.ts sanitizeState): never tokens, passwords or keys.
CREATE TABLE IF NOT EXISTS boti_setup (
  name        TEXT PRIMARY KEY,
  brand       TEXT,
  state       TEXT NOT NULL,
  progress    REAL NOT NULL DEFAULT 0,
  finished    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_boti_setup_updated ON boti_setup (updated_at DESC);
