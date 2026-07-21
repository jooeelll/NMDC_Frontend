import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeftIcon, FileSpreadIcon, PlusIcon, SearchIcon, EditIcon, TrashIcon } from './Icons';
import { EditSidePanel } from './EditSidePanel';
import { DeleteModal } from './DeleteModal';
import { dataService } from '../services/dataService';
import { useToast } from '../context/ToastContext';

export const WorkspacePage = ({ doc, onBack, onUpdateDoc }) => {
  const toast = useToast();

  const fileInputRef = useRef(null);

  const [rows, setRows] = useState(doc.rows);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sidePanel, setSidePanel] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [customCategories, setCustomCategories] = useState({});


  const processed = useMemo(() => {

    let data = [...rows];

    if (search.trim()) {

      const q = search.toLowerCase();

      data = data.filter(row =>
        doc.headers.some(header =>
          String(row[header] || '')
            .toLowerCase()
            .includes(q)
        )
      );
    }


    if (sortCol) {

      data.sort((a,b)=>{

        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';

        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));

      });

    }


    return data;

  },[rows,search,sortCol,sortDir,doc]);



  const paginated = processed.slice(
    (page-1)*pageSize,
    page*pageSize
  );



  const handleAdd = async(formData)=>{

    const newRow = {
      __id:crypto.randomUUID()
    };


    doc.headers.forEach(header=>{

      newRow[header] = formData[header] ?? '';

    });



    const hasValue = doc.headers.some(header =>
      String(newRow[header]).trim() !== ''
    );


    if(!hasValue){

      toast.error(
        "Empty Row",
        "Please enter at least one value."
      );

      return;

    }



    const updatedRows = [
      ...rows,
      newRow
    ];


    setRows(updatedRows);


    onUpdateDoc({
      ...doc,
      rows:updatedRows
    });

  };



  const handleEdit = async(formData)=>{

    const rowId = sidePanel.row.__id;


    const updatedRow = await dataService.updateRow(
      doc.id,
      rowId,
      {
        ...formData,
        __id:rowId
      }
    );


    const updatedRows = rows.map(row =>
      row.__id === rowId
      ? updatedRow
      : row
    );


    setRows(updatedRows);


    onUpdateDoc({
      ...doc,
      rows:updatedRows
    });

  };



  const handleDelete = async()=>{

    const rowId = deleteTarget.__id;


    const updatedRows = rows.filter(
      row => row.__id !== rowId
    );


    setRows(updatedRows);


    onUpdateDoc({
      ...doc,
      rows:updatedRows
    });


    setDeleteTarget(null);


    toast.success(
      "Deleted",
      "Record removed."
    );

  };



  const handleMerge = async(file)=>{

    if(!file) return;


    try{

      const {
        headers,
        rows:newRows
      } = await dataService.parseFile(file);



      const columnsMatch =
        headers.length === doc.headers.length &&
        headers.every(header =>
          doc.headers.includes(header)
        );



      if(!columnsMatch){

        toast.error(
          "Column mismatch",
          "CSV columns must match the existing document."
        );

        return;

      }



      const formattedRows = newRows.map(row=>({

        ...row,

        __id:crypto.randomUUID()

      }));



      const mergedRows = [
        ...rows,
        ...formattedRows
      ];



      setRows(mergedRows);



      onUpdateDoc({

        ...doc,

        rows:mergedRows

      });



      toast.success(
        "CSV Merged",
        `${formattedRows.length} rows added successfully`
      );


    }
    catch(error){

      toast.error(
        "Merge Failed",
        error.message
      );

    }

  };



  return (

    <div className="app-shell">


      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        hidden
        onChange={(e)=>handleMerge(e.target.files[0])}
      />



      <div className="workspace-header">


        <button
          className="workspace-back-btn"
          onClick={onBack}
        >

          <ArrowLeftIcon size={14}/>
          Back

        </button>



        <div className="workspace-title">

          <FileSpreadIcon size={18}/>
          {doc.name}

        </div>



        <div className="workspace-actions">


          <button
            className="btn btn-secondary btn-sm"
            onClick={()=>setSidePanel({mode:'add'})}
          >

            <PlusIcon size={14}/>
            Add Row

          </button>



          <button
            className="btn btn-primary btn-sm"
            onClick={()=>fileInputRef.current?.click()}
          >

            Merge CSV

          </button>


        </div>


      </div>




      <div className="toolbar">


        <div className="search-input-wrap">

          <SearchIcon size={15}/>


          <input

            className="search-input"

            placeholder="Filter sheet data..."

            value={search}

            onChange={e=>setSearch(e.target.value)}

          />

        </div>


      </div>




      <div
        className="table-card"
        style={{margin:'2rem'}}
      >

        <div className="table-wrap">


          <table className="data-table">


            <thead>

              <tr>

                {doc.headers.map(header=>(

                  <th key={header}>
                    {header}
                  </th>

                ))}


                <th>
                  Actions
                </th>


              </tr>

            </thead>



            <tbody>


              {paginated.map(row=>(


                <tr key={row.__id}>


                  {doc.headers.map(header=>(

                    <td key={header}>
                      {String(row[header] || '')}
                    </td>

                  ))}



                  <td className="actions-col">


                    <button

                      className="btn btn-ghost btn-icon btn-sm"

                      onClick={()=>setSidePanel({
                        mode:'edit',
                        row
                      })}

                    >

                      <EditIcon size={14}/>

                    </button>




                    <button

                      className="btn btn-ghost btn-icon btn-sm"

                      style={{
                        color:'var(--danger-500)'
                      }}

                      onClick={()=>setDeleteTarget(row)}

                    >

                      <TrashIcon size={14}/>

                    </button>


                  </td>


                </tr>


              ))}


            </tbody>


          </table>


        </div>


      </div>




      {sidePanel && (

        <EditSidePanel

          mode={sidePanel.mode}

          doc={{
            ...doc,
            rows
          }}

          rowData={sidePanel.row}

          onClose={()=>setSidePanel(null)}

          onSave={
            sidePanel.mode === 'add'
            ? handleAdd
            : handleEdit
          }

          customCategories={customCategories}

          setCustomCategories={setCustomCategories}

        />

      )}




      {deleteTarget && (

        <DeleteModal

          row={deleteTarget}

          headers={doc.headers}

          onClose={()=>setDeleteTarget(null)}

          onConfirm={handleDelete}

        />

      )}



    </div>

  );

};