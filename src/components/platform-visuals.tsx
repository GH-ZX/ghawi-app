/* Wireframe mockups — drawn, not screenshotted. */

function Chrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-bg-2/60 px-3 py-2.5">
      <span className="flex gap-1.5" aria-hidden="true">
        <span className="size-2 rounded-full bg-line-3" />
        <span className="size-2 rounded-full bg-line-3" />
        <span className="size-2 rounded-full bg-line-3" />
      </span>
      <span className="mono truncate rounded-sm bg-bg/70 px-2.5 py-1 text-[10px] tracking-[0.06em] text-fg-3">
        {url}
      </span>
    </div>
  );
}

/** GH Store — catalog wireframe with one highlighted offer. */
export function StoreVisual({ url }: { url: string }) {
  const categories = ["الألعاب", "الذكاء الاصطناعي", "قسائم", "بث", "VPN", "تصميم"];

  const tiles = [
    { label: "Steam", price: "$0.61", accent: false },
    { label: "Spotify", price: "$1.90", accent: true },
    { label: "Proton VPN", price: "$2.30", accent: false },
    { label: "Notion", price: "$1.73", accent: false },
    { label: "PSN Turkey", price: "$24.21", accent: false },
    { label: "Delta Force", price: "$0.26", accent: false },
  ];

  return (
    <div className="border border-line bg-bg-1">
      <Chrome url={url} />

      <div className="p-4">
        {/* Category rail */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {categories.map((category, index) => (
            <span
              key={category}
              className={`rounded-sm border px-2 py-1 text-[10px] ${
                index === 0
                  ? "border-acc-line bg-acc-soft text-acc"
                  : "border-line text-fg-3"
              }`}
            >
              {category}
            </span>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className={`group border p-2 transition-colors duration-300 ${
                tile.accent ? "border-acc-line bg-acc-soft/40" : "border-line bg-bg-2/40"
              }`}
            >
              {/* Image block */}
              <div
                className="mb-2 aspect-4/3 w-full"
                style={
                  tile.accent
                    ? // Token-driven so each theme tints its own accent rather
                      // than inheriting one theme's lime in all three.
                      {
                        backgroundImage:
                          "linear-gradient(135deg, color-mix(in oklab, var(--acc) 22%, transparent), color-mix(in oklab, var(--acc) 4%, transparent))",
                      }
                    : {
                        backgroundImage:
                          "linear-gradient(135deg, color-mix(in oklab, var(--fg) 5%, transparent), color-mix(in oklab, var(--fg) 1%, transparent))",
                      }
                }
              />
              <p
                className={`mono truncate text-[10px] ${
                  tile.accent ? "text-acc" : "text-fg-2"
                }`}
              >
                {tile.label}
              </p>
              <p
                className={`mono mt-1 text-[10px] ${
                  tile.accent ? "text-fg" : "text-fg-3"
                }`}
              >
                {tile.price}
              </p>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="mono mt-4 flex items-center justify-between border-t border-line pt-3 text-[10px] text-fg-3">
          <span className="flex items-center gap-1.5">
            <span className="pulse-dot scale-75" aria-hidden="true" />
            auto-fulfillment online
          </span>
          <span>AR · EN</span>
        </div>
      </div>
    </div>
  );
}

/** Bot Factory — tenant isolation diagram. */
export function FactoryVisual() {
  const tenants = ["tenant_a", "tenant_b", "tenant_c"];
  const services = ["PAYMENTS", "PROVIDERS", "FULFILLMENT"];

  return (
    <div className="border border-line bg-bg-1 p-4">
      {/* Tenants */}
      <div className="grid grid-cols-3 gap-2">
        {tenants.map((tenant) => (
          <div
            key={tenant}
            className="mono truncate border border-line bg-bg-2/60 px-2 py-2 text-center text-[10px] text-fg-2"
          >
            {tenant}
          </div>
        ))}
      </div>

      {/* Connector */}
      <Connector />

      {/* Core */}
      <div className="border border-acc-line bg-acc-soft/30 px-3 py-3 text-center">
        <p className="mono text-[11px] tracking-[0.14em] text-acc uppercase">Commerce Core</p>
        <p className="mono mt-1 text-[10px] text-fg-3">FastAPI · server-authoritative</p>
      </div>

      {/* Services */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {services.map((service) => (
          <div
            key={service}
            className="mono truncate border border-line bg-bg-2/60 px-2 py-2 text-center text-[10px] text-fg-2"
          >
            {service}
          </div>
        ))}
      </div>

      <Connector />

      {/* Data */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-line bg-bg-2/60 px-3 py-2.5 text-center">
          <p className="mono text-[10px] text-fg-2">LEDGER</p>
          <p className="mono text-[9.5px] text-fg-3">idempotent</p>
        </div>
        <div className="border border-line bg-bg-2/60 px-3 py-2.5 text-center">
          <p className="mono text-[10px] text-fg-2">VAULT</p>
          <p className="mono text-[9.5px] text-fg-3">encrypted</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mono mt-4 flex items-center justify-between border-t border-line pt-3 text-[10px] text-fg-3">
        <span>PostgreSQL · Redis</span>
        <span className="flex items-center gap-1.5">
          <span className="pulse-dot scale-75" aria-hidden="true" />
          isolated
        </span>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="relative mx-auto h-6 w-px bg-line-2" aria-hidden="true">
      <span className="absolute -top-px start-1/2 size-1 -translate-x-1/2 rotate-45 bg-acc/70" />
    </div>
  );
}