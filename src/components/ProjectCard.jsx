import Chip from "./Chip";

export default function ProjectCard({ p, i }) {
  return (
    <article
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs shadow-soft overflow-hidden animate-fadeUp"
      style={{ animationDelay: `${i * 60}ms` }}
    >
      <a href={p.url} className="absolute inset-0" aria-label={p.title}></a>
      <div className="aspect-[16/10] bg-slate-900/60 grid place-items-center">
        <div className="size-24 rounded-xl bg-gradient-to-br from-brand-500 to-cyanx/70 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{p.title}</h3>
        <p className="mt-1 text-sm text-slate-300/90">{p.desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.tags.map((t, idx) => (
            <Chip key={idx}>{t}</Chip>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-600/0 via-brand-600/70 to-cyanx/70 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </article>
  );
}
