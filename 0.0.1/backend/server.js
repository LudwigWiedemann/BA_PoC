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
app.post('/login', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        console.log('FAILED LOGIN: ' + username);
        return res.status(400).json({error: 'Username required'});
    }
    try {
        // Check if user exists
        const { rows } = await db.query('SELECT username FROM users WHERE username = $1', [username]);
        const user = rows[0];

        if (!user) {
            console.log('FAILED LOGIN: ' + username);
            return res.status(401).json({error: 'User is not registered'});
        }

        const tokenId = uuidv4();
        const expiry = Date.now() + TOKEN_TTL_MS;

        // Insert token into CockroachDB
        await db.query(
            'INSERT INTO tokens (id, username, expiry) VALUES ($1, $2, $3)',
            [tokenId, username, expiry]
        );
        console.log('SUCCESSFUL LOGIN: ' + username + ", " + tokenId);
        io.emit("tokens-updated");
        return res.json({ tokenId, username, expiry });
    } catch (err) {
        console.error('ERROR LOGIN:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ---- TOKEN MANAGEMENT ----
app.post('/token/validate', async (req, res) => {
    const { tokenId } = req.body;
    if (!tokenId) {
        console.log('FAILED TOKEN VALIDATION: tokenId required');
        return res.status(400).json({ valid: false, reason: 'TokenId required' });
    }
    try {
        // Query token from CockroachDB
        const { rows } = await db.query('SELECT * FROM tokens WHERE id = $1', [tokenId]);
        const token = rows[0];

        if (!token) {
            console.log('FAILED TOKEN VALIDATION - NOT FOUND: ' + tokenId);
            return res.status(404).json({valid: false, reason: 'Token not found'});
        }

        const now = Date.now();
        if (now > parseInt(token.expiry)) {
            console.log('FAILED TOKEN VALIDATION - EXPIRED: ' + tokenId);
            return res.status(401).json({ valid: false, reason: 'Token expired' });
        }

        console.log('SUCCESSFUL TOKEN VALIDATION: ' + tokenId);
        return res.json({
            valid: true,
            username: token.username,
            expiresIn: token.expiry - now
        });
    } catch (err) {
        console.error('ERROR TOKEN VALIDATION:', err);
        return res.status(500).json({ valid: false, reason: 'Internal server error' });
    }
});


app.delete('/token/:tokenId', async (req, res) => {
    const { tokenId } = req.params;

    if (!tokenId) {
        console.log('FAILED TOKEN DELETION: TokenId required');
        return res.status(400).json({success: false, error: 'TokenId required'});
    }

    try {
        // Prüfen, ob Token existiert
        const { rows } = await db.query('SELECT * FROM tokens WHERE id = $1', [tokenId]);
        const token = rows[0];

        if (!token) {
            console.log('FAILED TOKEN DELETION: Token not found (' + tokenId + ')');
            return res.status(404).json({ success: false, tokenId: tokenId, reason: 'Token not found' });
        }

        // Token löschen
        await db.query('DELETE FROM tokens WHERE id = $1', [tokenId]);

        console.log('SUCCESSFUL TOKEN DELETION: ' + tokenId);
        io.emit("tokens-updated");
        return res.json({ success: true, tokenId: tokenId});
    } catch (err) {
        console.error('ERROR TOKEN DELETION:', err);
        return res.status(500).json({ success: false, reason: 'Internal server error' });
    }
})

app.get('/tokens', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM tokens');
        res.json(rows);
    } catch (err) {
        console.error('ERROR FETCHING TOKENS:', err);
        res.status(500).json({ success: false, reason: 'Internal server error' });
    }
});


// ---- USER MANAGEMENT ----

app.post('/users', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        console.log('FAILED USER REGISTRATION: username required');
        return res.status(400).json({success: false, error: 'Username required'});
    }

    if (username === 'root') {
        console.log('FAILED USER REGISTRATION: cannot overwrite root');
        return res.status(403).json({ error: 'cannot overwrite root' });
    }

    try {
        const { rows: existingUsers } = await db.query(
            'SELECT username FROM users WHERE username = $1',
            [username]
        );

        if (existingUsers.length > 0) {
            console.log(`FAILED USER REGISTRATION: ${username} already exists`);
            return res.status(409).json({ success: false, error: `User ${username} already exists` });
        }

        await db.query(
            'INSERT INTO users (username) VALUES ($1)',
            [username]
        );

        console.log('SUCCESSFUL USER REGISTRATION: ' + username);
        io.emit("users-updated");
        res.json({ success: true });
    } catch (err) {
        console.error('ERROR USER REGISTRATION:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.delete('/users/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const { rows: existingUsers } = await db.query(
            'SELECT username FROM users WHERE username = $1',
            [username]
        );

        if (existingUsers.length === 0) {
            console.log('FAILED USER DELETION: ' + username);
            return res.status(409).json({ success: false, error: `User ${username} does not exist` });
        }

        await db.query(
            'DELETE FROM users WHERE username = $1',
            [username]
        );

        console.log('SUCCESSFUL DELETION: ' + username);
        io.emit("users-updated");
        return res.json({ success: true, username: username});
    } catch (err) {
        console.error('ERROR USER DELETION:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
})

app.get('/users', async (req, res) => {
    try {
        const { rows: users } = await db.query(
            'SELECT username, createdAt FROM users'
        );
        res.json(users);
    } catch (err) {
        console.error('ERROR GET USERS:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
