import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { WorkspacePage } from './components/WorkspacePage';
import { ToastProvider } from './context/ToastContext';
import { AnchorIcon } from './components/Icons';
import './index.css';

const initialDoc = {
  id: 'default',
  name: 'NMDC_Vessel_Projects_2024.csv',
  size: 4096,
  uploadedAt: new Date().toISOString(),
  headers: ['Vessel Name', 'Area', 'Status', 'Cost (AED)'],
  colTypes: { 'Vessel Name': 'text', 'Area': 'text', 'Status': 'text', 'Cost (AED)': 'number' },
  rows: [
    { __id: '1', 'Vessel Name': 'Al Samha', 'Area': 'Abu Dhabi', 'Status': 'On Track', 'Cost (AED)': '1200000' },
    { __id: '2', 'Vessel Name': 'Dalma', 'Area': 'Dubai', 'Status': 'Delayed', 'Cost (AED)': '450000' }
  ]
};

function App() {
  const [documents, setDocuments] = useState([initialDoc]);
  const [activeDoc, setActiveDoc] = useState(null);

  return (
    <ToastProvider>
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-brand" onClick={() => setActiveDoc(null)}>
            <div className="brand-icon"><AnchorIcon size={20} /></div>
            <div>
              <div className="brand-name">NMDC DocCenter</div>
              <div className="brand-tagline">Marine Engineering Operations</div>
            </div>
          </div>
        </header>

        {activeDoc ? (
          <WorkspacePage
            doc={activeDoc}
            onBack={() => setActiveDoc(null)}
            onUpdateDoc={(updated) => {
              setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
              setActiveDoc(updated);
            }}
          />
        ) : (
          <LandingPage
            documents={documents}
            onOpenDoc={setActiveDoc}
            onAddDoc={(doc) => setDocuments(prev => [doc, ...prev])}
            onDeleteDoc={(id) => setDocuments(prev => prev.filter(d => d.id !== id))}
          />
        )}
      </div>
    </ToastProvider>
  );
}

export default App;