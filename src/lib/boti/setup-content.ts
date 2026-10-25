import type { Lang, StepId } from "./setup";

/** One text in both languages. */
export type T = { en: string; ar: string };
export const tr = (lang: Lang, t: T) => t[lang];

export type MockKind = "botfather" | "deploykey" | "supabase-api" | "cloudflare-vars" | "nowpayments" | "panel-system";

export type HowTo = {
  title: T;
  /** Where to click, e.g. "Settings → Deploy keys". */
  path?: T;
  steps: T[];
  links: { label: T; href: string }[];
  mistakes: T[];
  mock?: MockKind;
};

export type StepText = { title: T; goal: T; /** Shown big in client view. */ client: T; howto: HowTo[] };

export const STEP_TEXT: Record<StepId, StepText> = {
  welcome: {
    title: { en: "Welcome", ar: "أهلاً" },
    goal: { en: "Name the store and choose its language.", ar: "سمِّ المتجر واختر لغته." },
    client: { en: "Let's build your store together", ar: "خلّينا نبني متجرك سوا" },
    howto: [
      {
        title: { en: "What we'll do today", ar: "شو رح نعمل اليوم" },
        steps: [
          { en: "Create the store's Telegram bot.", ar: "نعمل بوت تيليجرام للمتجر." },
          { en: "Create a private GitHub repo that receives every update.", ar: "نعمل ريبو GitHub خاص بيستقبل كل تحديث." },
          { en: "Create the database on Supabase.", ar: "نعمل قاعدة البيانات على Supabase." },
          { en: "Put the store online on Cloudflare, with its own domain.", ar: "نشغّل المتجر على Cloudflare بدومين خاص." },
          { en: "Connect the payment methods.", ar: "نربط طرق الدفع." },
          { en: "Open the admin panel and go live.", ar: "نفتح لوحة التحكم ونطلق المتجر." },
        ],
        links: [],
        mistakes: [
          { en: "Client name is the internal id: lowercase, no spaces (e.g. sara-store). The brand name is what customers see.", ar: "اسم العميل هو معرّف داخلي: أحرف صغيرة بدون فراغات (مثل sara-store). اسم المتجر هو اللي بيشوفه الزبائن." },
        ],
      },
    ],
  },

  telegram: {
    title: { en: "Telegram bot", ar: "بوت تيليجرام" },
    goal: { en: "Create the bot with BotFather and keep its token safe.", ar: "اعمل البوت عن طريق BotFather واحفظ التوكن تبعه بمكان آمن." },
    client: { en: "Your store's bot", ar: "بوت متجرك" },
    howto: [
      {
        title: { en: "Create the bot", ar: "إنشاء البوت" },
        path: { en: "Telegram → @BotFather → /newbot", ar: "تيليجرام ← ‎@BotFather ← ‎/newbot" },
        steps: [
          { en: "Open @BotFather from the client's Telegram account (the store owner should own the bot).", ar: "افتح ‎@BotFather من حساب تيليجرام تبع العميل (صاحب المتجر لازم يكون مالك البوت)." },
          { en: "Send /newbot, then the display name (the brand name).", ar: "أرسل ‎/newbot وبعدها الاسم الظاهر (اسم المتجر)." },
          { en: "Send a username ending in bot, e.g. SaraStoreBot. Type it in boti.", ar: "أرسل يوزر بينتهي بـ bot مثل SaraStoreBot، واكتبه هون بـ boti." },
          { en: "Copy the token BotFather sends. It goes into Cloudflare later as TELEGRAM_BOT_TOKEN — boti never stores it.", ar: "انسخ التوكن اللي بيبعته BotFather. رح نحطه بعدين بـ Cloudflare باسم TELEGRAM_BOT_TOKEN، وboti ما بيحفظه أبداً." },
          { en: "Send /setinline, pick the bot, and type a placeholder like \"Search products…\" (enables search from any chat).", ar: "أرسل ‎/setinline واختر البوت واكتب نص مثل «ابحث عن منتج…» (بيفعّل البحث من أي محادثة)." },
        ],
        links: [{ label: { en: "Open BotFather", ar: "افتح BotFather" }, href: "https://t.me/BotFather" }],
        mistakes: [
          { en: "Never paste the token in a chat or a group — anyone with it controls the bot. If it leaks: /revoke in BotFather.", ar: "لا تلصق التوكن بأي محادثة أو غروب، لأنه أي حدا معه بيتحكم بالبوت. إذا انكشف: ‎/revoke من BotFather." },
          { en: "Animated custom emoji only work when the bot's owner has Telegram Premium.", ar: "الإيموجي المتحركة بتشتغل بس إذا مالك البوت عنده Telegram Premium." },
        ],
        mock: "botfather",
      },
    ],
  },

  github: {
    title: { en: "GitHub", ar: "GitHub" },
    goal: { en: "A private repo that receives every update, with boti's deploy key.", ar: "ريبو خاص بيستقبل كل تحديث، مع مفتاح النشر تبع boti." },
    client: { en: "Where your store's code lives", ar: "مكان كود متجرك" },
    howto: [
      {
        title: { en: "Create the private repo", ar: "إنشاء الريبو الخاص" },
        path: { en: "github.com → New repository", ar: "github.com ← New repository" },
        steps: [
          { en: "Sign in to the client's GitHub (or create a free account).", ar: "سجّل دخول على GitHub تبع العميل (أو اعمل حساب مجاني)." },
          { en: "New repository → name it (e.g. my-store) → Private → do NOT add a README, .gitignore or licence.", ar: "New repository ← سمّيه (مثل my-store) ← Private ← لا تضيف README ولا ‎.gitignore ولا licence." },
          { en: "Type owner/name in boti, e.g. sara/my-store.", ar: "اكتب owner/name هون، مثل sara/my-store." },
        ],
        links: [{ label: { en: "New repository", ar: "ريبو جديد" }, href: "https://github.com/new" }],
        mistakes: [
          { en: "A README makes the repo non-empty and the first sync can refuse to overwrite it.", ar: "الـ README بيخلّي الريبو مش فاضي، وأول مزامنة ممكن ترفض تكتب فوقه." },
        ],
      },
      {
        title: { en: "Add boti's deploy key", ar: "إضافة مفتاح النشر" },
        path: { en: "Repo → Settings → Deploy keys → Add deploy key", ar: "الريبو ← Settings ← Deploy keys ← Add deploy key" },
        steps: [
          { en: "Press \"Create deploy key\" in boti and copy the public key.", ar: "اضغط «إنشاء مفتاح النشر» بـ boti وانسخ المفتاح العام." },
          { en: "In the client's repo: Settings → Deploy keys → Add deploy key.", ar: "بريبو العميل: Settings ← Deploy keys ← Add deploy key." },
          { en: "Title: boti. Paste the key. Tick \"Allow write access\". Add key.", ar: "العنوان: boti. الصق المفتاح. فعّل «Allow write access». اضغط Add key." },
        ],
        links: [],
        mistakes: [
          { en: "Without \"Allow write access\" every sync fails with \"permission denied\".", ar: "بدون «Allow write access» كل مزامنة بتفشل برسالة «permission denied»." },
          { en: "The private half never leaves boti: it's stored straight into the GitHub secret.", ar: "النصف الخاص من المفتاح ما بيطلع من boti: بيتخزّن مباشرة كـ secret على GitHub." },
        ],
        mock: "deploykey",
      },
    ],
  },

  supabase: {
    title: { en: "Supabase", ar: "Supabase" },
    goal: { en: "The store's database, its tables and the owner's admin account.", ar: "قاعدة بيانات المتجر وجداولها وحساب الأدمن تبع المالك." },
    client: { en: "Your store's database", ar: "قاعدة بيانات متجرك" },
    howto: [
      {
        title: { en: "Create the project", ar: "إنشاء المشروع" },
        path: { en: "supabase.com/dashboard → New project", ar: "supabase.com/dashboard ← New project" },
        steps: [
          { en: "Sign in with the client's account → New project (free plan is fine).", ar: "سجّل دخول بحساب العميل ← New project (الخطة المجانية بتكفي)." },
          { en: "Region: the closest to the customers (e.g. Frankfurt for the Middle East / Europe).", ar: "المنطقة: الأقرب للزبائن (مثلاً Frankfurt للشرق الأوسط وأوروبا)." },
          { en: "Generate a strong database password and save it in the client's password manager.", ar: "ولّد كلمة سر قوية لقاعدة البيانات واحفظها بمدير كلمات السر تبع العميل." },
          { en: "Project Settings → API: copy the Project URL into boti (the ref fills itself).", ar: "Project Settings ← API: انسخ Project URL لـ boti (الـ ref بيتعبّى لحاله)." },
          { en: "The service_role key (same page) goes into Cloudflare later — never into boti or a chat.", ar: "مفتاح service_role (بنفس الصفحة) رح يروح بعدين على Cloudflare، مش على boti ولا بأي محادثة." },
        ],
        links: [{ label: { en: "Supabase dashboard", ar: "لوحة Supabase" }, href: "https://supabase.com/dashboard/projects" }],
        mistakes: [
          { en: "service_role bypasses all security: it belongs only in Cloudflare secrets.", ar: "مفتاح service_role بيتجاوز كل الحماية: مكانه بس بـ secrets على Cloudflare." },
        ],
        mock: "supabase-api",
      },
      {
        title: { en: "Create the tables (migrations)", ar: "إنشاء الجداول (migrations)" },
        path: { en: "On your computer, in the boti folder", ar: "على كمبيوترك، بمجلد boti" },
        steps: [
          { en: "Run the three commands below (copy buttons) from the boti project folder.", ar: "شغّل الأوامر التلاتة تحت (في أزرار نسخ) من مجلد مشروع boti." },
          { en: "db push asks for the database password you just saved.", ar: "‏db push بيطلب كلمة سر قاعدة البيانات اللي حفظتها." },
          { en: "Then link back to your previous project if you were linked to another client.", ar: "بعدها رجّع الـ link لمشروعك السابق إذا كنت مربوط بعميل تاني." },
        ],
        links: [],
        mistakes: [
          { en: "supabase link switches the folder to this client: double-check the ref before db push.", ar: "‏supabase link بيحوّل المجلد لهالعميل: تأكد من الـ ref قبل db push." },
        ],
      },
      {
        title: { en: "Owner's admin account", ar: "حساب الأدمن تبع المالك" },
        path: { en: "Authentication → Users → Add user", ar: "Authentication ← Users ← Add user" },
        steps: [
          { en: "Add user → the owner's email + a password → tick \"Auto Confirm User\".", ar: "Add user ← إيميل المالك وكلمة سر ← فعّل «Auto Confirm User»." },
          { en: "Authentication → Sign In / Providers → turn OFF \"Allow new users to sign up\".", ar: "Authentication ← Sign In / Providers ← أطفئ «Allow new users to sign up»." },
          { en: "Type the owner's email in boti (it becomes OWNER_EMAILS).", ar: "اكتب إيميل المالك هون (بيصير OWNER_EMAILS)." },
        ],
        links: [],
        mistakes: [
          { en: "Leaving sign-ups on lets strangers create accounts on the panel's database.", ar: "إذا خلّيت التسجيل مفتوح، أي حدا بيقدر يعمل حساب على قاعدة بيانات اللوحة." },
        ],
      },
    ],
  },

  cloudflare: {
    title: { en: "Cloudflare", ar: "Cloudflare" },
    goal: { en: "Put the store online: code, secrets, domain.", ar: "تشغيل المتجر أونلاين: الكود والمفاتيح السرية والدومين." },
    client: { en: "Putting your store online", ar: "تشغيل متجرك أونلاين" },
    howto: [
      {
        title: { en: "First, boti's part", ar: "أولاً، شغل boti" },
        steps: [
          { en: "Register the client and create its branch (two buttons).", ar: "سجّل العميل واعمل الفرع تبعه (زرّين)." },
          { en: "Run the first sync: the code lands in the client's repo (needs the deploy key from the GitHub step).", ar: "شغّل أول مزامنة: الكود بينزل بريبو العميل (بيحتاج مفتاح النشر من خطوة GitHub)." },
        ],
        links: [],
        mistakes: [{ en: "Sync failed? Check the deploy key has write access.", ar: "فشلت المزامنة؟ تأكد إنه مفتاح النشر عليه صلاحية كتابة." }],
      },
      {
        title: { en: "Connect the repo", ar: "ربط الريبو" },
        path: { en: "dash.cloudflare.com → Workers & Pages → Create → Import a repository", ar: "dash.cloudflare.com ← Workers & Pages ← Create ← Import a repository" },
        steps: [
          { en: "Sign in with the client's Cloudflare account (free).", ar: "سجّل دخول بحساب Cloudflare تبع العميل (مجاني)." },
          { en: "Workers & Pages → Create → Import a repository → connect GitHub → pick the client's repo.", ar: "Workers & Pages ← Create ← Import a repository ← اربط GitHub ← اختر ريبو العميل." },
          { en: "Project name = the Worker name shown in boti. Build command: npm run build. Deploy command: npx wrangler deploy.", ar: "اسم المشروع = اسم الـ Worker الظاهر بـ boti. أمر البناء: npm run build. أمر النشر: npx wrangler deploy." },
        ],
        links: [{ label: { en: "Cloudflare dashboard", ar: "لوحة Cloudflare" }, href: "https://dash.cloudflare.com/?to=/:account/workers-and-pages" }],
        mistakes: [
          { en: "A different project name creates a second Worker — keep it identical.", ar: "إذا اسم المشروع مختلف بيعمل Worker تاني — خلّيه نفس الاسم بالضبط." },
        ],
      },
      {
        title: { en: "Secrets", ar: "المفاتيح السرية" },
        path: { en: "Worker → Settings → Variables and Secrets → Add (type: Secret)", ar: "الـ Worker ← Settings ← Variables and Secrets ← Add (النوع: Secret)" },
        steps: [
          { en: "Add each secret from the list in boti, type \"Secret\" (not Text).", ar: "أضف كل مفتاح من القائمة بـ boti، بنوع «Secret» (مش Text)." },
          { en: "SUPABASE_URL is already in the code — don't add it.", ar: "‏SUPABASE_URL موجود أصلاً بالكود — لا تضيفه." },
          { en: "Deployments → Retry, so the secrets load.", ar: "Deployments ← Retry حتى تنقرا المفاتيح." },
        ],
        links: [],
        mistakes: [
          { en: "ENCRYPTION_KEY must never change after the store starts: it encrypts every saved provider token.", ar: "‏ENCRYPTION_KEY ما لازم يتغيّر أبداً بعد ما يشتغل المتجر: هو اللي بيشفّر كل توكنات المزوّدين المحفوظة." },
        ],
        mock: "cloudflare-vars",
      },
      {
        title: { en: "Custom domain", ar: "الدومين الخاص" },
        path: { en: "Worker → Settings → Domains & Routes → Add → Custom domain", ar: "الـ Worker ← Settings ← Domains & Routes ← Add ← Custom domain" },
        steps: [
          { en: "The domain must be on the same Cloudflare account (Add a site → change nameservers at the registrar).", ar: "الدومين لازم يكون على نفس حساب Cloudflare (Add a site ← غيّر الـ nameservers عند شركة الدومين)." },
          { en: "Add it as a Custom domain on the Worker, then type it in boti and press Check.", ar: "أضفه كـ Custom domain على الـ Worker، وبعدين اكتبه هون واضغط فحص." },
        ],
        links: [],
        mistakes: [{ en: "\"Route\" ≠ \"Custom domain\": a route alone only serves some paths.", ar: "‏«Route» غير «Custom domain»: الـ route لحاله بيخدم بس بعض المسارات." }],
      },
    ],
  },

  payments: {
    title: { en: "Payments", ar: "طرق الدفع" },
    goal: { en: "Connect how customers top up. Each method is optional.", ar: "اربط طرق شحن الرصيد للزبائن. كل طريقة اختيارية." },
    client: { en: "How your customers pay", ar: "كيف بيدفعولك الزبائن" },
    howto: [
      {
        title: { en: "NOWPayments (USDT)", ar: "NOWPayments ‏(USDT)" },
        path: { en: "nowpayments.io → Dashboard", ar: "nowpayments.io ← Dashboard" },
        steps: [
          { en: "Create the account and verify the email.", ar: "اعمل حساب وأكّد الإيميل." },
          { en: "Settings → Payment → Payout wallets: add a USDT BEP20 address (e.g. the client's Binance deposit address on BSC).", ar: "Settings ← Payment ← Payout wallets: أضف عنوان USDT على BEP20 (مثلاً عنوان الإيداع تبع العميل ببينانس على شبكة BSC)." },
          { en: "Coins settings: enable USDT BSC (and TRC20 if you'll offer it).", ar: "Coins settings: فعّل USDT BSC (وTRC20 إذا رح تقدّمها)." },
          { en: "Copy the API key and the IPN secret.", ar: "انسخ الـ API key والـ IPN secret." },
          { en: "Client panel → Settings → Payments → NOWPayments: paste both, tick the networks, Save, press Test.", ar: "لوحة العميل ← الإعدادات ← المدفوعات ← NOWPayments: الصق الاتنين، اختر الشبكات، احفظ، واضغط اختبار." },
        ],
        links: [{ label: { en: "NOWPayments", ar: "NOWPayments" }, href: "https://account.nowpayments.io/" }],
        mistakes: [
          { en: "No payout wallet = NOWPayments refuses to create payments.", ar: "بدون محفظة استلام، NOWPayments بيرفض ينشئ دفعات." },
          { en: "Fee is a percent: 0.1 means 0.1%, not 10 cents.", ar: "الرسوم نسبة: 0.1 يعني 0.1% مش 10 سنت." },
        ],
        mock: "nowpayments",
      },
      {
        title: { en: "Binance Pay ID (manual)", ar: "Binance Pay ID ‏(يدوي)" },
        path: { en: "Client panel → Settings → Payments → Binance Pay ID", ar: "لوحة العميل ← الإعدادات ← المدفوعات ← Binance Pay ID" },
        steps: [
          { en: "In the Binance app: Pay → copy the Pay ID.", ar: "بتطبيق بينانس: Pay ← انسخ الـ Pay ID." },
          { en: "Paste it with the receiver name, keep confirmation \"Manual approval\", enable, Save.", ar: "الصقه مع اسم المستلم، خلّي التأكيد «موافقة يدوية»، فعّل واحفظ." },
          { en: "Each payment arrives in the admin bot for approval.", ar: "كل دفعة بتوصل لبوت الإدارة للموافقة." },
        ],
        links: [],
        mistakes: [{ en: "Approve only after checking the money really arrived.", ar: "وافق بس بعد ما تتأكد إنه المبلغ وصل فعلاً." }],
      },
      {
        title: { en: "ShamCash (manual)", ar: "شام كاش (يدوي)" },
        path: { en: "Client panel → Settings → Payments → ShamCash", ar: "لوحة العميل ← الإعدادات ← المدفوعات ← شام كاش" },
        steps: [
          { en: "Account name and number, optional QR image, currency and rate if in SYP.", ar: "اسم الحساب ورقمه، صورة QR اختيارية، والعملة وسعر الصرف إذا بالليرة." },
          { en: "Enable and Save. Customers send a screenshot; you approve in the admin bot.", ar: "فعّل واحفظ. الزبون بيرسل صورة التحويل، وأنت بتوافق من بوت الإدارة." },
        ],
        links: [],
        mistakes: [],
      },
    ],
  },

  live: {
    title: { en: "Go live", ar: "الإطلاق" },
    goal: { en: "Open the panel, connect the bot, send the first /start.", ar: "افتح اللوحة، اربط البوت، وأرسل أول ‎/start." },
    client: { en: "Your store goes live", ar: "متجرك صار جاهز" },
    howto: [
      {
        title: { en: "Connect the bot", ar: "ربط البوت" },
        path: { en: "Client panel → System", ar: "لوحة العميل ← النظام" },
        steps: [
          { en: "Open the panel link and sign in with the owner's email.", ar: "افتح رابط اللوحة وسجّل دخول بإيميل المالك." },
          { en: "System → \"Set webhook to this site\".", ar: "النظام ← «وجّه الويب هوك لهذا الموقع»." },
          { en: "System → \"Update bot commands\".", ar: "النظام ← «تحديث أوامر البوت»." },
          { en: "Open the bot and send /start — the store should answer.", ar: "افتح البوت وأرسل ‎/start — لازم يرد المتجر." },
          { en: "Optional: add a provider, import products, and make a small test order.", ar: "اختياري: أضف مزوّد، استورد منتجات، واعمل طلب تجربة صغير." },
        ],
        links: [],
        mistakes: [
          { en: "Sign-in refused? The email must be in OWNER_EMAILS and confirmed in Supabase.", ar: "رفض تسجيل الدخول؟ الإيميل لازم يكون بـ OWNER_EMAILS ومؤكد بـ Supabase." },
          { en: "Bot silent? Press \"Set webhook\" again after every domain change.", ar: "البوت ما عم يرد؟ اضغط «وجّه الويب هوك» من جديد بعد أي تغيير بالدومين." },
        ],
        mock: "panel-system",
      },
    ],
  },

  done: {
    title: { en: "Done", ar: "تم" },
    goal: { en: "Everything is set up.", ar: "كل شي جاهز." },
    client: { en: "Your store is live!", ar: "متجرك صار شغّال!" },
    howto: [],
  },
};

export const TASK_TEXT: Record<string, T> = {
  "telegram.newbot": { en: "Bot created with /newbot", ar: "انعمل البوت بـ ‎/newbot" },
  "telegram.token": { en: "Token copied to a safe place (for Cloudflare)", ar: "التوكن محفوظ بمكان آمن (لـ Cloudflare)" },
  "telegram.inline": { en: "Inline search on (/setinline)", ar: "البحث من أي محادثة مفعّل (‎/setinline)" },
  "github.account": { en: "Client's GitHub account ready", ar: "حساب GitHub تبع العميل جاهز" },
  "github.repo": { en: "Private, empty repo created", ar: "انعمل ريبو خاص وفاضي" },
  "github.deploykey": { en: "Deploy key added with write access", ar: "مفتاح النشر مضاف مع صلاحية كتابة" },
  "supabase.project": { en: "Project created, DB password saved", ar: "انعمل المشروع وكلمة سر القاعدة محفوظة" },
  "supabase.migrate": { en: "Tables created (db push)", ar: "انعملت الجداول (db push)" },
  "supabase.admin": { en: "Owner's admin user added (auto-confirmed)", ar: "انضاف حساب أدمن المالك (مؤكد)" },
  "supabase.signups": { en: "Public sign-ups turned off", ar: "التسجيل العام مطفى" },
  "cloudflare.import": { en: "Repo connected in Workers Builds", ar: "الريبو مربوط بـ Workers Builds" },
  "cloudflare.secrets": { en: "All secrets added, deployment retried", ar: "كل المفاتيح مضافة وأُعيد النشر" },
  "cloudflare.domain": { en: "Custom domain added", ar: "الدومين الخاص مضاف" },
  "payments.nowpayments": { en: "NOWPayments connected and tested", ar: "NOWPayments مربوط ومجرّب" },
  "payments.binance": { en: "Binance Pay ID added", ar: "Binance Pay ID مضاف" },
  "payments.shamcash": { en: "ShamCash added", ar: "شام كاش مضاف" },
  "live.signin": { en: "Signed in to the panel", ar: "تسجيل الدخول للوحة تم" },
  "live.webhook": { en: "Webhook set", ar: "الويب هوك موجّه" },
  "live.commands": { en: "Bot commands updated", ar: "أوامر البوت محدّثة" },
  "live.start": { en: "/start answered", ar: "البوت رد على ‎/start" },
  "live.order": { en: "Test order made", ar: "انعمل طلب تجربة" },
};

export const PROBLEMS: Record<string, T> = {
  client: { en: "Client name: 2–31 characters, a-z, 0-9 and -", ar: "اسم العميل: من 2 لـ 31 حرف، a-z و0-9 و-" },
  brand: { en: "Store name is empty", ar: "اسم المتجر فاضي" },
  bot_username: { en: "Bot username: letters, digits, _ (ends in bot)", ar: "يوزر البوت: أحرف وأرقام و_ (بينتهي بـ bot)" },
  repo: { en: "Repo: owner/name", ar: "الريبو: owner/name" },
  supabase_url: { en: "Supabase URL: https://<ref>.supabase.co", ar: "رابط Supabase: ‏https://<ref>.supabase.co" },
  owner_email: { en: "Owner email is not valid", ar: "إيميل المالك غير صحيح" },
  worker_name: { en: "Worker name: a-z, 0-9 and -", ar: "اسم الـ Worker: ‏a-z و0-9 و-" },
  domain: { en: "Domain looks wrong (e.g. store.example.com)", ar: "الدومين شكله غلط (مثل store.example.com)" },
  task: { en: "Tick the remaining required items", ar: "علّم على العناصر المطلوبة الباقية" },
  "action:deploy_key": { en: "Create the deploy key", ar: "أنشئ مفتاح النشر" },
  "action:register": { en: "Register the client", ar: "سجّل العميل" },
  "action:branch": { en: "Create the client branch", ar: "أنشئ فرع العميل" },
  "action:sync": { en: "Run the first sync", ar: "شغّل أول مزامنة" },
};

/** Interface words. */
export const UI = {
  tab: { en: "Quick setup", ar: "إعداد سريع" },
  heading: { en: "Quick setup", ar: "الإعداد السريع" },
  intro: { en: "Set up a new client's store step by step, with the client next to you.", ar: "جهّز متجر عميل جديد خطوة بخطوة، والعميل جنبك." },
  start: { en: "Start a new setup", ar: "ابدأ إعداد جديد" },
  inProgress: { en: "Setups in progress", ar: "إعدادات قيد التنفيذ" },
  resume: { en: "Resume", ar: "تابع" },
  remove: { en: "Remove", ar: "حذف" },
  removeConfirm: { en: "Remove this setup's progress? (Nothing on GitHub changes.)", ar: "حذف تقدّم هالإعداد؟ (ما بيتغيّر شي على GitHub.)" },
  step: { en: "Step", ar: "الخطوة" },
  of: { en: "of", ar: "من" },
  howto: { en: "How to", ar: "كيف؟" },
  close: { en: "Close", ar: "إغلاق" },
  next: { en: "Next", ar: "التالي" },
  back: { en: "Back", ar: "رجوع" },
  complete: { en: "Complete step", ar: "إنهاء الخطوة" },
  skip: { en: "Skip", ar: "تخطّي" },
  reopen: { en: "Edit again", ar: "تعديل" },
  clientView: { en: "Client view", ar: "عرض للعميل" },
  exitClientView: { en: "Exit client view", ar: "خروج من عرض العميل" },
  saved: { en: "Saved", ar: "تم الحفظ" },
  saving: { en: "Saving…", ar: "عم يحفظ…" },
  saveFailed: { en: "Couldn't save — will retry", ar: "ما انحفظ — رح يعيد المحاولة" },
  required: { en: "Required", ar: "مطلوب" },
  optional: { en: "Optional", ar: "اختياري" },
  status: { todo: { en: "To do", ar: "باقي" }, active: { en: "Now", ar: "الآن" }, done: { en: "Done", ar: "تم" }, skipped: { en: "Skipped", ar: "متخطّى" } },
  where: { en: "Where", ar: "وين" },
  mistakes: { en: "Common mistakes", ar: "أخطاء شائعة" },
  open: { en: "Open", ar: "افتح" },
  run: { en: "Run", ar: "شغّل" },
  runAgain: { en: "Run again", ar: "شغّل مرة تانية" },
  doneMark: { en: "Done", ar: "تم" },
  failed: { en: "Failed", ar: "فشل" },
  // inputs
  clientName: { en: "Client name (internal id)", ar: "اسم العميل (معرّف داخلي)" },
  brand: { en: "Store name (customers see it)", ar: "اسم المتجر (بيشوفه الزبائن)" },
  language: { en: "Store language", ar: "لغة المتجر" },
  botUsername: { en: "Bot username", ar: "يوزر البوت" },
  tokenNote: { en: "The token is never typed here: it goes straight into Cloudflare as TELEGRAM_BOT_TOKEN.", ar: "التوكن ما بينكتب هون أبداً: بيروح مباشرة على Cloudflare باسم TELEGRAM_BOT_TOKEN." },
  repo: { en: "Client repo (owner/name)", ar: "ريبو العميل (owner/name)" },
  deployKey: { en: "Create deploy key", ar: "إنشاء مفتاح النشر" },
  deployKeyHint: { en: "Paste this public key into the client's repo → Settings → Deploy keys (Allow write access).", ar: "الصق هالمفتاح العام بريبو العميل ← Settings ← Deploy keys (فعّل Allow write access)." },
  supabaseUrl: { en: "Supabase project URL", ar: "رابط مشروع Supabase" },
  ownerEmail: { en: "Owner's email (panel sign-in)", ar: "إيميل المالك (لتسجيل دخول اللوحة)" },
  commands: { en: "Run in the boti folder", ar: "شغّل بمجلد boti" },
  workerName: { en: "Worker name (Cloudflare project)", ar: "اسم الـ Worker (مشروع Cloudflare)" },
  domain: { en: "Domain", ar: "الدومين" },
  register: { en: "Register client", ar: "تسجيل العميل" },
  branch: { en: "Create branch", ar: "إنشاء الفرع" },
  sync: { en: "Run first sync", ar: "أول مزامنة" },
  keys: { en: "Generate keys", ar: "توليد المفاتيح" },
  keysOnce: { en: "Copy them now — they're shown once and never stored.", ar: "انسخهم هلق — بيظهروا مرة وحدة وما بينحفظوا." },
  secrets: { en: "Cloudflare secrets", ar: "مفاتيح Cloudflare السرية" },
  fromClient: { en: "from the client's account", ar: "من حساب العميل" },
  check: { en: "Check site", ar: "فحص الموقع" },
  siteUp: { en: "Online", ar: "شغّال" },
  siteDown: { en: "Not reachable yet", ar: "لسا ما بيرد" },
  panel: { en: "Admin panel", ar: "لوحة التحكم" },
  store: { en: "Store", ar: "المتجر" },
  bot: { en: "Bot", ar: "البوت" },
  print: { en: "Print summary", ar: "طباعة الملخّص" },
  doneTitle: { en: "The store is live", ar: "المتجر صار شغّال" },
  doneText: { en: "Everything below is set up. Keep this summary with the client.", ar: "كل شي تحت صار جاهز. خلّي هالملخّص مع العميل." },
  needsDomain: { en: "Add the domain first", ar: "أضف الدومين أولاً" },
  needsName: { en: "Finish the Welcome step first", ar: "خلّص خطوة الترحيب أولاً" },
  githubMissing: { en: "GitHub isn't connected on boti (GITHUB_TOKEN).", ar: "GitHub مش مربوط على boti ‏(GITHUB_TOKEN)." },
  advanced: { en: "Advanced: one-page wizard", ar: "متقدّم: المعالج بصفحة وحدة" },
  langBoth: { en: "Arabic + English", ar: "عربي + إنجليزي" },
  langBothHint: { en: "Customers choose in the bot", ar: "الزبون بيختار من البوت" },
  langAr: { en: "Arabic", ar: "عربي" },
  langEn: { en: "English", ar: "إنجليزي" },
  continue: { en: "Continue", ar: "متابعة" },
  getStarted: { en: "Get started", ar: "يلا نبدأ" },
  finish: { en: "Finish", ar: "إنهاء" },
  details: { en: "Details", ar: "التفاصيل" },
  detailsHint: { en: "For you — not needed on the client's screen", ar: "إلك أنت — مش لازم يشوفها العميل" },
  detailsNeeded: { en: "Open Details to finish this step", ar: "افتح التفاصيل لتكمّل هالخطوة" },
  exit: { en: "Exit", ar: "خروج" },
  stepsNav: { en: "Steps", ar: "الخطوات" },
  goToStep: { en: "Go to step", ar: "روح للخطوة" },
} as const;
