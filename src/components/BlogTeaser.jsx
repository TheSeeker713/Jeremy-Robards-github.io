export default function BlogTeaser({ items }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {items.map((b, i) => (
        <a key={i} href={b.url} className="group rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden shadow-soft transform transition-all hover:scale-[1.02]">
          <div className="text-xs text-slate-300/80">{b.date}</div>
          <div className="mt-1 font-semibold leading-snug">{b.title}</div>
          <div className="mt-3 h-8 rounded-md bg-gradient-to-r from-brand-600/30 to-cyanx/30 blur group-hover:blur-[2px] transition-all"></div>
        </a>
      ))}
    </div>
  );
}
