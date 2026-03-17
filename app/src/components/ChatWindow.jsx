import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

const COLOR_MAP = {
  ENVY: '#8B5CF6',
  NEVAEH: '#EC4899',
  BEACON: '#F59E0B',
  EVERSOUND: '#10B981',
  ORPHEUS: '#3B82F6',
  ATLAS: '#6366F1',
};

const ROLE_MAP = {
  ENVY: 'Orchestrator & Voice',
  NEVAEH: 'Healer',
  BEACON: 'Guardian',
  EVERSOUND: 'Builder',
  ORPHEUS: 'Architect',
  ATLAS: 'Navigator',
};

export default function ChatWindow({ sibling, messages, isLoading, error, onSendMessage, onBack }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const name = sibling?.agent_name || sibling?.name || 'UNKNOWN';
  const role = sibling?.role || ROLE_MAP[name] || '';
  const color = sibling?.color || COLOR_MAP[name] || '#6366F1';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on sibling change
  useEffect(() => {
    inputRef.current?.focus();
  }, [name]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(name, trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sibling) {
    return (
      <div className="flex-1 flex items-center justify-center bg-sanctum-bg">
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="font-display text-xl tracking-widest text-sanctum-muted mb-2">
            THE SANCTUM
          </h2>
          <p className="text-sm text-sanctum-muted/60">
            Select a sibling to start a conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-sanctum-bg min-w-0">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-sanctum-border bg-sanctum-surface/30 backdrop-blur-sm">
        {/* Mobile Back Button */}
        <button
          onClick={onBack}
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 text-sanctum-muted hover:text-sanctum-text transition-colors"
          aria-label="Back to siblings"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: `${color}20`, borderColor: color, borderWidth: '1.5px' }}
        >
          <span style={{ color }}>{name.charAt(0)}</span>
        </div>
        <div>
          <h2 className="text-base font-semibold" style={{ color }}>
            {name}
          </h2>
          <p className="text-xs text-sanctum-muted truncate max-w-[200px]">{role}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                style={{ backgroundColor: `${color}15`, color }}
              >
                {name.charAt(0)}
              </div>
              <p className="text-sm text-sanctum-muted">
                Start a conversation with {name}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id || msg.created_at} message={msg} />
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 mb-3 msg-enter">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              {name.charAt(0)}
            </div>
            <div
              className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5"
              style={{ backgroundColor: `${color}10`, border: `1px solid ${color}20` }}
            >
              <div className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <div className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <div className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center mb-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-sm text-red-400">
              ⚠️ {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-6 py-4 border-t border-sanctum-border bg-sanctum-surface/20 pb-safe">
        <div className="flex items-end gap-2 md:gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${name}...`}
            rows={1}
            className="sanctum-input flex-1 rounded-xl px-4 py-3 text-sm text-sanctum-text resize-none placeholder-sanctum-muted/50"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-11 h-11 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: input.trim() && !isLoading ? `${color}30` : 'transparent',
              borderColor: color,
              borderWidth: '1px',
              color,
            }}
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
