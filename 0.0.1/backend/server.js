import express from 'express';
import cors from 'cors';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { Server } from "socket.io";
import http from "http";


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors:
        { origin: "*"}
    });

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
});

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
    io.emit("tokens-updated");
    return res.json({ tokenId, username, expiry });
});

// ---- TOKEN MANAGEMENT ----
app.post('/token/validate', (req, res) => {
    const { tokenId } = req.body;
    const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId);

    if (!token) {
        console.log('FAILED TOKEN VALIDATION - NOT FOUND: ' + tokenId);
        return res.status(404).json({valid: false, reason: 'Token not found'});
    }

    const now = Date.now();
    if (now > token.expiry) {
        console.log('FAILED TOKEN VALIDATION - EXPIRED: ' + tokenId);
        return res.status(401).json({ valid: false, reason: 'Token expired' });
    }

    console.log('SUCCESSFUL TOKEN VALIDATION: ' + tokenId);
    return res.json({ valid: true, username: token.username, expiresIn: token.expiry - now });
});


app.delete('/token/:tokenId', (req, res) => {
    const { tokenId } = req.params;

    if (!tokenId) {
        console.log('FAILED TOKEN DELETION: TokenId required');
        return res.status(400).json({success: false, error: 'TokenId required'});
    }
    const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId);

    if (!token) {
        console.log('FAILED TOKEN DELETION: Token not found (' + tokenId + ')');
        return res.status(404).json({ success: false, tokenId: tokenId, reason: 'Token not found' });
    }
    db.prepare('DELETE FROM tokens WHERE id = ?').run(tokenId);
    console.log('SUCCESSFUL TOKEN DELETION: ' + tokenId);
    io.emit("tokens-updated");
    return res.json({ success: true, tokenId: tokenId});
})

app.get('/tokens', (req, res) => {
    const tokens = db.prepare('SELECT * FROM tokens').all();
    res.json(tokens);
});


// ---- USER MANAGEMENT ----

app.post('/users', (req, res) => {
    const { username } = req.body;

    if (!username) {
        console.log('FAILED USER REGISTRATION: username required');
        return res.status(400).json({success: false, error: 'Username required'});
    }

    if (username === 'root') {
        console.log('FAILED USER REGISTRATION: cannot overwrite root');
        return res.status(403).json({ error: 'cannot overwrite root' });
    }

    const existingUser = db
        .prepare('SELECT username FROM users WHERE username = ?')
        .get(username);
    if (existingUser) {
        console.log('FAILED USER REGISTRATION: ' + username + 'already exists');
        return res.status(409).json({success: false, error: 'User ' + username + '  already exists'});
    }

    db.prepare('INSERT INTO users (username) VALUES (?)').run(username);
    console.log('SUCCESSFUL USER REGISTRATION: ' + username);
    io.emit("users-updated");
    res.json({ success: true });
});

app.delete('/users/:username', (req, res) => {
    const { username } = req.params;
    const existingUser = db.prepare('SELECT username FROM users WHERE username = ?').get(username);

    if (!existingUser) {
        console.log('FAILED USER DELETION: ' + username);
        return res.status(409).json({success: false, error: 'User ' + username + '  does not exist'});
    }

    db.prepare('DELETE FROM users WHERE username = ?').run(username);
    console.log('SUCCESSFUL DELETION: ' + username);
    io.emit("users-updated");
    return res.json({ success: true, username: username});
})

app.get('/users', (req, res) => {
    const users = db.prepare('SELECT username, createdAt FROM users').all();
    res.json(users);
});


server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
