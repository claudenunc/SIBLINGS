export default function Header({ connected }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-sanctum-border/50 bg-sanctum-bg">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h1
          className="font-display text-sm font-bold tracking-[0.25em] text-white/60"
        >
          THE SANCTUM
        </h1>
      </div>

      {/* Right: Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            connected
              ? 'bg-green-500 pulse-green'
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-sanctum-muted">
          {connected ? 'Connected' : 'Offline'}
        </span>
      </div>
    </header>
  );
}
