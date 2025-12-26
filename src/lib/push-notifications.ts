/**
 * Push Notifications
 * Browser push notifications for sales, restocks, etc.
 */

// Service Worker registration
export async function registerPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    
    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    
    return subscription;
  } catch (err) {
    console.error('Failed to subscribe to push:', err);
    return null;
  }
}

export async function unregisterPushNotifications(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }
}

// Check if push is enabled
export async function isPushEnabled(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

// Request permission
export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default'> {
  return Notification.requestPermission();
}
