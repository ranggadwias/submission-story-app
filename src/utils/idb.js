import { openDB } from "idb";

const DB_NAME = "story-app";
const DB_VERSION = 1;
const STORE_NAME = "favorites";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

async function withDB(fn) {
  try {
    const db = await dbPromise;
    return await fn(db);
  } catch (error) {
    console.error(`[idb] Error in ${fn.name}:`, error);
    throw error;
  }
}

export const saveFavoriteStory = (story) =>
  withDB((db) => db.put(STORE_NAME, story));

export const getAllFavoriteStories = () =>
  withDB((db) => db.getAll(STORE_NAME));

export const deleteFavoriteStory = (id) =>
  withDB((db) => db.delete(STORE_NAME, id));

export const clearFavoriteStories = () =>
  withDB((db) => db.clear(STORE_NAME));