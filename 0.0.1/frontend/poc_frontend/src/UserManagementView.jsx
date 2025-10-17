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
            const res = await axios.post(`${API_BASE}/users`, { username: userRegistryInput }); // or username: username
            // TODO UI: display result to the user nicely :)
            console.log(res);
            loadUsers();
            toast.success("User added successfully.");

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
                value={userRegistryInput}
                placeholder="Enter new username"
                onChange={e => setUserRegistryInput(e.target.value)}
            />
            <button onClick={handleAddUser}>Register</button>
            <ul>
                {registeredUsersList.map(u => <li key={u.username}>{u.username}</li>)}
            </ul>
        </div>
    );
}
