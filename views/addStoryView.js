export default class AddStoryView {
  constructor(root, onAddStory) {
    this.root = root;
    this.onAddStory = onAddStory;
    this.latitude = null;
    this.longitude = null;
    this.stream = null;
    this.video = null;
    this.photoBlob = null;
    this.marker = null;
    this.map = null;
    this.photoPreview = null;
  }

  clear() {
    this.stopCamera();
    this.root.innerHTML = "";
  }

  render() {
    this.clear();

    const form = document.createElement("form");
    form.setAttribute("aria-label", "Form tambah story");

    const descLabel = this.createLabel("desc-input", "Deskripsi");
    const descInput = this.createTextarea("desc-input", "description", true);

    const cameraLabel = document.createElement("label");
    cameraLabel.textContent = "Ambil Foto";

    this.video = document.createElement("video");
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.style.width = "100%";
    this.video.style.borderRadius = "10px";

    const captureBtn = document.createElement("button");
    captureBtn.type = "button";
    captureBtn.innerHTML = '<i class="fas fa-camera"></i> Ambil Foto';
    captureBtn.addEventListener("click", () => this.capturePhoto());

    this.photoPreview = document.createElement("img");
    this.photoPreview.alt = "Preview foto yang diambil";
    this.photoPreview.style.width = "100%";
    this.photoPreview.style.borderRadius = "10px";
    this.photoPreview.style.display = "none";

    const mapLabel = document.createElement("label");
    mapLabel.textContent = "Pilih Lokasi (klik pada peta)";

    const mapDiv = document.createElement("div");
    mapDiv.id = "add-map";

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Tambah Story";

    form.append(
      descLabel,
      descInput,
      cameraLabel,
      this.video,
      captureBtn,
      this.photoPreview,
      mapLabel,
      mapDiv,
      submitBtn
    );

    this.root.appendChild(form);

    this.initCamera();
    this.initMap();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!this.photoBlob) {
        alert("Harap ambil foto terlebih dahulu.");
        return;
      }
      if (this.latitude === null || this.longitude === null) {
        alert("Harap pilih lokasi di peta.");
        return;
      }

      const description = descInput.value.trim();
      try {
        await this.onAddStory({
          description,
          photo: this.photoBlob,
          latitude: this.latitude,
          longitude: this.longitude,
        });
        alert("Story berhasil ditambahkan!");
        this.clear();
        window.location.hash = "#list";
      } catch (err) {
        alert("Gagal menambahkan story: " + err.message);
      }
    });
  }

  createLabel(forId, text) {
    const label = document.createElement("label");
    label.setAttribute("for", forId);
    label.textContent = text;
    return label;
  }

  createTextarea(id, name, required = false) {
    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.name = name;
    textarea.required = required;
    return textarea;
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = this.stream;
    } catch (e) {
      alert("Tidak dapat mengakses kamera: " + e.message);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  capturePhoto() {
    if (!this.video) return;

    const canvas = document.createElement("canvas");
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        alert("Gagal mengambil foto.");
        return;
      }
      this.photoBlob = blob;
      this.photoPreview.src = URL.createObjectURL(blob);
      this.photoPreview.style.display = "block";
      this.stopCamera();
    }, "image/jpeg");
  }

  initMap() {
    const mapDiv = document.getElementById("add-map");
    this.map = L.map(mapDiv).setView([-2.5489, 118.0149], 5);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    });
    const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenTopoMap contributors",
    });

    osm.addTo(this.map);

    L.control.layers({ OpenStreetMap: osm, "Topo Map": topo }).addTo(this.map);

    this.marker = null;

    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      this.latitude = lat;
      this.longitude = lng;

      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng).addTo(this.map);
      }
    });
  }
}