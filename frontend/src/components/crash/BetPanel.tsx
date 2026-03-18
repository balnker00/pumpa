'use client';

import { useState } from 'react';
import type { GameState } from '@/hooks/useCrashGame';

interface Props {
  gameState: GameState;
  balance: number;
  activeBet: number | null;
  onPlaceBet: (amount: number, autoCashout: number) => void;
  onCashOut: () => void;
}

export default function BetPanel({ gameState, balance, activeBet, onPlaceBet, onCashOut }: Props) {
  const [amount, setAmount] = useState('0.01');
  const [autoCashout, setAutoCashout] = useState('0.00');

  const canBet = (gameState === 'waiting' || gameState === 'starting') && activeBet === null;
  const canCashOut = gameState === 'running' && activeBet !== null;

  const handleBet = () => {
    const a = parseFloat(amount);
    const ac = parseFloat(autoCashout);
    if (isNaN(a) || a <= 0) return;
    onPlaceBet(a, isNaN(ac) ? 0 : ac);
  };

  const setHalf = () => setAmount((prev) => (parseFloat(prev) / 2).toFixed(4));
  const setDouble = () => setAmount((prev) => Math.min(parseFloat(prev) * 2, balance).toFixed(4));
  const setMax = () => setAmount(balance.toFixed(4));

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Bet Amount */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
          Bet Amount ({(parseFloat(amount || '0') * 95).toFixed(2)} USD est.)
        </label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <span className="text-yellow-400 font-bold text-sm">◎</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent outline-none w-full text-white text-sm tabular-nums"
            />
          </div>
          <button onClick={setHalf} className="px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>½</button>
          <button onClick={setDouble} className="px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>2x</button>
          <button onClick={setMax} className="px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>MAX</button>
        </div>
      </div>

      {/* Auto Cashout */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Auto Cashout</label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <span className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>✕</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={autoCashout}
            onChange={(e) => setAutoCashout(e.target.value)}
            className="bg-transparent outline-none w-full text-white text-sm tabular-nums"
            placeholder="0.00"
          />
          {parseFloat(autoCashout) > 0 && (
            <button onClick={() => setAutoCashout('0.00')} className="text-xs" style={{ color: 'var(--text-muted)' }}>✕</button>
          )}
        </div>
      </div>

      {/* Action Button */}
      {canCashOut ? (
        <button
          onClick={onCashOut}
          className="w-full py-3 rounded-xl font-bold text-white text-lg transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px #22c55e44' }}
        >
          Cash Out ◎{activeBet ? (activeBet).toFixed(4) : ''}
        </button>
      ) : (
        <button
          onClick={handleBet}
          disabled={!canBet}
          className="w-full py-3 rounded-xl font-bold text-white text-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: canBet ? 'linear-gradient(135deg, #b8960c, #f0c420)' : undefined, color: canBet ? '#0a0a00' : undefined }}
        >
          {activeBet !== null ? `Bet Placed: ◎${activeBet}` : 'Place Bet'}
        </button>
      )}

      {/* Balance */}
      <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Balance: <span className="font-bold text-yellow-400">◎{balance.toFixed(4)}</span>
        <span className="text-xs ml-1">(placeholder)</span>
      </div>
    </div>
  );
}
