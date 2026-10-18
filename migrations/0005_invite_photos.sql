-- Wedding photos for the thank-you page at invite.ghawi.app.
--
-- The files live in R2 (binding INVITE_PHOTOS): photos/<id>/full and
-- photos/<id>/thumb, both resized in the admin's browser before upload.
-- `id` is random, so photo addresses can't be guessed; `audience` decides
-- which guests may see a photo: everyone, or one party's guests only.

CREATE TABLE IF NOT EXISTS invite_photos (
  id          TEXT    PRIMARY KEY,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  full_type   TEXT    NOT NULL,
  thumb_type  TEXT    NOT NULL,
  caption     TEXT    NOT NULL DEFAULT '',
  audience    TEXT    NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'men', 'women')),
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_invite_photos_sort ON invite_photos (sort, created_at);
