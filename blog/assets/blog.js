// blog.js — handles loading posts, rendering list, pagination, and post navigation
import { getCurrentUser, onAuthChange, isAdmin } from './auth.js';

const POSTS_PATH = '/blog/posts.json';

async function fetchJSON(path){
  try{ const res = await fetch(path); if(!res.ok) throw new Error('Fetch failed'); return await res.json(); }
  catch(e){ console.warn('Could not load', path, e); return null; }
}

function formatDate(d){
  const dt = new Date(d); return dt.toLocaleDateString();
}

function renderPostCard(post){
  const tpl = document.getElementById('post-card');
  const node = tpl.content.cloneNode(true);
  node.querySelector('.post-link').textContent = post.title;
  node.querySelector('.post-link').href = `/blog/${post.slug}/`;
  node.querySelector('.meta').textContent = `${formatDate(post.date)} — ${post.author}`;
  node.querySelector('.excerpt').textContent = post.excerpt || post.content.slice(0,160) + '...';
  return node;
}

export async function loadPosts(){
  const postsEl = document.getElementById('posts');
  const posts = await fetchJSON(POSTS_PATH) || [];
  // only published and not deleted
  const visible = posts.filter(p => p.status === 'published' && !p.deleted).sort((a,b)=> new Date(b.date)-new Date(a.date));
  postsEl.innerHTML = '';
  visible.forEach(p => postsEl.appendChild(renderPostCard(p)));
}

// client-side helpers for managing posts.json in GH Pages environment
export async function savePosts(posts){
  // Placeholder: on static sites we can't write files — provide localStorage fallback
  localStorage.setItem('blog_posts', JSON.stringify(posts));
}

export async function loadLocalPostsFallback(){
  const raw = localStorage.getItem('blog_posts');
  return raw ? JSON.parse(raw) : null;
}

// init
document.addEventListener('DOMContentLoaded', async ()=>{
  const newBtn = document.getElementById('new-post-btn');
  try{ if(isAdmin()) newBtn.classList.remove('hidden'); }catch(e){}
  onAuthChange(()=>{ if(isAdmin()) newBtn.classList.remove('hidden'); else newBtn.classList.add('hidden'); });
  await loadPosts();
});

// Expose small API for editor and recycle logic
export default { fetchJSON, loadPosts, savePosts, loadLocalPostsFallback };
