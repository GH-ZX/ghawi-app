-- The wedding invitation at invite.ghawi.app.
--
-- invite_settings: 'config' is the whole invitation (names, wording, both
-- parties, rules, theme) as JSON, edited from Admin → Invitation; 'logo' is
-- an uploaded logo as a data: URL (absent means the drawn أ إ monogram).
-- invite_guests:   one row per personal link (invite.ghawi.app/<slug>).
-- invite_rsvps:    replies. A named guest has at most one (upserted);
--                  the general link (/general) adds a row per reply.

CREATE TABLE IF NOT EXISTS invite_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS invite_guests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  -- "الآنسة", "السيد", "عائلة"… shown before the name; empty for none.
  honorific   TEXT    NOT NULL DEFAULT '',
  -- Which party the link shows: 'men', 'women' or 'both'.
  parties     TEXT    NOT NULL DEFAULT 'both' CHECK (parties IN ('men', 'women', 'both')),
  -- Most people this invitation covers, the guest included.
  seats       INTEGER NOT NULL DEFAULT 1 CHECK (seats BETWEEN 1 AND 30),
  -- A theme for this guest only; NULL follows the invitation's theme.
  theme       TEXT,
  note        TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  first_open  TEXT,
  last_open   TEXT,
  open_count  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invite_rsvps (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id    INTEGER UNIQUE REFERENCES invite_guests(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  attending   INTEGER NOT NULL,
  men         INTEGER NOT NULL DEFAULT 0,
  women       INTEGER NOT NULL DEFAULT 0,
  message     TEXT    NOT NULL DEFAULT '',
  ip          TEXT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_invite_rsvps_created ON invite_rsvps (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invite_rsvps_ip ON invite_rsvps (ip, created_at DESC);

-- The invitation as first set up. Both parties at the same time — Sunday
-- 25 October 2026, 8 pm Syria time (UTC+3) — in two different halls.
-- The time and map links are edited from the admin.
INSERT OR IGNORE INTO invite_settings (key, value) VALUES ('config', '{
  "groomName": "أحمد خليل غاوي",
  "groomShort": "أحمد",
  "brideDisplay": "كريمته",
  "groomFatherTitle": "الأستاذ",
  "groomFather": "خليل غاوي",
  "groomFatherDeceased": false,
  "brideFatherTitle": "",
  "brideFather": "أحمد كنجو",
  "brideFatherDeceased": true,
  "deceasedLabel": "رحمه الله",
  "opening": "بقلوبٍ يملؤها الفرح، وبمشاعر لا تسعها الكلمات",
  "invitationLine": "يتشرّف {groomFather} بدعوتكم لحضور حفل زفاف نجله {groom} على كريمته، ابنة {brideFather}",
  "personalLine": "حضوركم يُتمّ فرحتنا، ويزيد ليلتنا بهجةً وجمالاً",
  "notesTitle": "ملاحظة",
  "closing": "دمتم ودامت أفراحكم عامرة بالمحبة",
  "families": "آل غاوي · آل كنجو",
  "shareMessage": "{name}، يسعدنا ويشرّفنا حضوركم حفل زفاف أحمد 🤍\nدعوتكم الخاصة هنا:\n{link}",
  "rules": [
    { "icon": "child", "title": "دعوة للكبار فقط", "text": "حرصاً على راحتكم وهدوء الحفل، نعتذر عن اصطحاب الأطفال، ونقبّل وجناتهم عن بُعد." },
    { "icon": "smoke", "title": "سهرة بلا أراكيل", "text": "نرجو التكرّم بعدم إحضار الأراكيل، ليبقى الجوّ صافياً كالفرح." }
  ],
  "events": {
    "men": {
      "title": "حفل الرجال",
      "venue": "مزرعة محمد عمر غاوي",
      "address": "الأتارب، طريق الابزمو",
      "mapUrl": "",
      "note": ""
    },
    "women": {
      "title": "حفل النساء",
      "venue": "صالة البركات",
      "address": "الأتارب",
      "mapUrl": "",
      "note": ""
    }
  },
  "startsAt": "2026-10-25T20:00",
  "utcOffset": "+03:00",
  "rsvpOpen": true,
  "theme": "navy",
  "font": "classic",
  "status": "auto",
  "endedTitle": "تمّ الزواج",
  "endedText": "شكراً لكل من شاركنا الفرح بحضوره ودعائه ومحبته",
  "galleryEnabled": true,
  "galleryTitle": "من ليلة الفرح"
}');
