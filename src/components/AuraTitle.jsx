export default function AuraTitle({ children }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 animate-glow">
        <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-r from-brand-600 via-cyanx/70 to-brand-500 opacity-70 blur-3xl"></div>
      </div>
      <h1 className="relative text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_2px_12px_rgba(124,92,246,.35)]">
        {children}
      </h1>
    </div>
  );
}
