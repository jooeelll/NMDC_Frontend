import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircleIcon, XCircleIcon, InfoIcon, AlertTriangleIcon } from '../components/Icons';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, duration);
  }, []);

  const toast = useMemo(() => ({
    success: (title, msg) => addToast('success', title, msg),
    error:   (title, msg) => addToast('error',   title, msg),
    info:    (title, msg) => addToast('info',     title, msg),
    warning: (title, msg) => addToast('warning',  title, msg),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}${t.exiting ? ' exiting' : ''}`}>
            <div className="toast-icon">
              {t.type === 'success' && <CheckCircleIcon size={16} />}
              {t.type === 'error'   && <XCircleIcon size={16} />}
              {t.type === 'info'    && <InfoIcon size={16} />}
              {t.type === 'warning' && <AlertTriangleIcon size={16} />}
            </div>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);