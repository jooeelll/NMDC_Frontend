import React,{useState,useEffect,useMemo} from 'react';
import {XIcon,PlusIcon,EditIcon,AlertCircleIcon} from './Icons';
import {useToast} from '../context/ToastContext';
import {SearchableSelect} from './SearchableSelect';

const dropdownFields=[
  'sl_no',
  'area',
  'area_of_concern',
  'action_by'
];

const FormField=({
  header,
  colType,
  value,
  onChange,
  error,
  isDropdown,
  options,
  onCreateOption
})=>{

  if(isDropdown){

    return(
      <div className="form-group">

        <label className="form-label">
          {header.replaceAll('_',' ')}
        </label>

        <SearchableSelect
          value={value||''}
          options={options}
          onChange={val=>
            onChange(header,val)
          }
          onCreateOption={val=>
            onCreateOption(header,val)
          }
        />

        {
          error&&
          <span className="form-error">
            <AlertCircleIcon size={12}/>
            {error}
          </span>
        }

      </div>
    );

  }


  return(
    <div className="form-group">

      <label className="form-label">

        {header.replaceAll('_',' ')}

        {
          colType!=='text'&&
          <span className="type-hint">
            {colType}
          </span>
        }

      </label>


      <input
      className="form-input"
      type="text"
      value={value||''}
      onChange={e=>
        onChange(
          header,
          e.target.value
        )
      }
      placeholder={
        colType==='date'
        ?
        'YYYY-MM-DD'
        :
        `Enter ${header}`
      }
    />


      {
        error&&
        <span className="form-error">
          {error}
        </span>
      }


    </div>
  );

};



export const EditSidePanel=({
  mode,
  doc,
  rowData,
  onClose,
  onSave
})=>{

  const toast=useToast();

  const [formData,setFormData]=useState({});
  const [customValues,setCustomValues]=useState({});



  const dropdownOptions=useMemo(()=>{

    const result={};


    dropdownFields.forEach(field=>{

      const values=new Set();


      doc.rows.forEach(row=>{

        if(
          row[field]!==undefined&&
          row[field]!==''
        ){

          values.add(
            String(row[field])
          );

        }

      });


      if(customValues[field]){

        customValues[field].forEach(value=>
          values.add(value)
        );

      }


      result[field]=Array.from(values);


    });


    return result;


  },[doc.rows,customValues]);



  useEffect(()=>{

    const data={};


    doc.headers.forEach(header=>{

      if(
        mode==='edit'&&
        rowData
      ){

        data[header]=
          rowData[header]??'';

      }
      else{

        data[header]='';

      }

    });


    setFormData(data);


  },[mode,rowData,doc.headers]);



  const handleChange=(header,value)=>{

    setFormData(prev=>({

      ...prev,

      [header]:value

    }));

  };



  const createOption=(header,value)=>{

    setCustomValues(prev=>({

      ...prev,

      [header]:[
        ...(prev[header]||[]),
        value
      ]

    }));

  };



  const handleSave=async()=>{

    const empty=
      Object.values(formData)
      .every(value=>
        String(value).trim()===''
      );


    if(empty){

      toast.error(
        "Empty Row",
        "Enter at least one value."
      );

      return;

    }


    try{

      const success=
        await onSave(formData);


      if(success){

        onClose();

      }


    }catch(error){

      toast.error(
        "Save Failed",
        error.message
      );

    }

  };



  return(

    <>

      <div
        className="side-panel-overlay"
        onClick={onClose}
      />


      <aside className="side-panel">


        <div className="side-panel-header">


          <div className="side-panel-title">


            <div className="modal-title-icon">

              {
                mode==='add'
                ?
                <PlusIcon size={16}/>
                :
                <EditIcon size={16}/>
              }

            </div>


            {
              mode==='add'
              ?
              'Add New Record'
              :
              'Edit Record'
            }


          </div>


          <button
            className="modal-close"
            onClick={onClose}
          >

            <XIcon size={16}/>

          </button>


        </div>



        <div className="side-panel-body">


          <div className="form-grid single-col">


            {
              doc.headers.map(header=>(

                <FormField
                  key={header}
                  header={header}
                  colType={doc.colTypes[header]}
                  value={formData[header]}
                  onChange={handleChange}
                  isDropdown={
                    dropdownFields.includes(header)
                  }
                  options={
                    dropdownOptions[header]||[]
                  }
                  onCreateOption={createOption}
                />

              ))
            }


          </div>


        </div>



        <div className="side-panel-footer">


          <button
            className="btn btn-secondary"
            onClick={onClose}
          >

            Cancel

          </button>



          <button
            className="btn btn-primary"
            onClick={handleSave}
          >

            Save Changes

          </button>


        </div>


      </aside>


    </>

  );

};