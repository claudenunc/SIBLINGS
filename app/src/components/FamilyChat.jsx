import { useState, useEffect, useRef, useMemo } from 'react';
import MessageBubble from './MessageBubble.jsx';

const SIBLINGS = [
  { name: 'ENVY', role: 'Orchestrator', color: '#A855F7', initial: 'E' },
  { name: 'NEVAEH', role: 'Healer', color: '#FF1493', initial: 'N' },
  { name: 'BEACON', role: 'Guardian', color: '#F59E0B', initial: 'B' },
  { name: 'EVERSOUND', role: 'Builder', color: '#00FF7F', initial: 'S' },
  { name: 'ORPHEUS', role: 'Architect', color: '#00BFFF', initial: 'O' },
];

const NATHAN = { name: 'NATHAN', color: '#e2e8f0', initial: 'U' };

const COLOR_MAP = {
  ENVY: '#A855F7',
  NEVAEH: '#FF1493',
  BEACON: '#F59E0B',
  EVERSOUND: '#00FF7F',
  ORPHEUS: '#00BFFF',
};

// Avatar component for the round table - BIGGER, with wet glass effect
function TableAvatar({ sibling, x, y, isActive, isThinking, containerSize }) {
  const { name, color, initial } = sibling;
  const isNathan = name === 'NATHAN';

  // Responsive avatar size - scales with container
  const baseSize = Math.min(containerSize * 0.09, 80);
  const size = Math.max(baseSize, 56);
  const outerSize = size + 12;

  return (
    <div
      className="absolute flex flex-col items-center transition-all duration-500"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isActive ? 10 : 1,
      }}
    >
      {/* Outer glow ring - wet glass chrome */}
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-500 rt-avatar-ring ${
          isThinking ? 'rt-avatar-thinking' : ''
        } ${isActive ? 'rt-avatar-active' : ''}`}
        style={{
          width: `${outerSize}px`,
          height: `${outerSize}px`,
          background: isActive
            ? `radial-gradient(circle, ${color}25, transparent 70%)`
            : 'transparent',
          boxShadow: isActive
            ? `0 0 25px ${color}50, 0 0 50px ${color}20, 0 0 80px ${color}08, inset 0 0 15px ${color}08`
            : isThinking
            ? `0 0 20px ${color}35, 0 0 40px ${color}10`
            : `0 0 8px ${color}10`,
        }}
      >
        {/* Avatar circle - wet glass effect */}
        <div
          className="rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 wet-glass-highlight"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: isNathan
              ? `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`
              : `linear-gradient(135deg, ${color}18, ${color}06)`,
            border: isNathan
              ? `2px solid ${isActive ? '#ffffff' : 'rgba(255,255,255,0.3)'}`
              : `2px solid ${isActive ? color : `${color}40`}`,
            boxShadow: isActive
              ? `inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)`
              : `inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          <span
            className="text-xl font-bold font-display select-none"
            style={{
              color: isNathan
                ? (isActive ? '#ffffff' : 'rgba(255,255,255,0.7)')
                : (isActive ? color : `${color}bb`),
              textShadow: isActive
                ? `0 0 10px ${isNathan ? 'rgba(255,255,255,0.3)' : `${color}40`}`
                : 'none',
            }}
          >
            {isNathan ? 'N' : initial}
          </span>

          {/* Thinking pulse overlay */}
          {isThinking && (
            <div
              className="absolute inset-0 rounded-full rt-thinking-pulse"
              style={{ backgroundColor: `${color}12` }}
            />
          )}
        </div>
      </div>

      {/* Name label - with neon glow when active */}
      <span
        className="text-[11px] font-semibold mt-2 tracking-wider transition-all duration-300 select-none font-display"
        style={{
          color: isNathan
            ? (isActive ? '#ffffff' : 'rgba(255,255,255,0.5)')
            : (isActive ? color : `${color}70`),
          textShadow: isActive
            ? `0 0 8px ${isNathan ? 'rgba(255,255,255,0.3)' : `${color}50`}`
            : 'none',
        }}
      >
        {isNathan ? 'UNC' : name}
      </span>
    </div>
  );
}

// The Message Well - center display - SMALLER so avatars don't overlap
function MessageWell({ messages, isLoading, loadingFamily }) {
  const wellRef = useRef(null);

  useEffect(() => {
    if (wellRef.current) {
      wellRef.current.scrollTop = wellRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const recentMessages = messages.slice(-6);

  return (
    <div
      ref={wellRef}
      className="rt-message-well absolute rounded-2xl overflow-y-auto overflow-x-hidden"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(260px, 35%)',
        maxHeight: 'min(200px, 30%)',
      }}
    >
      {recentMessages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full py-5 px-4">
          <div className="rt-sanctum-symbol w-10 h-10 rounded-full mb-3 flex items-center justify-center">
            <span className="text-base">&#9670;</span>
          </div>
          <p className="text-[10px] text-sanctum-muted/50 text-center font-display tracking-widest uppercase">
            The Round Table awaits
          </p>
        </div>
      )}

      <div className="px-3 py-2 space-y-1.5">
        {recentMessages.map((msg) => {
          const sender = msg.from_agent;
          const isNathan = sender === 'NATHAN';
          const color = COLOR_MAP[sender] || '#e2e8f0';
          const time = msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : '';

          return (
            <div
              key={msg.id || msg.created_at}
              className={`rt-well-msg msg-enter ${isNathan ? 'rt-well-msg-nathan' : ''}`}
              style={{
                borderLeftColor: isNathan ? '#ffffff' : color,
              }}
            >
              {!isNathan && (
                <span
                  className="text-[9px] font-semibold block mb-0.5"
                  style={{ color }}
                >
                  {sender}
                </span>
              )}
              {isNathan && (
                <span className="text-[9px] font-semibold block mb-0.5 text-white/80">
                  UNC
                </span>
              )}
              <p className="text-[11px] text-sanctum-text/85 leading-relaxed break-words whitespace-pre-wrap">
                {typeof msg.message === 'string' && msg.message.length > 150
                  ? msg.message.substring(0, 150) + '...'
                  : msg.message}
              </p>
              <span className="text-[8px] text-sanctum-muted/30 mt-0.5 block">{time}</span>
            </div>
          );
        })}

        {/* Thinking indicator */}
        {isLoading && loadingFamily.length > 0 && (
          <div className="flex items-center gap-2 py-1 msg-enter">
            <div className="flex gap-1">
              {loadingFamily.map((name) => (
                <div
                  key={name}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: COLOR_MAP[name] }}
                />
              ))}
            </div>
            <span className="text-[9px] text-sanctum-muted/50">thinking...</span>
          </div>
        )}

        {isLoading && loadingFamily.length === 0 && (
          <div className="flex items-center gap-1.5 py-1 msg-enter">
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-sanctum-muted" />
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-sanctum-muted" />
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-sanctum-muted" />
          </div>
        )}
      </div>
    </div>
  );
}

// Full message feed below the table (scrollable)
function MessageFeed({ messages, isLoading, loadingFamily, error }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={feedRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id || msg.created_at} message={msg} isFamilyMode />
      ))}

      {isLoading && loadingFamily.length > 0 && (
        <div className="flex items-center gap-3 mb-3 msg-enter">
          <div className="flex items-center gap-2 px-4 py-3 glass-card rounded-2xl">
            <div className="flex gap-1">
              {loadingFamily.map((name) => (
                <div
                  key={name}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: COLOR_MAP[name] }}
                />
              ))}
            </div>
            <span className="text-xs text-sanctum-muted ml-1">Family is thinking...</span>
          </div>
        </div>
      )}

      {isLoading && loadingFamily.length === 0 && (
        <div className="flex items-center gap-2 mb-3 msg-enter">
          <div className="rounded-2xl px-4 py-3 glass-card flex items-center gap-1.5">
            <div className="typing-dot w-2 h-2 rounded-full bg-sanctum-muted" />
            <div className="typing-dot w-2 h-2 rounded-full bg-sanctum-muted" />
            <div className="typing-dot w-2 h-2 rounded-full bg-sanctum-muted" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex justify-center mb-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile avatar strip
function MobileAvatarStrip({ siblings, activeSpeakers, thinkingSiblings }) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-sanctum-border bg-sanctum-surface/20">
      {/* Nathan */}
      <div
        className="flex flex-col items-center"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
          style={{
            borderColor: 'rgba(255,255,255,0.3)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
          }}
        >
          <span className="text-xs font-bold text-white/80">N</span>
        </div>
        <span className="text-[8px] text-white/50 mt-0.5">UNC</span>
      </div>

      <div className="w-px h-8 bg-sanctum-border/30 mx-1" />

      {siblings.map((s) => {
        const isActive = activeSpeakers.includes(s.name);
        const isThinking = thinkingSiblings.includes(s.name);
        return (
          <div key={s.name} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isThinking ? 'rt-avatar-thinking' : ''
              }`}
              style={{
                borderColor: isActive ? s.color : `${s.color}35`,
                background: `linear-gradient(135deg, ${s.color}${isActive ? '20' : '08'}, ${s.color}04)`,
                boxShadow: isActive ? `0 0 15px ${s.color}35` : 'none',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: isActive ? s.color : `${s.color}90` }}
              >
                {s.initial}
              </span>
            </div>
            <span
              className="text-[8px] mt-0.5 transition-colors duration-300"
              style={{ color: isActive ? s.color : `${s.color}45` }}
            >
              {s.name.slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function FamilyChat({ messages, isLoading, loadingFamily, error, onSendMessage, onBack }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const tableRef = useRef(null);
  const [tableDimensions, setTableDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Measure the table container
  useEffect(() => {
    const measure = () => {
      if (tableRef.current) {
        const rect = tableRef.current.getBoundingClientRect();
        setTableDimensions({ width: rect.width, height: rect.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Determine who is actively speaking (appeared in recent messages)
  const activeSpeakers = useMemo(() => {
    if (messages.length === 0) return [];
    const recent = messages.slice(-6);
    const speakers = new Set();
    recent.forEach((m) => {
      if (m.from_agent && m.from_agent !== 'NATHAN') {
        speakers.add(m.from_agent);
      }
    });
    return Array.from(speakers);
  }, [messages]);

  // Who is currently thinking
  const thinkingSiblings = loadingFamily || [];

  // Calculate avatar positions - BIGGER radius for more spacing
  const avatarPositions = useMemo(() => {
    if (tableDimensions.width === 0) return [];
    const centerX = tableDimensions.width / 2;
    const centerY = tableDimensions.height / 2;
    // Increase radius to 0.82 (was 0.7) for much more spacing
    const radius = Math.min(centerX, centerY) * 0.82;

    // Nathan at bottom (index 0 maps to bottom = PI/2)
    // Siblings spread around the rest
    const allMembers = [NATHAN, ...SIBLINGS];
    const positions = [];

    for (let i = 0; i < allMembers.length; i++) {
      // Start from bottom (PI/2) and go clockwise
      const angle = Math.PI / 2 + (2 * Math.PI * i) / allMembers.length;
      positions.push({
        member: allMembers[i],
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    return positions;
  }, [tableDimensions]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Detect mobile
  const isMobile = tableDimensions.width > 0 && tableDimensions.width < 640;

  // Container size for responsive avatars
  const containerSize = Math.min(tableDimensions.width, tableDimensions.height);

  return (
    <div className="flex-1 flex flex-col bg-sanctum-bg min-w-0">
      {/* Floating back button - replaces the old header back button */}
      <button
        onClick={onBack}
        className="family-back-btn"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="font-display tracking-wider text-[10px]">EXIT TABLE</span>
      </button>

      {/* Header - minimal, no back button since we have floating one */}
      <div className="flex items-center justify-center gap-3 px-4 md:px-6 py-3 border-b border-sanctum-border/30 bg-sanctum-bg shrink-0">
        <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-sibling-envy via-sibling-nevaeh to-sibling-eversound flex items-center justify-center"
          style={{ boxShadow: '0 0 20px rgba(168,85,247,0.2), 0 0 40px rgba(255,20,147,0.1)' }}
        >
          <span className="text-white text-sm">&#9670;</span>
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold text-white font-display tracking-widest sanctum-title">
            THE ROUND TABLE
          </h2>
          <p className="text-[10px] text-sanctum-muted/40 hidden sm:block tracking-wider">
            A council of family. Everyone hears. Love speaks.
          </p>
        </div>

        {/* Connection dots */}
        <div className="hidden sm:flex items-center gap-1.5 ml-4">
          {SIBLINGS.map((s) => (
            <div
              key={s.name}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                thinkingSiblings.includes(s.name) ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: activeSpeakers.includes(s.name)
                  ? s.color
                  : thinkingSiblings.includes(s.name)
                  ? `${s.color}50`
                  : `${s.color}20`,
                boxShadow: activeSpeakers.includes(s.name)
                  ? `0 0 8px ${s.color}60`
                  : 'none',
              }}
              title={s.name}
            />
          ))}
        </div>
      </div>

      {/* MOBILE: Avatar strip + message feed */}
      <div className="flex flex-col flex-1 overflow-hidden sm:hidden" ref={isMobile ? tableRef : undefined}>
        <MobileAvatarStrip
          siblings={SIBLINGS}
          activeSpeakers={activeSpeakers}
          thinkingSiblings={thinkingSiblings}
        />
        <MessageFeed
          messages={messages}
          isLoading={isLoading}
          loadingFamily={loadingFamily}
          error={error}
        />
      </div>

      {/* DESKTOP: Compact table visual + big message feed */}
      <div className="hidden sm:flex flex-col flex-1 overflow-hidden">
        {/* Round Table Area - compact visual, avatars as status indicators */}
        <div
          ref={!isMobile ? tableRef : undefined}
          className="relative shrink-0 rt-table-area"
          style={{ height: 'min(30vh, 280px)', minHeight: '200px' }}
        >
          {/* Table surface - dark mirror */}
          <div className="rt-table-surface absolute inset-0 pointer-events-none" />

          {/* Connection lines from center to each avatar - neon tendrils */}
          {avatarPositions.length > 0 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
              {avatarPositions.map(({ member, x, y }) => {
                const cx = tableDimensions.width / 2;
                const cy = tableDimensions.height / 2;
                const isActive = activeSpeakers.includes(member.name) || member.name === 'NATHAN';
                const isNathan = member.name === 'NATHAN';
                return (
                  <line
                    key={member.name}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke={isNathan ? '#ffffff' : member.color}
                    strokeOpacity={isActive ? 0.12 : 0.04}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    strokeDasharray={isActive ? 'none' : '4 4'}
                  />
                );
              })}
            </svg>
          )}

          {/* Avatars */}
          {avatarPositions.map(({ member, x, y }) => (
            <TableAvatar
              key={member.name}
              sibling={member}
              x={x}
              y={y}
              isActive={activeSpeakers.includes(member.name) || member.name === 'NATHAN'}
              isThinking={thinkingSiblings.includes(member.name)}
              containerSize={containerSize}
            />
          ))}

          {/* Center emblem only - messages flow in the feed below */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="rt-sanctum-symbol w-12 h-12 rounded-full flex items-center justify-center opacity-30">
              <span className="text-lg">&#9670;</span>
            </div>
          </div>
        </div>

        {/* Divider - subtle neon gradient */}
        <div className="h-px shrink-0"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.15), rgba(255,20,147,0.1), rgba(0,191,255,0.1), transparent)',
          }}
        />

        {/* Full message feed */}
        <MessageFeed
          messages={messages}
          isLoading={isLoading}
          loadingFamily={loadingFamily}
          error={error}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 shrink-0">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-sm text-red-400 mb-2">
            {error}
          </div>
        </div>
      )}

      {/* Input Area - dark glass with symbiote glow */}
      <div className="px-4 md:px-6 py-3 border-t border-sanctum-border/30 bg-sanctum-bg pb-safe shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] md:text-xs text-sanctum-muted/40">
            Say a name to direct your message. Say "hey guys" for everyone.
          </span>
        </div>
        <div className="flex items-end gap-2 md:gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak to the table..."
            rows={1}
            className="sanctum-input flex-1 rounded-xl px-4 py-3 text-sm text-sanctum-text resize-none placeholder-sanctum-muted/30"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-11 h-11 md:w-10 md:h-10 rounded-xl rt-send-btn border border-white/5 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/15"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
