'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/hooks/useCrashGame';

interface Props {
  multiplier: number;
  gameState: GameState;
  countdown: number;
}

function getColor(gameState: GameState, multiplier: number) {
  if (gameState === 'crashed') return '#ef4444';
  if (multiplier >= 5) return '#f0c420';
  if (multiplier >= 2) return '#f0c420';
  return '#22c55e';
}

export default function MultiplierDisplay({ multiplier, gameState, countdown }: Props) {
  const color = getColor(gameState, multiplier);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(240,196,32,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(240,196,32,0.2) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          perspective: '500px',
        }}
      />

      <AnimatePresence mode="wait">
        {gameState === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-[#94a3b8] text-lg font-medium tracking-widest uppercase">New Round</p>
            <p className="text-white text-6xl font-bold">{countdown}s</p>
            <p className="text-[#64748b] text-sm">Place your bets</p>
          </motion.div>
        )}

        {gameState === 'starting' && (
          <motion.div
            key="starting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-[#94a3b8] text-lg font-medium tracking-widest uppercase">Starting</p>
            <p className="text-white text-6xl font-bold">{countdown}s</p>
          </motion.div>
        )}

        {gameState === 'running' && (
          <motion.div
            key="running"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <motion.p
              className="font-black tabular-nums leading-none"
              style={{ color, fontSize: 'clamp(3rem, 10vw, 7rem)', textShadow: `0 0 40px ${color}66` }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              {multiplier.toFixed(2)}x
            </motion.p>
          </motion.div>
        )}

        {gameState === 'crashed' && (
          <motion.div
            key="crashed"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-[#ef4444] text-2xl font-bold tracking-widest uppercase">Busted!</p>
            <p
              className="font-black tabular-nums"
              style={{ color: '#ef4444', fontSize: 'clamp(3rem, 10vw, 7rem)', textShadow: '0 0 40px #ef444466' }}
            >
              {multiplier.toFixed(2)}x
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
