// editor.js — handles post creation, editing, drafts and publish actions
import { getCurrentUser, isAdmin } from './auth.js';
import blog from './blog.js';

const POSTS_PATH = '/blog/posts.json';

function uid(){ return Math.random().toString(36).slice(2,9); }

export async function initEditor(){
  const user = getCurrentUser();
  if(!user || !isAdmin()) {
    document.getElementById('editor-root').innerHTML = '<p>Access denied. Editor is admin-only. <a href="/blog/auth.html">Sign in</a></p>';
    return;
  }
  const form = document.getElementById('post-form');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.date = data.date || new Date().toISOString();
    data.author = user.displayName || user.username;
    data.slug = data.slug || (data.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')) + '-' + uid();
    data.status = data.status || 'draft';
    data.tags = data.tags ? data.tags.split(',').map(t=>t.trim()) : [];
    // Fetch existing posts from localStorage fallback
    const existing = (await blog.fetchJSON(POSTS_PATH)) || blog.loadLocalPostsFallback() || [];
    if(data.id){
      // edit
      const idx = existing.findIndex(p=>p.id===data.id);
      if(idx>-1) existing[idx] = Object.assign(existing[idx], data);
    } else {
      data.id = uid(); existing.push(data);
    }
    // Save to localStorage fallback
    await blog.savePosts(existing);
    // If published, append to posts.json (simulated)
    if(data.status === 'published'){
      alert('Post published — on static hosts you need to commit the generated file to deploy.');
    } else {
      alert('Saved draft locally');
    }
    window.location.href = '/blog/';
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('post-form')) initEditor();
});

export default { initEditor };
