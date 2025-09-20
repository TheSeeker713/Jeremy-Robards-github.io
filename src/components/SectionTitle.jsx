export default function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
      <div className="h-px flex-1 bg-white/10"></div>
    </div>
  );
}
    