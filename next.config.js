/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  turbopack: {},
};

// Apply next-pwa for web PWA support
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
