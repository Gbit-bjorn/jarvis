import initSqlJs, { type Database } from 'sql.js';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;

const getDbPath = (): string => {
  const userDataPath = app.getPath('userData');
  const dbDir = path.join(userDataPath, 'jarvis');

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return path.join(dbDir, 'jarvis.db');
};

export async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      // Point to the wasm file in node_modules
      return path.join(process.cwd(), 'node_modules/sql.js/dist', file);
    },
  });

  const dbPath = getDbPath();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Run migrations
  await runMigrations(db);

  // Save database
  saveDatabase();

  return db;
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function saveDatabase(): void {
  if (!db) return;

  const dbPath = getDbPath();
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

async function runMigrations(database: Database): Promise<void> {
  // Create migrations table if not exists
  database.run(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get list of migration files
  const migrationsDir = path.join(process.cwd(), 'db/migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  // Get executed migrations
  const executedMigrations = database
    .exec('SELECT filename FROM migrations')
    .flatMap((result) =>
      result.values.map((row) => row[0] as string)
    );

  // Run pending migrations
  for (const file of files) {
    if (executedMigrations.includes(file)) {
      continue;
    }

    console.log(`Running migration: ${file}`);

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Execute migration
    database.exec(sql);

    // Record migration
    const stmt = database.prepare(
      'INSERT INTO migrations (filename) VALUES (?)'
    );
    stmt.run([file]);
    stmt.free();

    // Save after each migration
    saveDatabase();

    console.log(`Migration complete: ${file}`);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

// Auto-save every 5 seconds
setInterval(() => {
  if (db) {
    saveDatabase();
  }
}, 5000);
