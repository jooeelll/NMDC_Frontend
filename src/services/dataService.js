import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const genId = () => `_${Math.random().toString(36).slice(2, 11)}`;

const inferType = (values) => {
  const sample = values.filter(v => v !== null && v !== undefined && v !== '').slice(0, 20);
  if (sample.length === 0) return 'text';
  const isNum = sample.every(v => !isNaN(Number(String(v).replace(/,/g, ''))));
  if (isNum) return 'number';
  const dateRe = /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/;
  if (sample.every(v => dateRe.test(String(v)))) return 'date';
  return 'text';
};

const buildColTypes = (headers, rows) => {
  const types = {};
  headers.forEach(h => {
    types[h] = inferType(rows.map(r => r[h]));
  });
  return types;
};

export const dataService = {
  parseFile: (file) => {
    return new Promise((resolve, reject) => {
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            const headers = results.meta.fields || [];
            const rows = results.data.map((r) => ({ __id: genId(), ...r }));
            const colTypes = buildColTypes(headers, rows);
            resolve({ headers, rows, colTypes });
          },
          error: reject,
        });
      } else if (['xlsx', 'xls'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const wb = XLSX.read(e.target.result, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
            const headers = raw.length > 0 ? Object.keys(raw[0]) : [];
            const rows = raw.map((r) => ({ __id: genId(), ...r }));
            const colTypes = buildColTypes(headers, rows);
            resolve({ headers, rows, colTypes });
          } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file format.'));
      }
    });
  },

  listDocuments: (docs) => Promise.resolve(docs),
  addRow: (docId, rowData) => Promise.resolve({ __id: genId(), ...rowData }),
  updateRow: (docId, rowId, rowData) => Promise.resolve({ __id: rowId, ...rowData }),
  deleteRow: (docId, rowId) => Promise.resolve({ success: true }),

  exportCsv: (headers, rows, filename) => {
    const data = rows.map(r => {
      const clean = {};
      headers.forEach(h => { clean[h] = r[h] ?? ''; });
      return clean;
    });
    const csv = Papa.unparse(data, { columns: headers });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.(xlsx|xls)$/i, '.csv');
    a.click();
    URL.revokeObjectURL(url);
    return Promise.resolve();
  },
};