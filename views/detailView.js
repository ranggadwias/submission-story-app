import { fetchStoryDetail } from '../api/storyApi.js';

export default class DetailView {
  constructor(root) {
    this.root = root;
  }

  clear() {
    this.root.innerHTML = '';
  }

  async render(id) {
    this.clear();

    try {
      const story = await fetchStoryDetail(id);

      const container = document.createElement('div');
      container.innerHTML = `
        <h2>${story.name}</h2>
        <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" style="width:100%;border-radius:10px;" />
        <p>${story.description}</p>
        <small>Dibuat pada: ${new Date(story.createdAt).toLocaleString()}</small>
        <div id="map-detail" style="height: 300px; margin-top: 1rem;"></div>
      `;

      this.root.appendChild(container);

      if (story.lat && story.lon) {
        const map = L.map('map-detail').setView([story.lat, story.lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
        L.marker([story.lat, story.lon])
          .addTo(map)
          .bindPopup('Lokasi story')
          .openPopup();
      }

    } catch (e) {
      this.root.innerHTML = `<p style="color:red">Gagal mengambil detail: ${e.message}</p>`;
    }
  }
}