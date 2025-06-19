const BASE_URL = "https://story-api.dicoding.dev/v1";
const VAPID_PUBLIC_KEY = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function getToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User belum login");
  return token;
}

function encodeKey(key) {
  return btoa(String.fromCharCode(...new Uint8Array(key)));
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribePush() {
  const token = getToken();
  if (!("serviceWorker" in navigator)) throw new Error("ServiceWorker not supported");
  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: encodeKey(subscription.getKey("p256dh")),
      auth: encodeKey(subscription.getKey("auth")),
    },
  };

  const res = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Gagal subscribe push notification");
  }

  return res.json();
}

export async function unsubscribePush() {
  const token = getToken();
  if (!("serviceWorker" in navigator)) throw new Error("ServiceWorker not supported");
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) throw new Error("Belum ada subscription");

  const res = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Gagal unsubscribe push notification");
  }

  await subscription.unsubscribe();
  return res.json();
}