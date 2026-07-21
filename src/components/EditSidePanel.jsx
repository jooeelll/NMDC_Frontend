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

      if (
        raw !== '' &&
        !/^-?\d*\.?\d*$/.test(raw)
      ) {
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

          onChange={(val) =>
            onChange(header, val)
          }

          onCreateOption={(newValue) =>
            onCreateCategory(header, newValue)
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


      <label className="form-label">

        {header}


        {
          colType !== 'text' &&
          <span className="type-hint">

            {colType}

          </span>
        }


      </label>




      <input

        className={`form-input${error ? ' error' : ''}`}

        type="text"

        value={value || ''}

        onChange={handleChange}

        placeholder={
          colType === 'date'
          ? 'DD/MM/YYYY'
          : colType === 'number'
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

    if(colTypes[header] !== 'text'){
      return false;
    }


    const values = new Set();


    rows.forEach(row => {

      if(row[header]){

        values.add(
          String(row[header])
        );

      }

    });



    if(customCategories?.[header]){

      customCategories[header].forEach(value => {

        values.add(value);

      });

    }



    return values.size <= 12 && values.size > 0;

  };




  const categoryValues = useMemo(() => {

    const result = {};


    doc.headers.forEach(header => {


      if(
        detectCategorical(
          header,
          doc.rows,
          doc.colTypes
        )
      ){


        const values = new Set();



        doc.rows.forEach(row => {

          if(row[header]){

            values.add(
              String(row[header])
            );

          }

        });



        if(customCategories?.[header]){

          customCategories[header].forEach(value => {

            values.add(value);

          });

        }



        result[header] =
          Array.from(values).sort();


      }


    });



    return result;


  },[doc,customCategories]);





  useEffect(() => {

    const data = {};


    doc.headers.forEach(header => {


      if(
        mode === 'edit' &&
        rowData
      ){

        data[header] =
          rowData[header] !== undefined
          ? String(rowData[header])
          : '';

      }
      else{

        data[header] = '';

      }

    });


    setFormData(data);
    setErrors({});


  },[mode,rowData,doc]);






  const handleChange = (
    header,
    value
  ) => {


    setFormData(prev => ({

      ...prev,

      [header]:value

    }));



    if(errors[header]){


      setErrors(prev => {

        const updated = {
          ...prev
        };


        delete updated[header];


        return updated;

      });


    }


  };






  const handleCreateCategory = (
    header,
    value
  ) => {


    const newValue =
      value.trim();



    if(!newValue){

      return;

    }



    setCustomCategories(prev => {


      const existing =
        prev[header] || [];



      if(existing.includes(newValue)){

        return prev;

      }



      return {

        ...prev,

        [header]:[

          ...existing,

          newValue

        ]

      };


    });


  };






  const validate = () => {

    const errs = {};



    const allEmpty = doc.headers.every(
      h =>
        !formData[h] ||
        formData[h].trim() === ''
    );



    if(allEmpty){

      errs._row =
        "At least one field must be filled.";

      return errs;

    }




    doc.headers.forEach(header => {


      const value =
        formData[header] || '';




      if(
        doc.requiredFields?.[header] &&
        value.trim() === ''
      ){

        errs[header] =
          "This field cannot be empty.";

      }





      if(
        doc.colTypes[header] === 'number' &&
        value !== '' &&
        isNaN(Number(value))
      ){

        errs[header] =
          "Only numbers allowed.";

      }





      if(
        doc.colTypes[header] === 'date' &&
        value !== ''
      ){


        const regex =
          /^\d{2}\/\d{2}\/\d{4}$/;



        if(!regex.test(value)){

          errs[header] =
            "Use DD/MM/YYYY";

        }

      }


    });



    return errs;

  };






  const handleSave = async () => {


    const validationErrors =
      validate();



    if(
      Object.keys(validationErrors).length > 0
    ){

      setErrors(validationErrors);


      toast.error(
        "Validation Failed",
        validationErrors._row ||
        "Fix errors before saving."
      );


      return;

    }



    setSaving(true);



    try{


      await onSave(formData);


      toast.success(
        mode === 'edit'
        ? "Record Updated"
        : "Record Added",
        "Changes saved successfully."
      );


      onClose();


    }
    catch(error){


      toast.error(
        "Save Failed",
        error.message
      );


    }
    finally{

      setSaving(false);

    }


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

              {
                mode === 'add'
                ?
                <PlusIcon size={16}/>
                :
                <EditIcon size={16}/>
              }

            </div>



            {
              mode === 'add'
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
              doc.headers.map(header => (

                <FormField

                  key={header}

                  header={header}

                  colType={
                    doc.colTypes[header]
                  }

                  value={
                    formData[header]
                  }

                  onChange={
                    handleChange
                  }

                  error={
                    errors[header]
                  }

                  isCategorical={
                    detectCategorical(
                      header,
                      doc.rows,
                      doc.colTypes
                    )
                  }

                  categoryValues={
                    [
                      ...(categoryValues[header] || []),
                      ...(customCategories?.[header] || [])
                    ]
                    .filter(
                      (v,i,a)=>
                        a.indexOf(v)===i
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
              "Saving..."
              :
              "Save Changes"
            }


          </button>


        </div>


      </aside>


    </>

  );

};