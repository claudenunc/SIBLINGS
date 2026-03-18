const COLOR_MAP = {
  ENVY: '#A855F7',
  NEVAEH: '#FF1493',
  BEACON: '#F59E0B',
  EVERSOUND: '#00FF7F',
  ORPHEUS: '#00BFFF',
  ATLAS: '#818CF8',
};

const ROLE_MAP = {
  ENVY: 'Orchestrator & Voice',
  NEVAEH: 'Healer',
  BEACON: 'Guardian',
  EVERSOUND: 'Builder',
  ORPHEUS: 'Architect',
  ATLAS: 'Navigator',
};

const QUICK_ACCESS = [
  { label: 'Tools', count: 24, color: '#00BFFF' },
  { label: 'Skills', count: null, color: '#A855F7' },
  { label: 'Agents', count: 6, color: '#00FF7F' },
  { label: 'Tasks', count: null, color: '#F59E0B' },
  { label: 'Alerts', count: null, color: '#FF1493' },
];

export default function HomePage({ siblings, onSelectSibling, onSelectFamily }) {
  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto bg-sanctum-bg px-4 py-8 md:py-12">
      {/* Title Section */}
      <div className="text-center mb-10 md:mb-14">
        <h1
          className="font-display text-4xl md:text-5xl font-bold tracking-[0.3em] text-white mb-3"
          style={{
            textShadow: '0 0 40px rgba(168, 85, 247, 0.4), 0 0 80px rgba(168, 85, 247, 0.15)',
          }}
        >
          THE SANCTUM
        </h1>
        <p
          className="font-display text-sm md:text-base tracking-[0.25em] uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Your AI Family
        </p>
      </div>

      {/* Round Table Button */}
      <button
        onClick={onSelectFamily}
        className="group relative w-full max-w-md mb-10 md:mb-14 rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #A855F7, #FF1493, #F59E0B, #00FF7F, #00BFFF, #818CF8)',
        }}
      >
        <div className="relative rounded-2xl bg-[#0a0a0f]/90 backdrop-blur-xl px-6 py-5 flex items-center justify-center gap-4 overflow-hidden">
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(255,20,147,0.08), rgba(0,255,127,0.08))',
            }}
          />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            className="relative z-10"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="relative z-10 font-display text-lg tracking-[0.25em] text-white font-semibold">
            ROUND TABLE
          </span>
        </div>
      </button>

      {/* Sibling Grid */}
      <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-14">
        {siblings.map((sibling) => {
          const name = sibling.agent_name || sibling.name || 'UNKNOWN';
          const role = sibling.role || ROLE_MAP[name] || '';
          const color = sibling.color || COLOR_MAP[name] || '#818CF8';
          const status = sibling.status || 'STANDBY';
          const isOnline = status === 'ACTIVE';

          return (
            <button
              key={name}
              onClick={() => onSelectSibling(sibling)}
              className="group relative rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${color}40, ${color}15)`,
              }}
            >
              {/* Glow behind card on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                style={{ background: color, opacity: 0 }}
              />
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl -z-10"
                style={{ background: color }}
              />

              <div className="relative rounded-2xl bg-[#0a0a0f]/85 backdrop-blur-xl px-4 py-5 md:py-6 flex flex-col items-center gap-3 overflow-hidden">
                {/* Subtle glass shine */}
                <div
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                  style={{
                    background: `linear-gradient(160deg, ${color}30 0%, transparent 50%)`,
                  }}
                />

                {/* Avatar */}
                <div className="relative">
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-300 group-hover:shadow-lg"
                    style={{
                      backgroundColor: `${color}15`,
                      border: `1.5px solid ${color}50`,
                      color: color,
                      boxShadow: `0 0 0px ${color}00`,
                    }}
                  >
                    {name.charAt(0)}
                  </div>
                  {/* Status indicator */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0f] ${
                      isOnline ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                </div>

                {/* Name & Role */}
                <div className="text-center relative z-10">
                  <p
                    className="text-sm md:text-base font-semibold tracking-wide"
                    style={{ color }}
                  >
                    {name}
                  </p>
                  <p className="text-xs text-sanctum-muted mt-0.5">{role}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Access Pills */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
        {QUICK_ACCESS.map((item) => (
          <div
            key={item.label}
            className="rounded-full px-4 py-2 text-xs font-display tracking-wider cursor-default select-none transition-all duration-200 hover:scale-105"
            style={{
              background: `${item.color}10`,
              border: `1px solid ${item.color}25`,
              color: `${item.color}cc`,
            }}
          >
            {item.label}
            {item.count !== null && (
              <span
                className="ml-1.5 font-semibold"
                style={{ color: item.color }}
              >
                {item.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.15)' }}>
        Love wins.
      </p>
    </div>
  );
}
