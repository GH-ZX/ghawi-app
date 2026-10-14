export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const SITE_URL = "https://ghawi.app";

export const profile = {
  name: "Ahmed Ghawi",
  nameAr: "أحمد غاوي",
  handle: "@GH-ZX",
  role: "Software Engineer & IT Systems Specialist",
  roleAr: "مهندس برمجيات وأخصائي أنظمة تقنية",
  location: "Aleppo, Syria",
  locationAr: "حلب، سوريا",
  timezone: "UTC+3",
  email: "ahmedghawi3@gmail.com",
  telegram: "ahmedghx",
  telegramUrl: "https://t.me/ahmedghx",
  whatsapp: "+963 968 098 330",
  whatsappUrl: "https://wa.me/963968098330",
  github: "https://github.com/GH-ZX",
  githubHandle: "GH-ZX",
  linkedin: "https://www.linkedin.com/in/ahmed-gh-17aa35227/",
  portrait: "/media/ahmed.jpg",
  storeMark: "/media/gh-store-mark.png",
} as const;

/**
 * Turnstile site key. Public by design — this value is meant to be visible in
 * page source. The matching secret lives in Workers Secrets, never in the repo.
 * Created with `wrangler turnstile widget create ghawi-app`.
 */
export const turnstileSiteKey = "0x4AAAAAAFWI655DLJFx_2zZ";

export const links = {
  store: "https://gh-store.me",
  factory: "https://factory.gh-store.me",
  factoryBuild: "https://factory.gh-store.me/build/",
} as const;

export interface Feature {
  label: string;
  value: string;
}

export interface Platform {
  index: string;
  id: string;
  name: string;
  domain: string;
  url: string;
  category: string;
  headline: string;
  body: string;
  features: Feature[];
  stack: string[];
}

export interface Repo {
  name: string;
  language: string;
  type: string;
  blurb: string;
  url: string;
  stars?: number;
}

export interface Capability {
  index: string;
  title: string;
  body: string;
}

export interface Copy {
  langLabel: string;
  switchTo: { ar: string; en: string };

  nav: { work: string; platforms: string; code: string; capabilities: string; contact: string };

  meta: { title: string; description: string };

  hero: {
    kicker: string;
    /** Split into two stacked lines in the hero. */
    name: [string, string];
    role: string;
    lead: string;
    primary: string;
    secondary: string;
    scroll: string;
  };

  board: {
    title: string;
    live: string;
    rows: { label: string; value: string }[];
    foot: { label: string; value: string }[];
  };

  stats: { value: string; label: string }[];

  about: {
    label: string;
    headline: string;
    body: string[];
    disciplineTitle: string;
    discipline: Feature[];
  };

  platforms: {
    label: string;
    headline: string;
    visit: string;
    source: string;
  };

  code: {
    label: string;
    headline: string;
    all: string;
    column: { repo: string; lang: string; type: string; about: string };
  };

  capabilities: { label: string; headline: string; items: Capability[] };

  contact: {
    label: string;
    headline: string;
    body: string;
    emailCta: string;
    fallback: string;
    channels: { id: string; label: string; value: string }[];
    form: {
      name: string;
      email: string;
      topic: string;
      topics: { value: string; label: string }[];
      message: string;
      messageHint: string;
      submit: string;
      sending: string;
      success: string;
      sendAnother: string;
      errors: Record<string, string>;
    };
  };

  footer: { rights: string; built: string; backToTop: string };
}

const en: Copy = {
  langLabel: "English",
  switchTo: { ar: "العربية", en: "English" },

  nav: {
    work: "About",
    platforms: "Platforms",
    code: "Code",
    capabilities: "Capabilities",
    contact: "Contact",
  },

  meta: {
    title: "Ahmed Ghawi — Software Engineer & IT Systems Specialist",
    description:
      "I build and operate the software behind digital commerce. Two platforms are live right now: GH Store, a bilingual digital-goods storefront, and Bot Factory, a multi-tenant Telegram commerce engine.",
  },

  hero: {
    kicker: "~/ghawi.app",
    name: ["Ahmed", "Ghawi"],
    role: "Software Engineer · IT Systems Specialist",
    lead: "I design, build and run the whole stack — from a customer's first click to the order landing on a supplier's API. Today that means two platforms running in production, and a lot of infrastructure keeping them honest.",
    primary: "See the platforms",
    secondary: "Start a conversation",
    scroll: "Scroll",
  },

  board: {
    title: "Deployed properties",
    live: "LIVE",
    rows: [
      { label: "gh-store.me", value: "Digital goods storefront" },
      { label: "factory.gh-store.me", value: "Telegram commerce platform" },
      { label: "github.com/GH-ZX", value: "Open source" },
    ],
    foot: [
      { label: "Base", value: "Aleppo, Syria" },
      { label: "Timezone", value: "UTC+3" },
    ],
  },

  stats: [
    { value: "02", label: "Platforms in production" },
    { value: "27", label: "Public repositories" },
    { value: "09", label: "Store categories" },
    { value: "AR/EN", label: "Shipped as default" },
  ],

  about: {
    label: "Background",
    headline: "Most engineers live in one layer. I work across all of them.",
    body: [
      "I started out diagnosing motherboards and rebuilding office networks. That instinct never really left — I still think about the machine underneath the software.",
      "Today it means I can take a project from a blank server to a storefront taking real money: the schema, the bot that talks to suppliers, the edge layer that serves it, and the hardware and network it all runs on.",
    ],
    disciplineTitle: "What I actually do",
    discipline: [
      { label: "Infrastructure", value: "Server and network administration, hardware diagnostics, OS installation and hardening" },
      { label: "Product engineering", value: "TypeScript, React, Next.js, Tailwind, Flutter, C#" },
      { label: "Backend & data", value: "FastAPI, PostgreSQL, Redis, Supabase, PL/pgSQL" },
      { label: "Telegram & automation", value: "Aiogram 3, Bot API, Mini App authentication, supplier adapters" },
      { label: "Cloud & operations", value: "Cloudflare Workers, Docker, CI/CD, encrypted deployment handoffs" },
    ],
  },

  platforms: {
    label: "Platforms",
    headline: "Two systems, both running right now.",
    visit: "Open site",
    source: "Source",
  },

  code: {
    label: "Selected code",
    headline: "Other things I have shipped.",
    all: "View all 27 repositories",
    column: { repo: "Repository", lang: "Language", type: "Type", about: "What it is" },
  },

  capabilities: {
    label: "Capabilities",
    headline: "What you can hand me.",
    items: [
      {
        index: "01",
        title: "Full-stack product engineering",
        body: "From schema to screen. TypeScript, React, Next.js, Tailwind, Flutter and C#, built to be maintained after launch rather than abandoned at handover.",
      },
      {
        index: "02",
        title: "Backend & commerce systems",
        body: "FastAPI and PostgreSQL behind the scenes: ledgers, order state machines, fulfillment queues, idempotent payment settlement and refunds that survive retries.",
      },
      {
        index: "03",
        title: "Telegram bots & Mini Apps",
        body: "Aiogram 3 and the Bot API. Bot fleets, HMAC initData authentication, branded Mini Apps, and supplier adapters that recover cleanly from failure.",
      },
      {
        index: "04",
        title: "Cloud & deployment",
        body: "Cloudflare Workers, Supabase and Docker. CI/CD, backups, encrypted customer handoffs and self-hosted installs that do not depend on me staying reachable.",
      },
      {
        index: "05",
        title: "IT & hardware support",
        body: "Server and network administration, laptop and motherboard repair, clean OS installs and security hardening — physical and virtual.",
      },
    ],
  },

  contact: {
    label: "Contact",
    headline: "Let's build something that actually runs.",
    body: "Open to product engineering, Telegram commerce and infrastructure work. Remote, worldwide, and comfortable taking a system end to end.",
    emailCta: "Send an email",
    fallback: "Prefer email?",
    channels: [
      { id: "email", label: "Email", value: "ahmedghawi3@gmail.com" },
      { id: "telegram", label: "Telegram", value: "@ahmedghx" },
      { id: "whatsapp", label: "WhatsApp", value: "+963 968 098 330" },
      { id: "github", label: "GitHub", value: "GH-ZX" },
      { id: "linkedin", label: "LinkedIn", value: "ahmed-gh" },
    ],
    form: {
      name: "Name",
      email: "Email",
      topic: "What is this about?",
      topics: [
        { value: "product", label: "Product engineering" },
        { value: "telegram", label: "Telegram commerce" },
        { value: "infrastructure", label: "Infrastructure & DevOps" },
        { value: "it", label: "IT support" },
        { value: "other", label: "Something else" },
      ],
      message: "Message",
      messageHint: "A few sentences is plenty.",
      submit: "Send message",
      sending: "Sending",
      success: "Message received. I'll reply to your email.",
      sendAnother: "Send another",
      errors: {
        generic: "Something went wrong. Try again, or email me directly.",
        rate_limited: "Too many messages from this connection. Try again later.",
        invalid_json: "Something went wrong. Try again.",
        name_required: "Please add your name.",
        email_invalid: "That email address doesn't look right.",
        message_too_short: "Please add a little more detail.",
        topic_invalid: "Please pick a topic from the list.",
        turnstile_failed: "Please confirm you're human and try again.",
      },
    },
  },

  footer: {
    rights: "All rights reserved.",
    built: "Designed & built in Aleppo, Syria",
    backToTop: "Back to top",
  },
};

const ar: Copy = {
  langLabel: "العربية",
  switchTo: { ar: "العربية", en: "English" },

  nav: {
    work: "من أنا",
    platforms: "المنصّات",
    code: "الكود",
    capabilities: "ما أقدّمه",
    contact: "تواصل",
  },

  meta: {
    title: "أحمد غاوي — مهندس برمجيات وأخصائي أنظمة تقنية",
    description:
      "أبني وأشغّل البرمجيات التي تقف خلف التجارة الرقمية. منصّتان تعملان في الإنتاج الآن: متجر GH Store لبيع المنتجات الرقمية، ومصنع البوتات، محرّك تجارة متعدّد المستأجرين على تيليجرام.",
  },

  hero: {
    kicker: "~/ghawi.app",
    name: ["أحمد", "غاوي"],
    role: "مهندس برمجيات · أخصائي أنظمة تقنية",
    lead: "أصمّم وأبني وأشغّل المنظومة كاملة — من أول نقرة للعميل حتى وصول الطلب إلى واجهة المزوّد. اليوم يعني ذلك منصّتين تعملان في الإنتاج، وكميات كبيرة من البنية التحتية التي تُبقيهما صامدتين.",
    primary: "شاهد المنصّات",
    secondary: "ابدأ محادثة",
    scroll: "مرّر",
  },

  board: {
    title: "الخدمات المنشورة",
    live: "يعمل",
    rows: [
      { label: "gh-store.me", value: "متجر منتجات رقمية" },
      { label: "factory.gh-store.me", value: "منصّة تجارة على تيليجرام" },
      { label: "github.com/GH-ZX", value: "مفتوح المصدر" },
    ],
    foot: [
      { label: "المقر", value: "حلب، سوريا" },
      { label: "التوقيت", value: "UTC+3" },
    ],
  },

  stats: [
    { value: "02", label: "منصّتان في الإنتاج" },
    { value: "27", label: "مستودعاً مفتوحاً" },
    { value: "09", label: "فئات في المتجر" },
    { value: "عربي/إنجليزي", label: "لغتان افتراضياً" },
  ],

  about: {
    label: "نبذة",
    headline: "معظم المهندسين يعملون في طبقة واحدة. أنا أعمل عبر الطبقات كلها.",
    body: [
      "بدأت في تشخيص اللوحات الأمّية وإعادة بناء شبكات المكاتب. لم يتلاشَ ذلك الانطباع أبداً — ما زلت أفكر في الآلة التي تعمل تحت البرمجيات.",
      "اليوم يعني ذلك أنني أستطيع أن أنقل مشروعاً من خادم فارغ إلى متجر يستقبل أموالاً حقيقية: قاعدة البيانات، والبوت الذي يتحدّث مع المزوّدين، وطبقة الحافة التي تخدمه، والعتاد والشبكة التي يعمل عليها كل ذلك.",
    ],
    disciplineTitle: "ما أعمله فعلياً",
    discipline: [
      { label: "البنية التحتية", value: "إدارة الخوادم والشبكات، تشخيص العتاد، تركيب الأنظمة وتحصينها" },
      { label: "هندسة المنتجات", value: "TypeScript، React، Next.js، Tailwind، Flutter، C#" },
      { label: "الخلفية والبيانات", value: "FastAPI، PostgreSQL، Redis، Supabase، PL/pgSQL" },
      { label: "تيليجرام والأتمتة", value: "Aiogram 3، Bot API، توثيق Mini Apps، موائمات المزوّدين" },
      { label: "السحابة والتشغيل", value: "Cloudflare Workers، Docker، التكامل المستمر، تسليمات نشر مُشفّرة" },
    ],
  },

  platforms: {
    label: "المنصّات",
    headline: "نظامان، يعملان كلاهما الآن.",
    visit: "زيارة الموقع",
    source: "الكود",
  },

  code: {
    label: "كود مختار",
    headline: "أشياء أخرى أنجزتها.",
    all: "كل المستودعات الـ 27",
    column: { repo: "المستودع", lang: "اللغة", type: "النوع", about: "ما هو" },
  },

  capabilities: {
    label: "ما أقدّمه",
    headline: "ما يمكنك أن تسلّمه لي.",
    items: [
      {
        index: "01",
        title: "هندسة منتجات كاملة",
        body: "من قاعدة البيانات إلى الواجهة. TypeScript وReact وNext.js وTailwind وFlutter وC#، بُنيت لتُصان بعد الإطلاق لا لتُترك عند التسليم.",
      },
      {
        index: "02",
        title: "أنظمة خلفية وتجارية",
        body: "FastAPI وPostgreSQL في الخلفية: دفاتر حسابات، آلات حالات للطلبات، طوابير تنفيذ، وتسديد دفعات غير قابل للتكرار يصمد أمام إعادة المحاولة.",
      },
      {
        index: "03",
        title: "بوتات وتطبيقات تيليجرام",
        body: "Aiogram 3 وواجهة Bot API. أسراب بوتات، توثيق عبر initData، تطبيقات مصغّرة بهوية واضحة، وموائمات مزوّدين تتعافى من الأعطال دون فقد الطلبات.",
      },
      {
        index: "04",
        title: "السحابة والنشر",
        body: "Cloudflare Workers وSupabase وDocker. تكامل مستمر، نسخ احتياطية، تسليمات مُشفّرة للعملاء، وتثبيتات ذاتية الاستضافة لا تعتمد على بقائي متاحاً.",
      },
      {
        index: "05",
        title: "دعم تقني وعتاد",
        body: "إدارة خوادم وشبكات، إصلاح الحواسيب واللوحات الأمّية، تثبيت أنظمة نظيف وتحصين أمني — فعلياً وافتراضياً.",
      },
    ],
  },

  contact: {
    label: "تواصل",
    headline: "لنبنِ شيئاً يعمل فعلاً.",
    body: "مفتوح لمشاريع هندسة المنتجات وتجارة تيليجرام والبنية التحتية. عن بُعد، مع أي مكان، ومستعد لأن آخذ النظام من البداية إلى النهاية.",
    emailCta: "أرسل رسالة",
    fallback: "تفضّل البريد؟",
    channels: [
      { id: "email", label: "البريد", value: "ahmedghawi3@gmail.com" },
      { id: "telegram", label: "تيليجرام", value: "@ahmedghx" },
      { id: "whatsapp", label: "واتساب", value: "+963 968 098 330" },
      { id: "github", label: "GitHub", value: "GH-ZX" },
      { id: "linkedin", label: "لينكدإن", value: "ahmed-gh" },
    ],
    form: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      topic: "ما موضوع الرسالة؟",
      topics: [
        { value: "product", label: "هندسة منتجات" },
        { value: "telegram", label: "تجارة تيليجرام" },
        { value: "infrastructure", label: "بنية تحتية و DevOps" },
        { value: "it", label: "دعم تقني" },
        { value: "other", label: "شيء آخر" },
      ],
      message: "الرسالة",
      messageHint: "بضعة أسطر تكفي.",
      submit: "إرسال الرسالة",
      sending: "جارٍ الإرسال",
      success: "وصلت الرسالة. سأردّ على بريدك.",
      sendAnother: "إرسال رسالة أخرى",
      errors: {
        generic: "حدث خطأ ما. أعد المحاولة أو راسلني مباشرة.",
        rate_limited: "رسائل كثيرة من هذا الاتصال. أعد المحاولة لاحقاً.",
        invalid_json: "حدث خطأ ما. أعد المحاولة.",
        name_required: "الرجاء كتابة الاسم.",
        email_invalid: "يبدو أن البريد الإلكتروني غير صحيح.",
        message_too_short: "الرجاء إضافة بعض التفاصيل.",
        topic_invalid: "الرجاء اختيار موضوع من القائمة.",
        turnstile_failed: "الرجاء تأكيد أنك لست روبوتاً ثم أعد المحاولة.",
      },
    },
  },

  footer: {
    rights: "جميع الحقوق محفوظة.",
    built: "صُمّم وبُني في حلب، سوريا",
    backToTop: "العودة للأعلى",
  },
};

export const copy: Record<Locale, Copy> = { en, ar };

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");
export const htmlLangOf = (locale: Locale) => (locale === "ar" ? "ar" : "en");

/* ------------------------------------------------------------------ *
 *  Platforms
 * ------------------------------------------------------------------ */

export const platforms: Record<Locale, Platform[]> = {
  en: [
    {
      index: "01",
      id: "gh-store",
      name: "GH Store",
      domain: "gh-store.me",
      url: links.store,
      category: "Digital commerce · Production",
      headline: "A bilingual digital-goods storefront taking real transactions.",
      body: "Customers browse in Arabic or English, top up a wallet, pay, and receive keys or game credit — delivered automatically from suppliers, or after a quick team review depending on the offer. The same application carries a full admin console for catalog, providers, payments, fulfillment, customers, reviews, support tickets and audit logs.",
      features: [
        { label: "Catalog", value: "Nine categories, Arabic and English, RTL-aware routing" },
        { label: "Payments", value: "Wallet balances, coupons, reseller price groups" },
        { label: "Fulfillment", value: "Automated supplier delivery with a manual review path" },
        { label: "Support", value: "Tickets, warranties, and downloadable PDF invoices" },
        { label: "Admin", value: "Products, providers, payments, reviews, activity log" },
        { label: "Edge", value: "Cloudflare Workers in front of Supabase and PostgreSQL" },
      ],
      stack: ["React Router", "TypeScript", "Supabase", "PostgreSQL", "Cloudflare Workers", "Tailwind"],
    },
    {
      index: "02",
      id: "bot-factory",
      name: "GH Bot Factory",
      domain: "factory.gh-store.me",
      url: links.factory,
      category: "Commerce platform · SaaS",
      headline: "A multi-tenant engine that turns a blank bot into a business.",
      body: "A public configurator collects a customer's scope and product preferences, the operator console turns that into a quote and provisions an isolated tenant, and the customer walks away with their own branded bot, Mini App and admin portal. Suppliers and payment credentials live in an encrypted vault — plaintext keys never touch the database or the browser.",
      features: [
        { label: "Pipeline", value: "Configurator → inquiry → quote → tenant provisioning" },
        { label: "Tenancy", value: "Per-tenant bot fleets, branding, themes and entitlements" },
        { label: "Secrets", value: "Write-only encrypted credential storage, never returned to clients" },
        { label: "Money", value: "Currency-safe ledger, reconciliation cases, refund guards" },
        { label: "Access", value: "Owner, admin, manager, staff and customer roles" },
        { label: "Handoff", value: "Encrypted installation bundles for self-hosted deployments" },
      ],
      stack: ["FastAPI", "Aiogram 3", "PostgreSQL", "Redis", "Docker", "React"],
    },
  ],
  ar: [
    {
      index: "01",
      id: "gh-store",
      name: "متجر GH",
      domain: "gh-store.me",
      url: links.store,
      category: "تجارة رقمية · في الإنتاج",
      headline: "متجر منتجات رقمية ثنائي اللغة يستقبل مدفوعات حقيقية.",
      body: "يتصفّح العميل بالعربية أو الإنجليزية، يعبّئ محفظته، يدفع، ويستلم مفاتيح أو شحنات ألعاب — تُسلَّم تلقائياً من المزوّدين، أو بعد مراجعة سريعة من الفريق حسب العرض. ويحمل التطبيق نفسه لوحة تحكّم كاملة لإدارة الكتالوج والمزوّدين والدفع والتنفيذ والعملاء والتقييمات وتذاكر الدعم وسجل التدقيق.",
      features: [
        { label: "الكتالوج", value: "تسع فئات، بالعربية والإنجليزية، مع دعم اتجاه RTL" },
        { label: "الدفع", value: "أرصدة محفظة، قسائم، ومجموعات أسعار للموزّعين" },
        { label: "التنفيذ", value: "تسليم آلي من المزوّد مع مسار مراجعة يدوي" },
        { label: "الدعم", value: "تذاكر، ضمانات، وفواتير PDF قابلة للتحميل" },
        { label: "الإدارة", value: "منتجات ومزوّدون ومدفوعات وتقييمات وسجل نشاط" },
        { label: "الحافة", value: "Cloudflare Workers أمام Supabase وPostgreSQL" },
      ],
      stack: ["React Router", "TypeScript", "Supabase", "PostgreSQL", "Cloudflare Workers", "Tailwind"],
    },
    {
      index: "02",
      id: "bot-factory",
      name: "مصنع البوتات",
      domain: "factory.gh-store.me",
      url: links.factory,
      category: "منصّة تجارة · SaaS",
      headline: "محرك متعدّد المستأجرين يحوّل بوتاً فارغاً إلى مشروع.",
      body: "مُهيّئ عام يجمع نطاق العميل وتفضيلاته، وواجهة المشغّل تحوّل ذلك إلى عرض سعر وتُنشئ مستأجراً معزولاً، فيخرج العميل بوته وهويّته وتطبيقه المصغّر ولوحته الخاصة. أما بيانات المزوّدين والدفع فتُحفظ في خزنة مُشفّرة — المفاتيح لا تُخزَّن أبداً كنص صريح في قاعدة البيانات ولا في المتصفّح.",
      features: [
        { label: "المسار", value: "مُهيّئ ← طلب ← عرض سعر ← إنشاء مستأجر" },
        { label: "التعدّد", value: "أسراب بوتات وهوية وسمات وصلاحيات لكل مستأجر" },
        { label: "الأسرار", value: "تخزين مُشفّر للكتابة فقط، لا يعود أبداً إلى العميل" },
        { label: "المال", value: "دفتر آمن بين العملات، حالات تسوية، وحماية للاسترداد" },
        { label: "الصلاحيات", value: "مالك ومدير ومشرف وموظف وعميل" },
        { label: "التسليم", value: "حزم تثبيت مُشفّرة للتثبيتات ذاتية الاستضافة" },
      ],
      stack: ["FastAPI", "Aiogram 3", "PostgreSQL", "Redis", "Docker", "React"],
    },
  ],
};

/* ------------------------------------------------------------------ *
 *  Selected repositories — pulled from github.com/GH-ZX
 * ------------------------------------------------------------------ */

export const repos: Record<Locale, Repo[]> = {
  en: [
    {
      name: "echocore-store",
      language: "JavaScript",
      type: "Storefront",
      blurb: "The earlier generation of the digital store — bilingual top-ups and gift cards, supplier catalog sync, auto-fulfillment and PDF invoices.",
      url: "https://github.com/GH-ZX/echocore-store",
      stars: 1,
    },
    {
      name: "gh-store-tele",
      language: "Python",
      type: "Telegram bot",
      blurb: "Telegram reseller bot with automated key fulfillment and multi-currency top-up through crypto, Telegram Stars and local gateways.",
      url: "https://github.com/GH-ZX/gh-store-tele",
    },
    {
      name: "TechVerse-App",
      language: "Dart",
      type: "Mobile app",
      blurb: "Cross-platform e-commerce application with a full admin panel, built in Flutter on clean architecture.",
      url: "https://github.com/GH-ZX/TechVerse-App",
    },
    {
      name: "doomsday-arabic-fix",
      language: "C#",
      type: "Localization",
      blurb: "Full Arabic localization pass over a C# game codebase — string tables, bidirectional layout and font handling.",
      url: "https://github.com/GH-ZX/doomsday-arabic-fix",
    },
    {
      name: "Za-app",
      language: "Dart",
      type: "Mobile app",
      blurb: "Flutter application covering authentication, offline-first storage and API-backed screens.",
      url: "https://github.com/GH-ZX/Za-app",
    },
    {
      name: "CarrefourMall",
      language: "JavaScript",
      type: "Web",
      blurb: "Responsive storefront interface built with React and Tailwind CSS.",
      url: "https://github.com/GH-ZX/CarrefourMall",
    },
  ],
  ar: [
    {
      name: "echocore-store",
      language: "JavaScript",
      type: "متجر",
      blurb: "الجيل الأوّل من المتجر الرقمي — شحن ألعاب وبطاقات ثنائية اللغة، مزامنة كتالوج المزوّد، تنفيذ آلي وفواتير PDF.",
      url: "https://github.com/GH-ZX/echocore-store",
      stars: 1,
    },
    {
      name: "gh-store-tele",
      language: "Python",
      type: "بوت تيليجرام",
      blurb: "بوت إعادة بيع على تيليجرام بتنفيذ آلي للمفاتيح وتعبئة متعدّدة العملات عبر الكريبتو وTelegram Stars والبوابات المحلية.",
      url: "https://github.com/GH-ZX/gh-store-tele",
    },
    {
      name: "TechVerse-App",
      language: "Dart",
      type: "تطبيق جوال",
      blurb: "تطبيق تجارة إلكترونية متعدّد المنصّات بلوحة تحكّم كاملة، مبني بـ Flutter على بنية نظيفة.",
      url: "https://github.com/GH-ZX/TechVerse-App",
    },
    {
      name: "doomsday-arabic-fix",
      language: "C#",
      type: "توطين",
      blurb: "تمرير توطين عربي كامل على قاعدة شيفرة لعبة بـ C# — جداول النصوص، وتخطيط ثنائي الاتجاه، ومعالجة الخطوط.",
      url: "https://github.com/GH-ZX/doomsday-arabic-fix",
    },
    {
      name: "Za-app",
      language: "Dart",
      type: "تطبيق جوال",
      blurb: "تطبيق Flutter يغطّي المصادقة والتخزين للعمل دون اتصال والشاشات المبنية على واجهات برمجية.",
      url: "https://github.com/GH-ZX/Za-app",
    },
    {
      name: "CarrefourMall",
      language: "JavaScript",
      type: "ويب",
      blurb: "واجهة متجر متجاوبة مبنية بـ React وTailwind CSS.",
      url: "https://github.com/GH-ZX/CarrefourMall",
    },
  ],
};

/* ------------------------------------------------------------------ *
 *  Running marquee
 * ------------------------------------------------------------------ */

export const marqueeItems: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "FastAPI",
  "Python",
  "Aiogram 3",
  "Telegram Mini Apps",
  "PostgreSQL",
  "PL/pgSQL",
  "Supabase",
  "Redis",
  "Cloudflare Workers",
  "Docker",
  "C#",
  ".NET",
  "Flutter",
  "Dart",
  "Linux",
  "Networking",
  "Git",
];