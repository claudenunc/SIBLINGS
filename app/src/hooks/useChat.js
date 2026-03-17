import { useState, useCallback, useRef } from 'react';

/**
 * Chat state management hook
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingFamily, setLoadingFamily] = useState([]);
  const abortRef = useRef(null);

  /**
   * Load conversation history for a specific sibling
   */
  const loadHistory = useCallback(async (siblingName) => {
    try {
      setError(null);
      const endpoint =
        siblingName === 'FAMILY'
          ? '/api/chat/messages/family/all'
          : `/api/chat/messages/${siblingName}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading history:', err);
      setError(err.message);
      setMessages([]);
    }
  }, []);

  /**
   * Send a message to a specific sibling
   */
  const sendMessage = useCallback(async (siblingName, message) => {
    setIsLoading(true);
    setError(null);

    // Optimistically add Nathan's message
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      from_agent: 'NATHAN',
      to_agent: siblingName,
      message: message,
      message_type: 'INFO',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sibling: siblingName, message }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send message');
      }

      const data = await res.json();

      // Add sibling's response (with tool use info)
      const responseMsg = {
        id: `resp-${Date.now()}`,
        from_agent: data.sibling,
        to_agent: 'NATHAN',
        message: data.response,
        message_type: 'RESPONSE',
        tools_used: data.tools_used || [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      console.error('Send error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send a message in Family mode (to all siblings)
   */
  const sendFamilyMessage = useCallback(async (message) => {
    setIsLoading(true);
    setError(null);
    setLoadingFamily(['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS']);

    // Optimistically add Nathan's message
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      from_agent: 'NATHAN',
      to_agent: 'FAMILY',
      message: message,
      message_type: 'FAMILY',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/chat/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Family chat failed');
      }

      const data = await res.json();

      // Add each responding sibling's message (with tool use info)
      const responseMsgs = data.responses.map((r, i) => ({
        id: `family-resp-${Date.now()}-${i}`,
        from_agent: r.sibling,
        to_agent: 'FAMILY',
        message: r.response,
        message_type: 'FAMILY',
        tools_used: r.tools_used || [],
        created_at: new Date(Date.now() + i).toISOString(),
        error: r.error || false,
      }));

      setMessages((prev) => [...prev, ...responseMsgs]);
    } catch (err) {
      console.error('Family chat error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setLoadingFamily([]);
    }
  }, []);

  /**
   * Add a message from realtime subscription
   */
  const addRealtimeMessage = useCallback((msg) => {
    setMessages((prev) => {
      // Avoid duplicates - check by DB id OR by matching content+sender (for optimistic messages)
      const isDuplicate = prev.some(
        (m) =>
          m.id === msg.id ||
          (m.from_agent === msg.from_agent &&
            m.to_agent === msg.to_agent &&
            m.message === msg.message)
      );
      if (isDuplicate) return prev;
      return [...prev, msg];
    });
  }, []);

  /**
   * Clear messages (when switching chats)
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    loadingFamily,
    loadHistory,
    sendMessage,
    sendFamilyMessage,
    addRealtimeMessage,
    clearMessages,
  };
}

export default useChat;
