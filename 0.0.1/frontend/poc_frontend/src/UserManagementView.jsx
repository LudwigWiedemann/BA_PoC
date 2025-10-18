import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const API_BASE = 'http://3.122.55.15:4000';

export default function UserManagement() {
    const socket = io('http://'+API_BASE+'}:4000');

    const [userRegistryInput, setUserRegistryInput] = useState('');
    const [registeredUsersList, setRegisteredUsersList] = useState([]);

    const loadUsers = async () => {
        const res = await axios.get(`${API_BASE}/users`);
        setRegisteredUsersList(res.data);
    };

    const handleAddUser = async () => {
        try {
            await axios.post(`${API_BASE}/users`, { username: userRegistryInput }); // or username: username
            await loadUsers();
            toast.success("User " + userRegistryInput + " added successfully.");
            setUserRegistryInput('')

        } catch (err) {
            toast.error(err.response?.data?.error || err.message + " - Backend Offline???");
        }
    };

    const handleDeleteUser = async (uName) => {
        try {
            await axios.delete(`${API_BASE}/users/${uName}`);
            await loadUsers();
            toast.success("User " + uName + " deleted successfully.");

        } catch (err) {
            toast.error(err.response?.data?.error || err.message + " - Backend Offline???");
        }
    };

    const handleCopyUser = async (username) => {
        if (username) {
            await navigator.clipboard.writeText(username);
            toast.success('Token copied to clipboard');
        }
    };


    useEffect(() => {
        loadUsers();
    }, []);


    useEffect(() => {
        socket.on("users-updated", () => {
            loadUsers(); // automatisch reloaden
        });

        return () => socket.off("tokens-updated");
    }, []);

    return (
        <div>
            <h2>User Management</h2>
            <input
                className="input"
                value={userRegistryInput}
                placeholder="Enter new username"
                onChange={e => setUserRegistryInput(e.target.value)}
            />
            <button
                className={"submitButton"}
                onClick={handleAddUser}>Register</button>
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
                        <th style={{ padding: "0.75rem" }}>Username</th>
                        <th style={{ padding: "0.75rem" }}>Created At</th>
                        <th style={{ padding: "0.75rem" }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {registeredUsersList.map((u) => (
                        <tr
                            key={u.username}
                            style={{
                                borderBottom: "1px solid #eee",
                                backgroundColor: u.username === "root" ? "#616567" : "#99999a",
                                transition: "background-color 0.2s ease",
                            }}
                        >
                            <td style={{ padding: "0.75rem" }}>{u.username}</td>
                            <td style={{ padding: "0.75rem" }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                                <button
                                    className={"interactButton"}
                                    onClick={() => handleCopyUser(u.username)}
                                >
                                    Copy
                                </button>
                                {u.username !== "root" && (
                                    <button
                                        className={"deleteButton"}
                                        onClick={() => handleDeleteUser(u.username)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
