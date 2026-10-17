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
  email: "ahmedghawi3@gmail.com",
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
  factorySource: "https://github.com/GH-ZX/GH-Bot-Factory",
  echocore: "https://www.echocore412.com",
  echocoreSource: "https://github.com/GH-ZX/echocore-store",
} as const;

export type IconName = "store" | "bot" | "code" | "globe" | "cloud" | "chip";

export interface Project {
  id: "factory" | "echocore";
  kicker: string;
  name: string;
  title: string;
  body: string;
  points: string[];
  stack: string[];
  /** Shown with a live dot when the product is publicly reachable. */
  live: boolean;
  links: { label: string; href: string }[];
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
    lead: string;
    primary: string;
    secondary: string;
    facts: string[];
    portraitAlt: string;
    liveChip: string;
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
    looks: { title: string; body: string; live: string; group: string };
    demo: {
      label: string;
      close: string;
      miniApp: string;
      badge: string;
      slideTitle: string;
      slideSub: string;
      slideCta: string;
      picks: string;
      all: string;
      categories: string[];
      tabs: string[];
    };
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
    localTime: string;
    top: string;
  };
}

const en: Dictionary = {
  meta: {
    title: "Ahmed Ghawi — Software Engineer & IT Systems Specialist",
    description:
      "I design, build and run commerce systems end to end. My flagship, GH Store, sells digital goods on the web, in a Telegram Mini App and through a bot — one core, in Arabic and English.",
    ogAlt: "Ahmed Ghawi — software engineer. From a blank server to a store taking real money.",
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
    title: "From a blank server to a store taking real money.",
    lead: "I design, build and run commerce systems end to end: the database, the payment ledger, the bot that talks to suppliers, the storefront customers see, and the machines it all runs on. The proof is GH Store, live on the web and inside Telegram.",
    primary: "See the work",
    secondary: "Start a conversation",
    facts: ["Aleppo, Syria · UTC+3", "Arabic & English", "Remote, worldwide"],
    portraitAlt: "Portrait of Ahmed Ghawi",
    liveChip: "GH Store is live",
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
      { value: "1", label: "Cloudflare Worker serves the site, Mini App, bot, API and jobs" },
      { value: "5", label: "suppliers behind a single catalogue" },
      { value: "4", label: "payment methods, from Telegram Stars to USDT" },
      { value: "2", label: "languages, Arabic first and right-to-left" },
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
    },
    demo: {
      label: "Illustration of the GH Store Mini App home screen",
      close: "Close",
      miniApp: "mini app",
      badge: "Instant",
      slideTitle: "PUBG Mobile UC",
      slideSub: "Top up in seconds, delivered automatically.",
      slideCta: "Top up now",
      picks: "Today's picks",
      all: "See all",
      categories: ["Games", "AI", "Cards", "Streaming"],
      tabs: ["Store", "Orders", "Wallet", "Profile"],
    },
  },

  projects: [
    {
      id: "factory",
      kicker: "Platform · Self-hosted",
      name: "GH Bot Factory",
      title: "A multi-tenant engine for Telegram commerce.",
      body: "One installation runs many branded stores, each with its own bots, Mini App, catalogue and staff. Prices, payments, wallets and fulfilment stay on the server; Telegram and the browser only present them.",
      points: [
        "Tenant isolation with owner, admin, staff and customer roles",
        "Telegram Stars checkout with exactly-once settlement",
        "Supplier routing and a durable fulfilment worker",
        "Supplier and payment keys kept in an encrypted vault",
        "One-command Easy Start installer for self-hosting",
      ],
      stack: ["Python", "FastAPI", "Aiogram 3", "PostgreSQL", "Redis", "Docker"],
      live: false,
      links: [{ label: "Source on GitHub", href: links.factorySource }],
    },
    {
      id: "echocore",
      kicker: "Earlier storefront · Live",
      name: "Echocore Store",
      title: "Where it started.",
      body: "A bilingual game top-up and gift-card shop on React and Supabase, served from GitHub Pages. It syncs a supplier's catalogue, fulfils orders automatically and issues invoices.",
      points: [
        "Supplier catalogue sync with automatic fulfilment",
        "ShamCash recharge and checkout",
        "Order and recharge invoices as PNG or PDF",
        "Arabic and English throughout",
      ],
      stack: ["React", "Supabase", "Edge Functions", "GitHub Pages"],
      live: true,
      links: [
        { label: "Visit echocore412.com", href: links.echocore },
        { label: "Source", href: links.echocoreSource },
      ],
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
      "Today that means I can take a project from a blank server to a store taking real money — the schema, the ledger, the bot that talks to suppliers, the edge in front of it and the deployment that keeps it up. One accountable person, from brief to production.",
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
        icon: "store",
        title: "Commerce platforms",
        body: "Storefronts, wallets, ledgers and order pipelines that take real payments and survive retries.",
      },
      {
        icon: "bot",
        title: "Telegram bots & Mini Apps",
        body: "Bots and Mini Apps on Aiogram and the Bot API, with verified sign-in, Stars checkout and supplier integrations that recover from failure.",
      },
      {
        icon: "code",
        title: "Full-stack products",
        body: "TypeScript, React, Next.js and Flutter — built to be maintained after launch, not abandoned at handover.",
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
    ogAlt: "أحمد غاوي — مهندس برمجيات. من خادم فارغ إلى متجر يستقبل أموالاً حقيقية.",
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
    title: "من خادم فارغ إلى متجر يستقبل أموالاً حقيقية.",
    lead: "أصمّم أنظمة التجارة الرقمية وأبنيها وأشغّلها من أولها إلى آخرها: قاعدة البيانات، ودفتر المدفوعات، والبوت الذي يتحدّث مع المزوّدين، والمتجر الذي يراه العميل، والأجهزة التي يعمل عليها كل ذلك. والدليل GH Store، يعمل الآن على الويب وداخل تيليجرام.",
    primary: "شاهد الأعمال",
    secondary: "ابدأ محادثة",
    facts: ["حلب، سوريا · UTC+3", "العربية والإنجليزية", "عن بُعد، لأي مكان"],
    portraitAlt: "صورة أحمد غاوي",
    liveChip: "GH Store يعمل الآن",
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
      { value: "1", label: "Cloudflare Worker واحد يخدم الموقع والتطبيق المصغّر والبوت والواجهة البرمجية والمهام" },
      { value: "5", label: "مزوّدين خلف كتالوج واحد" },
      { value: "4", label: "طرق دفع، من نجوم تيليجرام إلى USDT" },
      { value: "2", label: "لغتان، والعربية أولاً من اليمين إلى اليسار" },
    ],
    principlesTitle: "مبنيّ ليُؤتمَن على المال",
    principles: [
      {
        title: "المال يتحرّك داخل SQL فقط",
        body: "الأرصدة أعداد صحيحة بالسنتات، ولا تتغيّر إلا داخل دوال قاعدة البيانات التي تكتب قيداً في الدفتر. الخادم نفسه لا يستطيع لمس أي محفظة.",
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
    },
    demo: {
      label: "رسم توضيحي للشاشة الرئيسية في تطبيق GH Store المصغّر",
      close: "إغلاق",
      miniApp: "تطبيق مصغّر",
      badge: "فوري",
      slideTitle: "شدّات ببجي موبايل",
      slideSub: "اشحن في ثوانٍ، والتسليم تلقائي.",
      slideCta: "اشحن الآن",
      picks: "اختيارات اليوم",
      all: "عرض الكل",
      categories: ["ألعاب", "ذكاء", "بطاقات", "ترفيه"],
      tabs: ["المتجر", "الطلبات", "المحفظة", "حسابي"],
    },
  },

  projects: [
    {
      id: "factory",
      kicker: "منصّة · استضافة ذاتية",
      name: "GH Bot Factory",
      title: "محرّك متعدّد المستأجرين لتجارة تيليجرام.",
      body: "تثبيت واحد يشغّل متاجر كثيرة بهويّات مختلفة، لكلّ منها بوتاتها وتطبيقها المصغّر وكتالوجها وفريقها. الأسعار والمدفوعات والمحافظ والتسليم تبقى على الخادم، وتيليجرام والمتصفّح مجرّد واجهات عرض.",
      points: [
        "عزل كامل للمستأجرين بأدوار المالك والمدير والموظف والعميل",
        "دفع بنجوم تيليجرام بتسوية تحدث مرّة واحدة بالضبط",
        "توجيه الطلبات بين المزوّدين وعامل تسليم موثوق",
        "مفاتيح المزوّدين والدفع محفوظة في خزنة مشفّرة",
        "مثبّت Easy Start بأمر واحد للاستضافة الذاتية",
      ],
      stack: ["Python", "FastAPI", "Aiogram 3", "PostgreSQL", "Redis", "Docker"],
      live: false,
      links: [{ label: "الكود على GitHub", href: links.factorySource }],
    },
    {
      id: "echocore",
      kicker: "متجر سابق · يعمل الآن",
      name: "Echocore Store",
      title: "من هنا بدأت.",
      body: "متجر ثنائي اللغة لشحن الألعاب والبطاقات، مبنيّ بـ React وSupabase ومستضاف على GitHub Pages. يزامن كتالوج المزوّد، وينفّذ الطلبات تلقائياً، ويُصدر الفواتير.",
      points: [
        "مزامنة كتالوج المزوّد مع تنفيذ تلقائي للطلبات",
        "شحن ودفع عبر ShamCash",
        "فواتير الطلبات والشحن بصيغتي PNG وPDF",
        "بالعربية والإنجليزية في كل مكان",
      ],
      stack: ["React", "Supabase", "Edge Functions", "GitHub Pages"],
      live: true,
      links: [
        { label: "زيارة echocore412.com", href: links.echocore },
        { label: "الكود المصدري", href: links.echocoreSource },
      ],
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
      "واليوم يعني ذلك أنني أستطيع أن أنقل مشروعاً من خادم فارغ إلى متجر يستقبل أموالاً حقيقية: قاعدة البيانات، والدفتر المالي، والبوت الذي يتحدّث مع المزوّدين، وطبقة الحافة أمامه، والنشر الذي يبقيه قائماً. شخص واحد مسؤول، من الفكرة حتى الإنتاج.",
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
        icon: "store",
        title: "منصّات تجارة",
        body: "متاجر ومحافظ ودفاتر حسابات ومسارات طلبات تستقبل مدفوعات حقيقية وتصمد أمام إعادة المحاولة.",
      },
      {
        icon: "bot",
        title: "بوتات وتطبيقات تيليجرام",
        body: "بوتات وتطبيقات مصغّرة على Aiogram وBot API، بتسجيل دخول موثّق ودفع بالنجوم وربط مع المزوّدين يتعافى من الأعطال.",
      },
      {
        icon: "code",
        title: "منتجات متكاملة",
        body: "TypeScript وReact وNext.js وFlutter — مبنيّة لتُصان بعد الإطلاق، لا لتُترك عند التسليم.",
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
    localTime: "التوقيت في حلب",
    top: "العودة للأعلى",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, ar };
