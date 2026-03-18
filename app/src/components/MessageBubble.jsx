const COLOR_MAP = {
  ENVY: '#8B5CF6',
  NEVAEH: '#EC4899',
  BEACON: '#F59E0B',
  EVERSOUND: '#10B981',
  ORPHEUS: '#3B82F6',
  ATLAS: '#6366F1',
  NATHAN: '#e2e8f0',
};

// Render message text with inline images and clickable links
function MessageContent({ text, color }) {
  if (!text) return null;

  // Split text by URLs that look like images (from DALL-E or similar)
  const urlRegex = /(https?:\/\/[^\s"<>]+\.(?:png|jpg|jpeg|gif|webp)[^\s"<>]*|https?:\/\/oaidalleapiprodscus\.blob\.core\.windows\.net[^\s"<>]*)/gi;
  const linkRegex = /(https?:\/\/[^\s"<>]+)/g;

  // Check if there are image URLs
  const imageUrls = text.match(urlRegex) || [];

  // Replace URLs with clickable links
  const parts = text.split(linkRegex);
  const rendered = parts.map((part, i) => {
    if (part.match(linkRegex)) {
      // Check if it's an image URL
      if (imageUrls.some((img) => part.startsWith(img.substring(0, 50)))) {
        return (
          <span key={i}>
            <a href={part} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color }}>
              View full image
            </a>
            <img
              src={part}
              alt="Generated image"
              className="mt-2 rounded-lg max-w-full max-h-80 object-contain"
              loading="lazy"
            />
          </span>
        );
      }
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline break-all" style={{ color }}>
          {part.length > 60 ? part.substring(0, 57) + '...' : part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });

  return (
    <p className="text-sm text-sanctum-text whitespace-pre-wrap break-words leading-relaxed">
      {rendered}
    </p>
  );
}

export default function MessageBubble({ message, isFamilyMode = false }) {
  const isNathan = message.from_agent === 'NATHAN';
  const sender = message.from_agent;
  const color = COLOR_MAP[sender] || '#e2e8f0';
  const initial = sender ? sender.charAt(0) : '?';

  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  if (isNathan) {
    return (
      <div className="flex justify-end mb-3 msg-enter">
        <div className="max-w-[70%] flex flex-col items-end">
          {isFamilyMode && (
            <span className="text-xs text-sanctum-muted mb-1 mr-2">Nathan</span>
          )}
          <div className="bg-neon-blue/20 border border-neon-blue/30 rounded-2xl rounded-br-md px-4 py-2.5">
            <p className="text-sm text-sanctum-text whitespace-pre-wrap break-words leading-relaxed">
              {message.message}
            </p>
          </div>
          <span className="text-xs text-sanctum-muted mt-1 mr-2">{time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3 msg-enter">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-1 mr-2"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
      >
        {initial}
      </div>

      <div className="max-w-[70%] flex flex-col items-start">
        {/* Name badge */}
        <div className="flex items-center gap-2 mb-1 ml-1">
          <span className="text-xs font-semibold" style={{ color }}>
            {sender}
          </span>
          {message.error && (
            <span className="text-xs text-red-400">⚠️ Error</span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className="rounded-2xl rounded-bl-md px-4 py-2.5"
          style={{
            backgroundColor: `${color}10`,
            border: `1px solid ${color}20`,
          }}
        >
          <MessageContent text={message.message} color={color} />
        </div>
        {/* Tool use indicators */}
        {message.tools_used && message.tools_used.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 ml-2">
            {message.tools_used.map((tool, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
              >
                {tool.name.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-sanctum-muted mt-1 ml-2">{time}</span>
      </div>
    </div>
  );
}
