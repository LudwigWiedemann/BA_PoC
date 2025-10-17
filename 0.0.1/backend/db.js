// db.js
import Database from 'better-sqlite3';
const db = new Database('data.db');

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
