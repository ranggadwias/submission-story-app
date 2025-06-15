const BASE_URL = "https://story-api.dicoding.dev/v1";

function getToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User belum login");
  return token;
}

export function restorePhoto(buffer, type = "image/jpeg", name = "photo.jpg") {
  if (!buffer) throw new Error("Missing buffer in restorePhoto");
  return new File([new Uint8Array(buffer)], name, { type });
}

export async function fetchStories() {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/stories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal ambil data story");
  }

  return data.listStory || [];
}

export async function fetchStoryDetail(id) {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/stories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal ambil detail story");
  }

  return data.story;
}

export async function addStory({ description, photo, latitude, longitude }) {
  const token = getToken();
  const formData = new FormData();
  formData.append("description", description);

  if (photo) {
    formData.append("photo", photo);
  }

  if (typeof latitude === 'number' && !isNaN(latitude)) {
    formData.append("lat", latitude.toString());
  }

  if (typeof longitude === 'number' && !isNaN(longitude)) {
    formData.append("lon", longitude.toString());
  }

  const response = await fetch(`${BASE_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal tambah story");
  }

  return data;
}