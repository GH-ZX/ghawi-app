-- -- Which design the front door (/) forwards to: 'grid', 'film' or 'atlas'.
-- Each remains directly addressable at /en, /film/en and /atlas/en regardless.
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('landing', 'grid');