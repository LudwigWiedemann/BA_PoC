import { useState } from 'react';
import axios from 'axios';
import './App.css';
import toast from 'react-hot-toast'

const API_BASE = 'http://localhost:4000';

export default function TokenManagement() {

    const [deletionInput, setDeletionInput] = useState('');

    const handleDeleteToken = async () => {
        try {
            await axios.post(`${API_BASE}/delete`, {tokenId: deletionInput});
            toast.success('Token deleted: ' + deletionInput);
        } catch (err) {
            toast.error(err.response?.data?.reason || err.message + " - Backend Offline???" )
        }
    };
    return (
    <div>
        <input
            className="input"
            placeholder="Paste token"
            value={deletionInput}
            onChange={e => setDeletionInput(e.target.value)}
        />
        <button onClick={handleDeleteToken}>Delete token</button>
    </div>
    );
}
