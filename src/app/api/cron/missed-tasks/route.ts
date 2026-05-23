export const dynamic = "force-dynamic";
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

    // 1. Find all pending tasks past their due date
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .lt('due_date', today);

    if (fetchError) {
      console.error('Failed to fetch past due tasks:', fetchError);
      return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'No missed tasks found' });
    }

    let totalUpdated = 0;
    let totalSent = 0;

    for (const task of tasks) {
      // 2. Mark task status as 'missed'
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'missed' })
        .eq('id', task.id);

      if (updateError) {
        console.error(`Failed to update task ${task.id} to missed:`, updateError);
        continue;
      }

      totalUpdated++;

      // 3. Fetch subscriptions for the user
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', task.user_id);

      if (subscriptions && subscriptions.length > 0) {
        const pushSubscriptions = subscriptions.map((sub: any) => ({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }));

        // Send push notification
        const { sent } = await sendBulkNotifications(pushSubscriptions, {
          title: 'Missed task âŒ',
          body: `You didn't complete: "${task.title}"`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `missed-${task.id}`,
          data: { taskId: task.id },
        });

        totalSent += sent;
      }

      // Log notification log history
      await supabase.from('notification_log').insert({
        user_id: task.user_id,
        task_id: task.id,
        message: `Missed task âŒ: You didn't complete: "${task.title}"`,
      });
    }

    return NextResponse.json({
      success: true,
      updated: totalUpdated,
      sent: totalSent,
    });
  } catch (error) {
    console.error('Missed tasks cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
