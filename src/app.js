import AppPresenter from "../presenters/appPresenter.js";

document.addEventListener("DOMContentLoaded", async () => {
  const main = document.getElementById("main-content");
  const app = new AppPresenter(main);
  app.init();

  await registerServiceWorkerAndSubscribe();
});

async function registerServiceWorkerAndSubscribe() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("sw.js");
    await navigator.serviceWorker.ready;

    const token = localStorage.getItem("token");
    if (!token) return;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(
        "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
      );

      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      } catch (err) {
        console.warn("🔕 Gagal subscribe push:", err.message);
        return;
      }
    }

    const { endpoint, keys } = subscription.toJSON();
    const dataToSend = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const res = await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) throw new Error("Failed to subscribe push notification.");
  } catch (err) {
    console.warn("SW/Push registration issue:", err.message);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}