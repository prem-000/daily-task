# 🔔 Notifications Guide — Web Push

This guide covers the complete implementation of Web Push Notifications in StudyFlow, including setup, subscription management, and sending notifications.

## 🎯 Overview

StudyFlow uses the **Web Push API** to send notifications directly to users' devices without requiring email, WhatsApp, or any third-party messaging service.

### Notification Types

| Type | When | Description |
|------|------|-------------|
| 🌅 Morning Digest | 7:00 AM daily | Lists all tasks due today |
| ⏰ Repeating Reminder | Every X minutes | Reminds about pending tasks |
| ✅ Completion Prompt | End of day | Asks to mark tasks as done |
| 🎯 Task Alert | On task creation | Confirms task was added |

## 🔑 VAPID Keys Setup

VAPID (Voluntary Application Server Identification) keys are required for Web Push.

### Generate Keys

```bash
npx web-push generate-vapid-keys
```

**Output:**
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib27SGeRoPgXnkQ...
Private Key: bdSiGDzqIxPP-vW4Xq1rBXvdvfkx5K9tnXA7x9yV...
```

### Add to Environment

```env
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib27SGeRoPgXnkQ...
VAPID_PRIVATE_KEY=bdSiGDzqIxPP-vW4Xq1rBXvdvfkx5K9tnXA7x9yV...
VAPID_MAILTO=mailto:your-email@example.com
```

## 📦 Installation

```bash
npm install web-push
```

## 🔧 Backend Implementation

### Push Helper (`lib/push.ts`)

```typescript
import webpush from 'web-push';

// Configure VAPID details
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

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; error?: any }> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 86400, // 24 hours
        urgency: 'normal',
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error('Push notification error:', error);

    // Handle expired subscriptions
    if (error.statusCode === 410) {
      console.log('Subscription expired, should be removed from database');
    }

    return { success: false, error };
  }
}

export async function sendBulkNotifications(
  subscriptions: PushSubscription[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length;
  const failed = results.length - sent;

  return { sent, failed };
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

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    // Validate subscription object
    if (
      !subscription.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Save or update subscription in database
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      {
        onConflict: 'endpoint',
      }
    );

    if (error) {
      console.error('Failed to save subscription:', error);
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    // Remove subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Failed to delete subscription:', error);
      return NextResponse.json(
        { error: 'Failed to delete subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Send Notification API Route (`app/api/push/send/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendBulkNotifications } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, taskId, tag } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', session.user.id);

    if (fetchError) {
      console.error('Failed to fetch subscriptions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found' },
        { status: 404 }
      );
    }

    // Prepare push subscriptions
    const pushSubscriptions = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    // Send notifications
    const { sent, failed } = await sendBulkNotifications(pushSubscriptions, {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: tag || 'studyflow-notification',
      data: { taskId },
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });

    // Log notification
    await supabase.from('notification_log').insert({
      user_id: session.user.id,
      task_id: taskId || null,
      message: `${title}: ${body}`,
    });

    // Remove failed subscriptions (expired)
    if (failed > 0) {
      // In production, implement logic to remove expired subscriptions
      console.log(`${failed} notifications failed to send`);
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
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

## 💻 Frontend Implementation

### Notification Permission Hook (`hooks/useNotifications.ts`)

```typescript
'use client';

import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check for existing subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return false;
    }

    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribe();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      setSubscription(sub);

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      console.log('Push subscription successful');
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();

      // Remove from server
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setSubscription(null);
      console.log('Unsubscribed from push notifications');
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  };

  return {
    permission,
    subscription,
    loading,
    requestPermission,
    unsubscribe,
    isSubscribed: !!subscription,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
```

### Notification Settings Component

```tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff } from 'lucide-react';

export function NotificationSettings() {
  const { permission, isSubscribed, loading, requestPermission, unsubscribe } =
    useNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await requestPermission();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="text-blue-500" size={24} />
          ) : (
            <BellOff className="text-gray-400" size={24} />
          )}
          <div>
            <h3 className="font-semibold">Push Notifications</h3>
            <p className="text-sm text-gray-600">
              {isSubscribed
                ? 'You will receive task reminders'
                : 'Enable to get task reminders'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading || permission === 'denied'}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${
              isSubscribed
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>

      {permission === 'denied' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}
```

## ⏰ Scheduled Notifications (Cron Jobs)

### Morning Digest (`app/api/cron/morning-digest/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkNotifications } from '@/lib/push';

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

    let totalSent = 0;
    let totalFailed = 0;

    // Send morning digest to each user
    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      // Get user's push subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subscriptions || subscriptions.length === 0) {
        continue;
      }

      const pushSubscriptions = subscriptions.map((sub) => ({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }));

      const taskList = userTasks.map((t) => `• ${t.title}`).join('\n');

      const { sent, failed } = await sendBulkNotifications(pushSubscriptions, {
        title: '🌅 Good Morning!',
        body: `You have ${userTasks.length} task(s) due today:\n${taskList}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'morning-digest',
        data: { type: 'morning-digest' },
      });

      totalSent += sent;
      totalFailed += failed;

      // Log notification
      await supabase.from('notification_log').insert({
        user_id: userId,
        message: `Morning digest: ${userTasks.length} tasks due today`,
      });
    }

    return NextResponse.json({
      success: true,
      users: Object.keys(tasksByUser).length,
      sent: totalSent,
      failed: totalFailed,
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

## 🧪 Testing Notifications

### Test Notification Button

```tsx
'use client';

export function TestNotificationButton() {
  const sendTestNotification = async () => {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '🧪 Test Notification',
        body: 'This is a test notification from StudyFlow!',
        tag: 'test',
      }),
    });

    const data = await response.json();
    alert(`Sent: ${data.sent}, Failed: ${data.failed}`);
  };

  return (
    <button
      onClick={sendTestNotification}
      className="bg-purple-500 text-white px-4 py-2 rounded-lg"
    >
      Send Test Notification
    </button>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Permission denied | User blocked notifications | Guide user to browser settings |
| Subscription failed | Invalid VAPID key | Regenerate and update keys |
| Notifications not showing | Service worker not registered | Check SW registration |
| 410 Gone error | Subscription expired | Remove from database |
| HTTPS required | Running on HTTP | Use ngrok or deploy to HTTPS |

### Debug Checklist

```typescript
// Check notification support
console.log('Notification' in window); // Should be true

// Check service worker support
console.log('serviceWorker' in navigator); // Should be true

// Check push manager support
console.log('PushManager' in window); // Should be true

// Check permission status
console.log(Notification.permission); // 'granted', 'denied', or 'default'

// Check subscription
navigator.serviceWorker.ready.then((reg) => {
  reg.pushManager.getSubscription().then((sub) => {
    console.log('Subscription:', sub);
  });
});
```

## 📚 Additional Resources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notification API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push Library](https://github.com/web-push-libs/web-push)

## 🔗 Related Guides

- [PWA Guide](./PWA.md) — Service worker setup
- [Backend Guide](./BACKEND.md) — API implementation
- [Deployment Guide](./DEPLOYMENT.md) — Production setup
