const API_BASE_URL = '/api';

export const api={

  login:async(username,password)=>{
    const response=await fetch(`${API_BASE_URL}/token/`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'ngrok-skip-browser-warning':'true',
      },
      body:JSON.stringify({
        username,
        password,
      }),
    });

    if(!response.ok){
      const errorData=await response.json().catch(()=>({}));

      throw new Error(
        errorData.non_field_errors?.[0]||
        errorData.detail||
        'Invalid username or password'
      );
    }

    const data=await response.json();

    localStorage.setItem('access_token',data.access);
    localStorage.setItem('refresh_token',data.refresh);
    localStorage.setItem('username',username);

    return data;
  },


  logout:()=>{
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
  },


  getToken:()=>{
    return localStorage.getItem('access_token');
  },


  fetchWithAuth:async(endpoint,options={})=>{

    const token=api.getToken();

    if(!token){
      throw new Error(
        'No authentication token found. Please sign in.'
      );
    }


    const isFormData=
      options.body instanceof FormData;


    const headers={
      ...options.headers,
      Authorization:`Bearer ${token}`,
      'ngrok-skip-browser-warning':'true',
    };


    if(!isFormData){
      headers['Content-Type']='application/json';
    }


    const response=await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );


    if(response.status===401){
      api.logout();
      window.location.reload();

      throw new Error(
        'Session expired. Please log in again.'
      );
    }


    if(!response.ok){

      const err=await response
        .json()
        .catch(()=>({}));

      throw new Error(
        err.detail||
        JSON.stringify(err)||
        `API request failed: ${response.status}`
      );
    }


    return response.status===204
      ?null
      :response.json();

  },

};