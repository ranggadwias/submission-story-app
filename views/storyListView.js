import { saveFavoriteStory, deleteFavoriteStory, getAllFavoriteStories } from "../src/utils/idb.js";

export default class StoryListView {
  constructor(root) {
    this.root = root;
  }

  clear() {
    this.root.innerHTML = "";
  }

  createButton(text, onClick, options = {}) {
    const btn = document.createElement("button");
    btn.textContent = text;
    if (options.style) Object.assign(btn.style, options.style);
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        await onClick(e);
      } catch (error) {
        alert(error.message);
      }
    });
    return btn;
  }

  async render(stories) {
    this.clear();

    const favoriteStories = await getAllFavoriteStories();
    const favoriteIds = favoriteStories.map((fav) => fav.id);

    const container = document.createElement("div");
    container.className = "story-list";

    stories.forEach((story) => {
      const item = document.createElement("article");
      item.className = "story-item";
      item.style.cursor = "pointer";

      const img = document.createElement("img");
      img.src = story.photoUrl;
      img.alt = `Foto cerita: ${story.title}`;
      img.loading = "lazy";

      const title = document.createElement("h2");
      title.textContent = story.title;

      const desc = document.createElement("p");
      desc.textContent = story.description;

      const date = document.createElement("p");
      date.textContent = new Date(story.createdAt).toLocaleDateString();

      const btnContainer = document.createElement("div");
      btnContainer.style.marginTop = "0.5rem";

      if (location.hash === "#favorites") {
        const delBtn = this.createButton(
          "🗑 Hapus",
          async () => {
            await deleteFavoriteStory(story.id);
            alert("Dihapus dari favorit");
            window.dispatchEvent(new Event("hashchange"));
          },
          { style: { marginLeft: "10px" } }
        );
        btnContainer.appendChild(delBtn);
      } else {
        if (favoriteIds.includes(story.id)) {
          const favBtn = this.createButton("✔ Favorit Disimpan", () => {}, { style: { cursor: "default" } });
          favBtn.disabled = true;
          btnContainer.appendChild(favBtn);
        } else {
          const favBtn = this.createButton("⭐ Favorit", async () => {
            await saveFavoriteStory({
              id: story.id,
              description: story.description,
              title: story.title,
              createdAt: story.createdAt,
              photoUrl: story.photoUrl,
              latitude: story.latitude,
              longitude: story.longitude,
            });
            favBtn.disabled = true;
            favBtn.textContent = "✔ Favorit Disimpan";
          });
          btnContainer.appendChild(favBtn);
        }
      }

      item.append(img, title, desc, date, btnContainer);
      container.appendChild(item);

      item.addEventListener("click", () => {
        window.location.hash = `#detail/${story.id}`;
      });
    });

    this.root.appendChild(container);

    this.renderMap(stories);
  }

  renderMap(stories) {
    const existingMap = document.getElementById("map");
    if (existingMap) existingMap.remove();

    const mapDiv = document.createElement("div");
    mapDiv.id = "map";
    this.root.appendChild(mapDiv);

    const map = L.map(mapDiv).setView([-2.5489, 118.0149], 5);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    });

    const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenTopoMap contributors",
    });

    osm.addTo(map);

    const baseLayers = {
      OpenStreetMap: osm,
      "Topo Map": topo,
    };

    L.control.layers(baseLayers).addTo(map);

    stories.forEach((story) => {
      if (story.latitude && story.longitude) {
        const marker = L.marker([story.latitude, story.longitude]).addTo(map);
        marker.bindPopup(`<strong>${story.title}</strong><br>${story.description}`);
      }
    });
  }
}