// db.js
import pkg from 'pg';
const { Pool } = pkg;



const pool = new Pool({
    user: 'root',
    host: process.env.DB_HOST || 'cockroachdb.idp.svc.cluster.local',
    database: process.env.DB_NAME || 'idp',
    port: 26257,
    ssl: false,
});

// Datenbank anlegen
await pool.query(`CREATE DATABASE IF NOT EXISTS idp`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    username STRING PRIMARY KEY,
    createdAt TIMESTAMPTZ DEFAULT now()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS tokens (
    id STRING PRIMARY KEY,
    username STRING REFERENCES users(username),
    expiry BIGINT,
    createdAt TIMESTAMPTZ DEFAULT now()
  )
`);

const { rows } = await pool.query('SELECT username FROM users WHERE username = $1', ['root']);
if (rows.length === 0) {
    await pool.query('INSERT INTO users(username) VALUES($1)', ['root']);
    console.log('✅ Default user "root" created.');
} else {
    console.log('ℹ️ Default user "root" already exists.');
}

export default pool;