import React, { useState } from 'react';
import { TrashIcon } from './Icons';

export const DeleteModal = ({ row, headers, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const previewFields = headers.slice(0, 4);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
  };

  return (
    <div className="modal-overlay" id="delete-modal-overlay">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-body" style={{ paddingTop: '1.75rem', textAlign: 'center' }}>
          <div className="delete-icon-wrap">
            <TrashIcon size={24} style={{ color: 'var(--danger-500)' }} />
          </div>
          <div className="delete-modal-title">Delete This Record?</div>
          <div className="delete-modal-subtitle">
            This action cannot be undone. The record will be permanently removed from your dataset.
          </div>
          <div className="delete-modal-preview" style={{ textAlign: 'left' }}>
            {previewFields.map(h => (
              <div key={h} style={{ marginBottom: '.3rem' }}>
                <span style={{ color: 'var(--teal-400)', fontWeight: 600, fontSize: '.75rem' }}>{h}:</span>{' '}
                <span style={{ color: 'var(--slate-300)' }}>{String(row[h] || '—')}</span>
              </div>
            ))}
          </div>
          <div className="delete-modal-footer" style={{ justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-md" onClick={onClose} id="cancel-delete-btn" style={{ flex: 1 }}>
              Cancel
            </button>
            <button className="btn btn-danger btn-md" onClick={handleConfirm} disabled={deleting} style={{ flex: 1 }}>
              {deleting ? 'Deleting…' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};