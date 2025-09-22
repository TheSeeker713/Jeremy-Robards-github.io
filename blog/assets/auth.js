// auth.js — developer-only access via padlock prompt
// This file implements a small dev-access flow used to enable editing tools.

const DEV_KEY = 'blog_dev_access_v1';
const SECRET_ANSWER = '713';

export function hasDevAccess(){ try{ return localStorage.getItem(DEV_KEY) === '1'; }catch(e){return false;} }

export function grantDevAccess(){ try{ localStorage.setItem(DEV_KEY,'1'); dispatchChange(); }catch(e){} }

export function revokeDevAccess(){ try{ localStorage.removeItem(DEV_KEY); dispatchChange(); }catch(e){} }

export function requestDevAccess(promptFn = window.prompt){
  const ans = promptFn('who has NiN like no other?');
  if(ans === SECRET_ANSWER){ grantDevAccess(); return true; }
  return false;
}

const listeners = new Set();
function dispatchChange(){ listeners.forEach(cb=>{ try{ cb(hasDevAccess()); }catch(e){} }); }
export function onDevChange(cb){ listeners.add(cb); return ()=>listeners.delete(cb); }

// Auto-dispatch current state to DOM elements that expect `auth-ui` (padlock image)
document.addEventListener('DOMContentLoaded', ()=>{
  const authUi = document.getElementById('auth-ui');
  if(!authUi) return;
  function render(){
    authUi.innerHTML = '';
    const lock = document.createElement('img');
    lock.src = '/blog/assets/padlock.svg';
    lock.alt = hasDevAccess() ? 'Developer access unlocked' : 'Developer access locked';
    lock.style.width = '28px'; lock.style.cursor = 'pointer';
    lock.addEventListener('click', ()=>{
      if(hasDevAccess()){ if(confirm('Revoke developer access?')){ revokeDevAccess(); render(); } return; }
      const ok = requestDevAccess(); if(ok) { alert('Developer access granted'); render(); } else alert('Incorrect');
    });
    authUi.appendChild(lock);
  }
  render();
  onDevChange(()=>render());
});

export default { hasDevAccess, requestDevAccess, grantDevAccess, revokeDevAccess, onDevChange };
// auth.js — simple auth management using users.json and localStorage
// Passwords are hashed client-side (SHA-256) before storing in users.json (simulated)

const USERS_PATH = '/blog/users.json';

function sha256(msg){
  const enc = new TextEncoder();
  return crypto.subtle.digest('SHA-256', enc.encode(msg)).then(buf=>{
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  });
}

async function fetchJSON(path){
  try{ const res = await fetch(path); if(!res.ok) throw new Error('Fetch failed'); return await res.json(); }
  catch(e){ console.warn('Could not load', path, e); return null; }
}

let currentUser = null;
const listeners = new Set();

function notify(){ listeners.forEach(cb=>cb(currentUser)); }

export async function initAuth(){
  // try load users.json; if not present or empty, create default admin account in localStorage
  const users = await fetchJSON(USERS_PATH) || [];
  if(users.length === 0){
    const defaultPass = 'admin123';
    const hash = await sha256(defaultPass);
    const admin = { username: 'admin', passwordHash: hash, displayName: 'Administrator' };
    // store in localStorage as simulated users.json
    localStorage.setItem('blog_users', JSON.stringify([admin]));
    console.warn('No users.json found — created default admin in localStorage (password: admin123)');
  } else {
    // cache users in localStorage for edits from UI
    localStorage.setItem('blog_users', JSON.stringify(users));
  }
}

// sign-up is disabled for this demo. To add users, edit /blog/users.json before publishing.

export async function signIn(username, password){
  const raw = localStorage.getItem('blog_users');
  const users = raw ? JSON.parse(raw) : [];
  const hash = await sha256(password);
  const u = users.find(x=>x.username===username && x.passwordHash===hash);
  if(!u) throw new Error('Invalid credentials');
  currentUser = u; localStorage.setItem('blog_current', JSON.stringify(u)); notify();
  return u;
}

export function isAdmin(){ const u = getCurrentUser(); return !!(u && (u.username==='admin' || u.admin)); }

export function signOut(){ currentUser = null; localStorage.removeItem('blog_current'); notify(); }

export function getCurrentUser(){ if(!currentUser){ const raw = localStorage.getItem('blog_current'); if(raw) currentUser = JSON.parse(raw); } return currentUser; }

export function onAuthChange(cb){ listeners.add(cb); return ()=>listeners.delete(cb); }

// helper for UI wiring on pages
document.addEventListener('DOMContentLoaded', async ()=>{
  await initAuth();
  const authUi = document.getElementById('auth-ui');
  if(!authUi) return;
  function render(){
    const user = getCurrentUser();
    authUi.innerHTML = '';
    const mode = document.createElement('div');
    if(user){
      mode.innerHTML = `<span>Welcome, ${user.displayName||user.username}</span> <a id="signout" class="ml-3 text-sm text-blue-600">Sign Out</a>`;
      authUi.appendChild(mode);
      authUi.querySelector('#signout').addEventListener('click', ()=>{ signOut(); render(); });
    } else {
      mode.innerHTML = `<a href="/blog/auth.html" class="text-sm text-blue-600">Sign In</a>`;
      authUi.appendChild(mode);
    }
  }
  render();
  onAuthChange(()=>render());
});

export default { initAuth, signUp, signIn, signOut, getCurrentUser };
