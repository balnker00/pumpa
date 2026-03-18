const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { CrashGame } = require('./crash');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

// Chat messages (last 100)
const chatMessages = [];
const MAX_CHAT = 100;

const crash = new CrashGame(io);
crash.start();

io.on('connection', (socket) => {
  const username = socket.handshake.query.username || `Player_${socket.id.slice(0, 4)}`;
  console.log(`[+] ${username} connected (${socket.id})`);

  crash.addPlayer(socket.id, username);

  // Send current state on connect
  socket.emit('game:state', crash.getState());
  socket.emit('chat:history', chatMessages.slice(-50));

  // Broadcast updated player count
  io.emit('server:playerCount', io.engine.clientsCount);

  // --- Bet ---
  socket.on('bet:place', ({ amount, autoCashout }) => {
    const result = crash.placeBet(socket.id, Number(amount), Number(autoCashout));
    if (!result.success) {
      socket.emit('error', result.error);
    }
  });

  // --- Cash out ---
  socket.on('bet:cashout', () => {
    const result = crash.cashOut(socket.id);
    if (!result.success) {
      socket.emit('error', result.error);
    }
  });

  // --- Chat ---
  socket.on('chat:message', (text) => {
    if (typeof text !== 'string' || text.trim().length === 0) return;
    const msg = {
      id: Date.now(),
      username,
      text: text.trim().slice(0, 200),
      ts: Date.now(),
    };
    chatMessages.push(msg);
    if (chatMessages.length > MAX_CHAT) chatMessages.shift();
    io.emit('chat:message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`[-] ${username} disconnected`);
    crash.removePlayer(socket.id);
    io.emit('server:playerCount', io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
