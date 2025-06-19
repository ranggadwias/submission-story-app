import { subscribePush, unsubscribePush } from "../api/notificationApi.js";

document.getElementById("btn-subscribe").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");
    await subscribePush(token);
    alert("Berhasil subscribe!");
  } catch (e) {
    alert(e.message);
  }
});

document.getElementById("btn-unsubscribe").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");
    await unsubscribePush(token);
    alert("Berhasil unsubscribe!");
  } catch (e) {
    alert(e.message);
  }
});