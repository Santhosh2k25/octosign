import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';
import Register from './pages/Register';
import DocumentUpload from './pages/DocumentUpload';
import DocumentSign from './pages/DocumentSign';
import DocumentView from './pages/DocumentView';
import Documents from './pages/Documents';
import DocumentDetails from './pages/DocumentDetails';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import AuthRequired from './components/AuthRequired';
import Contacts from './pages/Contacts';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route element={<AuthRequired />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetails />} />
            <Route path="/documents/:id/view" element={<DocumentView />} />
            <Route path="/sign/:documentId" element={<DocumentSign />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;