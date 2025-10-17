import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginView from './LoginView';
import TokenManagement from "./TokenManagementView";
import UserManagement from './UserManagementView';
import {Toaster} from "react-hot-toast";

function App() {
    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(30, 30, 30, 0.85)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                padding: '1rem',
                textAlign: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                zIndex: 1000,
            }}
            >
                <Link to={"/token"}>Token Management</Link> | <Link to="/">Login</Link> | <Link to="/users">User Management</Link>
            </nav>

            <Routes>
                <Route path="/" element={<LoginView />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/token" element={<TokenManagement />} />
            </Routes>
        </Router>
    );
}

export default App;
