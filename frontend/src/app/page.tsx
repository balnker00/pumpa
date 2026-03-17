'use client';

import { useCrashGame } from '@/hooks/useCrashGame';
import { useChat } from '@/hooks/useChat';
import Navbar from '@/components/layout/Navbar';
import Chat from '@/components/layout/Chat';
import MultiplierDisplay from '@/components/crash/MultiplierDisplay';
import BetPanel from '@/components/crash/BetPanel';
import BetsList from '@/components/crash/BetsList';
import HistoryBar from '@/components/crash/HistoryBar';

// Placeholder username — replace with wallet address later
const USERNAME = `Player_${Math.random().toString(36).slice(2, 6)}`;

export default function Home() {
  const { state, placeBet, cashOut } = useCrashGame(USERNAME);
  const { messages, sendMessage } = useChat(USERNAME);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Navbar playerCount={state.playerCount} balance={state.balance} />

      {/* History bar */}
      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <HistoryBar history={state.history} />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Bet panel + bets list */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 p-3 overflow-y-auto border-r" style={{ borderColor: 'var(--border)' }}>
          <BetPanel
            gameState={state.gameState}
            balance={state.balance}
            activeBet={state.activeBet}
            onPlaceBet={placeBet}
            onCashOut={cashOut}
          />
          <BetsList bets={state.bets} />
        </div>

        {/* Center: Crash game display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative" style={{ minHeight: 300 }}>
            <MultiplierDisplay
              multiplier={state.multiplier}
              gameState={state.gameState}
              countdown={state.countdown}
            />
          </div>
          {/* Round info bar */}
          <div className="px-4 py-2 border-t text-xs flex items-center gap-4" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <span>Round #{state.roundId}</span>
            <span>State: <span style={{ color: 'var(--text-secondary)' }}>{state.gameState}</span></span>
          </div>
        </div>

        {/* Right: Chat */}
        <div className="w-72 flex-shrink-0 flex flex-col" style={{ borderLeft: '1px solid var(--border)' }}>
          <Chat messages={messages} onSend={sendMessage} username={USERNAME} />
        </div>
      </div>
    </div>
  );
}
