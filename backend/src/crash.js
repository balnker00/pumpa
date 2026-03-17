const crypto = require('crypto');

// Provably fair crash point generation
// Based on: https://bitcoin.stackexchange.com/questions/55186
function generateCrashPoint(serverSeed) {
  const hash = crypto.createHmac('sha256', serverSeed).update('crash').digest('hex');
  const h = parseInt(hash.slice(0, 8), 16);
  const e = 2 ** 32;

  // House edge: 4% (1 in 25 rounds crashes at exactly 1x)
  if (h % 25 === 0) return 1.0;

  const result = Math.floor((100 * e - h) / (e - h)) / 100;
  return Math.max(1.0, result);
}

function generateServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

const TICK_MS = 100; // 10 ticks per second

class CrashGame {
  constructor(io) {
    this.io = io;
    this.state = 'waiting'; // waiting | starting | running | crashed
    this.multiplier = 1.0;
    this.crashPoint = 1.0;
    this.serverSeed = '';
    this.startTime = null;
    this.bets = new Map(); // socketId -> { amount, autoCashout, cashedOut, payout }
    this.history = []; // last 20 crash points
    this.roundId = 0;
    this.tickInterval = null;
    this.players = new Map(); // socketId -> { username, balance }
  }

  start() {
    this._waitPhase();
  }

  _waitPhase() {
    this.state = 'waiting';
    this.multiplier = 1.0;
    this.bets.clear();
    this.serverSeed = generateServerSeed();
    this.roundId++;

    this.io.emit('game:waiting', {
      roundId: this.roundId,
      serverSeedHash: crypto.createHash('sha256').update(this.serverSeed).digest('hex'),
      countdown: 5,
    });

    setTimeout(() => this._startingPhase(), 5000);
  }

  _startingPhase() {
    this.state = 'starting';
    this.crashPoint = generateCrashPoint(this.serverSeed);
    this.io.emit('game:starting', { roundId: this.roundId, countdown: 3 });
    setTimeout(() => this._runningPhase(), 3000);
  }

  _runningPhase() {
    this.state = 'running';
    this.startTime = Date.now();
    this.multiplier = 1.0;

    this.io.emit('game:started', { roundId: this.roundId });

    this.tickInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      // Exponential growth: multiplier = e^(0.06 * t)
      this.multiplier = parseFloat(Math.pow(Math.E, 0.06 * elapsed).toFixed(2));

      // Check auto-cashouts
      for (const [socketId, bet] of this.bets) {
        if (!bet.cashedOut && bet.autoCashout > 0 && this.multiplier >= bet.autoCashout) {
          this._cashOut(socketId, bet.autoCashout);
        }
      }

      if (this.multiplier >= this.crashPoint) {
        this._crash();
      } else {
        this.io.emit('game:tick', { multiplier: this.multiplier });
      }
    }, TICK_MS);
  }

  _crash() {
    clearInterval(this.tickInterval);
    this.state = 'crashed';
    this.multiplier = this.crashPoint;

    // Bust all remaining bets
    for (const [, bet] of this.bets) {
      if (!bet.cashedOut) bet.payout = 0;
    }

    this.history.unshift(this.crashPoint);
    if (this.history.length > 20) this.history.pop();

    this.io.emit('game:crashed', {
      crashPoint: this.crashPoint,
      serverSeed: this.serverSeed,
      history: this.history,
    });

    setTimeout(() => this._waitPhase(), 3000);
  }

  placeBet(socketId, amount, autoCashout) {
    if (this.state !== 'waiting' && this.state !== 'starting') {
      return { success: false, error: 'Round already in progress' };
    }
    if (this.bets.has(socketId)) {
      return { success: false, error: 'Already placed a bet this round' };
    }
    if (amount <= 0) {
      return { success: false, error: 'Invalid bet amount' };
    }

    const player = this.players.get(socketId);
    if (!player) return { success: false, error: 'Player not found' };
    if (player.balance < amount) return { success: false, error: 'Insufficient balance' };

    player.balance -= amount;
    this.bets.set(socketId, { amount, autoCashout: autoCashout || 0, cashedOut: false, payout: 0 });

    this.io.to(socketId).emit('bet:placed', { amount, balance: player.balance });
    this.io.emit('game:betsList', this._getBetsList());

    return { success: true };
  }

  cashOut(socketId) {
    if (this.state !== 'running') return { success: false, error: 'Game not running' };
    const bet = this.bets.get(socketId);
    if (!bet || bet.cashedOut) return { success: false, error: 'No active bet' };
    return this._cashOut(socketId, this.multiplier);
  }

  _cashOut(socketId, multiplier) {
    const bet = this.bets.get(socketId);
    if (!bet || bet.cashedOut) return { success: false };

    bet.cashedOut = true;
    bet.payout = parseFloat((bet.amount * multiplier).toFixed(4));

    const player = this.players.get(socketId);
    if (player) player.balance += bet.payout;

    this.io.to(socketId).emit('bet:cashout', {
      multiplier,
      payout: bet.payout,
      balance: player?.balance ?? 0,
    });

    this.io.emit('game:betsList', this._getBetsList());
    return { success: true, payout: bet.payout };
  }

  _getBetsList() {
    const list = [];
    for (const [socketId, bet] of this.bets) {
      const player = this.players.get(socketId);
      list.push({
        username: player?.username ?? 'Anonymous',
        amount: bet.amount,
        cashedOut: bet.cashedOut,
        payout: bet.payout,
        multiplier: bet.cashedOut ? bet.payout / bet.amount : null,
      });
    }
    return list;
  }

  addPlayer(socketId, username) {
    this.players.set(socketId, {
      username,
      balance: 1.0, // 1 SOL starting balance (placeholder)
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    this.bets.delete(socketId);
  }

  getState() {
    return {
      state: this.state,
      multiplier: this.multiplier,
      history: this.history,
      bets: this._getBetsList(),
      roundId: this.roundId,
    };
  }
}

module.exports = { CrashGame };
