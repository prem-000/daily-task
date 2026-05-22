import webpush from 'web-push';

// Configure VAPID keys if they exist in the environment
const vapidMailto = process.env.VAPID_MAILTO;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidMailto && vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('Web Push VAPID keys are partially or fully unconfigured.');
}

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

    // Expired or invalid subscription status
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('Subscription expired or gone, should be removed from database');
      return { success: false, error: { expired: true, original: error } };
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
