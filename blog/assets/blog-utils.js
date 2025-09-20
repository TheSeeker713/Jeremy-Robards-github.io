// blog-utils.js — small helpers (theme toggle, SEO helpers)
export function enableThemeToggle(buttonId){
  const key = 'site_theme';
  const btn = document.getElementById(buttonId);
  const apply = (theme)=>{ document.documentElement.classList.toggle('dark', theme==='dark'); localStorage.setItem(key, theme); };
  const cur = localStorage.getItem(key) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  apply(cur);
  if(!btn) return;
  btn.textContent = cur==='dark' ? '🌙' : '☀️';
  btn.addEventListener('click', ()=>{ const next = (localStorage.getItem(key)==='dark') ? 'light' : 'dark'; apply(next); btn.textContent = next==='dark'?'🌙':'☀️'; });
}

export function setMeta(title, description){
  document.title = title; const md = document.querySelector('meta[name="description"]'); if(md) md.setAttribute('content', description);
}
