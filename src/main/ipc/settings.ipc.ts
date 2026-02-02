import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { getDatabase, saveDatabase } from '../services/db';

export function registerSettingsIpc() {
  // Get a single setting
  ipcMain.handle(
    'settings:get',
    (_event: IpcMainInvokeEvent, key: string): string | null => {
      const db = getDatabase();

      const stmt = db.prepare('SELECT value FROM global_settings WHERE key = ?');
      stmt.bind([key]);

      if (!stmt.step()) {
        stmt.free();
        return null;
      }

      const result = stmt.getAsObject() as { value: string };
      stmt.free();

      return result.value;
    }
  );

  // Get all settings
  ipcMain.handle('settings:get-all', (): Record<string, string> => {
    const db = getDatabase();

    const result = db.exec('SELECT key, value FROM global_settings');

    if (result.length === 0 || !result[0].values) {
      return {};
    }

    const settings: Record<string, string> = {};
    result[0].values.forEach((row) => {
      settings[row[0] as string] = row[1] as string;
    });

    return settings;
  });

  // Update a setting
  ipcMain.handle(
    'settings:update',
    (_event: IpcMainInvokeEvent, key: string, value: string): boolean => {
      const db = getDatabase();

      const stmt = db.prepare(`
        INSERT INTO global_settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `);

      stmt.run([key, value]);
      const changes = db.getRowsModified();
      stmt.free();
      saveDatabase();

      return changes > 0;
    }
  );

  // Update multiple settings
  ipcMain.handle(
    'settings:update-batch',
    (_event: IpcMainInvokeEvent, updates: Record<string, string>): boolean => {
      const db = getDatabase();

      try {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(`
          INSERT INTO global_settings (key, value, updated_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        `);

        for (const [key, value] of Object.entries(updates)) {
          stmt.run([key, value]);
        }

        stmt.free();
        db.run('COMMIT');
        saveDatabase();

        return true;
      } catch (error) {
        db.run('ROLLBACK');
        console.error('Error updating settings:', error);
        return false;
      }
    }
  );
}
