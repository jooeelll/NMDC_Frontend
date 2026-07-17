import React from 'react';

const Icon = ({ d, size = 18, stroke = 'currentColor', fill = 'none', ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

export const AnchorIcon      = ({ size }) => <Icon size={size} d="M12 2a6 6 0 0 0-6 6c0 5 6 13 6 13s6-8 6-13a6 6 0 0 0-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />;
export const UploadIcon      = ({ size }) => <Icon size={size} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />;
export const FileTextIcon    = ({ size }) => <Icon size={size} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>} />;
export const GridIcon        = ({ size }) => <Icon size={size} d={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>} />;
export const SearchIcon      = ({ size }) => <Icon size={size} d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm5.5-1.5 3 3" />;
export const PlusIcon        = ({ size }) => <Icon size={size} d="M12 5v14M5 12h14" />;
export const EditIcon        = ({ size }) => <Icon size={size} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
export const TrashIcon       = ({ size }) => <Icon size={size} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
export const DownloadIcon    = ({ size }) => <Icon size={size} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />;
export const ArrowLeftIcon   = ({ size }) => <Icon size={size} d="M19 12H5M12 19l-7-7 7-7" />;
export const XIcon           = ({ size }) => <Icon size={size} d="M18 6 6 18M6 6l12 12" />;
export const ChevronUpIcon   = ({ size }) => <Icon size={size} d="M18 15l-6-6-6 6" />;
export const ChevronDownIcon = ({ size }) => <Icon size={size} d="M6 9l6 6 6-6" />;
export const ChevronLeftIcon = ({ size }) => <Icon size={size} d="M15 18l-6-6 6-6" />;
export const ChevronRightIcon= ({ size }) => <Icon size={size} d="M9 18l6-6-6-6" />;
export const CheckCircleIcon = ({ size }) => <Icon size={size} d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" />;
export const XCircleIcon     = ({ size }) => <Icon size={size} d="M10 10a10 10 0 1 0 0 0zM15 9l-6 6M9 9l6 6" fill="none" />;
export const InfoIcon        = ({ size }) => <Icon size={size} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>} />;
export const AlertTriangleIcon=({ size }) => <Icon size={size} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
export const AlertCircleIcon = ({ size }) => <Icon size={size} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} />;
export const FilterIcon      = ({ size }) => <Icon size={size} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
export const RowsIcon        = ({ size }) => <Icon size={size} d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />;
export const FileSpreadIcon  = ({ size }) => <Icon size={size} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2M8 17h2M14 13h2M14 17h2"/></>} />;
export const HashIcon        = ({ size }) => <Icon size={size} d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />;
export const RefreshIcon     = ({ size }) => <Icon size={size} d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;