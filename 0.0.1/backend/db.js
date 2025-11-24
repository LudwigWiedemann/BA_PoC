// db.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname für ES Modules bauen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Datenverzeichnis relativ zu dieser Datei: ./data
const dataDir = path.join(__dirname, 'data');


// Ordner anlegen, falls er nicht existiert
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Pfad zur SQLite-Datei
const dbPath = path.join(dataDir, 'data.db');
console.log('📦 Using SQLite DB at:', dbPath);


// DB öffnen
const db = new Database(dbPath);


// Initiales Setup
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    username TEXT,
    expiry INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const existingRoot = db.prepare('SELECT username FROM users WHERE username = ?').get('root');

if (!existingRoot) {
    db.prepare('INSERT INTO users (username) VALUES (?)').run('root');
    console.log('✅ Default user "root" created.');
} else {
    console.log('ℹ️ Default user "root" already exists.');
}

export default db;