'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/hooks/useChat';

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  username: string;
}

export default function Chat({ messages, onSend, username }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}>
      <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>General Chat</span>
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: '#22c55e' }}>
          🟢 Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2 text-sm">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
              style={{ background: 'var(--accent-yellow)' }}
            >
              {msg.username[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-xs" style={{ color: msg.username === username ? '#f0c420' : 'var(--text-secondary)' }}>
                {msg.username}
              </span>
              <p className="break-words" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            maxLength={200}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={handleSend}
            className="px-3 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent-yellow)' }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
