import { useState } from 'react';
import axios from 'axios';
import './App.css';
import toast from 'react-hot-toast'

// const API_BASE = 'http://18.192.38.120:4000';
const API_BASE = import.meta.env.VITE_API_BASE;

export default function LoginView() {
    const [usernameInput, setUsernameInput] = useState('root');
    const [accessToken, setAccessToken] = useState('');
    const [validationInput, setValidationInput] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [greeting, setGreeting] = useState('');

    const handleLogin = async () => {
        console.log(API_BASE)
        try {
            const res = await axios.post(`${API_BASE}/login`, { username: usernameInput });
            setAccessToken(res.data.tokenId);
            setGreeting(`Hello, ${usernameInput}!`);
            setValidationInput(res.data.tokenId);
            setValidationResult(null)
        } catch (err) {
            toast.error(err.response?.data?.error || err.message + " - Backend Offline???");
        }
    };

    const handleValidate = async () => {
        try {
            const res = await axios.post(`${API_BASE}/token/validate`, { tokenId: validationInput });
            setValidationResult(res.data);
        } catch (err) {
            setValidationResult({ valid: false, reason: err.response?.data?.reason || err.message + " - Backend Offline???" });
        }
    };

    const handleCopyToken = async () => {
        if (accessToken) {
            await navigator.clipboard.writeText(accessToken);
            toast.success('Token copied to clipboard');
        }
    };


    const handleLogout = () => {
        setUsernameInput('root');
        setAccessToken('');
        setValidationInput('');
        setValidationResult(null);
        setGreeting('');
    };

    return (
        <div style={{ maxWidth: 400, margin: '5rem auto', textAlign: 'center' }}>
            <h1>IdP PoC III</h1>
            <h2 style={{ minHeight: '5rem', visibility: greeting ? 'visible' : 'hidden' }}>
                {greeting}
            </h2>
            <div>
                <input
                    className="input"
                    placeholder="Username"
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                />
                <button
                    className={"submitButton"}
                    onClick={handleLogin}>Login</button>
            </div>

            <div style={{ marginTop: 20, minHeight: '8rem', visibility: accessToken ? 'visible' : 'hidden'}}>
                {accessToken && (
                    <>
                        <p className="textarea"><strong>Access Token:</strong> {accessToken}</p>
                        <div style={{ minHeight: '3rem' }}> {/* Platz für den Button */}
                            <button
                                className={"interactButton"}
                                onClick={handleCopyToken}
                            >
                                Copy Token-ID
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div style={{ marginTop: 40 }}>
                <input
                    className="input"
                    placeholder="Paste token"
                    value={validationInput}
                    onChange={e => setValidationInput(e.target.value)}
                />
                <button
                    className={"interactButton"}
                    onClick={handleValidate}>Validate</button>
            </div>

            <div style={{ marginTop: 20, minHeight: '10rem', visibility: validationResult ? 'visible' : 'hidden' }}>
                {validationResult && (
                    <>
                        <p className="section">
                            <strong></strong> {validationResult.valid ? 'Valid ✅' : 'invalid ❌'}
                        </p>
                        {validationResult.reason && <p>Reason: {validationResult.reason}</p>}
                        {validationResult.username && <p>User: {validationResult.username}</p>}
                        {validationResult.expiresIn && <p>Expires in: {Math.round(validationResult.expiresIn / 1000)}s</p>}
                    </>
                )}
            </div>




            <div style={{ marginTop: 20 }}>
                <button
                    className={"deleteButton"}
                    onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}
