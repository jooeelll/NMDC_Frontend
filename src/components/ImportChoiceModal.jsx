import React, { useState } from 'react';
import { XIcon, PlusIcon, TrashIcon } from './Icons';
import { useToast } from '../context/ToastContext';

export const CreateDocumentModal = ({ onClose, onCreate }) => {
  const toast = useToast();

  const [sheetName, setSheetName] = useState('');
  const [columns, setColumns] = useState([]);

  const addColumn = () => {
    setColumns(prev => [
      ...prev,
      {
        name: '',
        type: ''
      }
    ]);
  };

  const updateColumn = (index, field, value) => {
    const updated = [...columns];
    updated[index][field] = value;
    setColumns(updated);
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const createSheet = () => {
    if (sheetName.trim() === '') {
      toast.error(
        "Missing Sheet Name",
        "Please enter a sheet name."
      );
      return;
    }

    if (columns.length === 0) {
      toast.error(
        "No Columns",
        "Please add at least one column."
      );
      return;
    }

    const emptyColumn = columns.some(
      col => col.name.trim() === ''
    );

    if (emptyColumn) {
      toast.error(
        "Missing Column Name",
        "Every column must have a name."
      );
      return;
    }

    const missingType = columns.some(
      col => col.type === ''
    );

    if (missingType) {
      toast.error(
        "Missing Data Type",
        "Please select a data type for every column."
      );
      return;
    }

    const duplicateNames = new Set(
      columns.map(col => col.name.trim())
    );

    if (duplicateNames.size !== columns.length) {
      toast.error(
        "Duplicate Columns",
        "Column names must be unique."
      );
      return;
    }

    const newDoc = {
      id: Math.random().toString(36).slice(2, 9),
      name: sheetName,
      size: 0,
      uploadedAt: new Date().toISOString(),
      headers: columns.map(col => col.name),
      colTypes: Object.fromEntries(
        columns.map(col => [
          col.name,
          col.type
        ])
      ),
      rows: []
    };

    onCreate(newDoc);
  };

  return (
    <>
      <div
        className="side-panel-overlay"
        onClick={onClose}
      />

      <aside className="side-panel">

        <div className="side-panel-header">

          <div className="side-panel-title">

            <div
              className="modal-title-icon"
              style={{
                background: 'rgba(14,154,167,.15)',
                color: 'var(--teal-400)'
              }}
            >
              <PlusIcon size={16} />
            </div>

            Create New Sheet

          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <XIcon size={16} />
          </button>

        </div>


        <div className="side-panel-body">

          <div className="form-grid single-col">

            <div className="form-group">

              <label className="form-label">
                Sheet Name
              </label>

              <input
                className="form-input"
                placeholder="Enter sheet name"
                value={sheetName}
                onChange={(e) =>
                  setSheetName(e.target.value)
                }
              />

            </div>


            <label className="form-label">
              Columns
            </label>


            {columns.map((column, index) => (

              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}
              >

                <input
                  className="form-input"
                  placeholder="Column name"
                  value={column.name}
                  onChange={(e) =>
                    updateColumn(
                      index,
                      'name',
                      e.target.value
                    )
                  }
                />


                <select
                  className="form-select"
                  value={column.type}
                  onChange={(e) =>
                    updateColumn(
                      index,
                      'type',
                      e.target.value
                    )
                  }
                >

                  <option value="" disabled>
                    Select Data Type
                  </option>

                  <option value="text">
                    Text
                  </option>

                  <option value="number">
                    Number
                  </option>

                  <option value="date">
                    Date
                  </option>

                </select>


                <button
                  className="btn btn-ghost btn-icon"
                  style={{
                    color: 'var(--danger-500)'
                  }}
                  onClick={() =>
                    removeColumn(index)
                  }
                >
                  <TrashIcon size={15} />
                </button>

              </div>

            ))}


            <button
              className="btn btn-secondary"
              onClick={addColumn}
            >
              <PlusIcon size={14} />
              Add Column
            </button>


          </div>

        </div>


        <div className="side-panel-footer">

          <button
            className="btn btn-secondary btn-md"
            onClick={onClose}
          >
            Cancel
          </button>


          <button
            className="btn btn-primary btn-md"
            onClick={createSheet}
          >
            Create Sheet
          </button>

        </div>


      </aside>
    </>
  );
};