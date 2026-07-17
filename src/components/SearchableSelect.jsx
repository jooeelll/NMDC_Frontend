import React, { useState, useRef, useEffect } from 'react';


export const SearchableSelect = ({
    value,
    options,
    onChange,
    onCreateOption
}) => {

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const wrapperRef = useRef();


    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target)
            ) {
                setOpen(false);
            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);



    const filtered = options.filter(option =>
        option
        .toLowerCase()
        .includes(search.toLowerCase())
    );



    const createNew = () => {

    const newValue = search.trim();

    if(newValue) {

        // add new option to dropdown
        onCreateOption(newValue);

        // select it for current row
        onChange(newValue);

        // clear search
        setSearch('');

        setOpen(false);

    }

};

    return (

        <div 
            ref={wrapperRef}
            style={{
                position:'relative'
            }}
        >


            <input

                className="form-input"

                value={open ? search : value || ''}

                placeholder="Search or add..."

                onFocus={()=>{
                    setOpen(true);
                    setSearch('');
                }}

                onChange={(e)=>{
                    setSearch(e.target.value);
                    setOpen(true);
                }}

            />



            {
                open && (

                    <div
                        style={{
                            position:'absolute',
                            top:'100%',
                            left:0,
                            right:0,
                            background:'var(--slate-900)',
                            border:'1px solid rgba(255,255,255,.1)',
                            borderRadius:'8px',
                            zIndex:1000,
                            maxHeight:'200px',
                            overflowY:'auto'
                        }}
                    >


                    {
                        filtered.map(option=>(

                            <div

                                key={option}

                                style={{
                                    padding:'10px',
                                    cursor:'pointer'
                                }}

                                onClick={()=>{

                                    onChange(option);

                                    setOpen(false);

                                }}

                            >

                                {option}

                            </div>

                        ))

                    }



                    {
                        search &&
                        !filtered.includes(search) &&

                        <div

                            style={{
                                padding:'10px',
                                cursor:'pointer',
                                color:'var(--teal-400)'
                            }}

                            onClick={createNew}

                        >

                            + Create "{search}"

                        </div>

                    }


                    </div>

                )

            }


        </div>

    );

};