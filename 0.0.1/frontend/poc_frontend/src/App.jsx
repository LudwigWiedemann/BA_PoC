import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:4000';

function App() {
    const [username, setUsername] = useState('root');
    const [tokenId, setTokenId] = useState('');
    const [tokenInput, setTokenInput] = useState('');
    const [validation, setValidation] = useState(null);
    const [deletionInput, setDeletionInput] = useState('');
    const [deletionSuccess, setDeletionSuccess] = useState(null);
    const [deletionResponse, setDeletionResponse] = useState(null);
    const [greeting, setGreeting] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_BASE}/login`, { username });
            setTokenId(res.data.tokenId);
            setGreeting(`Hello, ${username}!`);
            setTokenInput(res.data.tokenId);
            setCopySuccess('')
            setValidation(null)
        } catch (err) {
            setTokenId(err.response?.data?.error || err.message + " - Backend Offline???");
        }
    };

    const handleValidate = async () => {
        try {
            const res = await axios.post(`${API_BASE}/validate`, { tokenId: tokenInput });
            setValidation(res.data);
        } catch (err) {
            setValidation({ valid: false, reason: err.response?.data?.reason || err.message + " - Backend Offline???" });
        }
    };

    const handleCopyToken = async () => {
        if (tokenId) {
            await navigator.clipboard.writeText(tokenId);
            setCopySuccess('Token copied ✅');
            setTimeout(() => setCopySuccess(''), 2000); // nach 2 Sekunden ausblenden
        }
    };

    const handleDeleteToken = async () => {
        try {
            const res = await axios.post(`${API_BASE}/delete`, {tokenId: deletionInput});
            setDeletionSuccess(true)
            setDeletionResponse(res.statusText);
            setTimeout(() => setDeletionResponse(''), 2000); // nach 2 Sekunden ausblenden
        } catch (err) {
            setDeletionSuccess(false)
            setDeletionResponse(err.response?.data?.reason || err.message + " - Backend Offline???" );
            setTimeout(() => setDeletionResponse(''), 2000); // nach 2 Sekunden ausblenden
        }
    };

    const handleReset = () => {
        setUsername('root');
        setTokenId('');
        setTokenInput('');
        setValidation(null);
        setDeletionInput('');
        setDeletionSuccess(null);
        setDeletionResponse(null)
        setGreeting('');
        setCopySuccess('')
    };

    return (
        <div style={{ maxWidth: 400, margin: '5rem auto', textAlign: 'center' }}>
            <h1>IdP PoC</h1>
            <h2 style={{ minHeight: '2rem', visibility: greeting ? 'visible' : 'hidden' }}>
                {greeting}
            </h2>
            <div>
                <input
                    className="input"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
            </div>

            <div style={{ marginTop: 20, minHeight: '4rem'}}>
                {tokenId && (
                    <>
                        <p className="textarea"><strong>Access Token:</strong> {tokenId}</p>
                        <div style={{ minHeight: '2.5rem' }}> {/* Platz für den Button */}
                            <button
                                onClick={handleCopyToken}
                                style={{ visibility: tokenId ? 'visible' : 'hidden' }}
                            >
                                Copy Token-ID
                            </button>
                        </div>
                    </>
                )}
            </div>

            <p className="successPopup" style={{ minHeight: '1.5rem', opacity: copySuccess ? 1 : 0 }}>
                {copySuccess}
            </p>

            <div style={{ marginTop: 40 }}>
                <input
                    className="input"
                    placeholder="Paste token"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                />
                <button onClick={handleValidate}>Validate</button>
            </div>

            <div style={{ marginTop: 20, minHeight: '6rem', visibility: validation ? 'visible' : 'hidden' }}>
                {validation && (
                    <>
                        <p className="section">
                            <strong></strong> {validation.valid ? 'Valid ✅' : 'invalid ❌'}
                        </p>
                        {validation.reason && <p>Reason: {validation.reason}</p>}
                        {validation.username && <p>User: {validation.username}</p>}
                        {validation.expiresIn && <p>Expires in: {Math.round(validation.expiresIn / 1000)}s</p>}
                    </>
                )}
            </div>

            <div>
                <input
                    className="input"
                    placeholder="Paste token"
                    value={deletionInput}
                    onChange={e => setDeletionInput(e.target.value)}
                />
                <button onClick={handleDeleteToken}>Delete token</button>
            </div>

            <p className={deletionSuccess? "successPopup" : "errorPopup"} style={{ minHeight: '1.5rem', opacity: deletionResponse ? 1 : 0 }}>
                {deletionResponse}
            </p>


            <div style={{ marginTop: 20 }}>
                <button onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
}

export default App;
