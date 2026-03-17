'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export interface ChatMessage {
  id: number;
  username: string;
  text: string;
  ts: number;
}

export function useChat(username: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socket = getSocket(username);

    socket.on('chat:history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-99), msg]);
    });

    return () => {
      socket.off('chat:history');
      socket.off('chat:message');
    };
  }, [username]);

  const sendMessage = useCallback((text: string) => {
    const socket = getSocket(username);
    socket.emit('chat:message', text);
  }, [username]);

  return { messages, sendMessage };
}
