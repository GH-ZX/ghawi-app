/**
 * Generates the Film design's backdrop: out-of-focus light motes drifting
 * across a near-black field.
 *
 * Deliberately abstract. A portrait used to drive this loop and it read as a
 * smudged photograph rather than atmosphere; light on an empty stage is the
 * thing that actually suits the page.
 *
 * Every moving term is periodic over exactly LOOP seconds, so the last frame
 * is identical to the first and the clip loops with no cut. Motes are rendered
 * into their own bounding box rather than composited per-pixel, which keeps
 * ~340M operations for the whole sequence down to a few seconds.
 *
 * Output is raw PPM on stdout, piped straight into ffmpeg.
 */

import { once } from "node:events";

const WIDTH = 960;
const HEIGHT = 540;
const FPS = 24;
const LOOP = 12; // seconds

const TAU = Math.PI * 2;

/* Deterministic PRNG so every build produces the same backdrop. */
let seed = 0x9e3779b9;
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) % 100000) / 100000;
}

const range = (lo, hi) => lo + rand() * (hi - lo);

/**
 * Mote palettes. Kept dim and desaturated: this sits behind text at low
 * opacity, and a saturated blob behind body copy would fight the type.
 */
const PALETTES = [
  [255, 246, 233], // tungsten white
  [214, 228, 255], // cool daylight
  [255, 228, 196], // faint amber
  [186, 206, 255], // pale blue
];

const motes = [];

// A few large, very dim hazes first, to give the field depth.
for (let i = 0; i < 6; i++) {
  const [r, g, b] = PALETTES[Math.floor(rand() * PALETTES.length)];
  motes.push({
    x: range(-0.1, 1.1),
    y: range(-0.1, 1.1),
    radius: range(150, 320),
    intensity: range(0.05, 0.11),
    colour: [r, g, b],
    ax: range(0.04, 0.1),
    ay: range(0.03, 0.08),
    px: range(0, TAU),
    py: range(0, TAU),
    pulse: range(0, TAU),
    haze: true,
  });
}

for (let i = 0; i < 78; i++) {
  // Power curve: mostly small motes, a few large ones to anchor the eye.
  const t = Math.pow(rand(), 2.1);
  const [r, g, b] = PALETTES[Math.floor(rand() * PALETTES.length)];
  motes.push({
    x: range(-0.05, 1.05),
    y: range(-0.05, 1.05),
    radius: range(9, 26) + t * 58,
    intensity: range(0.1, 0.34) * (1 - t * 0.45),
    colour: [r, g, b],
    ax: range(0.015, 0.075),
    ay: range(0.012, 0.06),
    px: range(0, TAU),
    py: range(0, TAU),
    pulse: range(0, TAU),
    haze: false,
  });
}

// Near-black stage with a faint cool-to-warm vertical wash.
const BASE = [8, 8, 10];
const TOP_TINT = [26, 34, 52];
const BOTTOM_TINT = [34, 24, 18];

const vertical = new Float32Array(HEIGHT);
for (let y = 0; y < HEIGHT; y++) {
  const k = y / (HEIGHT - 1);
  vertical[y] = k;
}

const frame = new Float32Array(WIDTH * HEIGHT * 3);

function renderFrame(t) {
  frame.fill(0);

  // Ground wash.
  for (let y = 0; y < HEIGHT; y++) {
    const k = vertical[y];
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 3;
      frame[i] = BASE[0] + (TOP_TINT[0] - BASE[0]) * (1 - k) + (BOTTOM_TINT[0] - BASE[0]) * k;
      frame[i + 1] = BASE[1] + (TOP_TINT[1] - BASE[1]) * (1 - k) + (BOTTOM_TINT[1] - BASE[1]) * k;
      frame[i + 2] = BASE[2] + (TOP_TINT[2] - BASE[2]) * (1 - k) + (BOTTOM_TINT[2] - BASE[2]) * k;
    }
  }

  for (const m of motes) {
    // Every term completes an integer number of cycles over LOOP seconds.
    const theta = (t / LOOP) * TAU;
    const cx = (m.x + Math.sin(theta * 1 + m.px) * m.ax) * WIDTH;
    const cy = (m.y + Math.sin(theta * 1 + m.py) * m.ay) * HEIGHT;
    const brightness = m.intensity * (0.72 + 0.28 * Math.sin(theta * 2 + m.pulse));

    const R = m.radius;
    const x0 = Math.max(0, Math.floor(cx - R));
    const x1 = Math.min(WIDTH - 1, Math.ceil(cx + R));
    const y0 = Math.max(0, Math.floor(cy - R));
    const y1 = Math.min(HEIGHT - 1, Math.ceil(cy + R));

    for (let y = y0; y <= y1; y++) {
      const dy = y - cy;
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d >= R) continue;

        const q = d / R;
        // Soft body, with the slightly brighter rim that real defocus produces.
        let a = Math.pow(1 - q, 2.4);
        if (!m.haze) {
          const rim = q > 0.74 ? (q - 0.74) / 0.26 : 0;
          a *= 0.72 + 0.5 * rim * rim;
        }
        a *= brightness;
        if (a <= 0.0015) continue;

        const i = (y * WIDTH + x) * 3;
        frame[i] += m.colour[0] * a;
        frame[i + 1] += m.colour[1] * a;
        frame[i + 2] += m.colour[2] * a;
      }
    }
  }

  return frame;
}

const chunk = Buffer.allocUnsafe(WIDTH * HEIGHT * 3);

async function main() {
  const total = FPS * LOOP;
  for (let f = 0; f < total; f++) {
    const t = f / FPS;
    const px = renderFrame(t);
    for (let i = 0; i < px.length; i++) {
      // Soft shoulder so overlapping motes roll off instead of clipping flat.
      const v = px[i];
      chunk[i] = v > 255 ? 255 : Math.round(Math.pow(v / 255, 0.92) * 255);
    }
    if (!process.stdout.write(Buffer.concat([Buffer.from(`P6\n${WIDTH} ${HEIGHT}\n255\n`), chunk]))) {
      await once(process.stdout, "drain");
    }
  }
}

main();