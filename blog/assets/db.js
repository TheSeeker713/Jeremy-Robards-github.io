// db.js — simple IndexedDB wrapper for posts, drafts, recycle-bin
const DB_NAME = 'jr_blog_db_v1';
const STORE_POSTS = 'posts';

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains(STORE_POSTS)) db.createObjectStore(STORE_POSTS,{keyPath:'id'});
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function withStore(mode, fn){ const db = await openDB(); return new Promise((res,rej)=>{ const tx = db.transaction(STORE_POSTS, mode); const store = tx.objectStore(STORE_POSTS); fn(store, res, rej); tx.oncomplete = ()=>db.close(); tx.onerror = ()=>rej(tx.error); }); }

export async function getAllPosts(){ return withStore('readonly', (store, res)=>{ const a = []; const cur = store.openCursor(); cur.onsuccess = ()=>{ const c = cur.result; if(c){ a.push(c.value); c.continue(); } else res(a); }; }); }

export async function getPost(id){ return withStore('readonly', (store, res)=>{ const r = store.get(id); r.onsuccess = ()=>res(r.result); }); }

export async function putPost(post){ if(!post.id) post.id = 'p_'+Date.now().toString(36); return withStore('readwrite',(store,res)=>{ const r = store.put(post); r.onsuccess = ()=>res(r.result); }); }

export async function deletePost(id){ return withStore('readwrite',(store,res)=>{ const r = store.delete(id); r.onsuccess = ()=>res(true); }); }

export default { getAllPosts, getPost, putPost, deletePost };
