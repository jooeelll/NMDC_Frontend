import React, { useState } from 'react';
import { AnchorIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const LoginPage = ({ onLoginSuccess }) => {
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.login(username, password);
      toast.success('Authentication Successful', `Logged in as ${username}`);
      onLoginSuccess(username);
    } catch (err) {
      toast.error('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #060F1E 0%, #0B2545 100%)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(13, 46, 84, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(14, 154, 167, 0.25)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            margin: '0 auto 1rem',
            width: '48px',
            height: '48px',
            background: 'rgba(14, 154, 167, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0E9AA7'
          }}>
            <AnchorIcon size={26} />
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            NMDC Portal Login
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Area of Concern Tracking System
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(6, 15, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(6, 15, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              marginTop: '0.5rem',
              background: '#0E9AA7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s ease'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};