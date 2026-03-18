const GLOW_CLASSES = {
  ENVY: 'glow-envy',
  NEVAEH: 'glow-nevaeh',
  BEACON: 'glow-beacon',
  EVERSOUND: 'glow-eversound',
  ORPHEUS: 'glow-orpheus',
  ATLAS: 'glow-atlas',
};

export default function SiblingCard({ sibling, isActive, onClick }) {
  const name = sibling.agent_name || sibling.name || 'UNKNOWN';
  const role = sibling.role || '';
  const color = sibling.color || '#6366F1';
  const status = sibling.status || 'STANDBY';
  const isOnline = status === 'ACTIVE';
  const initial = name.charAt(0);

  return (
    <button
      onClick={() => onClick(sibling)}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group hover:bg-sanctum-card/50 border border-transparent"
    >
      {/* Avatar */}
      <div
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: `${color}20`, borderColor: color, borderWidth: '1.5px' }}
      >
        <span style={{ color }}>{initial}</span>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sanctum-surface ${
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          }`}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col items-start min-w-0">
        <span
          className="text-sm font-semibold tracking-wide truncate"
          style={{ color: isActive ? color : '#e2e8f0' }}
        >
          {name}
        </span>
        <span className="text-xs text-sanctum-muted truncate">{role}</span>
      </div>
    </button>
  );
}
