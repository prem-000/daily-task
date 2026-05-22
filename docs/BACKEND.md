# 🔧 Backend Guide

This guide covers the API routes, Supabase integration, database schema, and server-side logic.

## 📁 Backend Structure

```
app/api/
├── parse-task/
│   └── route.ts         # POST: Gemini parses chat message
├── push/
│   ├── subscribe/
│   │   └── route.ts     # POST: Save push subscription
│   └── send/
│       └── route.ts     # POST: Send push notification
└── cron/
    └── morning-digest/
        └── route.ts     # GET: Scheduled morning notifications

lib/
├── supabase.ts          # Supabase client (browser)
├── supabase-server.ts   # Supabase client (server)
├── gemini.ts            # Gemini API task extraction
└── push.ts              # Web Push send helper
```

## 🗄️ Database Schema

### Tables Overview

1. **profiles** — User profile information
2. **tasks** — Student tasks and assignments
3. **push_subscriptions** — Web Push endpoints
4. **notification_log** — Notification history

### Complete SQL Schema

Run this in your Supabase SQL Editor:

```sql
-- Users table (auto-populated by Supabase Auth)
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
  subject text,                          -- e.g. "Math", "Science", "English"
  due_date date not null,
  status text default 'pending'          -- 'pending' | 'done' | 'partial'
    check (status in ('pending', 'done', 'partial')),
  priority text default 'medium'         -- 'low' | 'medium' | 'high'
    check (priority in ('low', 'medium', 'high')),
  created_at timestamp with time zone default now()
);

-- Push subscriptions table
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default now()
);

-- Notification log table
create table public.notification_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  message text not null,
  sent_at timestamp with time zone default now(),
  read boolean default false
);

-- Row Level Security (RLS)
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

-- Indexes for performance
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_due_date_idx on public.tasks(due_date);
create index notification_log_user_id_idx on public.notification_log(user_id);
```

## 🔌 Supabase Client Setup

### Browser Client (`lib/supabase.ts`)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export const createClient = () => {
  return createClientComponentClient<Database>();
};
```

### Server Client (`lib/supabase-server.ts`)

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
```

### Route Handler Client

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export const createRouteClient = () => {
  return createRouteHandlerClient<Database>({ cookies });
};
```

## 🤖 AI Integration (Gemini 2.5 Flash)

### Gemini Client (`lib/gemini.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ParsedTask {
  title: string;
  subject?: string;
  due_date: string; // ISO date format
  priority: 'low' | 'medium' | 'high';
}

export async function parseTasksFromMessage(
  message: string,
  currentDate: Date = new Date()
): Promise<ParsedTask[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are a task extraction assistant for a student planner app.

Current date: ${currentDate.toISOString().split('T')[0]}

Extract all tasks from the following message and return them as a JSON array.
Each task should have:
- title: string (clear, concise task description)
- subject: string | null (e.g., "Math", "Science", "English", or null if not mentioned)
- due_date: string (ISO date format YYYY-MM-DD)
- priority: "low" | "medium" | "high" (infer from context, default to "medium")

Rules:
- "tomorrow" means ${new Date(currentDate.getTime() + 86400000).toISOString().split('T')[0]}
- "next week" means 7 days from now
- "Friday" means the next upcoming Friday
- If no date is mentioned, assume it's due tomorrow
- Extract multiple tasks if mentioned

User message: "${message}"

Return ONLY valid JSON array, no markdown or explanation.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const tasks = JSON.parse(cleanText);
    return Array.isArray(tasks) ? tasks : [tasks];
  } catch (error) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Failed to parse tasks from AI response');
  }
}
```

### Task Parsing API Route (`app/api/parse-task/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { parseTasksFromMessage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Parse tasks using Gemini 2.5 Flash
    const parsedTasks = await parseTasksFromMessage(message);

    // Insert tasks into database
    const tasksToInsert = parsedTasks.map((task) => ({
      ...task,
      user_id: session.user.id,
      status: 'pending' as const,
    }));

    const { data: insertedTasks, error } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks: insertedTasks,
      count: insertedTasks.length,
    });
  } catch (error) {
    console.error('Parse task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 🔔 Web Push Implementation

### Push Helper (`lib/push.ts`)

```typescript
import webpush from 'web-push';

// Configure VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
  }
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, error };
  }
}
```

### Subscribe API Route (`app/api/push/subscribe/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    // Save subscription to database
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });

    if (error) {
      console.error('Subscription save error:', error);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Send Push API Route (`app/api/push/send/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendPushNotification } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, taskId } = await request.json();

    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', session.user.id);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found' },
        { status: 404 }
      );
    }

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map((sub) =>
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: { taskId },
          }
        )
      )
    );

    // Log notification
    await supabase.from('notification_log').insert({
      user_id: session.user.id,
      task_id: taskId || null,
      message: `${title}: ${body}`,
    });

    return NextResponse.json({
      success: true,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error('Send push error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## ⏰ Scheduled Jobs (Cron)

### Morning Digest Cron (`app/api/cron/morning-digest/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/push';

// Use service role key for cron jobs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all users with tasks due today
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, profiles(*)')
      .eq('due_date', today)
      .eq('status', 'pending');

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'No tasks due today' });
    }

    // Group tasks by user
    const tasksByUser = tasks.reduce((acc, task) => {
      const userId = task.user_id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(task);
      return acc;
    }, {} as Record<string, any[]>);

    // Send morning digest to each user
    const results = await Promise.all(
      Object.entries(tasksByUser).map(async ([userId, userTasks]) => {
        // Get user's push subscriptions
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', userId);

        if (!subscriptions || subscriptions.length === 0) {
          return { userId, sent: false };
        }

        const taskList = userTasks.map((t) => `• ${t.title}`).join('\n');
        const message = {
          title: '🌅 Good Morning!',
          body: `You have ${userTasks.length} task(s) due today:\n${taskList}`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        };

        // Send to all user's subscriptions
        await Promise.all(
          subscriptions.map((sub) =>
            sendPushNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              message
            )
          )
        );

        // Log notification
        await supabase.from('notification_log').insert({
          user_id: userId,
          message: message.body,
        });

        return { userId, sent: true };
      })
    );

    return NextResponse.json({
      success: true,
      users: results.length,
      sent: results.filter((r) => r.sent).length,
    });
  } catch (error) {
    console.error('Morning digest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Vercel Cron Configuration (`vercel.json`)

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

## 🔐 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI (2.5 Flash)
GEMINI_API_KEY=your-gemini-api-key

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_MAILTO=mailto:you@example.com

# Cron Secret (for scheduled jobs)
CRON_SECRET=your-random-secret-string
```

### Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

## 📊 Type Safety with TypeScript

### Generate Supabase Types

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Example Types (`types/database.ts`)

```typescript
export interface Task {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  due_date: string;
  status: 'pending' | 'done' | 'partial';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  task_id: string | null;
  message: string;
  sent_at: string;
  read: boolean;
}
```

## 🧪 Testing API Routes

### Example Test (`__tests__/api/parse-task.test.ts`)

```typescript
import { POST } from '@/app/api/parse-task/route';
import { NextRequest } from 'next/server';

describe('/api/parse-task', () => {
  it('parses tasks from natural language', async () => {
    const request = new NextRequest('http://localhost:3000/api/parse-task', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Math homework due tomorrow and science project due Friday',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.tasks).toHaveLength(2);
    expect(data.tasks[0].subject).toBe('Math');
  });
});
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 🔗 Related Guides

- [Frontend Guide](./FRONTEND.md) — UI components and pages
- [AI Integration](./AI.md) — Detailed Gemini setup
- [Notifications Guide](./NOTIFICATIONS.md) — Push notification details
