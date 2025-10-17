import express from 'express';
import cors from 'cors';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const TOKEN_TTL_MS = 60 * 1000; // token valid for 1 minute

// ---- LOGIN ----
app.post('/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        console.log('FAILED LOGIN: ' + username);
        return res.status(400).json({error: 'Username required'});
    }
    const user = db.prepare('SELECT username FROM users WHERE username = ?').get(username);
    if (!user) {
        console.log('FAILED LOGIN: ' + username);
        return res.status(401).json({error: 'User is not registered'});
    }

    const tokenId = uuidv4();
    const expiry = Date.now() + TOKEN_TTL_MS;

    db.prepare('INSERT INTO tokens (id, username, expiry) VALUES (?, ?, ?)').run(tokenId, username, expiry);
    // tokenStore.set(tokenId, { username, expiry });
    console.log('SUCCESSFUL LOGIN: ' + username + ", " + tokenId);

    return res.json({ tokenId, username, expiry });
});

// ---- TOKEN MANAGEMENT ----
app.post('/validate', (req, res) => {
    const { tokenId } = req.body;
    const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId);

    if (!token) {
        console.log('FAILED VALIDATION - NOT FOUND: ' + tokenId);
        return res.status(404).json({valid: false, reason: 'Token not found'});
    }

    const now = Date.now();
    if (now > token.expiry) {
        console.log('FAILED VALIDATION - EXPIRED: ' + tokenId);
        return res.status(401).json({ valid: false, reason: 'Token expired' });
    }

    console.log('SUCCESSFUL VALIDATION: ' + tokenId);
    return res.json({ valid: true, username: token.username, expiresIn: token.expiry - now });
});


app.post('/delete', (req, res) => {
    const { tokenId } = req.body;
    const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId);

    if (!token) {
        console.log('FAILED DELETION: ' + tokenId);
        return res.status(404).json({ success: false, tokenId: tokenId, reason: 'Token not found' });
    }
    db.prepare('DELETE FROM tokens WHERE id = ?').run(tokenId);
    console.log('SUCCESSFUL DELETION: ' + tokenId);
    return res.json({ success: true, tokenId: tokenId});
})


// ---- USER MANAGEMENT ----

app.post('/users', (req, res) => {
    const { username } = req.body;

    if (!username) {
        console.log('FAILED REGISTRATION: ' + username);
        return res.status(400).json({success: false, error: 'Username required'});
    }

    if (username === 'root') {
        return res.status(403).json({ error: 'User "root" cannot be modified.' });
    }

    const existingUser = db
        .prepare('SELECT username FROM users WHERE username = ?')
        .get(username);
    if (existingUser) {
        return res.status(409).json({success: false, error: 'User ' + username + '  already exists'});
    }

    db.prepare('INSERT INTO users (username) VALUES (?)').run(username);
    res.json({ success: true });
});

app.get('/users', (req, res) => {
    const users = db.prepare('SELECT username, createdAt FROM users').all();
    res.json(users);
});


app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
