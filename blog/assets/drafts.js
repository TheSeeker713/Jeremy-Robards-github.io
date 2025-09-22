// drafts.js — simple helper to manage drafts in localStorage and list them
import db from './db.js';
import { hasDevAccess } from './auth.js';

export async function saveDraft(data){
  data.status = 'draft'; if(!data.id) data.id = 'd_'+Date.now().toString(36);
  await db.putPost(data);
}

export async function loadDrafts(){ const all = await db.getAllPosts(); return (all||[]).filter(p=>p.status==='draft'); }

export async function removeDraft(id){ await db.deletePost(id); }

export async function listDraftsUI(root){ if(!hasDevAccess()){ root.innerHTML = '<p>Access denied. Drafts are developer-only.</p>'; return; } const drafts = await loadDrafts(); root.innerHTML = ''; drafts.forEach(d=>{ const el = document.createElement('div'); el.className='p-3 bg-gray-50 dark:bg-gray-800 rounded mb-2'; el.innerHTML = `<strong>${d.title||'(untitled)'}</strong> — <small>${d.date||''}</small><div class="mt-2"><a href="/blog/editor.html?id=${d.id}" class="mr-2 text-sm text-blue-600">Edit</a><a href="#" class="text-sm text-red-600 delete">Delete</a></div>`; el.querySelector('.delete').addEventListener('click', async (e)=>{ e.preventDefault(); await removeDraft(d.id); listDraftsUI(root); }); root.appendChild(el); }); }

export default { saveDraft, loadDrafts, removeDraft, listDraftsUI };
