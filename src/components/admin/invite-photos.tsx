"use client";

import { useEffect, useState, type DragEvent } from "react";
import { arabicDigits, PHOTO_AUDIENCES, type InviteConfig, type PhotoAudience } from "@/lib/invite";

/*
 * Admin → Invitation → Photos: the wedding photos shown on the thank-you
 * page. Each photo is resized here in the browser — a full size (2000 px
 * long side) and a thumbnail (640 px) — then sent; R2 keeps the files.
 */

type Photo = { id: string; width: number; height: number; caption: string; audience: PhotoAudience; sort: number };

const AUDIENCE_LABEL: Record<PhotoAudience, string> = {
  all: "الجميع",
  men: "ضيوف حفل الرجال فقط",
  women: "ضيوف حفل النساء فقط",
};

const ERRORS: Record<string, string> = {
  no_bucket: "مخزن الصور غير متاح. أنشئ حاوية R2 باسم ghawi-invite-photos.",
  too_large: "الصورة كبيرة جداً حتى بعد التصغير.",
  decode: "تعذّرت قراءة الصورة (صيغة غير مدعومة في هذا المتصفح، مثل HEIC).",
};

type Resized = { blob: Blob; width: number; height: number };

async function resize(file: File, longSide: number, quality: number): Promise<Resized> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("decode");
  }
  const scale = Math.min(1, longSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("decode");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // WebP where the browser can write it, JPEG otherwise (older Safari).
  let blob = await encode("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob) throw new Error("decode");
  return { blob, width, height };
}

/** "صورة واحدة", "صورتان", "٣ صور", "١٢ صورة". */
function photoCount(n: number): string {
  if (n === 1) return "صورة واحدة";
  if (n === 2) return "صورتان";
  return `${arabicDigits(n)} ${n >= 3 && n <= 10 ? "صور" : "صورة"}`;
}

const thumbUrl = (id: string) => `/api/invite/photo/${id}?s=thumb`;

export function PhotosPanel({ config }: { config: InviteConfig }) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [audience, setAudience] = useState<PhotoAudience>("all");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");
  const [version, setVersion] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/admin/invite/photos", { signal: controller.signal, cache: "no-store" });
        const body = (await response.json()) as { photos?: Photo[]; error?: string };
        if (!response.ok) throw new Error(body.error ?? "load");
        setPhotos(body.photos ?? []);
        setLoadError("");
      } catch (failure) {
        if (!controller.signal.aborted) setLoadError(ERRORS[(failure as Error).message] ?? "تعذّر تحميل الصور.");
      }
    })();
    return () => controller.abort();
  }, [version]);

  async function upload(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!images.length) return;
    setErrors([]);
    setProgress({ done: 0, total: images.length });
    const failed: string[] = [];
    for (const [i, file] of images.entries()) {
      try {
        const full = await resize(file, 2000, 0.85);
        const thumb = await resize(file, 640, 0.78);
        const form = new FormData();
        form.set("full", full.blob, "full");
        form.set("thumb", thumb.blob, "thumb");
        form.set("width", String(full.width));
        form.set("height", String(full.height));
        form.set("audience", audience);
        const response = await fetch("/api/admin/invite/photos", { method: "POST", body: form });
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "failed");
      } catch (failure) {
        failed.push(`${file.name}: ${ERRORS[(failure as Error).message] ?? "تعذّر الرفع"}`);
      }
      setProgress({ done: i + 1, total: images.length });
    }
    setErrors(failed);
    setProgress(null);
    setVersion((v) => v + 1);
  }

  async function patch(body: object) {
    await fetch("/api/admin/invite/photos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  function update(id: string, change: Partial<Photo>) {
    setPhotos((list) => list?.map((p) => (p.id === id ? { ...p, ...change } : p)) ?? null);
  }

  async function move(index: number, step: number) {
    if (!photos) return;
    const next = [...photos];
    const target = index + step;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next);
    await patch({ order: next.map((p) => p.id) });
  }

  async function remove(photo: Photo) {
    if (!window.confirm("حذف هذه الصورة نهائياً؟")) return;
    setPhotos((list) => list?.filter((p) => p.id !== photo.id) ?? null);
    await fetch(`/api/admin/invite/photos?id=${photo.id}`, { method: "DELETE" });
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void upload([...event.dataTransfer.files]);
  }

  const busy = progress !== null;

  return (
    <div className="ivp__photos">
      <div className="card card--pad ivp__upload" data-drag={dragging || undefined} onDragOver={(e) => (e.preventDefault(), setDragging(true))} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <div>
          <strong>صور الزفاف</strong>
          <p className="muted small">
            تظهر في صفحة «{config.endedTitle}» بعد انتهاء الحفل{config.galleryEnabled ? "" : " — المعرض مُطفأ الآن من الإعدادات"}. اختر لمن تظهر الصور قبل
            رفعها؛ صور حفل النساء مثلاً لا تراها إلا روابط المدعوّات إليه.
          </p>
        </div>
        <div className="ivp__upload-row">
          <label className="field">
            <span className="field__label">تظهر لـ</span>
            <select className="select" value={audience} onChange={(e) => setAudience(e.target.value as PhotoAudience)} disabled={busy}>
              {PHOTO_AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {AUDIENCE_LABEL[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="btn btn--sm press ivp__pick">
            {busy ? `جارٍ الرفع ${arabicDigits(progress.done)} من ${arabicDigits(progress.total)}…` : "+ اختيار صور"}
            <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => (void upload([...(e.target.files ?? [])]), (e.target.value = ""))} />
          </label>
        </div>
        <span className="hint">أو اسحب الصور وأفلتها هنا. تُصغَّر تلقائياً قبل الرفع.</span>
        {errors.length ? (
          <ul className="error-text ivp__errors">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {loadError ? (
        <p className="login__alert" role="alert">
          {loadError}
        </p>
      ) : photos === null ? (
        <div className="empty">
          <span className="spinner" aria-hidden="true" />
          جارٍ التحميل…
        </div>
      ) : photos.length === 0 ? (
        <div className="empty">لا صور بعد.</div>
      ) : (
        <>
          <p className="muted small">
            {photoCount(photos.length)} · <a href="/invite/general?preview=1&ended=1" target="_blank" rel="noopener noreferrer">معاينة المعرض</a> (الرابط العام يعرض صور «الجميع» فقط)
          </p>
          <ul className="ivp__photo-grid">
            {photos.map((photo, i) => (
              <li key={photo.id} className="ivp__photo">
                {/* eslint-disable-next-line @next/next/no-img-element -- R2 thumbnail */}
                <img src={thumbUrl(photo.id)} alt="" loading="lazy" style={{ aspectRatio: `${photo.width} / ${photo.height}` }} />
                <input
                  className="input"
                  value={photo.caption}
                  placeholder="تعليق (اختياري)"
                  maxLength={200}
                  onChange={(e) => update(photo.id, { caption: e.target.value })}
                  onBlur={(e) => patch({ id: photo.id, caption: e.target.value })}
                />
                <select
                  className="select"
                  value={photo.audience}
                  onChange={(e) => {
                    const value = e.target.value as PhotoAudience;
                    update(photo.id, { audience: value });
                    void patch({ id: photo.id, audience: value });
                  }}
                  aria-label="تظهر لـ"
                >
                  {PHOTO_AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {AUDIENCE_LABEL[a]}
                    </option>
                  ))}
                </select>
                <div className="ivp__photo-actions">
                  <button type="button" className="btn btn--xs btn--soft press" onClick={() => move(i, -1)} disabled={i === 0} aria-label="تقديم">
                    →
                  </button>
                  <button type="button" className="btn btn--xs btn--soft press" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="تأخير">
                    ←
                  </button>
                  <button type="button" className="btn btn--xs btn--danger-soft press" onClick={() => remove(photo)}>
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
