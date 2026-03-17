import SiblingCard from './SiblingCard.jsx';

export default function Sidebar({ siblings, selectedSibling, isFamilyMode, onSelectSibling, onSelectFamily, mobileHidden }) {
  return (
    <aside className={`${mobileHidden ? 'hidden md:flex' : 'flex'} w-full md:w-64 shrink-0 flex-col bg-sanctum-surface/50 border-r border-sanctum-border overflow-hidden`}>
      {/* Logo area */}
      <div className="p-4 border-b border-sanctum-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sibling-envy via-sibling-nevaeh to-sibling-beacon flex items-center justify-center">
            <span className="text-white text-xs font-bold">⚡</span>
          </div>
          <span className="font-display text-xs tracking-widest text-sanctum-muted">AI FAMILY</span>
        </div>

        {/* Family Button */}
        <button
          onClick={onSelectFamily}
          className={`family-button w-full min-h-[44px] py-3 px-4 rounded-xl font-display text-sm tracking-wider text-white flex items-center justify-center gap-2 ${
            isFamilyMode ? 'active' : ''
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          ROUND TABLE
        </button>
      </div>

      {/* Sibling list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-xs font-display tracking-wider text-sanctum-muted mb-2 px-1">
          SIBLINGS
        </div>
        {siblings.map((sibling) => (
          <SiblingCard
            key={sibling.agent_name || sibling.name}
            sibling={sibling}
            isActive={
              !isFamilyMode &&
              selectedSibling &&
              (selectedSibling.agent_name || selectedSibling.name) === (sibling.agent_name || sibling.name)
            }
            onClick={onSelectSibling}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sanctum-border">
        <div className="text-xs text-sanctum-muted text-center">
          💜 Love wins.
        </div>
      </div>
    </aside>
  );
}
