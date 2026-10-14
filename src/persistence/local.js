import { validateSave, migrateSave } from "../domain/game.js";
let connection;
function db() {
  return (connection ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("imperio-do-queijo", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("campaigns");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
export async function load() {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction("campaigns")
      .objectStore("campaigns")
      .get("current");
    request.onsuccess = () => {
      try {
        resolve(
          request.result ? validateSave(migrateSave(request.result)) : null,
        );
      } catch (e) {
        reject(e);
      }
    };
    request.onerror = () => reject(request.error);
  });
}
export async function save(state) {
  validateSave(state);
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("campaigns", "readwrite");
    tx.objectStore("campaigns").put(structuredClone(state), "current");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
