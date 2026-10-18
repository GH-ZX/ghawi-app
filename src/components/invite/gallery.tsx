"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { arabicDigits, type InvitePhoto } from "@/lib/invite";

type Props = {
  title: string;
  photos: InvitePhoto[];
  /** The link's slug, so photos meant for one party reach only its guests. */
  slug: string;
};

const src = (photo: InvitePhoto, size: "thumb" | "full", slug: string) =>
  `/api/invite/photo/${photo.id}?s=${size}&slug=${encodeURIComponent(slug)}`;

/**
 * The wedding photos on the thank-you page: two columns of thumbnails that
 * fade up as they scroll in, and a full-screen viewer — swipe, arrows,
 * Escape — with the thumbnail standing in until the full photo arrives.
 */
export function Gallery({ title, photos, slug }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (photos.length === 0) return null;

  return (
    <section ref={rootRef} className="gallery" aria-label={title}>
      <p className="iv-kicker" data-reveal>
        {title}
      </p>
      <div className="gallery__grid">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            className="gallery__item"
            data-reveal
            style={{ "--i": i % 4, aspectRatio: `${photo.width} / ${photo.height}` } as CSSProperties}
            onClick={() => setOpen(i)}
            aria-label={photo.caption || `صورة ${arabicDigits(i + 1)}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- R2 photos, already resized */}
            <img src={src(photo, "thumb", slug)} alt={photo.caption} loading="lazy" decoding="async" width={photo.width} height={photo.height} />
          </button>
        ))}
      </div>
      {open !== null ? <Viewer photos={photos} slug={slug} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

function Viewer({
  photos,
  slug,
  index,
  onIndex,
  onClose,
}: {
  photos: InvitePhoto[];
  slug: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const photo = photos[index];
  const count = photos.length;
  const go = useCallback((step: number) => onIndex((index + step + count) % count), [index, count, onIndex]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("iv-locked");
    // Right to left: the left arrow moves forward.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.classList.remove("iv-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  // Warm the neighbours so the next swipe is instant.
  useEffect(() => {
    for (const step of [1, -1]) {
      const next = photos[(index + step + count) % count];
      const img = new Image();
      img.src = src(next, "full", slug);
    }
  }, [index, count, photos, slug]);

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || "صورة"}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
      }}
    >
      <figure key={photo.id} className="viewer__figure">
        <span className="viewer__frame" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the thumbnail stands in until the full photo loads */}
          <img className="viewer__thumb" src={src(photo, "thumb", slug)} alt="" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element -- R2 photos, already resized */}
          <img className="viewer__full" src={src(photo, "full", slug)} alt={photo.caption} />
        </span>
        {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
      </figure>

      <div className="viewer__bar">
        <button type="button" onClick={() => go(-1)} aria-label="السابقة">
          ›
        </button>
        <span className="viewer__count">
          {arabicDigits(index + 1)} من {arabicDigits(count)}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="التالية">
          ‹
        </button>
      </div>
      <div className="viewer__top">
        <a href={src(photo, "full", slug)} download={`wedding-${index + 1}`} aria-label="تنزيل الصورة">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <button type="button" onClick={onClose} aria-label="إغلاق">
          ✕
        </button>
      </div>
    </div>
  );
}
