# ⚡ Quick Start Guide

Get StudyFlow running in 5 minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Google Gemini API key (free tier available)

## 🚀 Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/your-username/studyflow.git
cd studyflow

# Install dependencies
npm install
```

### 2. Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to **SQL Editor** and run this schema:

```sql
-- Copy the complete SQL schema from docs/BACKEND.md
-- Or use the quick schema below
```

<details>
<summary>Click to see Quick Schema</summary>

```sql
-- Users table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  subject text,
  due_date date not null,
  status text default 'pending' check (status in ('pending', 'done', 'partial')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamp with time zone default now()
);

-- Push subscriptions
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default now()
);

-- Notification log
create table public.notification_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  message text not null,
  sent_at timestamp with time zone default now(),
  read boolean default false
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_log enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users manage own tasks" on public.tasks
  for all using (auth.uid() = user_id);

create policy "Users manage own subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

create policy "Users view own notifications" on public.notification_log
  for all using (auth.uid() = user_id);
```

</details>

4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

5. Go to **Authentication → Providers** and enable **Google**
   - Follow the instructions to set up Google OAuth
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 3. Get Gemini API Key (1 minute)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### 4. Generate VAPID Keys (30 seconds)

```bash
npx web-push generate-vapid-keys
```

Copy the output (Public Key and Private Key).

### 5. Configure Environment (1 minute)

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your keys:

```env
# Supabase (from step 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini (from step 3)
GEMINI_API_KEY=your-gemini-api-key

# VAPID (from step 4)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_MAILTO=mailto:your-email@example.com

# Cron Secret (any random string)
CRON_SECRET=my-super-secret-string-123
```

### 6. Run the App! (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## ✅ Verify Everything Works

### Test Authentication
1. Click "Sign in with Google"
2. Authorize the app
3. You should be redirected to the dashboard

### Test AI Chat
1. Go to the Chat tab
2. Type: "Math homework due tomorrow and science project due Friday"
3. AI should extract and create 2 tasks

### Test Calendar
1. Go to Dashboard
2. You should see your tasks on the calendar
3. Click a day to see task details
4. Click a task to change its status

### Test Notifications (Optional)
1. Go to Settings
2. Click "Enable Notifications"
3. Allow notifications in your browser
4. Click "Send Test Notification"
5. You should receive a notification

## 🎨 Customize (Optional)

### Change App Name

Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "YourApp"
}
```

### Change Colors

Edit `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
};
```

### Change Icons

Replace icons in `public/icons/` with your own (keep the same sizes).

## 🚀 Next Steps

- **Deploy to Production:** See [Deployment Guide](./DEPLOYMENT.md)
- **Customize UI:** See [UI Guide](./UI.md)
- **Add Features:** See [Contributing Guide](./CONTRIBUTING.md)
- **Learn More:** Explore all docs in the `docs/` folder

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify your Supabase project is active

### "Unauthorized" errors
- Make sure you ran the RLS policies SQL
- Check you're signed in

### "AI parsing failed"
- Verify your `GEMINI_API_KEY` is correct
- Check you have API quota remaining

### More issues?
See [Troubleshooting Guide](./TROUBLESHOOTING.md)

## 📚 Documentation

- [Frontend Guide](./FRONTEND.md) — Components and pages
- [Backend Guide](./BACKEND.md) — API and database
- [PWA Guide](./PWA.md) — Progressive Web App
- [UI Guide](./UI.md) — Design system
- [AI Guide](./AI.md) — Gemini integration
- [Notifications Guide](./NOTIFICATIONS.md) — Push notifications
- [Deployment Guide](./DEPLOYMENT.md) — Production setup
- [Contributing Guide](./CONTRIBUTING.md) — How to contribute
- [Troubleshooting Guide](./TROUBLESHOOTING.md) — Common issues

## 💬 Need Help?

- Open an issue on GitHub
- Check existing discussions
- Read the full documentation

---

**Congratulations!** You now have StudyFlow running locally. Happy coding! 🎉
