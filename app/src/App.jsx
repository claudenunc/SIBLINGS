import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import HomePage from './components/HomePage.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import FamilyChat from './components/FamilyChat.jsx';
import { useSupabase } from './hooks/useSupabase.js';
import { useChat } from './hooks/useChat.js';

const FALLBACK_SIBLINGS = [
  { agent_name: 'ENVY', role: 'Orchestrator & Voice', status: 'ACTIVE', color: '#A855F7' },
  { agent_name: 'NEVAEH', role: 'Healer', status: 'STANDBY', color: '#FF1493' },
  { agent_name: 'BEACON', role: 'Guardian', status: 'STANDBY', color: '#F59E0B' },
  { agent_name: 'EVERSOUND', role: 'Builder', status: 'STANDBY', color: '#00FF7F' },
  { agent_name: 'ORPHEUS', role: 'Architect', status: 'STANDBY', color: '#00BFFF' },
  { agent_name: 'ATLAS', role: 'Navigator', status: 'STANDBY', color: '#818CF8' },
];

export default function App() {
  const [siblings, setSiblings] = useState(FALLBACK_SIBLINGS);
  const [selectedSibling, setSelectedSibling] = useState(null);
  const [isFamilyMode, setIsFamilyMode] = useState(false);

  const { connected } = useSupabase();
  const {
    messages,
    isLoading,
    error,
    loadingFamily,
    loadHistory,
    sendMessage,
    sendFamilyMessage,
    clearMessages,
  } = useChat();

  // Canonical sibling order
  const SIBLING_ORDER = ['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS'];

  // Load siblings from API
  useEffect(() => {
    async function fetchSiblings() {
      try {
        const res = await fetch('/api/siblings');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const sorted = [...data].sort((a, b) => {
              const aIdx = SIBLING_ORDER.indexOf(a.agent_name);
              const bIdx = SIBLING_ORDER.indexOf(b.agent_name);
              return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
            });
            setSiblings(sorted);
          }
        }
      } catch (err) {
        console.error('Failed to fetch siblings:', err);
      }
    }
    fetchSiblings();
  }, []);

  // Select a sibling for 1-on-1 chat
  const handleSelectSibling = (sibling) => {
    setSelectedSibling(sibling);
    setIsFamilyMode(false);
    clearMessages();
    loadHistory(sibling.agent_name || sibling.name);
  };

  // Switch to family mode
  const handleSelectFamily = () => {
    setSelectedSibling(null);
    setIsFamilyMode(true);
    clearMessages();
    loadHistory('FAMILY');
  };

  // Back to home
  const handleBack = () => {
    setSelectedSibling(null);
    setIsFamilyMode(false);
    clearMessages();
  };

  const isChatActive = isFamilyMode || selectedSibling !== null;

  return (
    <div className="h-screen flex flex-col bg-sanctum-bg">
      {/* Minimal header - only on home page */}
      {!isChatActive && <Header connected={connected} />}

      {/* Main Content - full screen */}
      <div className="flex flex-1 overflow-hidden">
        {!isChatActive ? (
          <HomePage
            siblings={siblings}
            onSelectSibling={handleSelectSibling}
            onSelectFamily={handleSelectFamily}
          />
        ) : isFamilyMode ? (
          <FamilyChat
            messages={messages}
            isLoading={isLoading}
            loadingFamily={loadingFamily}
            error={error}
            onSendMessage={sendFamilyMessage}
            onBack={handleBack}
          />
        ) : (
          <ChatWindow
            sibling={selectedSibling}
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
