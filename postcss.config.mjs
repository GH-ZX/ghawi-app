/**
 * Tailwind v4 for the Webpack build path.
 *
 * `next dev` and `next build` run Turbopack, which loads Tailwind through the
 * `@tailwindcss/turbopack` loader configured in next.config.ts. The OpenNext
 * adapter needs a Webpack build, and Webpack picks CSS up through PostCSS
 * instead — so both paths are configured, and each only runs under its own
 * bundler.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;