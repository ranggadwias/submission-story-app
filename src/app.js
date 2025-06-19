import AppPresenter from "../presenters/appPresenter.js";
import { subscribePush, unsubscribePush } from "../api/notificationApi";

document.addEventListener("DOMContentLoaded", async () => {
  const main = document.getElementById("main-content");
  const app = new AppPresenter(main);
  app.init();

  await registerServiceWorker();
  setupPushButtons();
});

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("sw.js");
    await navigator.serviceWorker.ready;
    console.log("✅ Service worker registered");
  } catch (err) {
    console.warn("SW registration failed:", err.message);
  }
}

function setupPushButtons() {
  const subscribeBtn = document.getElementById("btn-subscribe");
  const unsubscribeBtn = document.getElementById("btn-unsubscribe");

  if (!subscribeBtn || !unsubscribeBtn) return;

  const token = localStorage.getItem("token");
  if (!token) {
    subscribeBtn.style.display = "none";
    unsubscribeBtn.style.display = "none";
    return;
  }

  subscribeBtn.addEventListener("click", async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        alert("Sudah aktif");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
        ),
      });

      await subscribePush(subscription, token);

      subscribeBtn.style.display = "none";
      unsubscribeBtn.style.display = "inline-block";
      alert("Notifikasi berhasil diaktifkan!");
    } catch (err) {
      alert("Gagal subscribe: " + err.message);
    }
  });

  unsubscribeBtn.addEventListener("click", async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        alert("Belum berlangganan");
        return;
      }

      await unsubscribePush(subscription, token);
      await subscription.unsubscribe();

      subscribeBtn.style.display = "inline-block";
      unsubscribeBtn.style.display = "none";
      alert("Notifikasi berhasil dinonaktifkan.");
    } catch (err) {
      alert("Gagal unsubscribe: " + err.message);
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}