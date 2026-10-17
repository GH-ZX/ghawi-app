import type { CSSProperties } from "react";
import {
  CardIcon,
  GamepadIcon,
  PlayIcon,
  SparkIcon,
  TabOrdersIcon,
  TabProfileIcon,
  TabStoreIcon,
  TabWalletIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import type { Dictionary } from "@/lib/content";

/*
 * GH Store's Mini App home screen, drawn with the store's own building blocks
 * (showcase slide, category bar, product cards, pill tab bar) and the same
 * theme variables — so it re-skins with the page when a preset is picked.
 * Product names and "from" prices are taken from the live catalogue, picked
 * so the picture template gives each card its own hue.
 */

const PRODUCTS = [
  { name: "PUBG Mobile", cents: 100 },
  { name: "Delta Force", cents: 28 },
  { name: "Canva Pro", cents: 69 },
  { name: "Gemini Pro", cents: 115 },
];

/** GH Store's picture template: hues and hashing as in its ui/kit.tsx. */
const ART_HUES = [285, 320, 355, 25, 60, 155, 195, 250];

function hueOf(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 0x01000193);
  return ART_HUES[(h >>> 0) % ART_HUES.length];
}

function monogramOf(name: string): string {
  const word = name.split(/\s+/)[0] ?? "•";
  return word.slice(0, word.length <= 3 && word === word.toUpperCase() ? 3 : 2).toUpperCase();
}

function Art({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`tile tile--art ${className ?? ""}`} style={{ "--h": hueOf(name) } as CSSProperties}>
      <span className="tile__mono">{monogramOf(name)}</span>
    </span>
  );
}

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const CATEGORY_ICONS = [GamepadIcon, SparkIcon, CardIcon, PlayIcon];
const TAB_ICONS = [TabStoreIcon, TabOrdersIcon, TabWalletIcon, TabProfileIcon];

export function StoreDemo({ demo }: { demo: Dictionary["store"]["demo"] }) {
  return (
    <div className="phone" role="img" aria-label={demo.label}>
      <div className="phone__screen" aria-hidden="true">
        <div className="tg-bar">
          <span className="tg-bar__close">{demo.close}</span>
          <span className="tg-bar__title">
            <strong>GH Store</strong>
            <span>{demo.miniApp}</span>
          </span>
          <span className="tg-bar__more">···</span>
        </div>

        <div className="m-body">
          <div className="m-top" dir="ltr">
            <Logo height={18} />
            <span className="m-wallet">
              <TabWalletIcon size={14} />
              <span className="num">$12.40</span>
            </span>
          </div>

          <div className="m-slide">
            <Art name="PUBG Mobile" className="m-slide__art" />
            <span className="m-slide__badge">⚡ {demo.badge}</span>
            <strong>{demo.slideTitle}</strong>
            <span>{demo.slideSub}</span>
            <span className="m-slide__cta">{demo.slideCta}</span>
          </div>

          <div className="m-cats">
            {demo.categories.map((label, index) => {
              const Icon = CATEGORY_ICONS[index];
              return (
                <span key={label} className="m-cat">
                  <span className="m-cat__icon">
                    <Icon size={20} />
                  </span>
                  {label}
                </span>
              );
            })}
          </div>

          <div className="m-shelf__head">
            <strong>{demo.picks}</strong>
            <span>{demo.all}</span>
          </div>
          <div className="m-grid">
            {PRODUCTS.map((product) => (
              <span key={product.name} className="m-product">
                <Art name={product.name} />
                <span className="m-product__body">
                  <span className="m-product__name">{product.name}</span>
                  <span className="m-product__price num">{usd(product.cents)}</span>
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="m-tabbar">
          {demo.tabs.map((label, index) => {
            const Icon = TAB_ICONS[index];
            return (
              <span key={label} className={index === 0 ? "m-tab m-tab--on" : "m-tab"}>
                {index === 0 ? <TabStoreIcon size={18} active /> : <Icon size={18} />}
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
