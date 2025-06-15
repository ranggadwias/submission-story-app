import StoryModel from "../models/storyModel.js";
import StoryListView from "../views/storyListView.js";
import AddStoryView from "../views/addStoryView.js";
import RegisterView from "../views/registerView.js";
import LoginView from "../views/loginView.js";
import DetailView from "../views/detailView.js";
import { getAllFavoriteStories } from "../src/utils/idb.js";

export default class AppPresenter {
  constructor(root) {
    this.root = root;
    this.model = new StoryModel();

    this.views = {
      list: new StoryListView(root),
      add: new AddStoryView(root, (data) => this.handleAddStory(data)),
      register: new RegisterView(root),
      login: new LoginView(root, () => this.handleRoute()),
      detail: new DetailView(root),
    };

    this.currentView = null;

    window.addEventListener("hashchange", () => this.handleRoute());
  }

  async init() {
    await this.handleRoute();
  }

  getCurrentHash() {
    return location.hash.trim() || "#list";
  }

  clearCurrentView() {
    if (this.currentView?.clear) this.currentView.clear();
  }

  async handleRoute() {
    const hash = this.getCurrentHash();

    const routeMap = {
      "#list": this.renderList.bind(this),
      "#add": () => this.switchView("add"),
      "#register": () => this.switchView("register"),
      "#login": () => this.switchView("login"),
      "#favorites": this.renderFavorites.bind(this),
    };

    const isDetailRoute = hash.startsWith("#detail/");

    const renderView = async () => {
      this.clearCurrentView();

      if (routeMap[hash]) {
        await routeMap[hash]();
      } else if (isDetailRoute) {
        const id = hash.split("/")[1];
        if (!id) throw new Error("ID tidak valid");
        this.switchView("detail", id);
      } else {
        this.renderNotFound();
      }

      this.root.querySelector("#main-content")?.focus();
    };

    try {
      if (document.startViewTransition) {
        await document.startViewTransition(renderView);
      } else {
        await renderView();
      }
    } catch (error) {
      this.renderError(error);
    }
  }

  async renderList() {
    try {
      const stories = await this.model.loadStories();
      this.switchView("list", stories);
    } catch (error) {
      console.warn("Gagal ambil data dari API:", error.message);
      this.switchView("list", []);
    }
  }

  async renderFavorites() {
    try {
      const favorites = await getAllFavoriteStories();
      this.switchView("list", favorites);
    } catch (error) {
      console.warn("Gagal ambil data favorit:", error.message);
      this.switchView("list", []);
    }
  }

  switchView(viewName, param = null) {
    switch (viewName) {
      case "list":
        this.views.list.render(param || []);
        this.currentView = this.views.list;
        break;
      case "add":
        this.views.add.render();
        this.currentView = this.views.add;
        break;
      case "register":
        this.views.register.render();
        this.currentView = this.views.register;
        break;
      case "login":
        this.views.login.render();
        this.currentView = this.views.login;
        break;
      case "detail":
        this.views.detail.render(param);
        this.currentView = this.views.detail;
        break;
      default:
        this.renderNotFound();
        break;
    }
  }

  renderNotFound() {
    this.root.innerHTML = `
      <main id="main-content" tabindex="-1">
        <h2>404 - Halaman tidak ditemukan</h2>
        <p>Halaman yang kamu cari tidak tersedia.</p>
      </main>
    `;
  }

  renderError(error) {
    console.error("Terjadi kesalahan saat merender view:", error);
    this.root.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${error.message}</p>`;
  }

  async handleAddStory(data) {
    try {
      await this.model.addNewStory(data);
      location.hash = "#list";
    } catch (error) {
      console.error("Gagal menambah story:", error.message);
      alert(`Gagal menambah story: ${error.message}`);
    }
  }
}