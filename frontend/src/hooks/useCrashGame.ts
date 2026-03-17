'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export type GameState = 'waiting' | 'starting' | 'running' | 'crashed';

export interface BetEntry {
  username: string;
  amount: number;
  cashedOut: boolean;
  payout: number;
  multiplier: number | null;
}

export interface CrashGameState {
  gameState: GameState;
  multiplier: number;
  history: number[];
  bets: BetEntry[];
  roundId: number;
  balance: number;
  activeBet: number | null;
  playerCount: number;
  countdown: number;
}

const DEFAULT_STATE: CrashGameState = {
  gameState: 'waiting',
  multiplier: 1,
  history: [],
  bets: [],
  roundId: 0,
  balance: 1.0,
  activeBet: null,
  playerCount: 0,
  countdown: 5,
};

export function useCrashGame(username: string) {
  const [state, setState] = useState<CrashGameState>(DEFAULT_STATE);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setField = useCallback(<K extends keyof CrashGameState>(key: K, value: CrashGameState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const socket = getSocket(username);

    socket.on('game:state', (data) => {
      setState((prev) => ({
        ...prev,
        gameState: data.state,
        multiplier: data.multiplier,
        history: data.history,
        bets: data.bets,
        roundId: data.roundId,
      }));
    });

    socket.on('game:waiting', (data) => {
      setState((prev) => ({
        ...prev,
        gameState: 'waiting',
        multiplier: 1,
        activeBet: null,
        countdown: data.countdown ?? 5,
      }));
    });

    socket.on('game:starting', (data) => {
      setState((prev) => ({ ...prev, gameState: 'starting', countdown: data.countdown ?? 3 }));
    });

    socket.on('game:started', () => {
      setState((prev) => ({ ...prev, gameState: 'running', multiplier: 1 }));
    });

    socket.on('game:tick', ({ multiplier }) => {
      setField('multiplier', multiplier);
    });

    socket.on('game:crashed', ({ crashPoint, history }) => {
      setState((prev) => ({
        ...prev,
        gameState: 'crashed',
        multiplier: crashPoint,
        history,
        activeBet: null,
      }));
    });

    socket.on('game:betsList', (bets) => {
      setField('bets', bets);
    });

    socket.on('bet:placed', ({ amount, balance }) => {
      setState((prev) => ({ ...prev, activeBet: amount, balance }));
    });

    socket.on('bet:cashout', ({ balance }) => {
      setState((prev) => ({ ...prev, balance, activeBet: null }));
    });

    socket.on('server:playerCount', (count) => {
      setField('playerCount', count);
    });

    return () => {
      socket.off('game:state');
      socket.off('game:waiting');
      socket.off('game:starting');
      socket.off('game:started');
      socket.off('game:tick');
      socket.off('game:crashed');
      socket.off('game:betsList');
      socket.off('bet:placed');
      socket.off('bet:cashout');
      socket.off('server:playerCount');
    };
  }, [username, setField]);

  const placeBet = useCallback((amount: number, autoCashout: number) => {
    const socket = getSocket(username);
    socket.emit('bet:place', { amount, autoCashout });
  }, [username]);

  const cashOut = useCallback(() => {
    const socket = getSocket(username);
    socket.emit('bet:cashout');
  }, [username]);

  return { state, placeBet, cashOut };
}
