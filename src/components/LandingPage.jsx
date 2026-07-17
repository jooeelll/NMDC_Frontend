import React, { useState, useRef } from 'react';
import { UploadIcon, FileSpreadIcon, TrashIcon, ChevronRightIcon, PlusIcon } from './Icons';
import { CreateDocumentModal } from './CreateDocumentModal';
import { dataService } from '../services/dataService';
import { useToast } from '../context/ToastContext';

export const LandingPage = ({ documents, onOpenDoc, onAddDoc, onDeleteDoc }) => {
  const toast = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [sheetName,setSheetName] = useState(''); 
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['csv', 'xlsx', 'xls'].includes(ext);
    });

    if (validFiles.length === 0) {
      toast.error('Invalid File', 'Please upload a CSV or Excel spreadsheet.');
      return;
    }

    setParsing(true);
    for (const file of validFiles) {
      try {
        const { headers, rows, colTypes } = await dataService.parseFile(file);
        const doc = {
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          headers,
          rows,
          colTypes,
        };
        onAddDoc(doc);
        toast.success('File Imported', `"${file.name}" processed successfully.`);
      } catch (err) {
        toast.error('Parse Error', err.message);
      }
    }
    setParsing(false);
  };

  return (
    <main className="main-content">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Active Documents</div>
          <div className="stat-card-value teal">{documents.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Operational Mode</div>
          <div className="stat-card-value">Static Build</div>
        </div>
      </div>

      <div className="upload-options">

      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        onDrop={(e) => { 
          e.preventDefault(); 
          setDragOver(false); 
          handleFiles(e.dataTransfer.files); 
        }}
        onDragOver={(e) => { 
          e.preventDefault(); 
          setDragOver(true); 
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !parsing && fileInputRef.current?.click()}
      >

        <input 
          ref={fileInputRef}
          className="upload-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="upload-icon-wrap">
          <UploadIcon size={32}/>
        </div>

        <div className="upload-title">
          Import Spreadsheet
        </div>

        <div className="upload-subtitle">
          Supports CSV, XLSX, and XLS files
        </div>

      </div>


      <div 
        className="manual-create-section"
        onClick={() => setShowManualCreate(true)}
      >

        <div className="upload-icon-wrap">
          <PlusIcon size={32}/>
        </div>

        <div className="upload-title">
          Create Manually
        </div>

        <div className="upload-subtitle">
          Create a new sheet and add data yourself
        </div>

      </div>


    </div>

      <div className="doc-grid">
        {documents.map(doc => (
          <div key={doc.id} className="doc-card" onClick={() => onOpenDoc(doc)}>
            <div className="doc-card-header">
              <div className="doc-card-icon xlsx"><FileSpreadIcon size={22} /></div>
              <button className="doc-card-menu-btn" onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }}>
                <TrashIcon size={15} />
              </button>
            </div>
            <div className="doc-card-filename">{doc.name}</div>
            <div className="doc-card-footer">
              <span className="doc-card-rows">{doc.rows.length} rows</span>
              <span className="open-btn">Open Workspace <ChevronRightIcon size={13} /></span>
            </div>
          </div>
        ))}
      </div>

        {showManualCreate && (

      <CreateDocumentModal

        onClose={() =>
          setShowManualCreate(false)
        }


        onCreate={(doc)=>{

          onAddDoc(doc);

          setShowManualCreate(false);

          toast.success(
            "Sheet Created",
            "Manual sheet created successfully."
          );

        }}

      />

    )}
    </main>
  );
};