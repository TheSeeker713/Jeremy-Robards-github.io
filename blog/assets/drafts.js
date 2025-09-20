// drafts.js — simple helper to manage drafts in localStorage and list them
import blog from './blog.js';
import { getCurrentUser, isAdmin } from './auth.js';

const DRAFT_KEY = 'blog_drafts';

export function saveDraft(data){
  const raw = localStorage.getItem(DRAFT_KEY); const arr = raw?JSON.parse(raw):[];
  if(!data.id) data.id = Date.now().toString(36);
  const idx = arr.findIndex(d=>d.id===data.id);
  if(idx>-1) arr[idx] = data; else arr.push(data);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(arr));
}

export function loadDrafts(){ const raw = localStorage.getItem(DRAFT_KEY); return raw?JSON.parse(raw):[]; }

export function removeDraft(id){ const arr = loadDrafts().filter(d=>d.id!==id); localStorage.setItem(DRAFT_KEY, JSON.stringify(arr)); }

export function listDraftsUI(root){
  const user = getCurrentUser(); if(!user || !isAdmin()){ root.innerHTML = '<p>Access denied. Drafts are admin-only.</p>'; return; }
  const drafts = loadDrafts(); root.innerHTML = '';
  drafts.forEach(d=>{
    const el = document.createElement('div'); el.className='p-3 bg-gray-50 dark:bg-gray-800 rounded mb-2';
    el.innerHTML = `<strong>${d.title||'(untitled)'}</strong> — <small>${d.date||''}</small>
    <div class="mt-2"><a href="/blog/editor.html?id=${d.id}" class="mr-2 text-sm text-blue-600">Edit</a>
    <a href="#" class="text-sm text-red-600 delete">Delete</a></div>`;
    el.querySelector('.delete').addEventListener('click', (e)=>{ e.preventDefault(); removeDraft(d.id); listDraftsUI(root); });
    root.appendChild(el);
  });
}

export default { saveDraft, loadDrafts, removeDraft, listDraftsUI };
