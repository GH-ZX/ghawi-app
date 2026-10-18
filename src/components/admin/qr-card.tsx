"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { describeDate, THEME_SWATCHES, type InviteConfig, type InviteTheme } from "@/lib/invite";
import { monogramSvg } from "@/lib/invite-mark";

/*
 * A printable QR card for one invitation link (or the general one): the
 * guest's name, the code in the theme's colours with the أ إ monogram at
 * its heart, the date and the link. Drawn on a canvas at 1080 × 1380, so
 * the PNG is sharp on paper and on a phone.
 */

const W = 1080;
const H = 1380;

type CardProps = {
  link: string;
  /** "الآنسة هيفاء"; empty for the general link. */
  to: string;
  theme: InviteTheme;
  config: InviteConfig;
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

/** Shrinks the font until the text fits `max` pixels wide. */
function fitText(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, size: number, max: number) {
  let s = size;
  ctx.font = font(s);
  while (ctx.measureText(text).width > max && s > 20) {
    s -= 2;
    ctx.font = font(s);
  }
}

async function drawCard(canvas: HTMLCanvasElement, { link, to, theme, config }: CardProps) {
  const [paper, ink, gold] = THEME_SWATCHES[theme];
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W;
  canvas.height = H;

  const display = (size: number) => `700 ${size}px "Aref Ruqaa", "Amiri", serif`;
  const text = (size: number, weight = 400) => `${weight} ${size}px "Amiri", serif`;
  await Promise.all([document.fonts.load(display(80), "أحمد"), document.fonts.load(text(40), "دعوة"), document.fonts.load(text(40, 700), "دعوة")]);

  // Paper and a fine double gold frame.
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.globalAlpha = 1;
  for (const [x, y] of [
    [40, 40],
    [W - 40, 40],
    [40, H - 40],
    [W - 40, H - 40],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = gold;
    ctx.fillRect(-9, -9, 18, 18);
    ctx.restore();
  }

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Who it is for.
  const general = !to;
  ctx.fillStyle = gold;
  ctx.font = text(44);
  ctx.fillText(general ? `${config.generalTitle} ${config.generalLine}` : "دعوة خاصة", W / 2, 170);
  ctx.fillStyle = ink;
  const name = general ? `${config.groomShort} ♥ ${config.brideDisplay}` : to;
  fitText(ctx, name, display, 96, W - 220);
  ctx.fillText(name, W / 2, 292);

  // The code, on white, with the monogram in a clear circle at its centre.
  const box = 700;
  const bx = (W - box) / 2;
  const by = 360;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, bx, by, box, box, 40);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  roundRect(ctx, bx, by, box, box, 40);
  ctx.stroke();

  const qr = QRCode.create(link, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  // A four-module quiet zone of white all round, as the standard asks.
  const m = box / (n + 8);
  const ox = bx + 4 * m;
  const oy = by + 4 * m;
  const isFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const centre = n / 2;
  const clear = n * 0.14; // radius, in modules, kept free for the monogram

  ctx.fillStyle = ink;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c) || isFinder(r, c)) continue;
      if (Math.hypot(r + 0.5 - centre, c + 0.5 - centre) < clear) continue;
      // Full, touching squares (a hair oversized so no seams show): gaps
      // between modules read as a grid of white lines and hurt scanning.
      ctx.fillRect(ox + c * m, oy + r * m, m + 0.6, m + 0.6);
    }
  }
  // Finder patterns as soft rounded squares — all dark: scanners find the code
  // by these three, and a mid-tone (gold) centre turns light when binarised.
  for (const [r, c] of [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]) {
    const x = ox + c * m;
    const y = oy + r * m;
    // Only a whisper of rounding: tested with OpenCV, rounder corners make
    // strict decoders miss the code at some sizes.
    ctx.fillStyle = ink;
    roundRect(ctx, x, y, 7 * m, 7 * m, 0.5 * m);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, x + m, y + m, 5 * m, 5 * m, 0.3 * m);
    ctx.fill();
    ctx.fillStyle = ink;
    roundRect(ctx, x + 2 * m, y + 2 * m, 3 * m, 3 * m, 0.3 * m);
    ctx.fill();
  }

  const cx = ox + centre * m;
  const cy = oy + centre * m;
  // The letters alone, no ring: ring lines near the modules read as code.
  const logo = clear * m * 1.7;
  const svg = monogramSvg({ ink, gold, size: 240, ring: false });
  const mark = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, logo / 2 + m * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(mark, cx - logo / 2, cy - logo / 2, logo, logo);

  // How to use it, when, and where.
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.7;
  ctx.font = text(36);
  ctx.fillText("امسحوا الرمز بكاميرا الهاتف لفتح الدعوة", W / 2, 1140);
  ctx.globalAlpha = 1;
  const date = describeDate(config.startsAt);
  if (date) {
    ctx.fillStyle = ink;
    ctx.font = text(38, 700);
    ctx.fillText(`${date.weekday} ${date.day} ${date.month} ${date.year} · الساعة ${date.time}`, W / 2, 1210);
  }
  ctx.direction = "ltr";
  ctx.fillStyle = gold;
  ctx.font = `500 30px "Amiri", serif`;
  ctx.fillText(link.replace(/^https?:\/\//, ""), W / 2, 1282);
}

export function QrDialog({ link, to, theme, config, message, onClose }: CardProps & { message: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [canShare, setCanShare] = useState(false);
  const fileName = `qr-${link.split("/").pop() || "general"}.png`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    drawCard(canvas, { link, to, theme, config })
      .then(() => {
        if (cancelled) return;
        setReady(true);
        const probe = new File([new Blob()], fileName, { type: "image/png" });
        setCanShare(Boolean(navigator.canShare?.({ files: [probe] })));
      })
      .catch(() => !cancelled && setError("تعذّر رسم البطاقة."));
    return () => {
      cancelled = true;
    };
  }, [link, to, theme, config, fileName]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toBlob = () => new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob(resolve, "image/png"));

  async function download() {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function share() {
    const blob = await toBlob();
    if (!blob) return;
    try {
      await navigator.share({ files: [new File([blob], fileName, { type: "image/png" })], text: message });
    } catch {
      /* the person closed the share sheet */
    }
  }

  return (
    <div className="ivp__qr" role="dialog" aria-modal="true" aria-label="رمز QR للدعوة" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card card--pad ivp__qr-card" dir="rtl">
        <div className="ivp__qr-head">
          <strong>رمز QR {to ? `· ${to}` : "· الرابط العام"}</strong>
          <button type="button" className="btn btn--xs btn--ghost press" onClick={onClose}>
            إغلاق
          </button>
        </div>
        <canvas ref={canvasRef} className="ivp__qr-canvas" data-ready={ready || undefined} />
        {error ? <p className="error-text">{error}</p> : null}
        <div className="message__actions">
          <button type="button" className="btn btn--sm press" onClick={download} disabled={!ready}>
            تنزيل PNG
          </button>
          {canShare ? (
            <button type="button" className="btn btn--sm btn--soft press" onClick={share} disabled={!ready}>
              مشاركة
            </button>
          ) : null}
        </div>
        <span className="hint">البطاقة بدقة 1080×1380، مناسبة للطباعة وللإرسال. الرمز يفتح {link.replace(/^https?:\/\//, "")}</span>
      </div>
    </div>
  );
}
