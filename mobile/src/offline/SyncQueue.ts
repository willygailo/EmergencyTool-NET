import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// Initialize the queue table
export const initSyncQueue = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('sync_queue.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS emergency_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
};

/**
 * Queue an emergency payload for later sync
 */
export const queueEmergency = async (type: string, payload: any) => {
  if (!db) await initSyncQueue();
  const payloadStr = JSON.stringify(payload);
  
  await db!.runAsync(
    'INSERT INTO emergency_queue (type, payload) VALUES (?, ?)',
    type,
    payloadStr
  );
  console.log(`Queued emergency of type: ${type}`);
};

/**
 * Retrieve all queued items
 */
export const getQueuedItems = async () => {
  if (!db) await initSyncQueue();
  const allRows = await db!.getAllAsync('SELECT * FROM emergency_queue ORDER BY created_at ASC');
  return allRows as Array<{ id: number; type: string; payload: string; created_at: string }>;
};

/**
 * Remove an item from the queue
 */
export const removeFromQueue = async (id: number) => {
  if (!db) await initSyncQueue();
  await db!.runAsync('DELETE FROM emergency_queue WHERE id = ?', id);
};
