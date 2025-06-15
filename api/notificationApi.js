const BASE_URL = "https://story-api.dicoding.dev/v1";

function encodeKey(key) {
  return btoa(String.fromCharCode(...new Uint8Array(key)));
}

export async function subscribePush(subscription, token) {
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