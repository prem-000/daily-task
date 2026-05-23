const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || 
           process.env.NEXT_EXPORT === 'true',
  register: true,
  skipWaiting: true,
});

// Set CAPACITOR_BUILD=true when running `npm run build:capacitor`
// to generate a static export for the Android APK.
// Regular `npm run build` (for Vercel) omits `output: 'export'` so
// API routes work as serverless functions.
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

module.exports = withPWA({
  output: isCapacitorBuild ? 'export' : undefined,
  trailingSlash: isCapacitorBuild,
  images: { unoptimized: true },
  turbopack: {},
});
