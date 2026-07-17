import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, FileSpreadIcon, PlusIcon, SearchIcon, EditIcon, TrashIcon } from './Icons';
import { EditSidePanel } from './EditSidePanel';
import { DeleteModal } from './DeleteModal';
import { dataService } from '../services/dataService';
import { useToast } from '../context/ToastContext';

export const WorkspacePage = ({ doc, onBack, onUpdateDoc }) => {
  const toast = useToast();
  const [rows, setRows] = useState(doc.rows);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sidePanel, setSidePanel] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const processed = useMemo(() => {
    let data = [...rows];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => doc.headers.some(h => String(r[h] || '').toLowerCase().includes(q)));
    }
    if (sortCol) {
      data.sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return data;
  }, [rows, search, sortCol, sortDir, doc]);

  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  const handleAdd = async (formData) => {
    const newRow = await dataService.addRow(doc.id, formData);
    const updated = [...rows, newRow];
    setRows(updated);
    onUpdateDoc({ ...doc, rows: updated });
  };

  const handleEdit = async (formData) => {
    const rowId = sidePanel.row.__id;
    const updatedRow = await dataService.updateRow(doc.id, rowId, { ...formData, __id: rowId });
    const updated = rows.map(r => r.__id === rowId ? updatedRow : r);
    setRows(updated);
    onUpdateDoc({ ...doc, rows: updated });
  };

  const handleDelete = async () => {
    const rowId = deleteTarget.__id;
    const updated = rows.filter(r => r.__id !== rowId);
    setRows(updated);
    onUpdateDoc({ ...doc, rows: updated });
    setDeleteTarget(null);
    toast.success('Deleted', 'Record removed.');
  };

  return (
    <div className="app-shell">
      <div className="workspace-header">
        <button className="workspace-back-btn" onClick={onBack}><ArrowLeftIcon size={14} /> Back</button>
        <div className="workspace-title"><FileSpreadIcon size={18} /> {doc.name}</div>
        <div className="workspace-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setSidePanel({ mode: 'add' })}><PlusIcon size={14} /> Add Row</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <SearchIcon size={15} />
          <input className="search-input" placeholder="Filter sheet data..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card" style={{ margin: '2rem' }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {doc.headers.map(h => <th key={h}>{h}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(row => (
                <tr key={row.__id}>
                  {doc.headers.map(h => <td key={h}>{String(row[h] || '')}</td>)}
                  <td className="actions-col">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSidePanel({ mode: 'edit', row })}><EditIcon size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteTarget(row)}><TrashIcon size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sidePanel && <EditSidePanel mode={sidePanel.mode} doc={{ ...doc, rows }} rowData={sidePanel.row} onClose={() => setSidePanel(null)} onSave={sidePanel.mode === 'add' ? handleAdd : handleEdit} />}
      {deleteTarget && <DeleteModal row={deleteTarget} headers={doc.headers} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  );
};