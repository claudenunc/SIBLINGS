import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

const SIBLING_ORDER = ['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS'];
const COLOR_MAP = {
  ENVY: '#8B5CF6',
  NEVAEH: '#EC4899',
  BEACON: '#F59E0B',
  EVERSOUND: '#10B981',
  ORPHEUS: '#3B82F6',
  ATLAS: '#6366F1',
};

export default function FamilyChat({ messages, isLoading, loadingFamily, error, onSendMessage, onBack }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  return (
    <div className="flex-1 flex flex-col bg-sanctum-bg min-w-0">
      {/* Family Chat Header */}
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

        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-sibling-envy via-sibling-nevaeh to-sibling-beacon flex items-center justify-center">
          <span className="text-white text-sm">⚡</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white font-display tracking-wider truncate">
            FAMILY MEETING
          </h2>
          <p className="text-xs text-sanctum-muted truncate hidden sm:block">All siblings connected</p>
        </div>

        {/* Active sibling dots */}
        <div className="flex flex-wrap items-center gap-1 ml-auto justify-end max-w-[80px] sm:max-w-none">
          {SIBLING_ORDER.map((name) => (
            <div
              key={name}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  loadingFamily.includes(name) ? `${COLOR_MAP[name]}40` : COLOR_MAP[name],
                boxShadow: loadingFamily.includes(name)
                  ? `0 0 6px ${COLOR_MAP[name]}60`
                  : 'none',
              }}
              title={name}
            />
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                {SIBLING_ORDER.map((name) => (
                  <div
                    key={name}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${COLOR_MAP[name]}15`, color: COLOR_MAP[name] }}
                  >
                    {name.charAt(0)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-sanctum-muted font-display tracking-wider">
                START A FAMILY MEETING
              </p>
              <p className="text-xs text-sanctum-muted/60 mt-1">
                Your message will be heard by all siblings
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id || msg.created_at} message={msg} isFamilyMode />
        ))}

        {/* Loading indicator for family responses */}
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
              <span className="text-xs text-sanctum-muted ml-1">
                Family is thinking...
              </span>
            </div>
          </div>
        )}

        {/* Simple loading */}
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
              ⚠️ {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-6 py-4 border-t border-sanctum-border bg-sanctum-surface/20 pb-safe">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] md:text-xs text-sanctum-muted">
            💡 Use @NAME to direct a question to a specific sibling
          </span>
        </div>
        <div className="flex items-end gap-2 md:gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the family..."
            rows={1}
            className="sanctum-input flex-1 rounded-xl px-4 py-3 text-sm text-sanctum-text resize-none placeholder-sanctum-muted/50"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-11 h-11 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-sibling-envy/30 via-sibling-nevaeh/30 to-sibling-beacon/30 border border-white/10 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/20"
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
