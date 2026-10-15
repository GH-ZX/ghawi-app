-- Admin surface: site settings and login throttling.

-- Archived flag on contact messages, toggled from the admin inbox.
ALTER TABLE contact_messages ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_contact_archived
  ON contact_messages (archived, id DESC);

-- Single-row key/value store. `key` is the primary key so upserts are trivial.
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site_title_en',    'Ahmed Ghawi — Software Engineer'),
  ('site_title_ar',    'أحمد غاوي — مهندس برمجيات'),
  ('site_desc_en',     'Software engineer and IT systems specialist. Two commerce platforms in production.'),
  ('site_desc_ar',     'مهندس برمجيات وأخصائي أنظمة تقنية. منصّتان تجاريتان في الإنتاج.'),
  ('maintenance',      '0'),
  ('maintenance_note', 'Back soon. Email me at ahmedghawi3@gmail.com if it is urgent.');

-- Failed-login counter, keyed by IP. Cleared on success.
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip           TEXT PRIMARY KEY,
  attempts     INTEGER NOT NULL DEFAULT 0,
  last_attempt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);