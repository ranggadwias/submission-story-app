import * as api from '../api/storyApi.js';

export default class StoryModel {
  async loadStories() {
    return await api.fetchStories();
  }

  async addNewStory(data) {
    await api.addStory(data);
  }
}