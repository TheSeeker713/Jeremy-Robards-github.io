import KAIAChat from '../../KAIAChat';


import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabaseClient';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [session, setSession] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    // local demo data if no DB
    setPosts([
      { id: 'demo-1', title: 'Hello Blog', body: 'This is a **demo** post. Replace with DB entries later.' }
    ]);

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
      return () => sub.subscription?.unsubscribe();
    }
  }, []);

  async function savePost() {
    if (!title.trim() || !body.trim()) return;
    // If you create a Supabase table "posts" (id uuid default, title text, body text),
    // uncomment below and it will persist:
    /*
    await supabase.from('posts').insert({ title, body });
    */
    // For now, append locally:
    setPosts([{ id: crypto.randomUUID(), title, body }, ...posts]);
    setTitle(''); setBody(''); setShowEditor(false);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-3xl font-bold">Blog</h1>
        {session && (
          <button onClick={() => setShowEditor(v => !v)}
                  className="ml-auto rounded-md border border-white/15 bg-white/5 px-3 py-1.5">
            {showEditor ? 'Close' : 'New Post'}
          </button>
        )}
      </div>

      {showEditor && (
        <div className="mb-6 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <input value={title} onChange={e=>setTitle(e.target.value)}
                 placeholder="Post title"
                 className="rounded-md bg-black/40 border border-white/10 px-3 py-2" />
          <textarea value={body} onChange={e=>setBody(e.target.value)}
                    placeholder="Write in Markdown…"
                    rows="8"
                    className="rounded-md bg-black/40 border border-white/10 px-3 py-2" />
          <button onClick={savePost}
                  className="self-start rounded-md bg-gradient-to-r from-violet-600 to-cyan-400 text-black font-semibold px-4 py-2">
            Publish
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {posts.map(p => (
          <article key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-xl font-semibold">{p.title}</h2>
            <div className="prose prose-invert mt-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.body}</ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
       <KAIAChat />
    </main>
  );
}
