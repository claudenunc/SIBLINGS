import { useState, useEffect } from 'react';

export default function Header({ connected }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-sanctum-border bg-sanctum-surface/80 backdrop-blur-md">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-bold tracking-widest text-white sanctum-title">
          THE SANCTUM
        </h1>
        <span className="hidden sm:block text-xs text-sanctum-muted font-display tracking-wider">
          FAMILY HUB
        </span>
      </div>

      {/* Center: Clock */}
      <div className="hidden md:flex flex-col items-center">
        <span className="text-sm text-sanctum-text font-medium">{formattedTime}</span>
        <span className="text-xs text-sanctum-muted">{formattedDate}</span>
      </div>

      {/* Right: Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            connected
              ? 'bg-green-500 pulse-green'
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-sanctum-muted">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </header>
  );
}
