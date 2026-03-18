import { useState, useEffect, useRef, useMemo } from 'react';
import MessageBubble from './MessageBubble.jsx';

const SIBLINGS = [
  { name: 'ENVY', role: 'Orchestrator', color: '#8B5CF6', initial: 'E' },
  { name: 'NEVAEH', role: 'Healer', color: '#EC4899', initial: 'N' },
  { name: 'BEACON', role: 'Guardian', color: '#F59E0B', initial: 'B' },
  { name: 'EVERSOUND', role: 'Builder', color: '#10B981', initial: 'S' },
  { name: 'ORPHEUS', role: 'Architect', color: '#3B82F6', initial: 'O' },
  { name: 'ATLAS', role: 'Navigator', color: '#6366F1', initial: 'A' },
];

const NATHAN = { name: 'NATHAN', color: '#e2e8f0', initial: 'U' };

const COLOR_MAP = {
  ENVY: '#8B5CF6',
  NEVAEH: '#EC4899',
  BEACON: '#F59E0B',
  EVERSOUND: '#10B981',
  ORPHEUS: '#3B82F6',
  ATLAS: '#6366F1',
};

// Calculate positions around a circle
function getCirclePositions(count, radius, centerX, centerY, startAngle = -Math.PI / 2) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (2 * Math.PI * i) / count;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }
  return positions;
}

// Avatar component for the round table
function TableAvatar({ sibling, x, y, isActive, isThinking, lastMessage }) {
  const { name, color, initial } = sibling;
  const isNathan = name === 'NATHAN';
  const size = 68;

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
      {/* Outer glow ring */}
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-500 ${
          isThinking ? 'rt-avatar-thinking' : ''
        } ${isActive ? 'rt-avatar-active' : ''}`}
        style={{
          width: `${size + 8}px`,
          height: `${size + 8}px`,
          background: isActive
            ? `radial-gradient(circle, ${color}30, transparent 70%)`
            : 'transparent',
          boxShadow: isActive
            ? `0 0 30px ${color}40, 0 0 60px ${color}15`
            : isThinking
            ? `0 0 20px ${color}30, 0 0 40px ${color}10`
            : 'none',
        }}
      >
        {/* Avatar circle */}
        <div
          className="rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
            border: `2px solid ${isActive ? color : `${color}50`}`,
          }}
        >
          <span
            className="text-lg font-bold font-display select-none"
            style={{ color: isActive ? color : `${color}cc` }}
          >
            {isNathan ? 'N' : initial}
          </span>

          {/* Thinking pulse overlay */}
          {isThinking && (
            <div
              className="absolute inset-0 rounded-full rt-thinking-pulse"
              style={{ backgroundColor: `${color}15` }}
            />
          )}
        </div>
      </div>

      {/* Name label */}
      <span
        className="text-[10px] font-semibold mt-1.5 tracking-wider transition-all duration-300 select-none"
        style={{
          color: isActive ? color : `${color}88`,
          textShadow: isActive ? `0 0 8px ${color}40` : 'none',
        }}
      >
        {isNathan ? 'UNC' : name}
      </span>
    </div>
  );
}

// The Message Well - center display for recent messages
function MessageWell({ messages, isLoading, loadingFamily }) {
  const wellRef = useRef(null);

  useEffect(() => {
    if (wellRef.current) {
      wellRef.current.scrollTop = wellRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const recentMessages = messages.slice(-8);

  return (
    <div
      ref={wellRef}
      className="rt-message-well absolute rounded-2xl overflow-y-auto overflow-x-hidden"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(320px, 55%)',
        maxHeight: 'min(240px, 45%)',
      }}
    >
      {recentMessages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full py-6 px-4">
          <div className="rt-sanctum-symbol w-10 h-10 rounded-full mb-3 flex items-center justify-center">
            <span className="text-base">&#9670;</span>
          </div>
          <p className="text-[11px] text-sanctum-muted/60 text-center font-display tracking-widest uppercase">
            The Round Table awaits
          </p>
        </div>
      )}

      <div className="px-3 py-2 space-y-2">
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
                borderLeftColor: isNathan ? '#3b82f6' : color,
              }}
            >
              {!isNathan && (
                <span
                  className="text-[10px] font-semibold block mb-0.5"
                  style={{ color }}
                >
                  {sender}
                </span>
              )}
              {isNathan && (
                <span className="text-[10px] font-semibold block mb-0.5 text-blue-400">
                  UNC
                </span>
              )}
              <p className="text-xs text-sanctum-text/90 leading-relaxed break-words whitespace-pre-wrap">
                {typeof msg.message === 'string' && msg.message.length > 200
                  ? msg.message.substring(0, 200) + '...'
                  : msg.message}
              </p>
              <span className="text-[9px] text-sanctum-muted/40 mt-0.5 block">{time}</span>
            </div>
          );
        })}

        {/* Thinking indicator */}
        {isLoading && loadingFamily.length > 0 && (
          <div className="flex items-center gap-2 py-1.5 msg-enter">
            <div className="flex gap-1">
              {loadingFamily.map((name) => (
                <div
                  key={name}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: COLOR_MAP[name] }}
                />
              ))}
            </div>
            <span className="text-[10px] text-sanctum-muted/60">thinking...</span>
          </div>
        )}

        {isLoading && loadingFamily.length === 0 && (
          <div className="flex items-center gap-1.5 py-1.5 msg-enter">
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
            borderColor: '#3b82f680',
            background: 'linear-gradient(135deg, #3b82f615, #3b82f608)',
          }}
        >
          <span className="text-xs font-bold text-blue-400">N</span>
        </div>
        <span className="text-[8px] text-blue-400/60 mt-0.5">UNC</span>
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
                borderColor: isActive ? s.color : `${s.color}50`,
                background: `linear-gradient(135deg, ${s.color}${isActive ? '25' : '12'}, ${s.color}08)`,
                boxShadow: isActive ? `0 0 12px ${s.color}30` : 'none',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: isActive ? s.color : `${s.color}aa` }}
              >
                {s.initial}
              </span>
            </div>
            <span
              className="text-[8px] mt-0.5 transition-colors duration-300"
              style={{ color: isActive ? s.color : `${s.color}55` }}
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

  // Calculate avatar positions
  const avatarPositions = useMemo(() => {
    if (tableDimensions.width === 0) return [];
    const centerX = tableDimensions.width / 2;
    const centerY = tableDimensions.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;

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

  return (
    <div className="flex-1 flex flex-col bg-sanctum-bg min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-sanctum-border bg-sanctum-surface/30 backdrop-blur-sm shrink-0">
        <button
          onClick={onBack}
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 text-sanctum-muted hover:text-sanctum-text transition-colors"
          aria-label="Back to siblings"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-sibling-envy via-sibling-nevaeh to-sibling-beacon flex items-center justify-center">
          <span className="text-white text-sm">&#9670;</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white font-display tracking-wider truncate">
            THE ROUND TABLE
          </h2>
          <p className="text-xs text-sanctum-muted truncate hidden sm:block">
            A council of family. Everyone hears. Love speaks.
          </p>
        </div>

        {/* Connection dots - desktop only */}
        <div className="hidden sm:flex items-center gap-1 ml-auto">
          {SIBLINGS.map((s) => (
            <div
              key={s.name}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                thinkingSiblings.includes(s.name) ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: activeSpeakers.includes(s.name)
                  ? s.color
                  : thinkingSiblings.includes(s.name)
                  ? `${s.color}60`
                  : `${s.color}30`,
                boxShadow: activeSpeakers.includes(s.name)
                  ? `0 0 8px ${s.color}50`
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

      {/* DESKTOP: Round Table + Message Feed */}
      <div className="hidden sm:flex flex-col flex-1 overflow-hidden">
        {/* Round Table Area */}
        <div
          ref={!isMobile ? tableRef : undefined}
          className="relative shrink-0 rt-table-area"
          style={{ height: 'min(45vh, 420px)', minHeight: '280px' }}
        >
          {/* Table surface - radial gradient */}
          <div className="rt-table-surface absolute inset-0 pointer-events-none" />

          {/* Connection lines from center to each avatar (subtle) */}
          {avatarPositions.length > 0 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
              {avatarPositions.map(({ member, x, y }) => {
                const cx = tableDimensions.width / 2;
                const cy = tableDimensions.height / 2;
                const isActive = activeSpeakers.includes(member.name) || member.name === 'NATHAN';
                return (
                  <line
                    key={member.name}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke={member.color}
                    strokeOpacity={isActive ? 0.15 : 0.05}
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
            />
          ))}

          {/* Message Well in center */}
          <MessageWell
            messages={messages}
            isLoading={isLoading}
            loadingFamily={loadingFamily}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-sanctum-border/50 to-transparent shrink-0" />

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

      {/* Input Area */}
      <div className="px-4 md:px-6 py-3 border-t border-sanctum-border bg-sanctum-surface/20 pb-safe shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] md:text-xs text-sanctum-muted/50">
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
            className="sanctum-input flex-1 rounded-xl px-4 py-3 text-sm text-sanctum-text resize-none placeholder-sanctum-muted/40"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-11 h-11 md:w-10 md:h-10 rounded-xl rt-send-btn border border-white/10 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/20"
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
