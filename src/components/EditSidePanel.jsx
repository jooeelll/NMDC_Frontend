import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, EditIcon, XIcon, AlertCircleIcon } from './Icons';
import { useToast } from '../context/ToastContext';

const FormField = ({ header, colType, value, onChange, error, isCategorical, categoryValues }) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (colType === 'number') {
      if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return;
    }
    onChange(header, raw);
  };

  if (isCategorical && categoryValues.length > 0) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={`field-${header}`}>
          {header} <span className="type-hint">categorical</span>
        </label>
        <select id={`field-${header}`} className="form-select" value={value || ''} onChange={(e) => onChange(header, e.target.value)}>
          <option value="">— Select —</option>
          {categoryValues.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        {error && <span className="form-error"><AlertCircleIcon size={12} /> {error}</span>}
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={`field-${header}`}>
        {header} {colType !== 'text' && <span className="type-hint">{colType}</span>}
      </label>
      <input
        id={`field-${header}`}
        className={`form-input${error ? ' error' : ''}`}
        type={colType === 'date' ? 'date' : 'text'}
        value={value || ''}
        onChange={handleChange}
        placeholder={colType === 'number' ? 'Numeric value only' : `Enter ${header}`}
        autoComplete="off"
      />
      {error && <span className="form-error"><AlertCircleIcon size={12} /> {error}</span>}
    </div>
  );
};

export const EditSidePanel = ({ mode, doc, rowData, onClose, onSave }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const detectCategorical = (header, rows, colTypes) => {
    if (colTypes[header] !== 'text') return false;
    const uniq = new Set(rows.map(r => String(r[header] || '')).filter(Boolean));
    return uniq.size <= 12 && rows.length > 0;
  };

  const categoryValues = useMemo(() => {
    const cv = {};
    doc.headers.forEach(h => {
      if (detectCategorical(h, doc.rows, doc.colTypes)) {
        cv[h] = [...new Set(doc.rows.map(r => String(r[h] || '')).filter(Boolean))].sort();
      }
    });
    return cv;
  }, [doc]);

  useEffect(() => {
    if (mode === 'edit' && rowData) {
      const d = {};
      doc.headers.forEach(h => { d[h] = rowData[h] !== undefined ? String(rowData[h]) : ''; });
      setFormData(d);
    } else {
      const d = {};
      doc.headers.forEach(h => { d[h] = ''; });
      setFormData(d);
    }
    setErrors({});
  }, [mode, rowData, doc]);

  const handleChange = (header, val) => {
    setFormData(prev => ({ ...prev, [header]: val }));
    if (errors[header]) setErrors(prev => { const n = { ...prev }; delete n[header]; return n; });
  };

  const validate = () => {
    const errs = {};
    doc.headers.forEach(h => {
      const val = formData[h];
      if (doc.colTypes[h] === 'number' && val !== '' && isNaN(Number(val))) {
        errs[h] = 'Invalid format. Only numerical values allowed.';
      }
    });
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Validation Failed', 'Please fix the errors before saving.');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
      toast.success(mode === 'edit' ? 'Record Updated' : 'Record Added', 'Changes processed successfully.');
      onClose();
    } catch (err) {
      toast.error('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const isAddMode = mode === 'add';

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose} />
      <aside className="side-panel" id="edit-side-panel">
        <div className="side-panel-header">
          <div>
            <div className="side-panel-title">
              <div className="modal-title-icon" style={{ background: 'rgba(14,154,167,.15)', color: 'var(--teal-400)' }}>
                {isAddMode ? <PlusIcon size={16} /> : <EditIcon size={16} />}
              </div>
              {isAddMode ? 'Add New Record' : 'Edit Record'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={16} /></button>
        </div>
        <div className="side-panel-body">
          <div className="form-grid single-col">
            {doc.headers.map(h => (
              <FormField
                key={h}
                header={h}
                colType={doc.colTypes[h]}
                value={formData[h]}
                onChange={handleChange}
                error={errors[h]}
                isCategorical={detectCategorical(h, doc.rows, doc.colTypes)}
                categoryValues={categoryValues[h] || []}
              />
            ))}
          </div>
        </div>
        <div className="side-panel-footer">
          <button className="btn btn-secondary btn-md" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-md" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </aside>
    </>
  );
};