import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, EditIcon, XIcon, AlertCircleIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { SearchableSelect } from './SearchableSelect';


const FormField = ({
  header,
  colType,
  value,
  onChange,
  error,
  isCategorical,
  categoryValues,
  onCreateCategory
}) => {


  const handleChange = (e) => {

    const raw = e.target.value;

    if (colType === 'number') {

      if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) {
        return;
      }

    }

    onChange(header, raw);

  };



  if (isCategorical) {

    return (

      <div className="form-group">

        <label className="form-label">

          {header}

          <span className="type-hint">
            categorical
          </span>

        </label>



        <SearchableSelect

          value={value || ''}

          options={categoryValues}

          onChange={(val)=>
            onChange(header,val)
          }

          onCreateOption={(newValue)=>
            onCreateCategory(header,newValue)
          }

        />


        {
          error &&
          <span className="form-error">
            {error}
          </span>
        }


      </div>

    );

  }



  return (

    <div className="form-group">

      <label 
        className="form-label"
        htmlFor={`field-${header}`}
      >

        {header}

        {
          colType !== 'text' &&
          <span className="type-hint">
            {colType}
          </span>
        }

      </label>



      <input

        id={`field-${header}`}

        className={`form-input${error ? ' error' : ''}`}

        type={colType === 'date' ? 'date' : 'text'}

        value={value || ''}

        onChange={handleChange}

        placeholder={
          colType === 'number'
          ? 'Numeric value only'
          : `Enter ${header}`
        }

        autoComplete="off"

      />



      {
        error &&
        <span className="form-error">

          <AlertCircleIcon size={12}/>

          {error}

        </span>
      }


    </div>

  );

};





export const EditSidePanel = ({
  mode,
  doc,
  rowData,
  onClose,
  onSave,
  customCategories,
  setCustomCategories
}) => {


  const toast = useToast();


  const [formData,setFormData] = useState({});

  const [errors,setErrors] = useState({});

  const [saving,setSaving] = useState(false);




  const detectCategorical = (
    header,
    rows,
    colTypes
  ) => {

    if(colTypes[header] !== 'text') {
      return false;
    }


    const uniq = new Set(
      rows
      .map(r => String(r[header] || ''))
      .filter(Boolean)
    );


    return uniq.size <= 12 && rows.length > 0;

  };





  const categoryValues = useMemo(()=>{


    const cv={};


    doc.headers.forEach(h=>{


      if(
        detectCategorical(
          h,
          doc.rows,
          doc.colTypes
        )
      ){

        cv[h] = [
          ...new Set(
            doc.rows
            .map(r=>String(r[h] || ''))
            .filter(Boolean)
          )
        ].sort();

      }


    });


    return cv;


  },[doc]);







  useEffect(()=>{


    if(mode==='edit' && rowData){


      const d={};


      doc.headers.forEach(h=>{

        d[h] =
          rowData[h] !== undefined
          ? String(rowData[h])
          : '';

      });


      setFormData(d);


    }
    else{


      const d={};


      doc.headers.forEach(h=>{

        d[h]='';

      });


      setFormData(d);


    }


    setErrors({});


  },[mode,rowData,doc]);







  const handleChange=(header,val)=>{


    setFormData(prev=>({

      ...prev,

      [header]:val

    }));



    if(errors[header]){


      setErrors(prev=>{

        const updated={...prev};

        delete updated[header];

        return updated;

      });


    }


  };







  const handleCreateCategory=(header,value)=>{


    setCustomCategories(prev=>{


      const existing =
        prev[header] || [];



      if(existing.includes(value)){

        return prev;

      }



      return {


        ...prev,


        [header]:[

          ...existing,

          value

        ]


      };


    });


  };








  const validate = () => {

  const errs = {};


  const allEmpty = doc.headers.every(
    h => !formData[h] || formData[h].trim() === ''
  );


  // Stop completely empty rows
  if(allEmpty){

    errs._row = "At least one field must be filled.";

    return errs;

  }



  // Required fields check
  doc.headers.forEach(h=>{

    const value = formData[h];


    if(
      doc.requiredFields?.[h] &&
      (!value || value.trim()==='')
    ){

      errs[h]="This field cannot be empty.";

    }



    // number validation

    if(
      doc.colTypes[h]==='number'
      &&
      value !== ''
      &&
      isNaN(Number(value))
    ){

      errs[h]="Only numbers allowed.";

    }


  });


  return errs;

};





  const handleSave=async()=>{


    const errs=validate();



    if(Object.keys(errs).length > 0){

      setErrors(errs);


      toast.error(
      'Validation Failed',
      errs._row || 'Please fix the errors before saving.'
      );


      return;

      }



    setSaving(true);



    try{


      await onSave(formData);



      toast.success(
        mode==='edit'
        ? 'Record Updated'
        : 'Record Added',

        'Changes processed successfully.'
      );



      onClose();



    }
    catch(err){


      toast.error(
        'Save Failed',
        err.message
      );


    }
    finally{


      setSaving(false);


    }


  };





  const isAddMode = mode==='add';





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

              {
                isAddMode
                ?
                <PlusIcon size={16}/>
                :
                <EditIcon size={16}/>
              }


            </div>



            {
              isAddMode
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
            doc.headers.map(h=>(


              <FormField

                key={h}

                header={h}

                colType={doc.colTypes[h]}

                value={formData[h]}

                onChange={handleChange}

                error={errors[h]}


                isCategorical={
                  detectCategorical(
                    h,
                    doc.rows,
                    doc.colTypes
                  )
                }


                categoryValues={

                  [
                    ...(categoryValues[h] || []),
                    ...(customCategories[h] || [])
                  ]

                  .filter(
                    (value,index,array)=>
                    array.indexOf(value)===index
                  )

                }



                onCreateCategory={
                  handleCreateCategory
                }


              />


            ))

          }



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

            onClick={handleSave}

            disabled={saving}

          >

            {
              saving
              ?
              'Saving…'
              :
              'Save Changes'
            }


          </button>



        </div>




      </aside>



    </>

  );

};