export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkNotifications } from '../../../../lib/push';
import { Database } from '../../../../types/supabase';

// Initialize admin-level Supabase client using the service role key for system cron access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient<any>(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  // Verify cron secret in request headers to block unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    console.error('Supabase admin client is not configured.');
    return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all pending tasks due today across all users
    const { data: tasks, error: taskError } = await (supabase
      .from('tasks') as any)
      .select('*')
      .eq('due_date', today)
      .eq('status', 'pending');

    if (taskError) {
      console.error('Failed to fetch tasks:', taskError);
      return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'No pending tasks due today' });
    }

    // Group tasks by user_id
    const tasksByUser = tasks.reduce((acc: Record<string, any[]>, task: any) => {
      const userId = task.user_id;
      if (!userId) return acc;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(task);
      return acc;
      }, {} as Record<string, any[]>);

    let totalSent = 0;
    let totalFailed = 0;

    // Send morning digest notifications to each user
    for (const [userId, userTasksAny] of Object.entries(tasksByUser)) {
      const userTasks = userTasksAny as any[];
      // Fetch subscriptions for this specific user
      const { data: subscriptions, error: subError } = await (supabase
        .from('push_subscriptions') as any)
        .select('*')
        .eq('user_id', userId);

      if (subError || !subscriptions || subscriptions.length === 0) {
        continue;
      }

      const pushSubscriptions = subscriptions.map((sub: any) => ({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }));

      // Create a bulleted task list
      const taskList = userTasks.map((t: any) => `â€¢ ${t.title}`).join('\n');

      const { sent, failed } = await sendBulkNotifications(pushSubscriptions, {
        title: 'ðŸŒ… Good Morning!',
        body: `You have ${userTasks.length} task(s) due today:\n${taskList}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'morning-digest',
        data: { type: 'morning-digest' },
      });

      totalSent += sent;
      totalFailed += failed;

      // Log notification log history
      await (supabase.from('notification_log') as any).insert({
        user_id: userId,
        message: `Morning digest sent: ${userTasks.length} pending task(s) due today.`,
      });
    }

    return NextResponse.json({
      success: true,
      users: Object.keys(tasksByUser).length,
      sent: totalSent,
      failed: totalFailed,
    });
  } catch (error) {
    console.error('Morning digest cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
