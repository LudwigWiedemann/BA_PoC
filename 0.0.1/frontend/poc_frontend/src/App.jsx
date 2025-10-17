import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginView from './LoginView';
import UserManagement from './UserManagementView';
import {Toaster} from "react-hot-toast";

function App() {
    return (
        <Router>
            <Toaster position="top-center" reverseOrder={false} />
            <nav style={{ marginBottom: '1rem' }}>
                <Link to="/">Login</Link> | <Link to="/users">User Management</Link>
            </nav>

            <Routes>
                <Route path="/" element={<LoginView />} />
                <Route path="/users" element={<UserManagement />} />
            </Routes>
        </Router>
    );
}

export default App;
