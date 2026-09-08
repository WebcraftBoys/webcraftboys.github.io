const empty={customers:[],websites:[],tasks:[],contacts:[],services:[],customerServices:[],team:[],activity:[]};
const state={session:null,loading:false,error:null,loaded:false,data:{...empty},lastSync:null};
export const getState=()=>state;
export const setSession=s=>state.session=s;
export const setLoading=v=>state.loading=!!v;
export const setError=e=>state.error=e?String(e.message||e):null;
export function setData(d){state.data={...state.data,...d};state.loaded=true;state.lastSync=new Date();}
export function clearData(){state.data={...empty};state.loaded=false;state.lastSync=null;}
