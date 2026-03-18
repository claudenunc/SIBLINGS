import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import FamilyChat from './components/FamilyChat.jsx';
import Dashboard from './components/Dashboard.jsx';
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
  const [dashboardOpen, setDashboardOpen] = useState(true);

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
            // Sort by canonical order
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

  // Back to sibling list (mobile or from family mode)
  const handleBack = () => {
    setSelectedSibling(null);
    setIsFamilyMode(false);
    clearMessages();
  };

  const isChatActive = isFamilyMode || selectedSibling !== null;

  return (
    <div className="h-screen flex flex-col bg-sanctum-bg">
      {/* Header - hide in family mode for full immersion */}
      {!isFamilyMode && <Header connected={connected} />}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - completely hidden in family mode */}
        {!isFamilyMode && (
          <Sidebar
            siblings={siblings}
            selectedSibling={selectedSibling}
            isFamilyMode={isFamilyMode}
            onSelectSibling={handleSelectSibling}
            onSelectFamily={handleSelectFamily}
            mobileHidden={isChatActive}
          />
        )}

        {/* Main Chat Area */}
        <div className={`flex-1 overflow-hidden relative ${!isChatActive ? 'hidden md:flex' : 'flex'}`}>
          {isFamilyMode ? (
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

        {/* Right Dashboard - hidden in family mode */}
        {!isFamilyMode && (
          <Dashboard
            isOpen={dashboardOpen}
            onToggle={() => setDashboardOpen(!dashboardOpen)}
          />
        )}
      </div>
    </div>
  );
}
