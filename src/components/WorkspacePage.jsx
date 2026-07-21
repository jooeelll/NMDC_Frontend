import React, {
  useState,
  useMemo,
  useRef
} from 'react';

import {
  ArrowLeftIcon,
  FileSpreadIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon
} from './Icons';

import { EditSidePanel } from './EditSidePanel';
import { DeleteModal } from './DeleteModal';
import { MergeModal } from './MergeModal';

import { dataService } from '../services/dataService';
import { useToast } from '../context/ToastContext';



export const WorkspacePage = ({
  doc,
  onBack,
  onUpdateDoc
}) => {


  const toast = useToast();


  const fileInputRef = useRef(null);



  const [rows,setRows] =
    useState(doc.rows || []);


  const [search,setSearch] =
    useState('');


  const [sidePanel,setSidePanel] =
    useState(null);


  const [deleteTarget,setDeleteTarget] =
    useState(null);



  const [mergeData,setMergeData] =
    useState(null);



  const [customCategories,setCustomCategories] =
    useState({});



  const [editingName,setEditingName] =
    useState(false);



  const [newName,setNewName] =
    useState(doc.name);






  const processed = useMemo(()=>{


    let data = [...rows];



    if(search.trim()){


      const query =
        search.toLowerCase();



      data =
        data.filter(row =>


          doc.headers.some(header =>


            String(row[header] || '')

            .toLowerCase()

            .includes(query)


          )


        );


    }



    return data;


  },[
    rows,
    search,
    doc.headers
  ]);






  const handleRename = () => {


    if(!newName.trim()){


      toast.error(
        "Invalid Name",
        "Sheet name cannot be empty."
      );


      return;

    }



    onUpdateDoc({

      ...doc,

      name:newName.trim()

    });



    setEditingName(false);



    toast.success(
      "Renamed",
      "Sheet name updated."
    );


  };







  const handleAdd = async(formData)=>{


    const newRow = {

      __id:crypto.randomUUID()

    };



    doc.headers.forEach(header=>{


      newRow[header] =
        formData[header] || '';


    });




    const hasValue =
      doc.headers.some(header =>

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


    const rowId =
      sidePanel.row.__id;



    const updatedRow =
      await dataService.updateRow(

        doc.id,

        rowId,

        {
          ...formData,
          __id:rowId
        }

      );



    const updatedRows =
      rows.map(row =>


        row.__id === rowId

        ?

        updatedRow

        :

        row


      );



    setRows(updatedRows);



    onUpdateDoc({

      ...doc,

      rows:updatedRows

    });


  };


  const handleDelete = ()=>{


    const updatedRows =
      rows.filter(row =>

        row.__id !== deleteTarget.__id

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


  const handleCSVSelect = async(file)=>{


    if(!file) return;



    try{


      const parsed =
        await dataService.parseFile(file);



      setMergeData(parsed);



    }
    catch(error){


      toast.error(
        "CSV Error",
        error.message
      );


    }


  };

    const handleMergeSelected = (selectedRows) => {


    const formattedRows =
      selectedRows.map(row => ({

        ...row,

        __id:crypto.randomUUID()

      }));



    const updatedRows = [

      ...rows,

      ...formattedRows

    ];



    setRows(updatedRows);



    onUpdateDoc({

      ...doc,

      rows:updatedRows

    });



    setMergeData(null);



    toast.success(

      "CSV Merged",

      `${formattedRows.length} rows added successfully.`

    );


  };


  return (

    <div className="app-shell">



      <input

        ref={fileInputRef}

        type="file"

        accept=".csv,.xlsx,.xls"

        hidden

        onChange={(e)=>{

          handleCSVSelect(
            e.target.files[0]
          );


          e.target.value = '';

        }}

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



          {
            editingName

            ?

            <input

              className="form-input"

              value={newName}

              autoFocus

              onChange={
                e=>setNewName(e.target.value)
              }

              onKeyDown={
                e=>{

                  if(e.key==="Enter"){

                    handleRename();

                  }

                }
              }

            />

            :

            <>

              <span>
                {doc.name}
              </span>


              <button

                className="btn btn-ghost btn-sm"

                onClick={()=>{

                  setNewName(doc.name);

                  setEditingName(true);

                }}

              >

                Edit

              </button>


            </>

          }


        </div>

        <div className="workspace-actions">


          <button

            className="btn btn-secondary btn-sm"

            onClick={()=>


              setSidePanel({

                mode:'add'

              })


            }

          >

            <PlusIcon size={14}/>

            Add Row


          </button>

          <button

            className="btn btn-primary btn-sm"

            onClick={()=>

              fileInputRef.current?.click()

            }

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

            onChange={
              e=>setSearch(e.target.value)
            }

          />


        </div>


      </div>



      <div

        className="table-card"

        style={{
          margin:'2rem'
        }}

      >


        <div

          className="table-wrap"

          style={{

            maxHeight:'70vh',

            overflowY:'auto'

          }}

        >


          <table className="data-table">


            <thead>


              <tr>


                {
                  doc.headers.map(header=>(

                    <th key={header}>

                      {header}

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
                processed.map(row=>(


                  <tr key={row.__id}>


                    {
                      doc.headers.map(header=>(


                        <td key={header}>

                          {
                            String(
                              row[header] || ''
                            )
                          }

                        </td>


                      ))
                    }



                    <td>


                      <button

                        className="btn btn-ghost btn-icon btn-sm"

                        onClick={()=>


                          setSidePanel({

                            mode:'edit',

                            row

                          })


                        }

                      >

                        <EditIcon size={14}/>

                      </button>


                      <button

                        className="btn btn-ghost btn-icon btn-sm"

                        style={{
                          color:'var(--danger-500)'
                        }}

                        onClick={()=>


                          setDeleteTarget(row)


                        }

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
        sidePanel && (


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

              ?

              handleAdd

              :

              handleEdit

            }



            customCategories={customCategories}



            setCustomCategories={
              setCustomCategories
            }


          />


        )

      }



      {
        deleteTarget && (


          <DeleteModal


            row={deleteTarget}



            headers={doc.headers}



            onClose={()=>
              setDeleteTarget(null)
            }



            onConfirm={handleDelete}


          />


        )

      }



      {
        mergeData && (


          <MergeModal


            fileData={mergeData}


            existingDoc={doc}



            onClose={()=>setMergeData(null)}



            onMerge={handleMergeSelected}


          />


        )

      }



    </div>

  );


};