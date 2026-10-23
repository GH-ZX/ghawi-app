/*
 * The site's default words, in both languages, plus the shape of everything
 * the admin can edit. What the page shows is these defaults with the admin's
 * saved edits laid over them (src/lib/site-content.ts); components never hold
 * copy of their own, so changing text never means touching layout code.
 */

import { SECTION_KEYS, type SectionKey } from "@/lib/sections";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const SITE_URL = "https://ghawi.app";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/** The hero portrait, also used by the CV and structured data. */
export const PORTRAIT = "/media/portrait.jpg";

/** The CV lives on its own subdomain (next.config.ts rewrites it onto /resume). */
export const CV_URL = "https://cv.ghawi.app";

/** Where to link the CV: its subdomain in production, the same pages under /resume while developing. */
export const cvHref = (locale: Locale) =>
  process.env.NODE_ENV === "production" ? `${CV_URL}${locale === "ar" ? "/ar" : ""}` : `/resume/${locale}`;

/**
 * Turnstile site key. Public by design — it is meant to be visible in page
 * source. The matching secret lives in Workers Secrets, never in the repo.
 */
export const turnstileSiteKey = "0x4AAAAAAFWI655DLJFx_2zZ";

/* ------------------------------------------------------------------ *
 *  Shared by both languages (Admin → Site → Basics)
 * ------------------------------------------------------------------ */

export interface Profile {
  name: string;
  nameAr: string;
  /** The full name, for the CV. */
  fullName: string;
  fullNameAr: string;
  email: string;
  /** Handles without the @. */
  telegram: string;
  instagram: string;
  github: string;
  /** As people should read it; the wa.me link keeps the digits. */
  whatsapp: string;
  linkedin: string;
  timeZone: string;
}

export interface Links {
  store: string;
  storeBot: string;
  storeChannel: string;
  storeSource: string;
}

export { SECTION_KEYS, type SectionKey } from "@/lib/sections";

export const AVAILABILITY = ["open", "limited", "booked"] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const HERO_CHANNELS = ["telegram", "whatsapp", "contact"] as const;
export type HeroChannel = (typeof HERO_CHANNELS)[number];

export interface Settings {
  /** Colours the hero badge: green, amber or red. Its words live in hero.status. */
  availability: Availability;
  /** Where the hero's second button goes. */
  heroChannel: HeroChannel;
  /** Page order after the hero; hidden sections leave the page and the nav. */
  sections: { id: SectionKey; visible: boolean }[];
  /** The tools drifting past under the hero. */
  stack: string[];
  /** GH Store's look picker in the footer. */
  looks: boolean;
  /** A Cloudflare Web Analytics token; empty for none. */
  beacon: string;
}

export const ICON_NAMES = ["store", "bot", "code", "globe", "cloud", "chip", "plug"] as const;
export type IconName = (typeof ICON_NAMES)[number];

export const CHANNEL_IDS = ["telegram", "whatsapp", "instagram", "github", "linkedin"] as const;
export type ChannelId = (typeof CHANNEL_IDS)[number];

/** Where a "see an example" link may point: the three showcases. */
export const PROOF_ANCHORS = ["", "#gh-store", "#store-bot", "#storefront"] as const;

export const CASE_SLUGS = ["gh-store", "store-bot", "storefront"] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];

/* ------------------------------------------------------------------ *
 *  One per language
 * ------------------------------------------------------------------ */

export interface Project {
  id: string;
  kicker: string;
  name: string;
  title: string;
  body: string;
  points: string[];
  stack: string[];
  /** Shown with a live dot when the product is publicly reachable. */
  live: boolean;
  links: { label: string; href: string }[];
  /** Alt text for the real screenshots in public/media/<id>. */
  shots: { desktop: string; mobile: string; bar: string };
  cta: { label: string; topic: string };
}

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  challenge: string;
  built: string[];
  result: string;
}

export interface CvEntry {
  role: string;
  org: string;
  place: string;
  period: string;
  points: string[];
}

export interface Dictionary {
  meta: { title: string; description: string; ogAlt: string };
  person: { role: string; location: string };
  ui: {
    skip: string;
    nav: string;
    switchLanguage: string;
    /** The other language's own name, shown on the switch. */
    otherLanguage: string;
    toLight: string;
    toDark: string;
    appearance: string;
    auto: string;
    light: string;
    dark: string;
    newTab: string;
    caseStudy: string;
    showAll: string;
  };
  nav: { work: string; services: string; about: string; contact: string; cta: string; cv: string };
  hero: {
    status: string;
    /** One line of proof above the title. */
    proof: string;
    title: string;
    /** The part of the title set in the accent. */
    titleAccent: string;
    lead: string;
    primary: string;
    /** The second button's words for each place it can go (Settings → hero channel). */
    secondary: { telegram: string; whatsapp: string; contact: string };
    bot: string;
    facts: string[];
    portraitAlt: string;
    liveChip: string;
    /** Floating cards beside the portrait; {products} is GH Store's live product count. */
    productsCard: { value: string; label: string };
    languageCard: { value: string; label: string };
  };
  work: {
    label: string;
    title: string;
    lead: string;
    /** The three showcases at a glance, at the top of the section. */
    glance: { name: string; line: string; href: string }[];
  };
  store: {
    kicker: string;
    title: string;
    body: string;
    doors: { name: string; detail: string }[];
    /** {products} is GH Store's live product count; a figure using it hides when unknown. */
    figures: { value: string; label: string }[];
    principlesTitle: string;
    principles: { title: string; body: string; tech: string }[];
    stack: string[];
    visit: string;
    openBot: string;
    channel: string;
    source: string;
    shots: { desktop: string; mobile: string };
  };
  /** A client's store bot, shown without the client's name. */
  bot: {
    kicker: string;
    title: string;
    body: string;
    points: string[];
    stack: string[];
    note: string;
    video: string;
    stills: string[];
    cta: { label: string; topic: string };
  };
  projects: Project[];
  more: {
    title: string;
    all: string;
    items: { name: string; kind: string; blurb: string; url: string }[];
  };
  testimonials: {
    label: string;
    title: string;
    lead: string;
    items: { quote: string; name: string; role: string; url: string }[];
  };
  services: {
    label: string;
    title: string;
    lead: string;
    cta: string;
    proof: string;
    items: { icon: string; title: string; body: string; topic: string; proof: string }[];
  };
  pricing: {
    label: string;
    title: string;
    lead: string;
    from: string;
    /** Shown in place of a price left empty. */
    quote: string;
    note: string;
    cta: string;
    featured: string;
    items: {
      name: string;
      price: string;
      timeline: string;
      body: string;
      includes: string[];
      topic: string;
      featured: boolean;
    }[];
  };
  process: {
    label: string;
    title: string;
    lead: string;
    steps: { title: string; body: string; time: string }[];
  };
  about: {
    label: string;
    title: string;
    body: string[];
    also: string;
    cv: string;
    layersTitle: string;
    layersNote: string;
    layers: { name: string; tools: string }[];
  };
  contact: {
    label: string;
    title: string;
    body: string;
    reply: string;
    emailLabel: string;
    copy: string;
    copied: string;
    channelsTitle: string;
    channels: { id: string; label: string }[];
    /** Typed into WhatsApp for the visitor when they open the chat. */
    whatsappText: string;
    formTitle: string;
    form: {
      name: string;
      email: string;
      topic: string;
      topicPlaceholder: string;
      topics: { value: string; label: string }[];
      budget: string;
      budgetPlaceholder: string;
      budgets: { value: string; label: string }[];
      message: string;
      messageHint: string;
      submit: string;
      sending: string;
      verifying: string;
      successTitle: string;
      successBody: string;
      sendAnother: string;
      errors: {
        generic: string;
        rate_limited: string;
        invalid_json: string;
        name_required: string;
        email_invalid: string;
        message_too_short: string;
        topic_invalid: string;
        turnstile_failed: string;
      };
    };
  };
  footer: {
    rights: string;
    built: string;
    synced: string;
    /** Shown instead of `synced` when the page wears a classic theme. */
    theme: string;
    localTime: string;
    top: string;
    looks: { title: string; live: string; group: string; reset: string };
  };
  cases: {
    label: string;
    back: string;
    challenge: string;
    built: string;
    result: string;
    stack: string;
    cta: { title: string; body: string; button: string };
    more: string;
    items: CaseStudy[];
  };
  cv: {
    title: string;
    description: string;
    /** Show the portrait on the CV. Many recruiters prefer none. */
    photo: boolean;
    headline: string;
    summary: string;
    labels: {
      contact: string;
      profile: string;
      experience: string;
      projects: string;
      skills: string;
      languages: string;
      education: string;
      training: string;
      download: string;
      print: string;
      back: string;
      other: string;
    };
    experience: CvEntry[];
    projects: { name: string; url: string; period: string; body: string }[];
    skills: { group: string; items: string }[];
    languages: { name: string; level: string }[];
    education: { title: string; place: string; period: string }[];
    training: { title: string; place: string; period: string }[];
  };
}

export interface SiteContent {
  profile: Profile;
  links: Links;
  settings: Settings;
  en: Dictionary;
  ar: Dictionary;
}

/* ------------------------------------------------------------------ *
 *  Defaults
 * ------------------------------------------------------------------ */

const profile: Profile = {
  name: "Ahmed Ghawi",
  nameAr: "أحمد غاوي",
  fullName: "Ahmed Khalil Ghawi",
  fullNameAr: "أحمد خليل غاوي",
  email: "ahmedghuwu3@gmail.com",
  telegram: "ahmedghx",
  instagram: "ahmedghx3",
  github: "GH-ZX",
  whatsapp: "+963 968 098 330",
  linkedin: "https://www.linkedin.com/in/ahmed-gh-17aa35227/",
  // Syria has kept UTC+3 all year since 2022.
  timeZone: "Asia/Damascus",
};

const links: Links = {
  store: "https://gh-store.me",
  storeBot: "https://t.me/ghstore_robot",
  storeChannel: "https://t.me/ghstorex",
  storeSource: "https://github.com/GH-ZX/gh-store-dev",
};

const settings: Settings = {
  availability: "open",
  heroChannel: "telegram",
  sections: SECTION_KEYS.map((id) => ({ id, visible: true })),
  stack: [
    "TypeScript", "React", "Next.js", "Cloudflare Workers", "Supabase", "PostgreSQL", "FastAPI",
    "Python", "grammY", "Aiogram 3", "Telegram Mini Apps", "Redis", "Docker", "Flutter", "C#", "Linux", "Networking",
  ],
  looks: true,
  beacon: "",
};

const en: Dictionary = {
  meta: {
    title: "Ahmed Ghawi — Telegram Bot & Online Store Developer",
    description:
      "I build Telegram store bots, online stores and websites that take real payments, in Arabic and English. Founder of GH Store, live on the web, in a Mini App and in a bot. Remote, worldwide.",
    ogAlt: "Ahmed Ghawi — software engineer. I build stores, bots and websites that take real money.",
  },

  person: {
    role: "Software Engineer & IT Systems Specialist",
    location: "Aleppo, Syria",
  },

  ui: {
    skip: "Skip to content",
    nav: "Main",
    switchLanguage: "Read this page in Arabic",
    otherLanguage: "العربية",
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
    appearance: "Appearance",
    auto: "Auto",
    light: "Light",
    dark: "Dark",
    newTab: "(opens in a new tab)",
    caseStudy: "Read the case study",
    showAll: "Show all",
  },

  nav: { work: "Work", services: "Services", about: "About", contact: "Contact", cta: "Let's talk", cv: "CV" },

  hero: {
    status: "Open to new projects",
    proof: "Founder of GH Store · 1,000+ orders delivered",
    title: "I build stores, bots and websites that take real money.",
    titleAccent: "real money",
    lead: "Telegram store bots, online stores and fast websites, designed, built and run end to end: the database, the payments, the bot that talks to suppliers and the storefront your customers see. The proof is GH Store, live on the web and inside Telegram.",
    primary: "See the work",
    secondary: {
      telegram: "Message me on Telegram",
      whatsapp: "Message me on WhatsApp",
      contact: "Start a conversation",
    },
    bot: "Try my store bot",
    facts: ["Aleppo, Syria · UTC+3", "Arabic & English", "Remote, worldwide"],
    portraitAlt: "Portrait of Ahmed Ghawi",
    liveChip: "GH Store is live",
    productsCard: { value: "{products}+", label: "products on sale in GH Store" },
    languageCard: { value: "AR · EN", label: "Arabic first, both ways" },
  },

  work: {
    label: "Work",
    title: "Shipped, running, taking orders.",
    lead: "Real products, not concept shots — each one designed, built and shipped by me.",
    glance: [
      { name: "GH Store", line: "My own store: website, Mini App and bot", href: "#gh-store" },
      { name: "Store bot", line: "Client project: a whole store in one chat", href: "#store-bot" },
      { name: "Game top-up store", line: "Client project: a web store that delivers itself", href: "#storefront" },
    ],
  },

  store: {
    kicker: "Flagship · Live",
    title: "One store, three doors.",
    body: "A multi-supplier store for digital goods: game top-ups, gift cards, subscriptions and virtual numbers. Customers buy on the website, inside a Telegram Mini App or straight from the bot — one account, one wallet, one catalogue and one order history across all three.",
    doors: [
      { name: "Website", detail: "gh-store.me" },
      { name: "Mini App", detail: "Inside Telegram" },
      { name: "Bot", detail: "@ghstore_robot" },
    ],
    figures: [
      { value: "1,000+", label: "orders delivered" },
      { value: "{products}+", label: "products on sale right now" },
      { value: "5", label: "suppliers behind a single catalogue" },
      { value: "4", label: "payment methods, from Telegram Stars to USDT" },
    ],
    principlesTitle: "Built to be trusted with money",
    principles: [
      {
        title: "Balances that always add up",
        body: "Every change to a wallet writes a line in a ledger, and only the database itself can write one. Nothing can quietly edit a balance.",
        tech: "Integer cents · changed only inside SQL functions · the app server can't touch a wallet",
      },
      {
        title: "No fake payments",
        body: "A payment notice never credits anyone by itself. The store checks with the provider directly before it adds money or delivers an order.",
        tech: "Callbacks are wake-ups only · every credit is re-verified with the provider",
      },
      {
        title: "Nobody is charged twice",
        body: "Double taps, retries and repeated notifications can't charge or credit twice. Every order happens exactly once.",
        tech: "Idempotent orders and top-ups · one unique key per operation",
      },
      {
        title: "No surprise prices",
        body: "If a supplier's cost suddenly jumps, the product pauses for review instead of selling at a loss or overcharging customers.",
        tech: "A price guard on every package · paused for review past its limit",
      },
    ],
    stack: ["Cloudflare Workers", "Supabase Postgres", "Hyperdrive", "TypeScript", "React", "Telegram Bot API"],
    visit: "Visit gh-store.me",
    openBot: "Open the bot",
    channel: "Store channel",
    source: "Source code",
    shots: {
      desktop: "GH Store's home page in a desktop browser",
      mobile: "GH Store on a phone",
    },
  },

  bot: {
    kicker: "Telegram bot · Client project",
    title: "A complete store inside one Telegram chat.",
    body: "Customers browse, pick a pack, pay from their wallet and get their account or code in the same chat — in seconds, with a warranty. Behind it, an admin panel runs the catalogue, providers, payments and support. Built for a client, so shown here without their name.",
    points: [
      "Catalogue, packs and checkout in English and Arabic",
      "Wallet top-ups by Binance Pay, USDT and ShamCash",
      "Instant delivery from several providers, with automatic failover",
      "Warranty, refunds, promo codes, referrals and cashback",
      "Admin panel: pricing, stock, orders, tickets and broadcasts",
    ],
    stack: ["TypeScript", "grammY", "Hono", "Cloudflare Workers", "Supabase", "React"],
    note: "Real screens from the bot. Prices and accounts are examples.",
    video: "The bot taking an order: shop, pick a pack, pay from the wallet, receive it in the chat",
    stills: ["The bot's main menu", "Checkout with the wallet", "The order delivered in the chat"],
    cta: { label: "I want a bot like this", topic: "telegram" },
  },

  projects: [
    {
      id: "storefront",
      kicker: "Web store · Live",
      name: "Game top-up storefront",
      title: "Where it started.",
      body: "A bilingual shop for game top-ups and gift cards: dozens of games, packs synced from a supplier and delivered automatically, wallet recharge and invoices. Shown here without its name.",
      points: [
        "Supplier catalogue sync with automatic fulfilment",
        "ShamCash wallet recharge and checkout",
        "Order and recharge invoices as PNG or PDF",
        "Arabic and English throughout",
      ],
      stack: ["React", "Vite", "Tailwind CSS", "Supabase", "Edge Functions"],
      live: true,
      links: [],
      shots: {
        desktop: "The store's home page: a featured game and the full catalogue strip",
        mobile: "A game's page on a phone: packs with prices and buy buttons",
        bar: "Live store",
      },
      cta: { label: "Ask for a live demo", topic: "web" },
    },
  ],

  more: {
    title: "More on GitHub",
    all: "All repositories",
    items: [
      {
        name: "gh-store-tele",
        kind: "Telegram bot · Python",
        blurb: "The first GH Store bot: a reseller catalogue with crypto, Telegram Stars and ShamCash top-ups.",
        url: "https://github.com/GH-ZX/gh-store-tele",
      },
      {
        name: "TechVerse-App",
        kind: "Mobile app · Flutter",
        blurb: "Cross-platform e-commerce app with a full admin panel, on clean architecture.",
        url: "https://github.com/GH-ZX/TechVerse-App",
      },
      {
        name: "doomsday-arabic-fix",
        kind: "Localization · C#",
        blurb: "Arabic localization for a C# game: string tables, right-to-left layout and font handling.",
        url: "https://github.com/GH-ZX/doomsday-arabic-fix",
      },
      {
        name: "Za-app",
        kind: "Mobile app · Flutter",
        blurb: "Authentication, offline-first storage and API-backed screens.",
        url: "https://github.com/GH-ZX/Za-app",
      },
      {
        name: "CarrefourMall",
        kind: "Web · React",
        blurb: "Responsive storefront interface built with React and Tailwind CSS.",
        url: "https://github.com/GH-ZX/CarrefourMall",
      },
    ],
  },

  testimonials: {
    label: "Clients",
    title: "What clients say.",
    lead: "In their own words, from projects that are live today.",
    items: [],
  },

  services: {
    label: "Services",
    title: "What you can hand me.",
    lead: "Tell me the result you want. I'll handle the stack, the payments and the launch.",
    cta: "Start this",
    proof: "See an example",
    items: [
      {
        icon: "bot",
        title: "Telegram store bots",
        body: "Bots that sell, take payments and deliver on their own — catalogues, wallets, Stars and crypto checkout, Mini Apps and an admin panel to run it all.",
        topic: "telegram",
        proof: "#store-bot",
      },
      {
        icon: "store",
        title: "Online stores",
        body: "Storefronts, wallets, ledgers and order pipelines that take real payments, deliver automatically and survive retries.",
        topic: "product",
        proof: "#gh-store",
      },
      {
        icon: "code",
        title: "Websites & web apps",
        body: "Landing pages, company sites and dashboards in Next.js and React — fast, in Arabic and English, and built to be maintained after launch.",
        topic: "web",
        proof: "#storefront",
      },
      {
        icon: "plug",
        title: "Payments & integrations",
        body: "ShamCash, Binance Pay, USDT, Telegram Stars, supplier APIs and automations, wired into one flow that keeps the books straight.",
        topic: "product",
        proof: "#gh-store",
      },
      {
        icon: "globe",
        title: "Arabic-first interfaces",
        body: "Right-to-left layouts and bilingual content done properly from day one, not mirrored as an afterthought.",
        topic: "web",
        proof: "#gh-store",
      },
      {
        icon: "cloud",
        title: "Cloud, DevOps & upkeep",
        body: "Cloudflare, Supabase and Docker; CI/CD, backups and monitoring — and someone to call when something breaks after launch.",
        topic: "infrastructure",
        proof: "",
      },
    ],
  },

  pricing: {
    label: "Pricing",
    title: "Ways to work together.",
    lead: "A fixed scope and a fixed price, agreed before any work starts. Every project comes with the source code and a proper handover.",
    from: "From",
    quote: "Quote within 24 h",
    note: "Prices in US dollars. You get a written quote after a short chat about what you need.",
    cta: "Get a quote",
    featured: "Most requested",
    items: [
      {
        name: "Telegram store bot",
        price: "",
        timeline: "2–4 weeks",
        body: "A bot that sells, takes payments and delivers on its own.",
        includes: [
          "Catalogue, cart and checkout in Arabic & English",
          "Wallet top-ups: ShamCash, USDT, Binance Pay or Stars",
          "Admin panel for products, orders and customers",
          "Automatic delivery from your suppliers",
        ],
        topic: "telegram",
        featured: true,
      },
      {
        name: "Website or landing page",
        price: "",
        timeline: "1–2 weeks",
        body: "A fast, bilingual site that turns visitors into messages.",
        includes: [
          "Designed and built in Next.js",
          "Arabic and English, right-to-left done properly",
          "Contact form, analytics and search basics",
          "Hosting set up on Cloudflare",
        ],
        topic: "web",
        featured: false,
      },
      {
        name: "Full online store",
        price: "",
        timeline: "4–8 weeks",
        body: "Website, Mini App and bot on one core — like GH Store.",
        includes: [
          "One catalogue, one wallet, one order history",
          "Supplier sync and automatic fulfilment",
          "Payment gateways and an audited ledger",
          "Admin dashboard, invoices and reports",
        ],
        topic: "product",
        featured: false,
      },
      {
        name: "Monthly care",
        price: "",
        timeline: "Monthly",
        body: "For a site or bot that's already live and has to stay that way.",
        includes: [
          "Monitoring, fixes and security updates",
          "Backups you can actually restore",
          "Small changes every month",
          "Priority replies on Telegram",
        ],
        topic: "infrastructure",
        featured: false,
      },
    ],
  },

  process: {
    label: "Process",
    title: "How we'll work.",
    lead: "Clear steps, a fixed price, and something you can try every week.",
    steps: [
      { title: "Chat", body: "Tell me what you're building — on Telegram, WhatsApp or the form below.", time: "Day 1" },
      { title: "Quote", body: "A written scope, price and timeline. Nothing starts until you agree to it.", time: "1–2 days" },
      { title: "Build", body: "Weekly demos you can click through, on a private link or a test bot.", time: "1–8 weeks" },
      { title: "Launch", body: "I deploy it, connect payments and domains, and hand over the code and the admin.", time: "Launch day" },
      { title: "Support", body: "Fixes are free for 30 days after launch; a monthly care plan after that is optional.", time: "After launch" },
    ],
  },

  about: {
    label: "About",
    title: "Most engineers live in one layer. I work across all of them.",
    body: [
      "I'm an informatics engineer from Aleppo. I started out diagnosing motherboards and running office networks, and the habit stuck: I still think about the machine underneath the software.",
      "Today that means I can take a project from an idea to a store taking real money — the schema, the ledger, the bot that talks to suppliers, the edge in front of it and the deployment that keeps it up. One accountable person, from brief to production.",
    ],
    also: "I still look after the hardware too: servers, networks and camera systems, IT support, clean installs and security hardening.",
    cv: "Read my CV",
    layersTitle: "The whole stack",
    layersNote: "Where I work, top to bottom",
    layers: [
      { name: "Customer", tools: "Websites, Telegram bots, Mini Apps" },
      { name: "Interface", tools: "React, Next.js, TypeScript, Flutter" },
      { name: "Application", tools: "Workers, Hono, FastAPI, grammY, Aiogram 3" },
      { name: "Data", tools: "PostgreSQL, PL/pgSQL, Redis, Supabase" },
      { name: "Delivery", tools: "Cloudflare, Docker, CI/CD" },
      { name: "Machine", tools: "Linux, servers, networks, cameras, hardware" },
    ],
  },

  contact: {
    label: "Contact",
    title: "Let's build something that actually runs.",
    body: "Open to Telegram commerce, online stores, websites and infrastructure work — remote, worldwide. Tell me what you're building and where it's stuck.",
    reply: "I reply within 24 hours — usually much faster on Telegram.",
    emailLabel: "Email",
    copy: "Copy",
    copied: "Copied",
    channelsTitle: "Or reach me on",
    channels: [
      { id: "telegram", label: "Telegram" },
      { id: "whatsapp", label: "WhatsApp" },
      { id: "instagram", label: "Instagram" },
      { id: "github", label: "GitHub" },
      { id: "linkedin", label: "LinkedIn" },
    ],
    whatsappText: "Hi Ahmed, I found you on ghawi.app and I'd like to talk about a project.",
    formTitle: "Send a message",
    form: {
      name: "Name",
      email: "Email",
      topic: "Topic",
      topicPlaceholder: "Choose one (optional)",
      topics: [
        { value: "telegram", label: "Telegram bot" },
        { value: "product", label: "Online store" },
        { value: "web", label: "Website or web app" },
        { value: "infrastructure", label: "Cloud & DevOps" },
        { value: "it", label: "IT support" },
        { value: "other", label: "Something else" },
      ],
      budget: "Budget",
      budgetPlaceholder: "Choose a range (optional)",
      budgets: [
        { value: "under-300", label: "Under $300" },
        { value: "300-1000", label: "$300 – $1,000" },
        { value: "1000-3000", label: "$1,000 – $3,000" },
        { value: "3000-plus", label: "$3,000 and up" },
        { value: "unsure", label: "Not sure yet" },
      ],
      message: "Message",
      messageHint: "What are you building? A few sentences is plenty.",
      submit: "Send message",
      sending: "Sending…",
      verifying: "Checking you're human…",
      successTitle: "Message received",
      successBody: "Thanks for writing. I'll reply to the email you gave within 24 hours.",
      sendAnother: "Send another",
      errors: {
        generic: "Something went wrong. Try again, or email me directly.",
        rate_limited: "Too many messages from this connection. Try again in an hour.",
        invalid_json: "Something went wrong. Try again.",
        name_required: "Please add your name.",
        email_invalid: "That email address doesn't look right.",
        message_too_short: "Please add a little more detail (10 characters or more).",
        topic_invalid: "Please pick a topic from the list.",
        turnstile_failed: "We couldn't confirm you're human. Try again.",
      },
    },
  },

  footer: {
    rights: "All rights reserved.",
    built: "Designed and built in Aleppo, Syria.",
    synced: "Wears GH Store's design system",
    theme: "Theme",
    localTime: "Local time in Aleppo",
    top: "Back to top",
    looks: {
      title: "GH Store's looks",
      live: "Live on the store",
      group: "GH Store design presets",
      reset: "Back to this site's look",
    },
  },

  cases: {
    label: "Case study",
    back: "All work",
    challenge: "The goal",
    built: "What I built",
    result: "Where it is now",
    stack: "Built with",
    cta: {
      title: "Want something like this?",
      body: "Tell me what you're building. You'll get a scope, a price and a timeline within a day.",
      button: "Start a conversation",
    },
    more: "More work",
    items: [
      {
        slug: "gh-store",
        title: "GH Store — one store on the web, in a Mini App and in a bot",
        description:
          "How I built and run GH Store: one catalogue, one wallet and one order history across a website, a Telegram Mini App and a bot, with payments that can't charge twice.",
        challenge:
          "Digital goods — game top-ups, gift cards, subscriptions, virtual numbers — come from several suppliers, each with its own API, prices and ways to fail. Customers in the region pay in very different ways, from ShamCash to USDT to Telegram Stars, and many of them live inside Telegram rather than a browser.",
        built: [
          "One core behind three doors: the website, a Telegram Mini App and a bot share one account, one wallet, one catalogue and one order history.",
          "Five suppliers behind a single catalogue, with automatic fulfilment and a price guard that pauses a package when its cost jumps.",
          "Four payment methods — ShamCash, USDT (BEP20), NOWPayments and Telegram Stars — feeding one audited wallet ledger.",
          "Money moves only inside the database: integer cents, ledger rows and idempotent orders, so retries and duplicate callbacks can't charge twice.",
          "Four design presets in light and dark, picked from the store's admin. This site wears the same design system.",
        ],
        result:
          "GH Store is live at gh-store.me and in Telegram as @ghstore_robot. It has delivered more than 1,000 orders, and every new feature reaches all three doors at once.",
      },
      {
        slug: "store-bot",
        title: "A complete store inside one Telegram chat",
        description:
          "A client's Telegram store bot: catalogue, wallet top-ups, instant delivery from several providers, warranty and a full admin panel, on Cloudflare Workers.",
        challenge:
          "Sell digital accounts and codes inside Telegram without handling orders by hand: customers should browse, pay, receive and get support in the same chat, at any hour, while the owner runs everything from one panel.",
        built: [
          "A catalogue of packs with checkout in English and Arabic, paid from an in-bot wallet.",
          "Wallet top-ups by Binance Pay, USDT and ShamCash.",
          "Instant delivery from several providers, with automatic failover when one is down.",
          "Warranty claims, refunds, promo codes, referrals and cashback.",
          "An admin panel for pricing, stock, orders, support tickets and broadcasts.",
        ],
        result:
          "The bot runs the client's store on its own: customers buy and receive in seconds, and the owner manages it all from the admin panel. Shown without the client's name.",
      },
      {
        slug: "storefront",
        title: "A bilingual game top-up store",
        description:
          "A web store for game top-ups and gift cards: supplier catalogue sync, automatic fulfilment, ShamCash wallet recharge and invoices, in Arabic and English.",
        challenge:
          "Players want to top up a game in a minute, in their own language, with a payment method they already use — and the owner can't copy every pack and price from the supplier by hand.",
        built: [
          "Supplier catalogue sync: dozens of games and their packs kept up to date automatically.",
          "Automatic fulfilment the moment an order is paid.",
          "ShamCash wallet recharge and checkout.",
          "Order and recharge invoices as PNG or PDF.",
          "Arabic and English throughout, right-to-left done properly.",
        ],
        result:
          "The store is live and selling. It's where my commerce work started, and its lessons shaped GH Store's ledger and supplier sync. Shown without its name.",
      },
    ],
  },

  cv: {
    title: "Ahmed Ghawi — CV",
    description:
      "CV of Ahmed Ghawi: software engineer and IT systems specialist. Telegram commerce, online stores, cloud and DevOps, servers and networks.",
    photo: false,
    headline: "Software Engineer · Telegram Commerce · IT Systems & DevOps",
    summary:
      "Informatics engineer from Aleppo, Syria. I design, build and run commerce systems end to end — Telegram bots, Mini Apps, online stores and the cloud they run on — and I founded GH Store, a multi-supplier digital goods store that has delivered more than 1,000 orders. Hands-on with servers, networks, camera systems and IT support. Arabic native, working in English, available remotely.",
    labels: {
      contact: "Contact",
      profile: "Profile",
      experience: "Experience",
      projects: "Selected projects",
      skills: "Skills",
      languages: "Languages",
      education: "Education",
      training: "Training",
      download: "Download PDF",
      print: "Print",
      back: "ghawi.app",
      other: "العربية",
    },
    experience: [
      {
        role: "IT Systems Administrator & DevOps",
        org: "",
        place: "Aleppo, Syria",
        period: "2026 – Present",
        points: [
          "Run the servers: setup, updates, backups, monitoring and user access.",
          "Install and maintain surveillance camera systems and the networks behind them.",
          "Technical and IT support for staff: hardware, software, accounts and connectivity.",
          "DevOps: deployments, automation and keeping services up.",
        ],
      },
      {
        role: "Founder & Lead Engineer",
        org: "GH Store",
        place: "Remote",
        period: "2026 – Present",
        points: [
          "Built and run a multi-supplier digital goods store on the web, in a Telegram Mini App and in a bot, on one shared core.",
          "Designed an audited wallet ledger in Postgres: integer cents, idempotent orders and re-verified provider callbacks.",
          "Integrated 5 suppliers and 4 payment methods (ShamCash, USDT BEP20, NOWPayments, Telegram Stars); 1,000+ orders delivered.",
          "TypeScript, React, Cloudflare Workers, Hyperdrive, Supabase Postgres, Telegram Bot API.",
        ],
      },
      {
        role: "Freelance Software Engineer",
        org: "Telegram bots & web stores",
        place: "Remote",
        period: "2026 – Present",
        points: [
          "A client's Telegram store bot: catalogue, wallet top-ups (Binance Pay, USDT, ShamCash), instant delivery with failover, warranty, referrals and an admin panel (TypeScript, grammY, Hono, Workers, Supabase).",
          "A bilingual game top-up store with supplier catalogue sync, automatic fulfilment, wallet recharge and PNG/PDF invoices (React, Vite, Supabase Edge Functions).",
        ],
      },
      {
        role: "IT Specialist — Hardware & Networks",
        org: "Freelance",
        place: "Aleppo, Syria",
        period: "Ongoing",
        points: [
          "Network and server administration: secure connectivity, user accounts and permissions.",
          "Hardware diagnosis and repair down to the motherboard; OS installs and security hardening.",
        ],
      },
      {
        role: "Web & Android App Developer",
        org: "Freelance",
        place: "Remote",
        period: "2022 – 2023",
        points: ["Built Android apps and managed web projects, with a focus on user experience and clean code."],
      },
      {
        role: "Data Entry & Monitoring",
        org: "Subul · My Humanity",
        place: "Syria",
        period: "2020 – 2023",
        points: ["Accurate data handling and system monitoring for organizations including Subul and My Humanity."],
      },
    ],
    projects: [
      {
        name: "GH Store",
        url: "https://gh-store.me",
        period: "2026",
        body: "Digital goods store on the web, in a Telegram Mini App and in a bot: one wallet, five suppliers, four payment methods.",
      },
      {
        name: "ghawi.app",
        url: "https://ghawi.app",
        period: "2026",
        body: "This site and its admin: bilingual Next.js on Cloudflare Workers with D1 and R2, an inbox, live theming, stats and a wedding invitation with RSVPs.",
      },
      {
        name: "gh-store-tele",
        url: "https://github.com/GH-ZX/gh-store-tele",
        period: "2026",
        body: "The first GH Store bot in Python (Aiogram 3): reseller catalogue with crypto, Telegram Stars and ShamCash top-ups.",
      },
      {
        name: "TechVerse",
        url: "https://github.com/GH-ZX/TechVerse-App",
        period: "2025",
        body: "Flutter e-commerce app for tech gear with a full admin panel, on clean architecture.",
      },
      {
        name: "doomsday-arabic-fix",
        url: "https://github.com/GH-ZX/doomsday-arabic-fix",
        period: "2026",
        body: "Arabic localization for a C# game: string tables, right-to-left layout and font handling.",
      },
    ],
    skills: [
      { group: "Languages", items: "TypeScript, JavaScript, Python, SQL (PL/pgSQL), Dart, C#" },
      { group: "Front end", items: "React, Next.js, Vite, Tailwind CSS, Flutter, Telegram Mini Apps" },
      { group: "Back end", items: "Cloudflare Workers, Hono, FastAPI, Node.js, grammY, Aiogram 3" },
      { group: "Data", items: "PostgreSQL, Supabase, Cloudflare D1 & R2, Redis, SQLite" },
      { group: "Payments", items: "ShamCash, Binance Pay, USDT (BEP20), NOWPayments, Telegram Stars" },
      { group: "DevOps & IT", items: "Docker, CI/CD, Linux servers, networking, camera systems, hardware repair" },
    ],
    languages: [
      { name: "Arabic", level: "Native" },
      { name: "English", level: "Working proficiency" },
    ],
    education: [{ title: "Informatics Engineering", place: "University of Science and Renaissance, Azaz", period: "" }],
    training: [{ title: "1000 Programmers course — Flutter", place: "Final project: PC Land store app", period: "2025" }],
  },
};

// "‎" (a left-to-right mark) after "C#" keeps the "#" beside its letter in Arabic text.
const ar: Dictionary = {
  meta: {
    title: "أحمد غاوي — مبرمج بوتات تيليجرام ومتاجر إلكترونية",
    description:
      "أبني بوتات متاجر على تيليجرام ومتاجر إلكترونية ومواقع تستقبل مدفوعات حقيقية، بالعربية والإنجليزية. مؤسس GH Store الذي يعمل على الويب وفي تطبيق مصغّر وبوت. أعمل عن بُعد لأي مكان.",
    ogAlt: "أحمد غاوي — مهندس برمجيات. أبني متاجر وبوتات ومواقع تستقبل أموالاً حقيقية.",
  },

  person: {
    role: "مهندس برمجيات وأخصائي أنظمة تقنية",
    location: "حلب، سوريا",
  },

  ui: {
    skip: "تخطَّ إلى المحتوى",
    nav: "التنقّل الرئيسي",
    switchLanguage: "اقرأ هذه الصفحة بالإنجليزية",
    otherLanguage: "English",
    toLight: "التبديل إلى الوضع الفاتح",
    toDark: "التبديل إلى الوضع الداكن",
    appearance: "المظهر",
    auto: "تلقائي",
    light: "فاتح",
    dark: "داكن",
    newTab: "(يفتح في نافذة جديدة)",
    caseStudy: "اقرأ القصة كاملة",
    showAll: "عرض الكل",
  },

  nav: { work: "الأعمال", services: "الخدمات", about: "عنّي", contact: "تواصل", cta: "لنتحدّث", cv: "السيرة الذاتية" },

  hero: {
    status: "متاح لمشاريع جديدة",
    proof: "مؤسس GH Store · أكثر من 1,000 طلب مُسلَّم",
    title: "أبني متاجر وبوتات ومواقع تستقبل أموالاً حقيقية.",
    titleAccent: "أموالاً حقيقية",
    lead: "بوتات متاجر على تيليجرام، ومتاجر إلكترونية، ومواقع سريعة — أصمّمها وأبنيها وأشغّلها من أولها إلى آخرها: قاعدة البيانات، والمدفوعات، والبوت الذي يتحدّث مع المزوّدين، والواجهة التي يراها عملاؤك. والدليل GH Store، يعمل الآن على الويب وداخل تيليجرام.",
    primary: "شاهد الأعمال",
    secondary: {
      telegram: "راسلني على تيليجرام",
      whatsapp: "راسلني على واتساب",
      contact: "ابدأ محادثة",
    },
    bot: "جرّب بوت متجري",
    facts: ["حلب، سوريا · UTC+3", "العربية والإنجليزية", "عن بُعد، لأي مكان"],
    portraitAlt: "صورة أحمد غاوي",
    liveChip: "GH Store يعمل الآن",
    productsCard: { value: "+{products}", label: "منتج معروض في GH Store" },
    languageCard: { value: "ع · EN", label: "العربية أولاً، وبالاتجاهين" },
  },

  work: {
    label: "الأعمال",
    title: "منشورة، تعمل، وتستقبل الطلبات.",
    lead: "منتجات حقيقية لا نماذج عرض — كلّ منها صمّمته وبنيته وأطلقته بنفسي.",
    glance: [
      { name: "GH Store", line: "متجري الخاص: موقع وتطبيق مصغّر وبوت", href: "#gh-store" },
      { name: "بوت متجر", line: "مشروع لعميل: متجر كامل في محادثة واحدة", href: "#store-bot" },
      { name: "متجر شحن ألعاب", line: "مشروع لعميل: متجر ويب يسلّم وحده", href: "#storefront" },
    ],
  },

  store: {
    kicker: "المشروع الرئيسي · يعمل الآن",
    title: "متجر واحد بثلاث واجهات.",
    body: "متجر للمنتجات الرقمية يجمع عدّة مزوّدين: شحن الألعاب، والبطاقات، والاشتراكات، والأرقام الافتراضية. يشتري العميل من الموقع أو من تطبيق تيليجرام المصغّر أو من البوت مباشرةً — بحساب واحد ومحفظة واحدة وكتالوج واحد وسجلّ طلبات واحد في الواجهات الثلاث.",
    doors: [
      { name: "الموقع", detail: "gh-store.me" },
      { name: "التطبيق المصغّر", detail: "داخل تيليجرام" },
      { name: "البوت", detail: "@ghstore_robot" },
    ],
    figures: [
      { value: "+1,000", label: "طلب مُسلَّم" },
      { value: "+{products}", label: "منتج معروض الآن" },
      { value: "5", label: "مزوّدين خلف كتالوج واحد" },
      { value: "4", label: "طرق دفع، من نجوم تيليجرام إلى USDT" },
    ],
    principlesTitle: "مبنيّ ليُؤتمَن على المال",
    principles: [
      {
        title: "أرصدة لا تخطئ",
        body: "كل تغيير في المحفظة يُكتب سطراً في دفتر حسابات، ولا يكتبه إلا قاعدة البيانات نفسها. لا شيء يستطيع تعديل رصيد بصمت.",
        tech: "سنتات بأعداد صحيحة · التغيير داخل دوال SQL فقط · خادم التطبيق لا يلمس المحافظ",
      },
      {
        title: "لا دفعات وهمية",
        body: "إشعار الدفع لا يضيف رصيداً لأحد بمفرده؛ يتحقّق المتجر من المزوّد مباشرةً قبل أن يضيف المال أو يسلّم الطلب.",
        tech: "الإشعار مجرّد تنبيه · كل إضافة رصيد يُعاد التحقّق منها",
      },
      {
        title: "لا خصم مرّتين",
        body: "النقر المزدوج وإعادة المحاولة وتكرار الإشعارات لا تخصم ولا تضيف مرّتين؛ كل طلب يحدث مرّة واحدة فقط.",
        tech: "طلبات وشحن محميّة من التكرار · مفتاح فريد لكل عملية",
      },
      {
        title: "لا مفاجآت في الأسعار",
        body: "إذا قفزت تكلفة المزوّد فجأة، يتوقّف المنتج للمراجعة بدل أن يُباع بخسارة أو بسعر مبالغ فيه.",
        tech: "حارس أسعار لكل باقة · إيقاف للمراجعة عند تجاوز الحدّ",
      },
    ],
    stack: ["Cloudflare Workers", "Supabase Postgres", "Hyperdrive", "TypeScript", "React", "Telegram Bot API"],
    visit: "زيارة gh-store.me",
    openBot: "افتح البوت",
    channel: "قناة المتجر",
    source: "الكود المصدري",
    shots: {
      desktop: "الصفحة الرئيسية لمتجر GH Store في متصفّح حاسوب",
      mobile: "متجر GH Store على الهاتف",
    },
  },

  bot: {
    kicker: "بوت تيليجرام · مشروع لعميل",
    title: "متجر كامل داخل محادثة تيليجرام واحدة.",
    body: "يتصفّح العميل، يختار الباقة، يدفع من محفظته، ويستلم حسابه أو الكود في المحادثة نفسها — خلال ثوانٍ، ومع ضمان. وخلفه لوحة تحكّم تدير الكتالوج والمزوّدين والمدفوعات والدعم. بنيته لعميل، لذلك يظهر هنا دون اسمه.",
    points: [
      "كتالوج وباقات ودفع بالعربية والإنجليزية",
      "شحن المحفظة عبر Binance Pay وUSDT وShamCash",
      "تسليم فوري من عدّة مزوّدين، مع تحويل تلقائي عند العطل",
      "ضمان واسترداد وأكواد خصم وإحالات واسترجاع نقدي",
      "لوحة تحكّم: التسعير والمخزون والطلبات والتذاكر والرسائل الجماعية",
    ],
    stack: ["TypeScript", "grammY", "Hono", "Cloudflare Workers", "Supabase", "React"],
    note: "شاشات حقيقية من البوت. الأسعار والحسابات أمثلة.",
    video: "البوت يستقبل طلباً: المتجر، اختيار الباقة، الدفع من المحفظة، والاستلام في المحادثة",
    stills: ["القائمة الرئيسية للبوت", "إتمام الشراء بالمحفظة", "تسليم الطلب في المحادثة"],
    cta: { label: "أريد بوتاً مثله", topic: "telegram" },
  },

  projects: [
    {
      id: "storefront",
      kicker: "متجر ويب · يعمل الآن",
      name: "متجر شحن ألعاب",
      title: "من هنا بدأت.",
      body: "متجر ثنائي اللغة لشحن الألعاب والبطاقات: عشرات الألعاب، وباقات تُزامَن من المزوّد وتُسلَّم تلقائياً، وشحن للمحفظة وفواتير. يظهر هنا دون اسمه.",
      points: [
        "مزامنة كتالوج المزوّد مع تنفيذ تلقائي للطلبات",
        "شحن المحفظة والدفع عبر ShamCash",
        "فواتير الطلبات والشحن بصيغتي PNG وPDF",
        "بالعربية والإنجليزية في كل مكان",
      ],
      stack: ["React", "Vite", "Tailwind CSS", "Supabase", "Edge Functions"],
      live: true,
      links: [],
      shots: {
        desktop: "الصفحة الرئيسية للمتجر: لعبة مميّزة وشريط الكتالوج كاملاً",
        mobile: "صفحة لعبة على الهاتف: الباقات بأسعارها وأزرار الشراء",
        bar: "متجر يعمل الآن",
      },
      cta: { label: "اطلب عرضاً حيّاً", topic: "web" },
    },
  ],

  more: {
    title: "المزيد على GitHub",
    all: "كل المستودعات",
    items: [
      {
        name: "gh-store-tele",
        kind: "بوت تيليجرام · Python",
        blurb: "أوّل بوت لـ GH Store: كتالوج لإعادة البيع مع شحن بالكريبتو ونجوم تيليجرام وShamCash.",
        url: "https://github.com/GH-ZX/gh-store-tele",
      },
      {
        name: "TechVerse-App",
        kind: "تطبيق جوال · Flutter",
        blurb: "تطبيق تجارة إلكترونية متعدّد المنصّات بلوحة تحكّم كاملة، على بنية نظيفة.",
        url: "https://github.com/GH-ZX/TechVerse-App",
      },
      {
        name: "doomsday-arabic-fix",
        kind: "تعريب · C#‎",
        blurb: "تعريب لعبة مكتوبة بـ C#‎: جداول النصوص، والتخطيط من اليمين إلى اليسار، ومعالجة الخطوط.",
        url: "https://github.com/GH-ZX/doomsday-arabic-fix",
      },
      {
        name: "Za-app",
        kind: "تطبيق جوال · Flutter",
        blurb: "مصادقة، وتخزين يعمل دون اتصال، وشاشات مبنيّة على واجهات برمجية.",
        url: "https://github.com/GH-ZX/Za-app",
      },
      {
        name: "CarrefourMall",
        kind: "ويب · React",
        blurb: "واجهة متجر متجاوبة مبنيّة بـ React وTailwind CSS.",
        url: "https://github.com/GH-ZX/CarrefourMall",
      },
    ],
  },

  testimonials: {
    label: "العملاء",
    title: "ماذا يقول العملاء.",
    lead: "بكلماتهم، من مشاريع تعمل اليوم.",
    items: [],
  },

  services: {
    label: "الخدمات",
    title: "ما يمكنك أن تسلّمه لي.",
    lead: "أخبرني بالنتيجة التي تريدها، وأنا أتولّى التقنية والمدفوعات والإطلاق.",
    cta: "ابدأ هذا",
    proof: "شاهد مثالاً",
    items: [
      {
        icon: "bot",
        title: "بوتات متاجر على تيليجرام",
        body: "بوتات تبيع وتستقبل المدفوعات وتسلّم وحدها — كتالوج ومحفظة ودفع بالنجوم والكريبتو وتطبيقات مصغّرة ولوحة تحكّم تدير كل شيء.",
        topic: "telegram",
        proof: "#store-bot",
      },
      {
        icon: "store",
        title: "متاجر إلكترونية",
        body: "واجهات بيع ومحافظ ودفاتر حسابات ومسارات طلبات تستقبل مدفوعات حقيقية، وتسلّم تلقائياً، وتصمد أمام إعادة المحاولة.",
        topic: "product",
        proof: "#gh-store",
      },
      {
        icon: "code",
        title: "مواقع وتطبيقات ويب",
        body: "صفحات تعريفية ومواقع شركات ولوحات تحكّم بـ Next.js وReact — سريعة، بالعربية والإنجليزية، ومبنيّة لتُصان بعد الإطلاق.",
        topic: "web",
        proof: "#storefront",
      },
      {
        icon: "plug",
        title: "المدفوعات والربط",
        body: "ShamCash وBinance Pay وUSDT ونجوم تيليجرام وواجهات المزوّدين والأتمتة، موصولة في مسار واحد يحفظ الحسابات سليمة.",
        topic: "product",
        proof: "#gh-store",
      },
      {
        icon: "globe",
        title: "واجهات عربية أولاً",
        body: "تخطيط من اليمين إلى اليسار ومحتوى ثنائي اللغة مُتقَن من اليوم الأول، لا انعكاساً يُضاف في النهاية.",
        topic: "web",
        proof: "#gh-store",
      },
      {
        icon: "cloud",
        title: "السحابة والـ DevOps والصيانة",
        body: "Cloudflare وSupabase وDocker؛ تكامل ونشر مستمرّان ونسخ احتياطية ومراقبة — وشخص تتّصل به إذا تعطّل شيء بعد الإطلاق.",
        topic: "infrastructure",
        proof: "",
      },
    ],
  },

  pricing: {
    label: "الأسعار",
    title: "طرق العمل معاً.",
    lead: "نطاق عمل ثابت وسعر ثابت، نتّفق عليهما قبل أن يبدأ أي شيء. ومع كل مشروع الكود المصدري وتسليم مرتّب.",
    from: "يبدأ من",
    quote: "عرض سعر خلال 24 ساعة",
    note: "الأسعار بالدولار الأمريكي. يصلك عرض سعر مكتوب بعد محادثة قصيرة عمّا تحتاجه.",
    cta: "اطلب عرض سعر",
    featured: "الأكثر طلباً",
    items: [
      {
        name: "بوت متجر على تيليجرام",
        price: "",
        timeline: "2–4 أسابيع",
        body: "بوت يبيع ويستقبل المدفوعات ويسلّم وحده.",
        includes: [
          "كتالوج وسلّة ودفع بالعربية والإنجليزية",
          "شحن المحفظة: ShamCash أو USDT أو Binance Pay أو النجوم",
          "لوحة تحكّم للمنتجات والطلبات والعملاء",
          "تسليم تلقائي من مزوّديك",
        ],
        topic: "telegram",
        featured: true,
      },
      {
        name: "موقع أو صفحة تعريفية",
        price: "",
        timeline: "1–2 أسبوع",
        body: "موقع سريع ثنائي اللغة يحوّل الزوّار إلى رسائل.",
        includes: [
          "تصميم وبناء بـ Next.js",
          "العربية والإنجليزية، واتجاه من اليمين إلى اليسار متقن",
          "نموذج تواصل وإحصاءات وأساسيات الظهور في البحث",
          "استضافة جاهزة على Cloudflare",
        ],
        topic: "web",
        featured: false,
      },
      {
        name: "متجر إلكتروني كامل",
        price: "",
        timeline: "4–8 أسابيع",
        body: "موقع وتطبيق مصغّر وبوت على نواة واحدة — مثل GH Store.",
        includes: [
          "كتالوج واحد ومحفظة واحدة وسجلّ طلبات واحد",
          "مزامنة المزوّدين وتنفيذ تلقائي للطلبات",
          "بوابات دفع ودفتر حسابات مدقَّق",
          "لوحة تحكّم وفواتير وتقارير",
        ],
        topic: "product",
        featured: false,
      },
      {
        name: "صيانة شهرية",
        price: "",
        timeline: "شهرياً",
        body: "لموقع أو بوت يعمل الآن ويجب أن يبقى كذلك.",
        includes: [
          "مراقبة وإصلاحات وتحديثات أمنية",
          "نسخ احتياطية يمكن استعادتها فعلاً",
          "تعديلات صغيرة كل شهر",
          "أولوية في الرد على تيليجرام",
        ],
        topic: "infrastructure",
        featured: false,
      },
    ],
  },

  process: {
    label: "طريقة العمل",
    title: "كيف سنعمل معاً.",
    lead: "خطوات واضحة، وسعر ثابت، وشيء تجرّبه بيدك كل أسبوع.",
    steps: [
      { title: "محادثة", body: "أخبرني ماذا تبني — على تيليجرام أو واتساب أو عبر النموذج في الأسفل.", time: "اليوم الأول" },
      { title: "عرض سعر", body: "نطاق عمل وسعر ومدّة مكتوبة. لا يبدأ شيء قبل موافقتك.", time: "1–2 يوم" },
      { title: "البناء", body: "عرض أسبوعي تجرّبه بنفسك، على رابط خاص أو بوت تجريبي.", time: "1–8 أسابيع" },
      { title: "الإطلاق", body: "أنشره، وأربط المدفوعات والنطاق، وأسلّمك الكود ولوحة التحكّم.", time: "يوم الإطلاق" },
      { title: "الدعم", body: "الإصلاحات مجانية لمدة 30 يوماً بعد الإطلاق، وبعدها خطة صيانة شهرية اختيارية.", time: "بعد الإطلاق" },
    ],
  },

  about: {
    label: "عنّي",
    title: "معظم المهندسين يعملون في طبقة واحدة. أنا أعمل عبر الطبقات كلّها.",
    body: [
      "أنا مهندس معلوماتية من حلب. بدأت بتشخيص اللوحات الأم وإدارة شبكات المكاتب، وبقيت تلك العادة: ما زلت أفكّر في الآلة التي تعمل تحت البرمجيات.",
      "واليوم يعني ذلك أنني أستطيع أن أنقل مشروعاً من فكرة إلى متجر يستقبل أموالاً حقيقية: قاعدة البيانات، والدفتر المالي، والبوت الذي يتحدّث مع المزوّدين، وطبقة الحافة أمامه، والنشر الذي يبقيه قائماً. شخص واحد مسؤول، من الفكرة حتى الإنتاج.",
    ],
    also: "وما زلت أهتمّ بالعتاد أيضاً: الخوادم والشبكات وأنظمة الكاميرات، والدعم التقني، وتثبيت الأنظمة وتحصينها.",
    cv: "اقرأ سيرتي الذاتية",
    layersTitle: "المنظومة كاملة",
    layersNote: "أين أعمل، من الأعلى إلى الأسفل",
    layers: [
      { name: "العميل", tools: "مواقع، بوتات تيليجرام، تطبيقات مصغّرة" },
      { name: "الواجهة", tools: "React، Next.js، TypeScript، Flutter" },
      { name: "التطبيق", tools: "Workers، Hono، FastAPI، grammY، Aiogram 3" },
      { name: "البيانات", tools: "PostgreSQL، PL/pgSQL، Redis، Supabase" },
      { name: "التشغيل", tools: "Cloudflare، Docker، CI/CD" },
      { name: "الآلة", tools: "Linux، الخوادم، الشبكات، الكاميرات، العتاد" },
    ],
  },

  contact: {
    label: "تواصل",
    title: "لنبنِ شيئاً يعمل فعلاً.",
    body: "متاح لمشاريع تجارة تيليجرام والمتاجر الإلكترونية والمواقع والبنية التحتية — عن بُعد، ولأي مكان. أخبرني ماذا تبني وأين تعثّر.",
    reply: "أردّ خلال 24 ساعة — وعلى تيليجرام عادةً أسرع بكثير.",
    emailLabel: "البريد",
    copy: "نسخ",
    copied: "نُسخ",
    channelsTitle: "أو تواصل عبر",
    channels: [
      { id: "telegram", label: "تيليجرام" },
      { id: "whatsapp", label: "واتساب" },
      { id: "instagram", label: "إنستغرام" },
      { id: "github", label: "GitHub" },
      { id: "linkedin", label: "لينكدإن" },
    ],
    whatsappText: "مرحباً أحمد، وجدتك عبر ghawi.app وأودّ الحديث عن مشروع.",
    formTitle: "أرسل رسالة",
    form: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      topic: "الموضوع",
      topicPlaceholder: "اختر موضوعاً (اختياري)",
      topics: [
        { value: "telegram", label: "بوت تيليجرام" },
        { value: "product", label: "متجر إلكتروني" },
        { value: "web", label: "موقع أو تطبيق ويب" },
        { value: "infrastructure", label: "سحابة و DevOps" },
        { value: "it", label: "دعم تقني" },
        { value: "other", label: "شيء آخر" },
      ],
      budget: "الميزانية",
      budgetPlaceholder: "اختر نطاقاً (اختياري)",
      budgets: [
        { value: "under-300", label: "أقل من 300$" },
        { value: "300-1000", label: "300$ – 1,000$" },
        { value: "1000-3000", label: "1,000$ – 3,000$" },
        { value: "3000-plus", label: "3,000$ فأكثر" },
        { value: "unsure", label: "لست متأكداً بعد" },
      ],
      message: "الرسالة",
      messageHint: "ماذا تبني؟ بضعة أسطر تكفي.",
      submit: "إرسال الرسالة",
      sending: "جارٍ الإرسال…",
      verifying: "نتحقّق من أنك لست روبوتاً…",
      successTitle: "وصلت الرسالة",
      successBody: "شكراً لك. سأردّ على البريد الذي كتبته خلال 24 ساعة.",
      sendAnother: "إرسال رسالة أخرى",
      errors: {
        generic: "حدث خطأ ما. أعد المحاولة أو راسلني مباشرة.",
        rate_limited: "رسائل كثيرة من هذا الاتصال. أعد المحاولة بعد ساعة.",
        invalid_json: "حدث خطأ ما. أعد المحاولة.",
        name_required: "الرجاء كتابة الاسم.",
        email_invalid: "يبدو أن البريد الإلكتروني غير صحيح.",
        message_too_short: "الرجاء إضافة بعض التفاصيل (10 أحرف على الأقل).",
        topic_invalid: "الرجاء اختيار موضوع من القائمة.",
        turnstile_failed: "لم نتمكّن من التحقّق من أنك لست روبوتاً. أعد المحاولة.",
      },
    },
  },

  footer: {
    rights: "جميع الحقوق محفوظة.",
    built: "صُمّم وبُني في حلب، سوريا.",
    synced: "بنظام تصميم GH Store",
    theme: "السمة",
    localTime: "التوقيت في حلب",
    top: "العودة للأعلى",
    looks: {
      title: "أشكال GH Store",
      live: "المعتمد في المتجر",
      group: "أشكال تصميم GH Store",
      reset: "العودة إلى شكل الموقع",
    },
  },

  cases: {
    label: "قصة مشروع",
    back: "كل الأعمال",
    challenge: "الهدف",
    built: "ماذا بنيت",
    result: "أين وصل اليوم",
    stack: "بُني بـ",
    cta: {
      title: "تريد شيئاً مثل هذا؟",
      body: "أخبرني ماذا تبني، ويصلك نطاق العمل والسعر والمدّة خلال يوم.",
      button: "ابدأ محادثة",
    },
    more: "أعمال أخرى",
    items: [
      {
        slug: "gh-store",
        title: "GH Store — متجر واحد على الويب وفي تطبيق مصغّر وفي بوت",
        description:
          "كيف بنيت GH Store وأشغّله: كتالوج واحد ومحفظة واحدة وسجلّ طلبات واحد عبر موقع وتطبيق تيليجرام مصغّر وبوت، بمدفوعات لا تخصم مرّتين.",
        challenge:
          "المنتجات الرقمية — شحن الألعاب والبطاقات والاشتراكات والأرقام الافتراضية — تأتي من عدّة مزوّدين، لكلّ منهم واجهته وأسعاره وطرق تعطّله. والعملاء في المنطقة يدفعون بطرق مختلفة جداً، من ShamCash إلى USDT إلى نجوم تيليجرام، وكثير منهم يعيش داخل تيليجرام لا في المتصفّح.",
        built: [
          "نواة واحدة خلف ثلاث واجهات: الموقع والتطبيق المصغّر والبوت تتشارك حساباً واحداً ومحفظة واحدة وكتالوجاً واحداً وسجلّ طلبات واحداً.",
          "خمسة مزوّدين خلف كتالوج واحد، مع تنفيذ تلقائي للطلبات وحارس أسعار يوقف الباقة إذا قفزت تكلفتها.",
          "أربع طرق دفع — ShamCash وUSDT (BEP20) وNOWPayments ونجوم تيليجرام — تصبّ في دفتر محفظة واحد مدقَّق.",
          "المال يتحرّك داخل قاعدة البيانات فقط: سنتات بأعداد صحيحة، وقيود في الدفتر، وطلبات محميّة من التكرار، فلا تخصم إعادة المحاولة أو الإشعارات المكرّرة مرّتين.",
          "أربعة أشكال تصميم بوضعين فاتح وداكن، يختارها مالك المتجر من لوحة التحكّم. وهذا الموقع يلبس نظام التصميم نفسه.",
        ],
        result:
          "يعمل GH Store الآن على gh-store.me وفي تيليجرام باسم ‎@ghstore_robot. سلّم أكثر من 1,000 طلب، وكل ميزة جديدة تصل إلى الواجهات الثلاث معاً.",
      },
      {
        slug: "store-bot",
        title: "متجر كامل داخل محادثة تيليجرام واحدة",
        description:
          "بوت متجر على تيليجرام لعميل: كتالوج وشحن محفظة وتسليم فوري من عدّة مزوّدين وضمان ولوحة تحكّم كاملة، على Cloudflare Workers.",
        challenge:
          "بيع حسابات وأكواد رقمية داخل تيليجرام دون معالجة الطلبات يدوياً: يتصفّح العميل ويدفع ويستلم ويحصل على الدعم في المحادثة نفسها، في أي ساعة، بينما يدير المالك كل شيء من لوحة واحدة.",
        built: [
          "كتالوج باقات مع دفع بالعربية والإنجليزية، من محفظة داخل البوت.",
          "شحن المحفظة عبر Binance Pay وUSDT وShamCash.",
          "تسليم فوري من عدّة مزوّدين، مع تحويل تلقائي إذا تعطّل أحدهم.",
          "مطالبات الضمان والاسترداد وأكواد الخصم والإحالات والاسترجاع النقدي.",
          "لوحة تحكّم للتسعير والمخزون والطلبات وتذاكر الدعم والرسائل الجماعية.",
        ],
        result:
          "يدير البوت متجر العميل وحده: يشتري العملاء ويستلمون خلال ثوانٍ، ويدير المالك كل شيء من لوحة التحكّم. يظهر هنا دون اسم العميل.",
      },
      {
        slug: "storefront",
        title: "متجر شحن ألعاب ثنائي اللغة",
        description:
          "متجر ويب لشحن الألعاب والبطاقات: مزامنة كتالوج المزوّد، وتنفيذ تلقائي، وشحن محفظة ShamCash، وفواتير، بالعربية والإنجليزية.",
        challenge:
          "اللاعب يريد شحن لعبته خلال دقيقة، بلغته، وبطريقة دفع يستخدمها أصلاً — وصاحب المتجر لا يستطيع نسخ كل باقة وسعر من المزوّد يدوياً.",
        built: [
          "مزامنة كتالوج المزوّد: عشرات الألعاب وباقاتها محدّثة تلقائياً.",
          "تنفيذ تلقائي للطلب لحظة الدفع.",
          "شحن المحفظة والدفع عبر ShamCash.",
          "فواتير الطلبات والشحن بصيغتي PNG وPDF.",
          "العربية والإنجليزية في كل مكان، واتجاه من اليمين إلى اليسار متقن.",
        ],
        result:
          "المتجر يعمل ويبيع الآن. منه بدأ عملي في التجارة الرقمية، ودروسه شكّلت دفتر حسابات GH Store ومزامنة مزوّديه. يظهر هنا دون اسمه.",
      },
    ],
  },

  cv: {
    title: "أحمد غاوي — السيرة الذاتية",
    description:
      "السيرة الذاتية لأحمد غاوي: مهندس برمجيات وأخصائي أنظمة تقنية. تجارة تيليجرام، متاجر إلكترونية، السحابة والـ DevOps، الخوادم والشبكات.",
    photo: false,
    headline: "مهندس برمجيات · تجارة تيليجرام · أنظمة تقنية وDevOps",
    summary:
      "مهندس معلوماتية من حلب، سوريا. أصمّم أنظمة التجارة الرقمية وأبنيها وأشغّلها من أولها إلى آخرها — بوتات تيليجرام وتطبيقات مصغّرة ومتاجر إلكترونية والسحابة التي تعمل عليها — وأسّست GH Store، متجر منتجات رقمية متعدّد المزوّدين سلّم أكثر من 1,000 طلب. خبرة عملية في الخوادم والشبكات وأنظمة الكاميرات والدعم التقني. العربية لغتي الأم، وأعمل بالإنجليزية، ومتاح للعمل عن بُعد.",
    labels: {
      contact: "التواصل",
      profile: "نبذة",
      experience: "الخبرة",
      projects: "مشاريع مختارة",
      skills: "المهارات",
      languages: "اللغات",
      education: "التعليم",
      training: "التدريب",
      download: "تنزيل PDF",
      print: "طباعة",
      back: "ghawi.app",
      other: "English",
    },
    experience: [
      {
        role: "مسؤول أنظمة تقنية وDevOps",
        org: "",
        place: "حلب، سوريا",
        period: "2026 – الآن",
        points: [
          "إدارة الخوادم: الإعداد والتحديثات والنسخ الاحتياطي والمراقبة وصلاحيات المستخدمين.",
          "تركيب أنظمة كاميرات المراقبة وصيانتها، والشبكات التي تعمل عليها.",
          "دعم فني وتقني للموظفين: العتاد والبرمجيات والحسابات والاتصال.",
          "DevOps: النشر والأتمتة وإبقاء الخدمات تعمل.",
        ],
      },
      {
        role: "المؤسس والمهندس الرئيسي",
        org: "GH Store",
        place: "عن بُعد",
        period: "2026 – الآن",
        points: [
          "بنيت متجراً للمنتجات الرقمية متعدّد المزوّدين وأشغّله، على الويب وفي تطبيق تيليجرام مصغّر وفي بوت، على نواة مشتركة واحدة.",
          "صمّمت دفتر محفظة مدقَّقاً في Postgres: سنتات بأعداد صحيحة، وطلبات محميّة من التكرار، وإشعارات مزوّدين يُعاد التحقّق منها.",
          "ربطت 5 مزوّدين و4 طرق دفع (ShamCash وUSDT BEP20 وNOWPayments ونجوم تيليجرام)؛ أكثر من 1,000 طلب مُسلَّم.",
          "TypeScript وReact وCloudflare Workers وHyperdrive وSupabase Postgres وTelegram Bot API.",
        ],
      },
      {
        role: "مهندس برمجيات مستقل",
        org: "بوتات تيليجرام ومتاجر ويب",
        place: "عن بُعد",
        period: "2026 – الآن",
        points: [
          "بوت متجر على تيليجرام لعميل: كتالوج وشحن محفظة (Binance Pay وUSDT وShamCash) وتسليم فوري مع تحويل عند العطل وضمان وإحالات ولوحة تحكّم (TypeScript وgrammY وHono وWorkers وSupabase).",
          "متجر شحن ألعاب ثنائي اللغة مع مزامنة كتالوج المزوّد وتنفيذ تلقائي وشحن محفظة وفواتير PNG/PDF (React وVite وSupabase Edge Functions).",
        ],
      },
      {
        role: "أخصائي دعم تقني — عتاد وشبكات",
        org: "عمل حرّ",
        place: "حلب، سوريا",
        period: "مستمر",
        points: [
          "إدارة الشبكات والخوادم: اتصال آمن وحسابات المستخدمين وصلاحياتهم.",
          "تشخيص الأعطال وإصلاحها حتى مستوى اللوحة الأم؛ تثبيت الأنظمة وتحصينها أمنياً.",
        ],
      },
      {
        role: "مطوّر ويب وتطبيقات أندرويد",
        org: "عمل حرّ",
        place: "عن بُعد",
        period: "2022 – 2023",
        points: ["بنيت تطبيقات أندرويد وأدرت مشاريع ويب، مع تركيز على تجربة المستخدم والكود النظيف."],
      },
      {
        role: "إدخال بيانات ومراقبة",
        org: "سبل · إنسانيتي",
        place: "سوريا",
        period: "2020 – 2023",
        points: ["معالجة بيانات دقيقة ومراقبة أنظمة لدى منظمات منها سبل وإنسانيتي."],
      },
    ],
    projects: [
      {
        name: "GH Store",
        url: "https://gh-store.me",
        period: "2026",
        body: "متجر منتجات رقمية على الويب وفي تطبيق تيليجرام مصغّر وفي بوت: محفظة واحدة وخمسة مزوّدين وأربع طرق دفع.",
      },
      {
        name: "ghawi.app",
        url: "https://ghawi.app",
        period: "2026",
        body: "هذا الموقع ولوحة تحكّمه: Next.js ثنائي اللغة على Cloudflare Workers مع D1 وR2، وصندوق رسائل، وسمات حيّة، وإحصاءات، ودعوة زفاف مع تأكيد الحضور.",
      },
      {
        name: "gh-store-tele",
        url: "https://github.com/GH-ZX/gh-store-tele",
        period: "2026",
        body: "أول بوت لـ GH Store بلغة Python ‏(Aiogram 3): كتالوج لإعادة البيع مع شحن بالكريبتو ونجوم تيليجرام وShamCash.",
      },
      {
        name: "TechVerse",
        url: "https://github.com/GH-ZX/TechVerse-App",
        period: "2025",
        body: "تطبيق تجارة إلكترونية بـ Flutter لمنتجات التقنية مع لوحة تحكّم كاملة، على بنية نظيفة.",
      },
      {
        name: "doomsday-arabic-fix",
        url: "https://github.com/GH-ZX/doomsday-arabic-fix",
        period: "2026",
        body: "تعريب لعبة مكتوبة بـ C#‎: جداول النصوص، والتخطيط من اليمين إلى اليسار، ومعالجة الخطوط.",
      },
    ],
    skills: [
      // Arabic words first, then the tool names: a run of Latin names reads cleanly left to right.
      { group: "لغات البرمجة", items: "TypeScript، JavaScript، Python، SQL، PL/pgSQL، Dart، C#‎" },
      { group: "الواجهات", items: "تطبيقات تيليجرام المصغّرة، React، Next.js، Vite، Tailwind CSS، Flutter" },
      { group: "الخوادم", items: "Cloudflare Workers، Hono، FastAPI، Node.js، grammY، Aiogram 3" },
      { group: "البيانات", items: "PostgreSQL، Supabase، Cloudflare D1، Cloudflare R2، Redis، SQLite" },
      { group: "المدفوعات", items: "نجوم تيليجرام، ShamCash، Binance Pay، USDT BEP20، NOWPayments" },
      { group: "DevOps والدعم التقني", items: "الخوادم والشبكات، أنظمة الكاميرات، صيانة العتاد، Linux، Docker، CI/CD" },
    ],
    languages: [
      { name: "العربية", level: "اللغة الأم" },
      { name: "الإنجليزية", level: "مستوى عمل" },
    ],
    education: [{ title: "هندسة المعلوماتية", place: "جامعة العلوم والنهضة، اعزاز", period: "" }],
    training: [{ title: "دورة 1000 مبرمج — Flutter", place: "مشروع التخرّج: تطبيق متجر PC Land", period: "2025" }],
  },
};

export const DEFAULT_CONTENT: SiteContent = { profile, links, settings, en, ar };
