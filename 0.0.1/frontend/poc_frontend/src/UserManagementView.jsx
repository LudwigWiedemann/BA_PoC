import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";

const API_BASE = 'http://localhost:4000';

export default function UserManagement() {
    const [userRegistryInput, setUserRegistryInput] = useState('');
    const [registeredUsersList, setRegisteredUsersList] = useState([]);

    const loadUsers = async () => {
        const res = await axios.get(`${API_BASE}/users`);
        setRegisteredUsersList(res.data);
    };

    const handleAddUser = async () => {
        try {
            await axios.post(`${API_BASE}/users`, { username: userRegistryInput }); // or username: username
            loadUsers();
            toast.success("User " + userRegistryInput + " added successfully.");
            setUserRegistryInput('')

        } catch (err) {
            toast.error(err.response?.data?.error || err.message + " - Backend Offline???");
        }
    };

    const handleDeleteUser = async (uName) => {
        try {
            await axios.post(`${API_BASE}/users/delete`, { username: uName });
            loadUsers();
            toast.success("User " + uName + " deleted successfully.");

        } catch (err) {
            toast.error(err.response?.data?.error || err.message + " - Backend Offline???");
        }
    };

    useEffect(() => {
        loadUsers();
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
            <button onClick={handleAddUser}>Register</button>
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
                                backgroundColor: u.username === "root" ? "#a840dc" : "#3582dc",
                                transition: "background-color 0.2s ease",
                            }}
                        >
                            <td style={{ padding: "0.75rem" }}>{u.username}</td>
                            <td style={{ padding: "0.75rem" }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                                {u.username !== "root" && (
                                    <button
                                        onClick={() => handleDeleteUser(u.username)}
                                        style={{
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "0.3rem 0.6rem",
                                            cursor: "pointer",
                                        }}
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
