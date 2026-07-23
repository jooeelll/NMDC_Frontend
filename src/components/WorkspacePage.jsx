import React,{useState,useRef} from 'react';
import {PlusIcon,EditIcon,TrashIcon,SearchIcon} from './Icons';
import {EditSidePanel} from './EditSidePanel';
import {DeleteModal} from './DeleteModal';
import {api} from '../services/api';
import {useToast} from '../context/ToastContext';

export const WorkspacePage=({
  concerns,
  setConcerns,
  refreshConcerns
})=>{

  const toast=useToast();
  const fileInputRef=useRef(null);

  const [search,setSearch]=useState('');
  const [sidePanel,setSidePanel]=useState(null);
  const [deleteTarget,setDeleteTarget]=useState(null);

  const headers=concerns.length>0
    ?Object.keys(concerns[0]).filter(
      key=>
        key!=='id'&&
        key!=='user'&&
        key!=='created_at'&&
        key!=='updated_at'
    )
    :[
      'date',
      'sl_no',
      'area',
      'area_of_concern',
      'milestone_delay_days',
      'action_by',
      'action_required'
    ];

  const colTypes={
    date:'date',
    sl_no:'number',
    area:'text',
    area_of_concern:'text',
    milestone_delay_days:'number',
    action_by:'text',
    action_required:'text'
  };

  const filteredRows=concerns.filter(row=>{

    if(!search.trim()){
      return true;
    }

    return headers.some(header=>
      String(row[header]||'')
      .toLowerCase()
      .includes(search.toLowerCase())
    );

  });


  const handleAdd=async(formData)=>{

    try{

      const response=
        await api.fetchWithAuth(
          '/area_of_concerns/',
          {
            method:'POST',
            body:JSON.stringify(formData)
          }
        );


      setConcerns(prev=>[
        ...prev,
        response
      ]);


      return true;

    }catch(error){

      toast.error(
        "Add Failed",
        error.message
      );


      return false;

    }

  };


  const handleEdit=async(formData)=>{

    try{

      const id=sidePanel.row.id;


      const response=
        await api.fetchWithAuth(
          `/area_of_concerns/${id}/`,
          {
            method:'PUT',
            body:JSON.stringify(formData)
          }
        );


      setConcerns(prev=>
        prev.map(row=>
          row.id===id
          ?response
          :row
        )
      );


      return true;

    }catch(error){

      toast.error(
        "Update Failed",
        error.message
      );


      return false;

    }

  };


  const handleDelete=async()=>{

    try{

      await api.fetchWithAuth(
        `/area_of_concerns/${deleteTarget.id}/`,
        {
          method:'DELETE'
        }
      );


      setConcerns(prev=>
        prev.filter(row=>
          row.id!==deleteTarget.id
        )
      );


      setDeleteTarget(null);


      toast.success(
        "Deleted",
        "Record removed successfully."
      );

    }catch(error){

      toast.error(
        "Delete Failed",
        error.message
      );

    }

  };


  const handleImport=async(file)=>{

    const formData=new FormData();

    formData.append(
      'file',
      file
    );


    try{

      await api.fetchWithAuth(
        '/area_of_concerns/import_excel/',
        {
          method:'POST',
          body:formData
        }
      );


      await refreshConcerns();


      toast.success(
        "Import Complete",
        "CSV imported successfully."
      );


    }catch(error){

      toast.error(
        "Import Failed",
        error.message
      );

    }

  };


  return(

    <div className="app-shell">

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".csv,.xlsx,.xls"
        onChange={e=>{

          if(e.target.files[0]){
            handleImport(e.target.files[0]);
          }

          e.target.value='';

        }}
      />


      <div className="workspace-header">

        <div className="workspace-title">
          Area of Concern
        </div>


        <div className="workspace-actions">

          <button
            className="btn btn-secondary btn-sm"
            onClick={()=>setSidePanel({
              mode:'add'
            })}
          >

            <PlusIcon size={14}/>
            Add Row

          </button>


          <button
            className="btn btn-primary btn-sm"
            onClick={()=>
              fileInputRef.current.click()
            }
          >

            Import CSV

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
            onChange={e=>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      <div className="table-card">

        <div className="table-wrap">

          <table className="data-table">

            <thead>

              <tr>

                {
                  headers.map(header=>(

                    <th key={header}>
                      {header.replaceAll('_',' ')}
                    </th>

                  ))
                }

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filteredRows.map(row=>(

                  <tr key={row.id}>

                    {
                      headers.map(header=>(

                        <td key={header}>
                          {row[header]||''}
                        </td>

                      ))
                    }


                    <td>

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

                ))

              }

            </tbody>

          </table>

        </div>

      </div>


      {
        sidePanel&&(

          <EditSidePanel
            mode={sidePanel.mode}
            doc={{
              headers,
              rows:concerns,
              colTypes
            }}
            rowData={sidePanel.row}
            onClose={()=>
              setSidePanel(null)
            }
            onSave={
              sidePanel.mode==='add'
              ?handleAdd
              :handleEdit
            }
          />

        )
      }


      {
        deleteTarget&&(

          <DeleteModal
            row={deleteTarget}
            onClose={()=>
              setDeleteTarget(null)
            }
            onConfirm={handleDelete}
          />

        )
      }

    </div>

  );

};