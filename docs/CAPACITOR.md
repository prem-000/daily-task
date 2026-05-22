# 📲 Capacitor — PWA to Android APK Guide

> Convert your **StudyFlow PWA** (Next.js) into a native Android APK using Capacitor, with full mobile responsive support.

---

## 🗂️ Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [PWA Setup Checklist](#pwa-setup-checklist)
- [Mobile Responsive Requirements](#mobile-responsive-requirements)
- [Installing Capacitor](#installing-capacitor)
- [Android Setup](#android-setup)
- [Build & Sync](#build--sync)
- [Generate APK](#generate-apk)
- [Capacitor Config Reference](#capacitor-config-reference)
- [Features Supported](#features-supported)
- [Common Issues & Fixes](#common-issues--fixes)
- [Recommended Workflow](#recommended-workflow)

---

## 🔍 Overview

Capacitor wraps your deployed Next.js PWA inside a native Android shell, giving you:

- A real `.apk` / `.aab` for Play Store distribution
- Access to native device features (camera, notifications, storage)
- Offline support via service workers
- A single codebase for web + mobile

```
Next.js App
    ↓
PWA Configuration (manifest.json + sw.js)
    ↓
Deploy on Vercel (HTTPS required)
    ↓
Capacitor Wrapper
    ↓
Android Studio
    ↓
APK / Play Store
```

---

## ✅ Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Android Studio | Latest | APK generation |
| Java JDK | 17+ | Android build |
| Next.js | 13+ | Frontend framework |
| Vercel deployment | Live HTTPS URL | Required by Capacitor |

---

## 📋 PWA Setup Checklist

Before using Capacitor, confirm your PWA is correctly configured:

**`public/manifest.json`** — minimum required fields:

```json
{
  "name": "StudyFlow - Smart Student Planner",
  "short_name": "StudyFlow",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**`public/sw.js`** — service worker must handle install, activate, and fetch events.

**`app/layout.tsx`** — register the service worker and link the manifest:

```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#3B82F6" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

---

## 📱 Mobile Responsive Requirements

> ⚠️ **A wrapped website is NOT automatically a good mobile app.** Mobile UX quality determines whether users keep or uninstall the app.

### Layout Rules

```css
/* Use mobile-first breakpoints */
.container {
  width: 100%;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .container { max-width: 768px; margin: 0 auto; }
}
```

### Bottom Navigation

Always use bottom navigation on mobile — not top nav:

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-white/10">
  <div className="flex items-center justify-around py-3 pb-safe">
    <NavItem icon={<Home />} label="Home" href="/dashboard" />
    <NavItem icon={<MessageCircle />} label="Chat" href="/chat" />
    <NavItem icon={<Bell />} label="Alerts" href="/notifications" />
    <NavItem icon={<Settings />} label="Settings" href="/settings" />
  </div>
</nav>
```

### Touch-Friendly Buttons

Minimum touch target size is **44×44px**:

```tsx
<button className="min-h-[44px] min-w-[44px] px-6 py-3 rounded-2xl active:scale-95 transition-transform">
  Tap Me
</button>
```

### Safe Area Support (Notch / Home Indicator)

Add to your global CSS:

```css
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
```

And in `public/manifest.json`:

```json
"display": "standalone"
```

### Typography Scaling

```css
html { font-size: 16px; }

h1 { font-size: clamp(1.5rem, 5vw, 2.5rem); }
h2 { font-size: clamp(1.25rem, 4vw, 2rem); }
p  { font-size: clamp(0.875rem, 3vw, 1rem); line-height: 1.6; }
```

### Mobile Checklist

- ✅ Responsive layout (no horizontal scroll)
- ✅ Bottom navigation bar
- ✅ Touch-friendly buttons (≥ 44px tap targets)
- ✅ Fast loading / skeleton screens
- ✅ Smooth animations (use `transform`, avoid `top`/`left`)
- ✅ Proper spacing (16px minimum side padding)
- ✅ Mobile typography scaling
- ✅ Offline support via service worker
- ✅ Splash screen configured in manifest
- ✅ Safe area insets for notch support

---

## 📦 Installing Capacitor

```bash
# 1. Install Capacitor core and CLI
npm install @capacitor/core @capacitor/cli

# 2. Initialize Capacitor in your project
npx cap init
```

When prompted:

| Field | Value |
|-------|-------|
| App Name | StudyFlow |
| Package ID | com.studyflow.app |
| Web Dir | out |

---

## 🤖 Android Setup

```bash
# Install Android platform
npm install @capacitor/android

# Add Android project
npx cap add android
```

This creates an `android/` folder in your project root.

---

## 🏗️ Build & Sync

```bash
# 1. Build your Next.js app (static export)
npm run build

# 2. Sync web assets into the Android project
npx cap sync

# 3. Open in Android Studio
npx cap open android
```

> **Important:** Your `next.config.js` must include `output: 'export'` for static generation.

```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
  output: 'export',   // ← required for Capacitor
});
```

---

## 📦 Generate APK

Inside **Android Studio**:

```
Build → Generate Signed Bundle / APK → APK
```

For development testing (unsigned):

```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

The APK will appear at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚙️ Capacitor Config Reference

**`capacitor.config.ts`**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyflow.app',
  appName: 'StudyFlow',
  webDir: 'out',                         // Next.js static export directory
  bundledWebRuntime: false,
  server: {
    // Uncomment for live reload during development:
    // url: 'https://studyflow.vercel.app',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,  // Set true for debugging only
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

---

## ✨ Features Supported in APK

| Feature | Supported | Notes |
|---------|-----------|-------|
| Offline Mode | ✅ | Via service worker cache |
| Splash Screen | ✅ | Configured in capacitor.config.ts |
| Push Notifications | ✅ | Requires `@capacitor/push-notifications` |
| File Uploads | ✅ | |
| Local Storage | ✅ | |
| Camera Access | ✅ | Requires `@capacitor/camera` plugin |
| App Install (Play Store) | ✅ | Sign APK before submission |
| Background Sync | ⚠️ | Limited — use native plugins |
| Bottom Navigation | ✅ | Implement in your React UI |
| Safe Area / Notch | ✅ | Use `env(safe-area-inset-*)` |

---

## 🐛 Common Issues & Fixes

### 1. Blank Screen on Launch

**Cause:** `webDir` points to wrong folder.

**Fix** in `capacitor.config.ts`:

```typescript
webDir: 'out'   // Must match Next.js output directory
```

And in `next.config.js`:

```js
output: 'export'
```

### 2. PWA Not Installable

**Cause:** Missing one or more of: `manifest.json`, HTTPS, service worker, or correct icon sizes.

**Fix checklist:**
- Confirm `manifest.json` is at `/public/manifest.json`
- Confirm both `icon-192x192.png` and `icon-512x512.png` exist
- Confirm deployment is on HTTPS (Vercel handles this automatically)
- Confirm service worker is registered in `layout.tsx`

### 3. Vercel Build Fails

**Cause:** Missing environment variables or Prisma generation step.

**Fix** in `package.json`:

```json
"scripts": {
  "build": "prisma generate && next build"
}
```

Add all required environment variables in **Vercel → Settings → Environment Variables**:

```
DATABASE_URL=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### 4. Service Worker Not Updating

Add `skipWaiting` and `clients.claim()` to your `sw.js`:

```javascript
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
```

### 5. iOS PWA Limitations

iOS (Safari) has restricted PWA support:
- No push notifications (add via native wrapper)
- Must open in Safari, not Chrome
- Limited background sync

---

## 🚀 Recommended Workflow

```
1. Build responsive web app         → Tailwind CSS, mobile-first layout
2. Add PWA support                  → manifest.json + sw.js + next-pwa
3. Deploy on Vercel                 → HTTPS automatically provided
4. Optimize mobile UX               → bottom nav, touch targets, safe areas
5. Add offline support              → service worker caching strategy
6. Install Capacitor                → npx cap init
7. Add Android platform             → npx cap add android
8. Build + sync                     → npm run build && npx cap sync
9. Generate APK in Android Studio   → Build → Generate Signed APK
10. Publish to Play Store           → Sign APK, create store listing
```

---

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [PWA on web.dev](https://web.dev/progressive-web-apps/)
- [Android Studio Download](https://developer.android.com/studio)
- [PWABuilder](https://www.pwabuilder.com/) — Test your PWA score before wrapping

---

> 💡 **Remember:** The quality of your mobile UX — speed, simplicity, touch interactions, offline reliability, and smooth navigation — is what determines whether users keep the app installed.
