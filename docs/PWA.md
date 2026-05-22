# 📱 PWA Guide — Progressive Web App

This guide covers everything you need to know about StudyFlow's Progressive Web App features, including installation, offline support, and service workers.

## 🎯 What is a PWA?

A Progressive Web App (PWA) is a web application that can be installed on devices like a native app. PWAs offer:

- **Installable** — Add to home screen on mobile and desktop
- **Offline Support** — Works without internet connection
- **Push Notifications** — Receive alerts even when app is closed
- **Fast Loading** — Cached assets for instant startup
- **Native Feel** — Full-screen experience without browser UI

## 📋 PWA Checklist

- ✅ HTTPS (required for service workers)
- ✅ Web App Manifest (`manifest.json`)
- ✅ Service Worker (`sw.js`)
- ✅ Icons (192x192, 512x512)
- ✅ Offline fallback page
- ✅ Installable prompt

## 🗂️ Web App Manifest

### `public/manifest.json`

```json
{
  "name": "StudyFlow - Smart Student Planner",
  "short_name": "StudyFlow",
  "description": "Manage homework, assignments, and daily tasks with AI-powered scheduling",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-dashboard.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["education", "productivity"],
  "shortcuts": [
    {
      "name": "Add Task",
      "short_name": "Add",
      "description": "Quickly add a new task",
      "url": "/chat",
      "icons": [
        {
          "src": "/icons/add-task.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Today's Tasks",
      "short_name": "Today",
      "description": "View today's tasks",
      "url": "/dashboard?date=today",
      "icons": [
        {
          "src": "/icons/today.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

### Manifest Properties Explained

| Property | Description |
|----------|-------------|
| `name` | Full app name (shown on install prompt) |
| `short_name` | Short name (shown under icon) |
| `start_url` | URL to open when app launches |
| `display` | `standalone` = full-screen without browser UI |
| `background_color` | Splash screen background |
| `theme_color` | Browser toolbar color |
| `icons` | App icons for different sizes |
| `screenshots` | Preview images for app stores |
| `shortcuts` | Quick actions from app icon |

## 🔧 Service Worker

### `public/sw.js`

```javascript
const CACHE_NAME = 'studyflow-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/chat',
  '/notifications',
  '/settings',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response and cache it
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cache, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Task',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const taskId = event.notification.data.taskId;
    const url = taskId ? `/dashboard?task=${taskId}` : '/dashboard';
    
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
```

### Service Worker Lifecycle

```
1. Install → Cache static assets
     ↓
2. Activate → Clean up old caches
     ↓
3. Fetch → Intercept network requests
     ↓
4. Push → Receive push notifications
     ↓
5. Notification Click → Handle user interaction
```

## 🔄 Service Worker Registration

### `app/layout.tsx`

```tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StudyFlow" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 📥 Install Prompt & Settings Integration

### Install App Card (Settings Page)

**Important for PWA adoption!** Add this inside the Settings page.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, Check, Smartphone } from 'lucide-react';
import Image from 'next/image';

export function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => setIsInstalled(true));
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Install Card */}
      <div 
        className="
          relative overflow-hidden
          rounded-[24px] p-6
          border border-white/8
          animate-pulse-border
        "
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)',
        }}
      >
        {/* Animated glow border */}
        <div className="absolute inset-0 rounded-[24px] animate-glow-border" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* App Icon with Glow */}
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-[16px] blur-xl"
                style={{
                  background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                  opacity: 0.6,
                }}
              />
              <Image
                src="/icons/icon-192x192.png"
                alt="StudyFlow"
                width={64}
                height={64}
                className="relative rounded-[16px]"
              />
            </div>

            {/* Text Content */}
            <div>
              <h3 className="text-white font-bold text-lg mb-1">
                Install StudyFlow
              </h3>
              <p className="text-white/60 text-sm">
                Get faster reminders and offline access
              </p>
            </div>
          </div>

          {/* Right Side - Install Button */}
          <div>
            {isInstalled ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-green-500/20 border border-green-500/30">
                <Check size={20} className="text-green-400" />
                <span className="text-green-400 font-semibold text-sm">
                  Installed
                </span>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="
                  flex items-center gap-2
                  px-6 py-3 rounded-[16px]
                  font-semibold text-white
                  transition-all duration-300
                  hover:scale-105 active:scale-95
                "
                style={{
                  background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                }}
              >
                <Download size={20} />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Install Modal */}
      {showModal && (
        <InstallModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
```

### Install Modal (Mobile Bottom Sheet)

```tsx
function InstallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div 
        className="
          relative w-full h-[70%]
          bg-[rgba(17,24,39,0.95)] backdrop-blur-[32px]
          border-t border-white/10
          rounded-t-[32px]
          p-6
          animate-slide-up
        "
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Install StudyFlow
            </h2>
            <p className="text-white/60">
              Get the best experience with our app
            </p>
          </div>

          {/* Screenshots */}
          <div className="flex gap-3 overflow-x-auto pb-4">
            <img src="/screenshots/dashboard.png" className="h-64 rounded-[20px]" />
            <img src="/screenshots/chat.png" className="h-64 rounded-[20px]" />
            <img src="/screenshots/calendar.png" className="h-64 rounded-[20px]" />
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <BenefitItem icon="⚡" text="Faster launch" />
            <BenefitItem icon="📴" text="Offline access" />
            <BenefitItem icon="🔔" text="Native notifications" />
            <BenefitItem icon="🚀" text="Better performance" />
            <BenefitItem icon="📱" text="Fullscreen experience" />
          </div>

          {/* Install Instructions */}
          <div className="bg-white/5 rounded-[20px] p-4">
            <p className="text-white/80 text-sm">
              <strong>How to install:</strong><br />
              Tap the share button <Smartphone className="inline" size={16} /> in your browser,
              then select "Add to Home Screen"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
        {icon}
      </div>
      <span className="text-white font-medium">{text}</span>
    </div>
  );
}
```

### Animations

```css
@keyframes pulse-border {
  0%, 100% {
    border-color: rgba(6, 182, 212, 0.3);
  }
  50% {
    border-color: rgba(6, 182, 212, 0.6);
  }
}

@keyframes glow-border {
  0%, 100% {
    box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.2);
  }
  50% {
    box-shadow: inset 0 0 40px rgba(6, 182, 212, 0.4);
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-pulse-border {
  animation: pulse-border 2s ease-in-out infinite;
}

.animate-glow-border {
  animation: glow-border 2s ease-in-out infinite;
}

.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 📴 Offline Page

### `public/offline.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - StudyFlow</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 32px;
      margin: 0 0 10px 0;
    }
    p {
      font-size: 18px;
      opacity: 0.9;
      margin: 0 0 30px 0;
    }
    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="icon">📡</div>
  <h1>You're Offline</h1>
  <p>Check your internet connection and try again</p>
  <button onclick="window.location.reload()">Retry</button>
</body>
</html>
```

## 📱 Platform-Specific Installation

### Android (Chrome)

1. Open StudyFlow in Chrome
2. Tap the three-dot menu (⋮)
3. Select "Add to Home Screen"
4. Tap "Install"
5. App appears on home screen

### iOS (Safari)

1. Open StudyFlow in Safari
2. Tap the Share icon (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App appears on home screen

**Note:** iOS has limited PWA support:
- No push notifications (yet)
- Limited background sync
- Must use Safari (not Chrome)

### Desktop (Chrome/Edge)

1. Open StudyFlow in Chrome or Edge
2. Look for install icon (⊕) in address bar
3. Click "Install StudyFlow"
4. App opens in standalone window
5. Access from Start Menu/Applications

## 🧪 Testing PWA Features

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run PWA audit
lighthouse https://your-app.vercel.app --view --preset=pwa
```

### Chrome DevTools

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - **Manifest** — Verify manifest.json loads
   - **Service Workers** — Check registration status
   - **Cache Storage** — View cached assets
   - **Push Notifications** — Test push

### PWA Builder

Test your PWA at [PWABuilder.com](https://www.pwabuilder.com/):
1. Enter your URL
2. Get PWA score
3. Download app packages for stores

## 📦 Next.js PWA Configuration

### Install `next-pwa`

```bash
npm install next-pwa
```

### `next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
  // Other Next.js config
});
```

## 🔒 HTTPS Requirement

PWAs require HTTPS. For local development:

### Option 1: ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, create HTTPS tunnel
ngrok http 3000
```

### Option 2: mkcert (Local SSL)

```bash
# Install mkcert
brew install mkcert  # macOS
choco install mkcert # Windows

# Create local CA
mkcert -install

# Generate certificate
mkcert localhost

# Update package.json
"dev": "next dev --experimental-https"
```

## 📊 PWA Analytics

Track PWA-specific events:

```typescript
// Track installation
window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  // Send to analytics
  gtag('event', 'pwa_install');
});

// Track standalone mode
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running as PWA');
  gtag('event', 'pwa_launch');
}
```

## 🐛 Common Issues

### Service Worker Not Updating

```javascript
// Force update in sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation
});

self.addEventListener('activate', (event) => {
  self.clients.claim(); // Take control immediately
});
```

### Cache Not Clearing

```javascript
// Clear all caches
caches.keys().then((names) => {
  names.forEach((name) => {
    caches.delete(name);
  });
});
```

### iOS Not Installing

- Must use Safari (not Chrome)
- Check manifest.json is valid
- Ensure HTTPS is enabled
- Icons must be correct sizes

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Workbox (Advanced SW)](https://developers.google.com/web/tools/workbox)

## 🔗 Related Guides

- [Notifications Guide](./NOTIFICATIONS.md) — Push notification setup
- [Deployment Guide](./DEPLOYMENT.md) — Deploy with HTTPS
- [Frontend Guide](./FRONTEND.md) — UI components
