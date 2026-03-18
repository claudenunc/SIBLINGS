const COLOR_MAP = {
  ENVY: '#A855F7',
  NEVAEH: '#FF1493',
  BEACON: '#F59E0B',
  EVERSOUND: '#00FF7F',
  ORPHEUS: '#00BFFF',
  FAMILY: '#A855F7',
  NATHAN: '#e2e8f0',
};

// Render message text with inline images, markdown images, and clickable links
function MessageContent({ text, color }) {
  if (!text) return null;

  // First: handle markdown images ![alt](url) and replace with actual images
  // Then: handle raw image URLs
  // Then: handle regular URLs as links

  const elements = [];
  // Split by markdown image pattern AND raw URLs
  const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urlRegex = /(https?:\/\/[^\s"<>)\]]+)/g;

  // Check if URL is an image
  const isImageUrl = (url) =>
    /\.(png|jpg|jpeg|gif|webp)/i.test(url) ||
    url.includes('supabase.co/storage') ||
    url.includes('oaidalleapiprodscus.blob.core.windows.net');

  // Replace markdown images first
  let processed = text.replace(mdImageRegex, (match, alt, url) => `\n__IMG__${url}__IMG__\n`);

  // Split by our image markers and URLs
  const chunks = processed.split(/(__IMG__[^_]+__IMG__)/g);

  chunks.forEach((chunk, i) => {
    // Handle our image markers
    const imgMatch = chunk.match(/^__IMG__(.+)__IMG__$/);
    if (imgMatch) {
      const url = imgMatch[1];
      elements.push(
        <span key={`img-${i}`} className="block my-2">
          <img src={url} alt="Generated" className="rounded-lg max-w-full max-h-96 object-contain" loading="lazy" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 block underline" style={{ color }}>
            Open full image
          </a>
        </span>
      );
      return;
    }

    // Handle text chunks - find URLs within them
    const parts = chunk.split(urlRegex);
    parts.forEach((part, j) => {
      if (part.match(urlRegex)) {
        if (isImageUrl(part)) {
          elements.push(
            <span key={`iurl-${i}-${j}`} className="block my-2">
              <img src={part} alt="Image" className="rounded-lg max-w-full max-h-96 object-contain" loading="lazy" />
              <a href={part} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 block underline" style={{ color }}>
                Open full image
              </a>
            </span>
          );
        } else {
          elements.push(
            <a key={`link-${i}-${j}`} href={part} target="_blank" rel="noopener noreferrer" className="underline break-all" style={{ color }}>
              {part.length > 60 ? part.substring(0, 57) + '...' : part}
            </a>
          );
        }
      } else if (part) {
        elements.push(<span key={`txt-${i}-${j}`}>{part}</span>);
      }
    });
  });

  return (
    <p className="text-sm text-sanctum-text whitespace-pre-wrap break-words leading-relaxed">
      {elements}
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
