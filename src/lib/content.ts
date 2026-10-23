/*
 * All of the site's words live here, in both languages. Components never hold
 * copy of their own, so changing text never means touching layout code.
 */

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const SITE_URL = "https://ghawi.app";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

export const profile = {
  name: "Ahmed Ghawi",
  nameAr: "أحمد غاوي",
  role: {
    en: "Software Engineer & IT Systems Specialist",
    ar: "مهندس برمجيات وأخصائي أنظمة تقنية",
  },
  location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
  /** Syria has kept UTC+3 all year since 2022. */
  timeZone: "Asia/Damascus",
  email: "ahmedghuwu3@gmail.com",
  telegram: "ahmedghx",
  telegramUrl: "https://t.me/ahmedghx",
  whatsapp: "+963 968 098 330",
  whatsappUrl: "https://wa.me/963968098330",
  github: "https://github.com/GH-ZX",
  githubHandle: "GH-ZX",
  linkedin: "https://www.linkedin.com/in/ahmed-gh-17aa35227/",
  portrait: "/media/portrait.jpg",
} as const;

/**
 * Turnstile site key. Public by design — it is meant to be visible in page
 * source. The matching secret lives in Workers Secrets, never in the repo.
 */
export const turnstileSiteKey = "0x4AAAAAAFWI655DLJFx_2zZ";

export const links = {
  store: "https://gh-store.me",
  storeBot: "https://t.me/ghstore_robot",
  storeSource: "https://github.com/GH-ZX/ghstore",
} as const;

/** The scrolling strip under the hero: tools in daily use. */
export const stackStrip = [
  "TypeScript", "React", "Next.js", "Cloudflare Workers", "Supabase", "PostgreSQL", "FastAPI",
  "Python", "Aiogram 3", "Telegram Mini Apps", "Redis", "Docker", "Flutter", "C#", "Linux", "Networking",
];

export type IconName = "store" | "bot" | "code" | "globe" | "cloud" | "chip";

export interface Project {
  id: "storefront";
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
}

export interface Dictionary {
  meta: { title: string; description: string; ogAlt: string };
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
  };
  nav: { work: string; about: string; services: string; contact: string; cta: string };
  hero: {
    status: string;
    eyebrow: string;
    title: string;
    /** The part of the title set in the accent. */
    titleAccent: string;
    lead: string;
    primary: string;
    secondary: string;
    facts: string[];
    portraitAlt: string;
    liveChip: string;
    /** Floating cards beside the portrait; {n} is GH Store's live product count. */
    productsCard: { value: string; label: string };
    languageCard: { value: string; label: string };
  };
  work: { label: string; title: string; lead: string };
  store: {
    kicker: string;
    title: string;
    body: string;
    doors: { name: string; detail: string }[];
    figures: { value: string; label: string }[];
    principlesTitle: string;
    principles: { title: string; body: string }[];
    stack: string[];
    visit: string;
    openBot: string;
    source: string;
    looks: { title: string; body: string; live: string; group: string; reset: string };
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
  };
  projects: Project[];
  more: {
    title: string;
    all: string;
    items: { name: string; kind: string; blurb: string; url: string }[];
  };
  about: {
    label: string;
    title: string;
    body: string[];
    layersTitle: string;
    layersNote: string;
    layers: { name: string; tools: string }[];
  };
  services: {
    label: string;
    title: string;
    items: { icon: IconName; title: string; body: string }[];
  };
  contact: {
    label: string;
    title: string;
    body: string;
    emailLabel: string;
    copy: string;
    copied: string;
    channelsTitle: string;
    channels: { id: "telegram" | "whatsapp" | "github" | "linkedin"; label: string; value: string }[];
    formTitle: string;
    form: {
      name: string;
      email: string;
      topic: string;
      topicPlaceholder: string;
      topics: { value: string; label: string }[];
      message: string;
      messageHint: string;
      submit: string;
      sending: string;
      verifying: string;
      successTitle: string;
      successBody: string;
      sendAnother: string;
      errors: Record<string, string>;
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
  };
}

const en: Dictionary = {
  meta: {
    title: "Ahmed Ghawi — Software Engineer & IT Systems Specialist",
    description:
      "I design, build and run commerce systems end to end. My flagship, GH Store, sells digital goods on the web, in a Telegram Mini App and through a bot — one core, in Arabic and English.",
    ogAlt: "Ahmed Ghawi — software engineer. I build stores, bots and websites that take real money.",
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
  },

  nav: { work: "Work", about: "About", services: "Services", contact: "Contact", cta: "Let's talk" },

  hero: {
    status: "Open to new projects",
    eyebrow: "Ahmed Ghawi · Software engineer & IT systems specialist",
    title: "I build stores, bots and websites that take real money.",
    titleAccent: "real money",
    lead: "I design, build and run commerce systems end to end: the database, the payment ledger, the bot that talks to suppliers, the storefront customers see, and the machines it all runs on. The proof is GH Store, live on the web and inside Telegram.",
    primary: "See the work",
    secondary: "Start a conversation",
    facts: ["Aleppo, Syria · UTC+3", "Arabic & English", "Remote, worldwide"],
    portraitAlt: "Portrait of Ahmed Ghawi",
    liveChip: "GH Store is live",
    productsCard: { value: "{n}+", label: "products on sale in GH Store" },
    languageCard: { value: "AR · EN", label: "Arabic first, both ways" },
  },

  work: {
    label: "Work",
    title: "Shipped, running, taking orders.",
    lead: "Real products, not concept shots — each one designed, built and shipped by me.",
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
      { value: "1,000+", label: "customers served" },
      { value: "5", label: "suppliers behind a single catalogue" },
      { value: "4", label: "payment methods, from Telegram Stars to USDT" },
    ],
    principlesTitle: "Built to be trusted with money",
    principles: [
      {
        title: "Money moves only in SQL",
        body: "Balances are integer cents and change only inside database functions that write a ledger row. The Worker itself cannot touch a wallet.",
      },
      {
        title: "A callback is only a wake-up",
        body: "No provider callback credits anything by itself. The store asks the provider again before it credits a top-up or delivers an order.",
      },
      {
        title: "Retries never charge twice",
        body: "Every order and top-up is idempotent, so double taps, retries and duplicate webhooks cannot charge or credit twice.",
      },
      {
        title: "Prices behind a guard",
        body: "When a supplier's cost jumps past its limit, the package pauses for review instead of quietly repricing.",
      },
    ],
    stack: ["Cloudflare Workers", "Supabase Postgres", "Hyperdrive", "TypeScript", "React", "Telegram Bot API"],
    visit: "Visit gh-store.me",
    openBot: "Open in Telegram",
    source: "Source code",
    looks: {
      title: "Four looks, one codebase",
      body: "The store's owner picks a look in its admin and every screen follows, in light and dark. This page wears the same design system and changes with the store — try it:",
      live: "Live on the store",
      group: "GH Store design presets",
      reset: "Back to this site's look",
    },
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

  about: {
    label: "About",
    title: "Most engineers live in one layer. I work across all of them.",
    body: [
      "I started out diagnosing motherboards and rebuilding office networks. The habit stuck: I still think about the machine underneath the software.",
      "Today that means I can take a project from an idea to a store taking real money — the schema, the ledger, the bot that talks to suppliers, the edge in front of it and the deployment that keeps it up. One accountable person, from brief to production.",
    ],
    layersTitle: "The whole stack",
    layersNote: "Where I work, top to bottom",
    layers: [
      { name: "Customer", tools: "Websites, Telegram bots, Mini Apps" },
      { name: "Interface", tools: "React, Next.js, TypeScript, Flutter" },
      { name: "Application", tools: "FastAPI, Aiogram 3, Workers, C#" },
      { name: "Data", tools: "PostgreSQL, PL/pgSQL, Redis, Supabase" },
      { name: "Delivery", tools: "Cloudflare, Docker, CI/CD" },
      { name: "Machine", tools: "Linux, networks, hardware repair" },
    ],
  },

  services: {
    label: "Services",
    title: "What you can hand me.",
    items: [
      {
        icon: "bot",
        title: "Telegram bots",
        body: "Store bots that sell, take payments and deliver on their own — catalogues, wallets, Stars and crypto checkout, Mini Apps and an admin panel to run it all.",
      },
      {
        icon: "code",
        title: "Websites & web apps",
        body: "Landing pages, storefronts and dashboards in Next.js and React — fast, in Arabic and English, and built to be maintained after launch.",
      },
      {
        icon: "store",
        title: "Commerce platforms",
        body: "Storefronts, wallets, ledgers and order pipelines that take real payments and survive retries.",
      },


      {
        icon: "globe",
        title: "Arabic-first interfaces",
        body: "Right-to-left layouts and bilingual content done properly from day one, not mirrored as an afterthought.",
      },
      {
        icon: "cloud",
        title: "Cloud & deployment",
        body: "Cloudflare Workers, Supabase and Docker. CI/CD, backups and self-hosted installs that don't depend on me staying reachable.",
      },
      {
        icon: "chip",
        title: "IT & hardware",
        body: "Server and network administration, laptop and motherboard repair, clean installs and security hardening.",
      },
    ],
  },

  contact: {
    label: "Contact",
    title: "Let's build something that actually runs.",
    body: "Open to product engineering, Telegram commerce and infrastructure work — remote, worldwide. Tell me what you're building and where it's stuck.",
    emailLabel: "Email",
    copy: "Copy",
    copied: "Copied",
    channelsTitle: "Or reach me on",
    channels: [
      { id: "telegram", label: "Telegram", value: "@ahmedghx" },
      { id: "whatsapp", label: "WhatsApp", value: "+963 968 098 330" },
      { id: "github", label: "GitHub", value: "GH-ZX" },
      { id: "linkedin", label: "LinkedIn", value: "Ahmed Ghawi" },
    ],
    formTitle: "Send a message",
    form: {
      name: "Name",
      email: "Email",
      topic: "Topic",
      topicPlaceholder: "Choose one (optional)",
      topics: [
        { value: "product", label: "Product engineering" },
        { value: "telegram", label: "Telegram commerce" },
        { value: "infrastructure", label: "Infrastructure & DevOps" },
        { value: "it", label: "IT support" },
        { value: "other", label: "Something else" },
      ],
      message: "Message",
      messageHint: "What are you building? A few sentences is plenty.",
      submit: "Send message",
      sending: "Sending…",
      verifying: "Checking you're human…",
      successTitle: "Message received",
      successBody: "Thanks for writing. I'll reply to the email you gave.",
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
  },
};

// "\u200E" (a left-to-right mark) after "C#" keeps the "#" beside its letter in Arabic text.
const ar: Dictionary = {
  meta: {
    title: "أحمد غاوي — مهندس برمجيات وأخصائي أنظمة تقنية",
    description:
      "أصمّم أنظمة التجارة الرقمية وأبنيها وأشغّلها من أولها إلى آخرها. مشروعي الرئيسي GH Store يبيع المنتجات الرقمية عبر الموقع وتطبيق تيليجرام المصغّر والبوت — بنواة واحدة، بالعربية والإنجليزية.",
    ogAlt: "أحمد غاوي — مهندس برمجيات. أبني متاجر وبوتات ومواقع تستقبل أموالاً حقيقية.",
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
  },

  nav: { work: "الأعمال", about: "عنّي", services: "الخدمات", contact: "تواصل", cta: "لنتحدّث" },

  hero: {
    status: "متاح لمشاريع جديدة",
    eyebrow: "أحمد غاوي · مهندس برمجيات وأخصائي أنظمة تقنية",
    title: "أبني متاجر وبوتات ومواقع تستقبل أموالاً حقيقية.",
    titleAccent: "أموالاً حقيقية",
    lead: "أصمّم أنظمة التجارة الرقمية وأبنيها وأشغّلها من أولها إلى آخرها: قاعدة البيانات، ودفتر المدفوعات، والبوت الذي يتحدّث مع المزوّدين، والمتجر الذي يراه العميل، والأجهزة التي يعمل عليها كل ذلك. والدليل GH Store، يعمل الآن على الويب وداخل تيليجرام.",
    primary: "شاهد الأعمال",
    secondary: "ابدأ محادثة",
    facts: ["حلب، سوريا · UTC+3", "العربية والإنجليزية", "عن بُعد، لأي مكان"],
    portraitAlt: "صورة أحمد غاوي",
    liveChip: "GH Store يعمل الآن",
    productsCard: { value: "+{n}", label: "منتج معروض في GH Store" },
    languageCard: { value: "ع · EN", label: "العربية أولاً، وبالاتجاهين" },
  },

  work: {
    label: "الأعمال",
    title: "منشورة، تعمل، وتستقبل الطلبات.",
    lead: "منتجات حقيقية لا نماذج عرض — كلّ منها صمّمته وبنيته وأطلقته بنفسي.",
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
      { value: "+1,000", label: "عميل خدمناه" },
      { value: "5", label: "مزوّدين خلف كتالوج واحد" },
      { value: "4", label: "طرق دفع، من نجوم تيليجرام إلى USDT" },
    ],
    principlesTitle: "مبنيّ ليُؤتمَن على المال",
    principles: [
      {
        title: "المال يتحرّك داخل SQL فقط",
        body: "الأرصدة أعداد صحيحة بالسنتات، ولا تتغيّر إلا داخل دوال قاعدة البيانات التي تكتب قيداً في الدفتر. والتطبيق نفسه لا يستطيع لمس أي محفظة.",
      },
      {
        title: "إشعار المزوّد مجرّد تنبيه",
        body: "لا يضيف أي إشعار من المزوّد رصيداً بمفرده؛ يسأل المتجر المزوّدَ من جديد قبل أن يشحن الرصيد أو يسلّم الطلب.",
      },
      {
        title: "إعادة المحاولة لا تخصم مرّتين",
        body: "كل طلب وكل شحن رصيد محميّ من التكرار، فالنقر المزدوج وإعادة المحاولة وتكرار الإشعارات لا تخصم ولا تضيف مرّتين.",
      },
      {
        title: "أسعار تحت الحراسة",
        body: "إذا قفزت تكلفة المزوّد فوق حدّها، تتوقّف الباقة للمراجعة بدل أن يتغيّر سعرها بصمت.",
      },
    ],
    stack: ["Cloudflare Workers", "Supabase Postgres", "Hyperdrive", "TypeScript", "React", "Telegram Bot API"],
    visit: "زيارة gh-store.me",
    openBot: "افتح في تيليجرام",
    source: "الكود المصدري",
    looks: {
      title: "أربعة أشكال، شيفرة واحدة",
      body: "يختار مالك المتجر الشكل من لوحة التحكّم فتتبعه كل الشاشات، فاتحةً وداكنة. وهذه الصفحة تلبس نظام التصميم نفسه وتتغيّر مع المتجر — جرّبه:",
      live: "المعتمد في المتجر",
      group: "أشكال تصميم GH Store",
      reset: "العودة إلى شكل الموقع",
    },
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
        kind: "تعريب · C#\u200E",
        blurb: "تعريب لعبة مكتوبة بـ C#\u200E: جداول النصوص، والتخطيط من اليمين إلى اليسار، ومعالجة الخطوط.",
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

  about: {
    label: "عنّي",
    title: "معظم المهندسين يعملون في طبقة واحدة. أنا أعمل عبر الطبقات كلّها.",
    body: [
      "بدأت بتشخيص اللوحات الأم وإعادة بناء شبكات المكاتب، وبقيت تلك العادة: ما زلت أفكّر في الآلة التي تعمل تحت البرمجيات.",
      "واليوم يعني ذلك أنني أستطيع أن أنقل مشروعاً من فكرة إلى متجر يستقبل أموالاً حقيقية: قاعدة البيانات، والدفتر المالي، والبوت الذي يتحدّث مع المزوّدين، وطبقة الحافة أمامه، والنشر الذي يبقيه قائماً. شخص واحد مسؤول، من الفكرة حتى الإنتاج.",
    ],
    layersTitle: "المنظومة كاملة",
    layersNote: "أين أعمل، من الأعلى إلى الأسفل",
    layers: [
      { name: "العميل", tools: "مواقع، بوتات تيليجرام، تطبيقات مصغّرة" },
      { name: "الواجهة", tools: "React، Next.js، TypeScript، Flutter" },
      { name: "التطبيق", tools: "FastAPI، Aiogram 3، Workers، C#\u200E" },
      { name: "البيانات", tools: "PostgreSQL، PL/pgSQL، Redis، Supabase" },
      { name: "التشغيل", tools: "Cloudflare، Docker، CI/CD" },
      { name: "الآلة", tools: "Linux، الشبكات، صيانة العتاد" },
    ],
  },

  services: {
    label: "الخدمات",
    title: "ما يمكنك أن تسلّمه لي.",
    items: [
      {
        icon: "bot",
        title: "بوتات تيليجرام",
        body: "بوتات متاجر تبيع وتستقبل المدفوعات وتسلّم وحدها — كتالوج ومحفظة ودفع بالنجوم والكريبتو وتطبيقات مصغّرة ولوحة تحكّم تدير كل شيء.",
      },
      {
        icon: "code",
        title: "مواقع وتطبيقات ويب",
        body: "صفحات تعريفية ومتاجر ولوحات تحكّم بـ Next.js وReact — سريعة، بالعربية والإنجليزية، ومبنيّة لتُصان بعد الإطلاق.",
      },
      {
        icon: "store",
        title: "منصّات تجارة",
        body: "متاجر ومحافظ ودفاتر حسابات ومسارات طلبات تستقبل مدفوعات حقيقية وتصمد أمام إعادة المحاولة.",
      },


      {
        icon: "globe",
        title: "واجهات عربية أولاً",
        body: "تخطيط من اليمين إلى اليسار ومحتوى ثنائي اللغة مُتقَن من اليوم الأول، لا انعكاساً يُضاف في النهاية.",
      },
      {
        icon: "cloud",
        title: "السحابة والنشر",
        body: "Cloudflare Workers وSupabase وDocker. تكامل ونشر مستمرّان، ونسخ احتياطية، وتثبيتات ذاتية الاستضافة لا تعتمد على بقائي متاحاً.",
      },
      {
        icon: "chip",
        title: "الدعم التقني والعتاد",
        body: "إدارة الخوادم والشبكات، وصيانة الحواسيب واللوحات الأم، وتثبيت أنظمة نظيف وتحصين أمني.",
      },
    ],
  },

  contact: {
    label: "تواصل",
    title: "لنبنِ شيئاً يعمل فعلاً.",
    body: "متاح لمشاريع هندسة المنتجات وتجارة تيليجرام والبنية التحتية — عن بُعد، ولأي مكان. أخبرني ماذا تبني وأين تعثّر.",
    emailLabel: "البريد",
    copy: "نسخ",
    copied: "نُسخ",
    channelsTitle: "أو تواصل عبر",
    channels: [
      { id: "telegram", label: "تيليجرام", value: "@ahmedghx" },
      { id: "whatsapp", label: "واتساب", value: "+963 968 098 330" },
      { id: "github", label: "GitHub", value: "GH-ZX" },
      { id: "linkedin", label: "لينكدإن", value: "Ahmed Ghawi" },
    ],
    formTitle: "أرسل رسالة",
    form: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      topic: "الموضوع",
      topicPlaceholder: "اختر موضوعاً (اختياري)",
      topics: [
        { value: "product", label: "هندسة منتجات" },
        { value: "telegram", label: "تجارة تيليجرام" },
        { value: "infrastructure", label: "بنية تحتية و DevOps" },
        { value: "it", label: "دعم تقني" },
        { value: "other", label: "شيء آخر" },
      ],
      message: "الرسالة",
      messageHint: "ماذا تبني؟ بضعة أسطر تكفي.",
      submit: "إرسال الرسالة",
      sending: "جارٍ الإرسال…",
      verifying: "نتحقّق من أنك لست روبوتاً…",
      successTitle: "وصلت الرسالة",
      successBody: "شكراً لك. سأردّ على البريد الذي كتبته.",
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
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, ar };
