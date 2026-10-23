-- The landing page, editable from Admin → Site.
--
-- The words themselves need no table: they are one JSON document in
-- site_settings under 'site_content', laid over the defaults in
-- src/lib/content.ts. This adds what the new page needs around them.

-- The budget range a visitor picks on the contact form (optional).
ALTER TABLE contact_messages ADD COLUMN budget TEXT;

-- Files the admin uploads for the site: the CV as PDF, per language
-- ('cv-en', 'cv-ar'). Small enough to live in D1 beside their metadata.
CREATE TABLE IF NOT EXISTS site_files (
  key         TEXT    PRIMARY KEY,
  type        TEXT    NOT NULL,
  name        TEXT    NOT NULL DEFAULT '',
  size        INTEGER NOT NULL,
  data        BLOB    NOT NULL,
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Visits and clicks, counted per day. No cookies, no IPs, nothing per person:
-- one row per (day, kind, label, locale) whose count goes up.
--   kind 'view'    label = the page path
--   kind 'click'   label = what was clicked (telegram, whatsapp, bot, cv…)
--   kind 'lead'    label = the contact form's topic
--   kind 'ref'     label = the site a visitor came from
--   kind 'country' label = the visitor's country code
CREATE TABLE IF NOT EXISTS site_events (
  day     TEXT    NOT NULL,
  kind    TEXT    NOT NULL,
  label   TEXT    NOT NULL,
  locale  TEXT    NOT NULL DEFAULT '',
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind, label, locale)
);

CREATE INDEX IF NOT EXISTS idx_site_events_kind_day ON site_events (kind, day);
