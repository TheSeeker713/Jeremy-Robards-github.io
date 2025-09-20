export default function Chip({ children }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-slate-200">
      {children}
    </span>
  );
}
