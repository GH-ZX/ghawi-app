/**
 * A short burst of paper confetti and gold flecks, for a "yes" reply.
 * One throwaway canvas, removed when the last piece has fallen; nothing
 * at all under reduced motion.
 */
export function burst() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const style = getComputedStyle(document.querySelector(".iv") ?? document.documentElement);
  const colors = ["--gold", "--gold-2", "--accent", "--paper"].map((name) => style.getPropertyValue(name).trim() || "#c9a86a");

  const canvas = document.createElement("canvas");
  canvas.className = "confetti";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.remove();
  ctx.scale(dpr, dpr);

  const w = window.innerWidth;
  const h = window.innerHeight;
  const pieces = Array.from({ length: 140 }, (_, i) => {
    const fromLeft = i % 2 === 0;
    const angle = (fromLeft ? -60 : -120) + (Math.random() - 0.5) * 50;
    const speed = 9 + Math.random() * 9;
    return {
      x: fromLeft ? -10 : w + 10,
      y: h * (0.55 + Math.random() * 0.2),
      vx: Math.cos((angle * Math.PI) / 180) * speed,
      vy: Math.sin((angle * Math.PI) / 180) * speed,
      size: 5 + Math.random() * 6,
      spin: Math.random() * Math.PI,
      vs: (Math.random() - 0.5) * 0.3,
      color: colors[i % colors.length],
      round: i % 5 === 0,
    };
  });

  const began = performance.now();
  const frame = (now: number) => {
    const t = now - began;
    ctx.clearRect(0, 0, w, h);
    for (const p of pieces) {
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.32;
      p.x += p.vx;
      p.y += p.vy;
      p.spin += p.vs;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.globalAlpha = Math.max(0, 1 - t / 4200);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * Math.abs(Math.cos(p.spin * 2)) + 1);
      }
      ctx.restore();
    }
    if (t < 4200) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
