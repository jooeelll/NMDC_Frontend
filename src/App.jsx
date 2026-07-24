import React, { useEffect, useState } from 'react';
import { WorkspacePage } from './components/WorkspacePage';
import { LoginPage } from './components/LoginPage';
import { ToastProvider, useToast } from './context/ToastContext';
import { AnchorIcon } from './components/Icons';
import { api } from './services/api';
import './index.css';

function MainApp() {
  const toast = useToast();

  const [username, setUsername] = useState(() => localStorage.getItem('username'));
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Managed auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    Boolean(localStorage.getItem('access_token'))
  );

  const handleLogout = () => {
    api.logout();
    setUsername(null);
    setConcerns([]);
    setIsAuthenticated(false);
  };

  const loadConcerns = async () => {
    setLoading(true);
    try {
      const data = await api.fetchWithAuth('/area_of_concerns/');
      setConcerns(data);
      return true;
    } catch (error) {
      // If backend returns 401/403 or invalid token, terminate session
      toast.error("Session Expired", "Your authentication token is invalid or expired. Please sign in again.");
      handleLogout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Authenticate token against backend by attempting to fetch data
        await loadConcerns();
      } else {
        setIsAuthenticated(false);
      }
      setIsVerifying(false);
    };

    verifySession();
  }, []);

  const handleLoginSuccess = (user) => {
    setUsername(user);
    setIsAuthenticated(true);
    loadConcerns();
  };

  // 1. Initial Verification Spinner
  if (isVerifying) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#fff' }}>
        <div>
          <h3>Verifying Authentication Session...</h3>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Show Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 3. Authenticated -> Show Dashboard App Shell
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <AnchorIcon size={22} />
          <div>
            <div className="brand-name">
              NMDC DocCenter
            </div>
            <div className="brand-tagline">
              Area of Concern System
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="topbar-badge">
            User: {username}
          </div>

          <button
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Workspace...</div>
      ) : (
        <WorkspacePage
          concerns={concerns}
          setConcerns={setConcerns}
          refreshConcerns={loadConcerns}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}