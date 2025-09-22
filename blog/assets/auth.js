// auth.js — developer-only access via padlock prompt
// Accessible padlock that grants dev editing tools when the correct secret is provided.

const DEV_KEY = 'blog_dev_access_v1';
const SECRET_ANSWER = '713';

export function hasDevAccess(){ try{ return localStorage.getItem(DEV_KEY) === '1'; }catch(e){ return false; } }

export function grantDevAccess(){ try{ localStorage.setItem(DEV_KEY, '1'); dispatchChange(); }catch(e){} }

export function revokeDevAccess(){ try{ localStorage.removeItem(DEV_KEY); dispatchChange(); }catch(e){} }

export function requestDevAccess(){
  return new Promise((resolve)=>{
    try{
      // build modal
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.background = 'rgba(0,0,0,0.5)'; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = 9999;
      overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true');

      const panel = document.createElement('div');
      panel.style.background = '#fff'; panel.style.color = '#000'; panel.style.padding = '18px'; panel.style.borderRadius = '8px'; panel.style.maxWidth = '420px'; panel.style.width = '100%'; panel.style.boxShadow = '0 6px 24px rgba(0,0,0,0.3)';
      panel.innerHTML = `
        <h3 style="margin:0 0 8px;font-size:16px">Developer check</h3>
        <p style="margin:0 0 12px;font-size:13px">who has NiN like no other?</p>
      `;

      const input = document.createElement('input');
      input.type = 'text'; input.autocomplete = 'off'; input.style.width = '100%'; input.style.padding = '8px'; input.style.marginBottom = '10px'; input.setAttribute('aria-label','Developer secret');

      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex'; btnRow.style.justifyContent = 'flex-end'; btnRow.style.gap = '8px';

      const cancel = document.createElement('button'); cancel.type='button'; cancel.textContent='Cancel'; cancel.style.padding='6px 10px';
      const submit = document.createElement('button'); submit.type='button'; submit.textContent='Unlock'; submit.style.padding='6px 10px'; submit.style.background='#0ea5e9'; submit.style.color='#fff'; submit.style.border='none'; submit.style.borderRadius='4px';

      btnRow.appendChild(cancel); btnRow.appendChild(submit);
      panel.appendChild(input); panel.appendChild(btnRow);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      input.focus();

      function cleanup(){ overlay.remove(); }

      cancel.addEventListener('click', ()=>{ cleanup(); resolve(false); });
      submit.addEventListener('click', ()=>{
        const v = input.value.trim();
        if(v === SECRET_ANSWER){ grantDevAccess(); cleanup(); resolve(true); }
        else { alert('Incorrect'); input.focus(); }
      });

      input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ submit.click(); } if(e.key === 'Escape'){ cancel.click(); } });

    }catch(e){
      // fallback to prompt
      try{ const ans = window.prompt('who has NiN like no other?'); if(ans === SECRET_ANSWER){ grantDevAccess(); resolve(true); } else resolve(false); }catch(err){ resolve(false); }
    }
  });
}

const listeners = new Set();
function dispatchChange(){ listeners.forEach(cb=>{ try{ cb(hasDevAccess()); }catch(e){} }); }
export function onDevChange(cb){ listeners.add(cb); return ()=>listeners.delete(cb); }

// Render accessible padlock in `#auth-ui` and wire interactions
document.addEventListener('DOMContentLoaded', ()=>{
  const authUi = document.getElementById('auth-ui');
  if(!authUi) return;
  function render(){
    authUi.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'p-0 bg-transparent border-0';
    btn.title = hasDevAccess() ? 'Developer access unlocked' : 'Developer access locked';
    btn.setAttribute('aria-pressed', hasDevAccess() ? 'true' : 'false');
    btn.setAttribute('aria-label', btn.title);

    const lock = document.createElement('img');
    lock.src = '/blog/assets/padlock.svg';
    lock.alt = btn.title;
    lock.style.width = '28px'; lock.style.height = '28px'; lock.style.pointerEvents = 'none';

    btn.appendChild(lock);

    btn.addEventListener('click', ()=>{
      if(hasDevAccess()){
        if(confirm('Revoke developer access?')){ revokeDevAccess(); render(); }
        return;
      }
      const ok = requestDevAccess();
      if(ok){ alert('Developer access granted'); render(); } else { alert('Incorrect'); }
    });

    btn.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); btn.click(); }
    });

    authUi.appendChild(btn);
  }
  render();
  onDevChange(()=>render());
});
export default { hasDevAccess, requestDevAccess, grantDevAccess, revokeDevAccess, onDevChange };
