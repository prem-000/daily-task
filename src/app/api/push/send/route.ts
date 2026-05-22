import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '../../../../lib/supabase-server';
import { sendBulkNotifications } from '../../../../lib/push';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthUser(request);
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

    const supabase = await createRouteClient();

    // Get user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', session.userId);

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

    const pushSubscriptions = subscriptions.map((sub: any) => ({
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

    // Log notification in the notification log
    await supabase.from('notification_log').insert({
      user_id: session.userId,
      task_id: taskId || null,
      message: `${title}: ${body}`,
    });

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
