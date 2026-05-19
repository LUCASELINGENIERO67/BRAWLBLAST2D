

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const os = require('os');

// ── HTTP Server ──────────────────────────
const httpServer = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});

// ── WebSocket Server ─────────────────────
const wss = new WebSocketServer({ server: httpServer });

let rooms = {}; // roomId -> { players: Map<ws, playerData>, state: 'waiting'|'playing'|'done' }
let wsToRoom = new Map(); // ws -> roomId

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

function broadcast(room, msg, exceptWs = null) {
  if (!rooms[room]) return;
  const data = JSON.stringify(msg);
  rooms[room].players.forEach((_, ws) => {
    if (ws !== exceptWs && ws.readyState === 1) ws.send(data);
  });
}

function broadcastAll(room, msg) {
  if (!rooms[room]) return;
  const data = JSON.stringify(msg);
  rooms[room].players.forEach((_, ws) => {
    if (ws.readyState === 1) ws.send(data);
  });
}

wss.on('connection', (ws) => {
  console.log('Nueva conexión');

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      case 'join': {
        const roomId = msg.room || 'default';
        if (!rooms[roomId]) {
          rooms[roomId] = { players: new Map(), state: 'waiting', hostId: null, seed: Math.floor(Math.random()*99999) };
        }
        const room = rooms[roomId];
        if (room.players.size >= 2) {
          ws.send(JSON.stringify({ type: 'error', msg: 'Sala llena (máx 2 jugadores)' }));
          return;
        }
        const playerId = room.players.size === 0 ? 'p1' : 'p2';
        room.players.set(ws, { id: playerId, name: msg.name || playerId, hero: msg.hero || 'ranger', x: 0, y: 0, hp: 5000, alive: true });
        wsToRoom.set(ws, roomId);
        if (playerId === 'p1') room.hostId = 'p1';
        ws.send(JSON.stringify({ type: 'joined', playerId, roomId, seed: room.seed, playerCount: room.players.size }));
        broadcast(roomId, { type: 'player_joined', playerId, name: msg.name, hero: msg.hero, playerCount: room.players.size }, ws);
        console.log(`[${roomId}] ${playerId} se unió. Total: ${room.players.size}`);
        if (room.players.size === 2) {
          // Notify both: game can start
          const players = [];
          room.players.forEach((data) => players.push({ id: data.id, name: data.name, hero: data.hero }));
          broadcastAll(roomId, { type: 'ready', players, seed: room.seed });
          console.log(`[${roomId}] ¡Ambos jugadores listos!`);
        }
        break;
      }

      case 'start': {
        const roomId = wsToRoom.get(ws);
        if (!roomId || !rooms[roomId]) return;
        rooms[roomId].state = 'playing';
        broadcastAll(roomId, { type: 'start', level: msg.level || 1, seed: rooms[roomId].seed });
        break;
      }

      case 'state': {
        // Player sends their position/state, relay to opponent
        const roomId = wsToRoom.get(ws);
        if (!roomId) return;
        const playerData = rooms[roomId]?.players.get(ws);
        if (playerData) {
          Object.assign(playerData, msg.data);
          broadcast(roomId, { type: 'opponent_state', data: msg.data }, ws);
        }
        break;
      }

      case 'shoot': {
        const roomId = wsToRoom.get(ws);
        if (!roomId) return;
        broadcast(roomId, { type: 'opponent_shoot', bullet: msg.bullet }, ws);
        break;
      }

      case 'special': {
        const roomId = wsToRoom.get(ws);
        if (!roomId) return;
        broadcast(roomId, { type: 'opponent_special', specialType: msg.specialType, data: msg.data }, ws);
        break;
      }

      case 'hit': {
        // Player reports being hit by opponent's bullet
        const roomId = wsToRoom.get(ws);
        if (!roomId) return;
        const playerData = rooms[roomId]?.players.get(ws);
        if (playerData) {
          playerData.hp = msg.hp;
          playerData.alive = msg.alive;
        }
        broadcast(roomId, { type: 'opponent_hit', hp: msg.hp, alive: msg.alive }, ws);
        if (!msg.alive) {
          broadcast(roomId, { type: 'game_over', winner: msg.killedBy }, ws);
          ws.send(JSON.stringify({ type: 'game_over', winner: msg.killedBy }));
        }
        break;
      }

      case 'chat': {
        const roomId = wsToRoom.get(ws);
        if (!roomId) return;
        const playerData = rooms[roomId]?.players.get(ws);
        broadcastAll(roomId, { type: 'chat', from: playerData?.id, name: playerData?.name, text: msg.text });
        break;
      }
    }
  });

  ws.on('close', () => {
    const roomId = wsToRoom.get(ws);
    if (roomId && rooms[roomId]) {
      const playerData = rooms[roomId].players.get(ws);
      rooms[roomId].players.delete(ws);
      broadcast(roomId, { type: 'opponent_left', playerId: playerData?.id });
      console.log(`[${roomId}] ${playerData?.id} desconectado`);
      if (rooms[roomId].players.size === 0) {
        delete rooms[roomId];
        console.log(`[${roomId}] Sala eliminada`);
      }
    }
    wsToRoom.delete(ws);
  });
});

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║      BRAWL BLAST 2D - SERVIDOR LOCAL      ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  ✅ Servidor corriendo en puerto ${PORT}      ║`);
  console.log(`║                                          ║`);
  console.log(`║  TÚ:      http://localhost:${PORT}           ║`);
  console.log(`║  AMIGO:   http://${ip}:${PORT}         ║`);
  console.log(`║                                          ║`);
  console.log('║  Dile a tu amigo esa URL ↑               ║');
  console.log('╚══════════════════════════════════════════╝\n');
});
