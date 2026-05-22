# 🚀 Deployment Guide

This guide covers deploying StudyFlow to production on Vercel with Supabase.

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema applied
- [ ] Google OAuth configured
- [ ] Gemini API key obtained
- [ ] VAPID keys generated
- [ ] Environment variables ready
- [ ] Production build tested locally

## 🌐 Deployment Platforms

### Recommended: Vercel

**Why Vercel?**
- Optimized for Next.js
- Automatic HTTPS
- Edge functions support
- Built-in cron jobs
- Free tier available

### Alternative: Netlify, Railway, or self-hosted

## 🔧 Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### 4. Configure Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI (2.5 Flash)
GEMINI_API_KEY=your-gemini-api-key

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_MAILTO=mailto:your-email@example.com

# Cron Secret (generate random string)
CRON_SECRET=your-random-secret-string
```

### 5. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:**
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/**
```

### 6. Configure Cron Jobs

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/morning-digest",
      "schedule": "0 7 * * *"
    }
  ]
}
```

**Cron Schedule Syntax:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Examples:**
- `0 7 * * *` — Every day at 7:00 AM
- `*/15 * * * *` — Every 15 minutes
- `0 9,17 * * 1-5` — 9 AM and 5 PM on weekdays

### 7. Deploy with GitHub

**Automatic Deployments:**

1. Push code to GitHub
2. Connect repository in Vercel Dashboard
3. Configure build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Add environment variables
5. Deploy

**Branch Deployments:**
- `main` branch → Production
- Other branches → Preview deployments

## 🗄️ Supabase Production Setup

### 1. Database Optimization

#### Enable Connection Pooling

In Supabase Dashboard → Settings → Database:

```
Connection Pooling Mode: Transaction
```

#### Add Indexes

```sql
-- Improve query performance
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user_read ON notification_log(user_id, read);
```

### 2. Row Level Security (RLS)

Verify all tables have RLS enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Backup Configuration

Enable automatic backups in Supabase Dashboard → Settings → Database → Backups

### 4. Rate Limiting

Configure rate limiting in Supabase Dashboard → Settings → API

## 🔒 Security Hardening

### 1. Environment Variables

**Never commit:**
- API keys
- Database credentials
- VAPID private keys
- Service role keys

**Use:**
- `.env.local` for local development
- Vercel environment variables for production
- Separate keys for staging and production

### 2. CORS Configuration

In `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-app.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 3. Content Security Policy

Add CSP headers:

```javascript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com;
  manifest-src 'self';
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};
```

### 4. Rate Limiting

Implement rate limiting for API routes:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
});
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

Enable in Vercel Dashboard → Analytics

Add to `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### 3. Logging

Use structured logging:

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date() }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error, timestamp: new Date() }));
  },
};
```

## 🧪 Pre-Production Testing

### 1. Build Locally

```bash
npm run build
npm run start
```

### 2. Test Checklist

- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Tasks can be created and updated
- [ ] AI chat parses tasks correctly
- [ ] Push notifications work
- [ ] PWA installs correctly
- [ ] Offline mode works
- [ ] Mobile responsive
- [ ] Lighthouse score > 90

### 3. Lighthouse Audit

```bash
npm install -g lighthouse

lighthouse https://your-app.vercel.app --view
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90
- PWA: ✓ Installable

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🌍 Custom Domain

### 1. Add Domain in Vercel

Vercel Dashboard → Your Project → Settings → Domains

### 2. Configure DNS

Add DNS records:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Update Supabase URLs

Update redirect URLs in Supabase to use your custom domain.

## 📱 PWA Deployment Checklist

- [ ] `manifest.json` configured
- [ ] Service worker registered
- [ ] Icons generated (all sizes)
- [ ] HTTPS enabled
- [ ] Offline page created
- [ ] Install prompt implemented
- [ ] Tested on mobile devices

## 🔍 Post-Deployment Verification

### 1. Smoke Tests

```bash
# Test API endpoints
curl https://your-app.vercel.app/api/health

# Test authentication
curl https://your-app.vercel.app/api/auth/session
```

### 2. Monitor Logs

```bash
vercel logs your-app.vercel.app
```

### 3. Check Cron Jobs

Vercel Dashboard → Your Project → Cron Jobs

Verify jobs are running on schedule.

## 🐛 Troubleshooting

### Build Failures

**Issue:** Build fails with module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Issue:** Environment variables not found
- Check Vercel Dashboard → Environment Variables
- Ensure variables are set for Production environment
- Redeploy after adding variables

### Runtime Errors

**Issue:** 500 Internal Server Error
- Check Vercel logs: `vercel logs`
- Verify environment variables
- Check Supabase connection

**Issue:** CORS errors
- Update CORS configuration in `next.config.js`
- Verify Supabase URL configuration

### Push Notifications Not Working

**Issue:** Notifications not received
- Verify VAPID keys are correct
- Check HTTPS is enabled
- Test subscription in browser DevTools
- Verify service worker is registered

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Web.dev Performance](https://web.dev/performance/)

## 🔗 Related Guides

- [Backend Guide](./BACKEND.md) — API implementation
- [PWA Guide](./PWA.md) — Progressive Web App setup
- [Notifications Guide](./NOTIFICATIONS.md) — Push notifications
