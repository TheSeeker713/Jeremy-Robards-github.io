import React, { useState } from 'react';

export default function KAIAChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey, I’m KAIA. What do you want to test?' }
  ]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');

    // TODO: wire up to your API (OpenAI/Claude proxy). For now, echo:
    const reply = { role: 'assistant', content: `You said: "${userMsg.content}"` };
    setMessages(m => [...m, reply]);
  }

  return (
    <>
      {/* Toggle button (top-right) */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed right-4 top-4 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur hover:bg-white/20"
        aria-label="Toggle KAIA chat"
      >
        <img src="/kaia.png" alt="KAIA" className="h-10 w-10 rounded-full object-cover" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed right-4 top-20 w-[360px] max-w-[90vw] rounded-2xl border border-white/10 bg-black/70 backdrop-blur shadow-xl">
          <div className="flex items-center gap-2 p-3 border-b border-white/10">
            <img src="/kaia.png" alt="" className="h-8 w-8 rounded-full" />
            <div className="font-semibold">KAIA</div>
            <button onClick={()=>setOpen(false)} className="ml-auto text-sm text-slate-300 hover:text-white">Close</button>
          </div>
          <div className="p-3 max-h-[46vh] overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'assistant' ? 'text-slate-200' : 'text-slate-300'}>
                <span className="text-xs uppercase mr-2 opacity-60">{m.role}</span>
                {m.content}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2"
              placeholder="Type a message…"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter' && send()}
            />
            <button onClick={send} className="rounded-md bg-gradient-to-r from-violet-600 to-cyan-400 text-black font-semibold px-3">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
