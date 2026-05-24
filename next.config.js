const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isCapacitorBuild ? 'export' : undefined,
  trailingSlash: isCapacitorBuild,
  images: { unoptimized: true },
  turbopack: {},
};

// Only apply next-pwa for non-Capacitor builds (Vercel / web PWA)
if (!isCapacitorBuild) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    // Use our hand-crafted sw.js as the source — next-pwa will
    // inject its workbox precache manifest into it instead of
    // generating a blank service worker that overwrites our file.
    swSrc: 'public/sw.js',
    swDest: 'public/sw.js',
  });
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
