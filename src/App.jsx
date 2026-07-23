import React,{useEffect,useState} from 'react';
import {WorkspacePage} from './components/WorkspacePage';
import {LoginPage} from './components/LoginPage';
import {ToastProvider,useToast} from './context/ToastContext';
import {AnchorIcon} from './components/Icons';
import {api} from './services/api';
import './index.css';

function MainApp(){
  const toast=useToast();

  const [username,setUsername]=useState(()=>localStorage.getItem('username'));
  const [concerns,setConcerns]=useState([]);
  const [loading,setLoading]=useState(false);

  const isAuthenticated=Boolean(localStorage.getItem('access_token'));

  const loadConcerns=async()=>{
    setLoading(true);
    try{
      const data=await api.fetchWithAuth('/area_of_concerns/');
      setConcerns(data);
    }catch(error){
      toast.error("Fetch Error",error.message);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(isAuthenticated){
      loadConcerns();
    }
  },[isAuthenticated]);

  const handleLogout=()=>{
    api.logout();
    setUsername(null);
    setConcerns([]);
  };

  if(!isAuthenticated){
    return(
      <LoginPage
        onLoginSuccess={(user)=>setUsername(user)}
      />
    );
  }

  return(
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <AnchorIcon size={22}/>
          <div>
            <div className="brand-name">
              NMDC DocCenter
            </div>
            <div className="brand-tagline">
              Area of Concern System
            </div>
          </div>
        </div>

        <div className="topbar-actions">

        <div className="topbar-badge">
          User: {username}
        </div>

        <button
          className="btn btn-danger btn-sm"
          onClick={handleLogout}
        >
          Sign Out
        </button>

      </div>

      </header>

      {loading?
        <div>Loading...</div>
        :
        <WorkspacePage
          concerns={concerns}
          setConcerns={setConcerns}
          refreshConcerns={loadConcerns}
        />
      }
    </div>
  );
}

export default function App(){
  return(
    <ToastProvider>
      <MainApp/>
    </ToastProvider>
  );
}