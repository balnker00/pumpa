'use client';

import Link from 'next/link';

interface Props {
  playerCount: number;
  balance: number;
}

export default function Navbar({ playerCount, balance }: Props) {
  return (
    <nav
      className="flex items-center gap-4 px-4 py-3 border-b"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-4">
        <span className="text-xl font-black text-white">SOL</span>
        <span className="text-xl font-black" style={{ color: 'var(--accent-purple-light)' }}>🚀PUMP</span>
      </Link>

      {/* Game tabs */}
      <div className="flex gap-1">
        {[
          { name: 'Crash', href: '/', icon: '📈', active: true },
          { name: 'Coinflip', href: '/coinflip', icon: '🪙' },
          { name: 'Blackjack', href: '/blackjack', icon: '🃏' },
        ].map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: tab.active ? 'var(--bg-elevated)' : 'transparent',
              color: tab.active ? 'var(--text-primary)' : 'var(--text-muted)',
              border: tab.active ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="flex-1" />

      {/* Balance placeholder */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <span className="text-purple-400 font-bold">◎</span>
        <span className="font-bold tabular-nums">{balance.toFixed(4)}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>SOL</span>
      </div>

      {/* Player count */}
      <div className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
        🟢 {playerCount} online
      </div>

      {/* Connect wallet placeholder */}
      <button
        className="px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-80"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}
      >
        Connect Wallet
      </button>
    </nav>
  );
}
