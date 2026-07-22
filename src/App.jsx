import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
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
  const [activeDoc, setActiveDoc] = useState(null);

  const isAuthenticated = Boolean(localStorage.getItem('access_token'));

  // FETCH CONCERNS FROM DJANGO BACKEND
  const loadConcerns = async () => {
    setLoading(true);
    try {
      // GET /api/area_of_concerns/ using JWT Bearer Token
      const data = await api.fetchWithAuth('/area_of_concerns/');
      console.log('Fetched user concerns from Django:', data);
      setConcerns(data);
    } catch (error) {
      console.error('Failed to load concerns:', error.message);
      toast.error('Data Fetch Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger API fetch as soon as user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConcerns();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    api.logout();
    setUsername(null);
    setConcerns([]);
    setActiveDoc(null);
  };

  // ➕ ADD THIS HANDLER FUNCTION
  const handleAddDoc = async (newDoc) => {
    console.log('Data generated from Excel:', newDoc);
    try {
      // POST the newly imported document/concern to Django backend
      await api.fetchWithAuth('/area_of_concerns/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
      toast.success('Document Created', 'Excel data imported successfully!');
      loadConcerns(); // Reload concerns from backend
    } catch (error) {
      console.error('Failed to create document:', error.message);
      toast.error('Save Error', error.message);
    }
  };

  // Guard: If not logged in, show Login Screen
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={(user) => setUsername(user)} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem', background: '#0B2545', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="topbar-brand" onClick={() => setActiveDoc(null)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon" style={{ color: '#0E9AA7' }}><AnchorIcon size={22} /></div>
          <div>
            <div className="brand-name" style={{ color: '#FFF', fontWeight: 700 }}>NMDC DocCenter</div>
            <div className="brand-tagline" style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Area of Concern System</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
            User: <strong style={{ color: '#0E9AA7' }}>{username}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.4rem 0.9rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: '#F87171',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
          Loading user concerns from backend...
        </div>
      ) : activeDoc ? (
        <WorkspacePage
          doc={activeDoc}
          onBack={() => setActiveDoc(null)}
          onUpdateDoc={(updated) => setActiveDoc(updated)}
        />
      ) : (
        <LandingPage
          documents={concerns}
          onOpenDoc={setActiveDoc}
          onRefreshData={loadConcerns}
          onAddDoc={handleAddDoc}
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