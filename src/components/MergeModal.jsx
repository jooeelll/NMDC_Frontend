import React, { useState } from 'react';
import { XIcon, PlusIcon } from './Icons';


export const MergeModal = ({
  fileData,
  existingDoc,
  onClose,
  onMerge
}) => {

  const [selectedRows,setSelectedRows] = useState([]);



  const toggleRow = (index)=>{

    setSelectedRows(prev =>

      prev.includes(index)

      ? prev.filter(i => i !== index)

      : [...prev,index]

    );

  };



  const toggleAll = ()=>{

    if(selectedRows.length === fileData.rows.length){

      setSelectedRows([]);

    }
    else{

      setSelectedRows(
        fileData.rows.map((_,index)=>index)
      );

    }

  };



  const handleMerge = ()=>{

    const rowsToMerge = selectedRows.map(
      index => fileData.rows[index]
    );


    onMerge(rowsToMerge);

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
                background:'rgba(14,154,167,.15)',
                color:'var(--teal-400)'
              }}
            >

              <PlusIcon size={16}/>

            </div>


            Merge CSV Rows


          </div>



          <button
            className="modal-close"
            onClick={onClose}
          >

            <XIcon size={16}/>

          </button>


        </div>




        <div className="side-panel-body">


          <p style={{marginBottom:'1rem'}}>

            Select rows to add into

            <b> {existingDoc.name}</b>

          </p>



          <div style={{
            marginBottom:'1rem',
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center'
          }}>


            <button

              className="btn btn-secondary btn-sm"

              onClick={toggleAll}

            >

              {
                selectedRows.length === fileData.rows.length

                ? 'Deselect All'

                : 'Select All'
              }


            </button>



            <span>

              {selectedRows.length} selected

            </span>


          </div>




          <div
            style={{
              maxHeight:'400px',
              overflowY:'auto'
            }}
          >


            <table className="data-table">


              <thead>


                <tr>


                  <th>
                    Select
                  </th>



                  {
                    fileData.headers.map(header=>(

                      <th key={header}>

                        {header}

                      </th>

                    ))
                  }


                </tr>


              </thead>




              <tbody>


                {
                  fileData.rows.length === 0 ? (

                    <tr>

                      <td
                        colSpan={
                          fileData.headers.length + 1
                        }
                        style={{
                          textAlign:'center'
                        }}
                      >

                        No rows found

                      </td>


                    </tr>


                  ) : (


                    fileData.rows.map((row,index)=>(


                      <tr key={index}>


                        <td>


                          <input

                            type="checkbox"

                            checked={
                              selectedRows.includes(index)
                            }

                            onChange={()=>
                              toggleRow(index)
                            }

                          />


                        </td>




                        {
                          fileData.headers.map(header=>(


                            <td key={header}>

                              {
                                String(
                                  row[header] ?? ''
                                )
                              }

                            </td>


                          ))
                        }



                      </tr>


                    ))


                  )

                }


              </tbody>


            </table>


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

            onClick={handleMerge}

            disabled={
              selectedRows.length === 0
            }

          >

            Merge Selected Rows


          </button>


        </div>


      </aside>


    </>

  );

};