-- Where each wedding photo appears: on the invitation itself ('invite'),
-- on the thank-you page after the wedding ('ended'), or on both.
-- Photos uploaded before this keep showing after the wedding only.
ALTER TABLE invite_photos ADD COLUMN placement TEXT NOT NULL DEFAULT 'ended'
  CHECK (placement IN ('invite', 'ended', 'both'));
