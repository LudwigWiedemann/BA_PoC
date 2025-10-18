import {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';
import toast from 'react-hot-toast'

const API_BASE = 'http://3.122.55.15:4000';

export default function TokenManagement() {

    const [deletionInput, setDeletionInput] = useState('');
    const [registeredTokensList, setRegisteredTokensList] = useState([]);
    const [timeNow, setTimeNow] = useState(Date.now());


    const handleDeleteTokenViaInput = async () => {
            if (deletionInput) {
                try {
                    await axios.delete(`${API_BASE}/token/${deletionInput}`);
                    loadTokens();
                    toast.success('Token deleted: ' + deletionInput);
                } catch (err) {
                    toast.error(err.response?.data?.reason || err.message + " - Backend Offline???")
                }
            } else {
                toast.error('Token-ID required');
            }
        };

    const handleDeleteTokenViaButton = async (tokenId) => {
        try {
            await axios.delete(`${API_BASE}/token/${tokenId}`);
            loadTokens();
            toast.success('Token deleted: ' + deletionInput);
        } catch (err) {
            toast.error(err.response?.data?.reason || err.message + " - Backend Offline???")
        }

    };

    const handleCopyToken = async (tokenId) => {
        if (tokenId) {
            await navigator.clipboard.writeText(tokenId);
            toast.success('Token copied to clipboard');
        }
    };

    const loadTokens = async () => {
        const res = await axios.get(`${API_BASE}/tokens`);
        setRegisteredTokensList(res.data);
    };


    useEffect(() => {
        loadTokens();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setTimeNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2>Token Management</h2>
            <input
                className="input"
                placeholder="Paste token"
                value={deletionInput}
                onChange={e => setDeletionInput(e.target.value)}
            />
            <button
                className={"deleteButton"}
                onClick={handleDeleteTokenViaInput}>Delete token</button>
            <div
                style={{
                    width: "100%",
                    minWidth: "50rem",
                    margin: "0 auto",
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
            >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#222", color: "white" }}>
                    <tr>
                        <th style={{ padding: "0.75rem" }}>ID</th>
                        <th style={{ padding: "0.75rem" }}>Username</th>
                        <th style={{ padding: "0.75rem" }}>Expiry</th>
                        <th style={{ padding: "0.75rem" }}>Created At</th>
                        <th style={{ padding: "0.75rem" }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {registeredTokensList.map((t) => (
                        <tr
                            key={t.id}
                            style={{
                                borderBottom: "1px solid #eee",
                                backgroundColor:
                                    new Date(t.expiry) <= timeNow
                                        ? "#8b0000" // abgelaufen (rot)
                                        : "#99999a", // aktiv
                                transition: "background-color 0.5s ease",
                            }}
                        >
                            <td style={{ padding: "0.75rem" }}>{t.id}</td>
                            <td style={{ padding: "0.75rem" }}>{t.username}</td>
                            <td style={{ padding: "0.75rem" }}>
                                {t.expiry
                                    ? (() => {
                                        const remaining = Math.round((new Date(t.expiry) - timeNow) / 1000);
                                        return remaining > 0 ? `${remaining}s` : "expired";
                                    })()
                                    : "-"}
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                                {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                                <button
                                    className={"interactButton"}
                                    onClick={() => handleCopyToken(t.id)}
                                >
                                    Copy
                                </button>

                                <button
                                    className={"deleteButton"}
                                    onClick={() => handleDeleteTokenViaButton(t.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>


    );
}
