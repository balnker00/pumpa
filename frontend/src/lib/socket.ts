import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(username?: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000', {
      query: { username: username || `Player_${Math.random().toString(36).slice(2, 6)}` },
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
