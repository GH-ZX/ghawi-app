-- Contact form submissions for ghawi.app
--
-- The message body is kept in full so nothing is lost; the IP and user agent
-- are stored for abuse investigation and rate limiting only.

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  topic      TEXT,
  message    TEXT    NOT NULL,
  locale     TEXT,
  ip         TEXT,
  user_agent TEXT,
  notified   INTEGER NOT NULL DEFAULT 0
);

-- Rate-limit lookup: recent rows for one IP.
CREATE INDEX IF NOT EXISTS idx_contact_ip_created
  ON contact_messages (ip, created_at DESC);

-- Inbox view: newest first.
CREATE INDEX IF NOT EXISTS idx_contact_created
  ON contact_messages (created_at DESC);