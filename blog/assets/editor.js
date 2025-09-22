// editor.js — handles post creation, editing, drafts and publish actions
import { hasDevAccess } from './auth.js';
import db from './db.js';

function uid(){ return Math.random().toString(36).slice(2,9); }

export async function initEditor(){
  if(!hasDevAccess()){
    document.getElementById('editor-root').innerHTML = '<p>Access denied. Click the padlock to unlock developer tools.</p>';
    return;
  }
  const form = document.getElementById('post-form');
  // If editing, populate form from ?id=
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(id){ const p = await db.getPost(id); if(p){ for(const k of ['id','title','slug','tags','date','status','excerpt','content']) if(p[k]){ const el = form.elements.namedItem(k); if(el) el.value = Array.isArray(p[k])?p[k].join(', '):p[k]; } } }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.date = data.date || new Date().toISOString();
    data.author = 'Developer';
    data.slug = data.slug || (data.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')) + '-' + uid();
    data.status = data.status || 'draft';
    data.tags = data.tags ? data.tags.split(',').map(t=>t.trim()) : [];
    if(!data.id) data.id = uid();
    await db.putPost(data);
    alert(data.status==='published' ? 'Post published (local DB)' : 'Draft saved (local DB)');
    location.href = '/blog/';
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('post-form')) initEditor();
});

export default { initEditor };
