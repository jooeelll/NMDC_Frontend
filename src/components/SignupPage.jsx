import React, { useState } from 'react';
import { AnchorIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const SignupPage = ({ onSignupSuccess, onSwitchToLogin }) => {
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.register(username, email, password);
      toast.success('Account Created', `You can now sign in as ${username}`);
      onSignupSuccess(username);
    } catch (err) {
      toast.error('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(6, 15, 30, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    color: '#CBD5E1',
    fontSize: '0.85rem',
    marginBottom: '0.4rem',
    fontWeight: 500
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
            Create Account
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Area of Concern Tracking System
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              style={inputStyle}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <span
            onClick={onSwitchToLogin}
            style={{ color: '#0E9AA7', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};