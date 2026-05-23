export const dynamic = "force-static";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkNotifications } from '../../../../lib/push';
import { Database } from '../../../../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient<any>(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  // Verify authorization secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch all pending or partial tasks due today or earlier
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['pending', 'partial'])
      .lte('due_date', today);

    if (taskError) {
      console.error('Failed to fetch pending tasks:', taskError);
      return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'No pending or partial tasks to remind' });
    }

    // Group tasks by user_id
    const tasksByUser = tasks.reduce((acc: Record<string, any[]>, task: any) => {
      const userId = task.user_id;
      if (!userId) return acc;
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(task);
      return acc;
    }, {} as Record<string, any[]>);

    let totalSent = 0;
    const now = new Date();

    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      // 1. Fetch user settings for this user
      const { data: settings } = await supabase
        .from('user_settings')
        .select('reminder_interval')
        .eq('user_id', userId)
        .single();

      const intervalMinutes = settings?.reminder_interval ?? 60; // default 60 mins

      // 2. Fetch subscriptions for this user
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subscriptions || subscriptions.length === 0) {
        continue;
      }

      const pushSubscriptions = subscriptions.map((sub: any) => ({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }));

      // 3. Process each task for the user
      for (const task of userTasks) {
        // Find if we sent a reminder for this task recently
        const { data: pastReminders } = await supabase
          .from('notification_log')
          .select('sent_at')
          .eq('user_id', userId)
          .eq('task_id', task.id)
          .like('message', '%is still pending!%')
          .order('sent_at', { ascending: false })
          .limit(1);

        let shouldSend = false;

        if (!pastReminders || pastReminders.length === 0) {
          // Never reminded before, send first reminder if task due time has passed or was due earlier
          shouldSend = true;
        } else {
          const lastSentTime = new Date(pastReminders[0].sent_at);
          const diffMs = now.getTime() - lastSentTime.getTime();
          const diffMins = Math.floor(diffMs / 60000);

          if (diffMins >= intervalMinutes) {
            shouldSend = true;
          }
        }

        if (shouldSend) {
          // Send push notification
          const { sent } = await sendBulkNotifications(pushSubscriptions, {
            title: 'â° Task Reminder',
            body: `"${task.title}" is still pending!`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: `reminder-${task.id}`,
            data: { taskId: task.id },
          });

          if (sent > 0) {
            totalSent += sent;
            
            // Log notification log history
            await supabase.from('notification_log').insert({
              user_id: userId,
              task_id: task.id,
              message: `Task Reminder â°: "${task.title}" is still pending!`,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: totalSent,
    });
  } catch (error) {
    console.error('Repeat reminders cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
