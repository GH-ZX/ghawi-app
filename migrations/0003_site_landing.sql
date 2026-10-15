-- Which design the front door (/ ) forwards to: 'grid' or 'film'.
-- Both designs remain directly addressable at /en and /film/en regardless.
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('landing', 'grid');