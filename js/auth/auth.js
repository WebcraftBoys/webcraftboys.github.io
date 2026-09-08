import {CONFIG} from '../config/config.js';import {setSession} from '../core/state.js';
export const supabase=window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_PUBLISHABLE_KEY);
export async function getSession(){const {data,error}=await supabase.auth.getSession();if(error)throw error;setSession(data.session);return data.session}
export async function signIn(email,password){const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;setSession(data.session);return data.session}
export async function signOut(){const {error}=await supabase.auth.signOut();if(error)throw error;setSession(null)}
export async function resetPassword(email){const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:location.origin+location.pathname});if(error)throw error}
export function onAuthChange(cb){return supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);cb(s)})}
