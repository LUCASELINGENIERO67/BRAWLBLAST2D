// ==========================================
//  BRAWL BLAST 2D - Game Engine v3 MULTIJUGADOR
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const mmCtx = minimapCanvas.getContext('2d');

function resize() {
  const vv = window.visualViewport;
  canvas.width = Math.floor(vv?.width || window.innerWidth);
  canvas.height = Math.floor(vv?.height || window.innerHeight);
}
resize();
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 250));

// ── Game State ────────────────────────────
let gameState = 'menu'; // menu | lobby | playing | win | over
let gameMode = 'solo';  // solo | multi
let currentLevel = 1;
let score = 0;
let gameTime = 0;
let particles = [];
let floatingTexts = [];
let shakeAmt = 0;
let flashColor = null;
let flashAlpha = 0;
let bombs = [];
let lastTime = 0;
let enemyTurrets = [];

const specials = { shield: { cd:0, maxCd:8 }, bomb: { cd:0, maxCd:6 }, dash: { cd:0, maxCd:4 }, ultimate: { cd:0, maxCd:10 } };

// ── Multiplayer State ─────────────────────
let ws = null;
let myPlayerId = null;      // 'p1' or 'p2'
let opponentState = null;   // latest state from opponent
let opponentBullets = [];   // bullets fired by opponent (rendered locally)
let opponentName = '-';
let opponentHeroId = 'ranger';
let opponentHp = 5000;
let opponentMaxHp = 5000;
let opponentAlive = true;
let multiReady = false;

// ── Hero Definitions ─────────────────────
const HERO_DEFS = [
  { id:'ranger',      name:'Ranger',        icon:'🤠', class:'Tirador',        desc:'El héroe inicial. Buen balance entre daño y movilidad.',                                    color:'#4488ff', hatColor:'#ffcc00', skinColor:'#ffd5b0', shirtColor:'#2255bb', hp:5000, speed:200, shootRate:0.25, maxAmmo:6, bulletDmg:500, bulletColor:'#00ccff',  abilities:[{name:'Tiro Certero',icon:'🎯',key:'Q',desc:'Disparo perforante'},{name:'Trampa Cazador',icon:'🪤',key:'E',desc:'Trampa de lazo'},{name:'Salto Ágil',icon:'🦘',key:'F',desc:'Salto con disparo'},{name:'Lluvia de Flechas',icon:'🏹',key:'T',desc:'Lluiva de flechas'}],   unlockAt:0, unlockDesc:'Personaje inicial', stats:{poder:3,vida:3,velocidad:3} },
  { id:'ninja',       name:'Ninja Sombra',  icon:'🥷', class:'Asesino',         desc:'Rápido y sigiloso. Daño alto pero poca vida.',                                              color:'#222244', hatColor:'#cc0044', skinColor:'#ffe0c0', shirtColor:'#111133', hp:3500, speed:260, shootRate:0.18, maxAmmo:4, bulletDmg:700, bulletColor:'#ff0066',  abilities:[{name:'Invisible', icon:'🌀',key:'Q',desc:'Invisible 2s'}, {name:'Shuriken',  icon:'⭐',key:'E',desc:'Ataque penetrante'},{name:'Triple Dash', icon:'💨',key:'F',desc:'Triple dash'}],  unlockAt:1, unlockDesc:'Completa Nivel 1',  stats:{poder:5,vida:2,velocidad:5} },
  { id:'tank',        name:'Hierro Bruto',  icon:'🦾', class:'Tanque',          desc:'Resistente como una roca. Slow pero enorme HP.',                                            color:'#556677', hatColor:'#334455', skinColor:'#d0b090', shirtColor:'#445566', hp:9000, speed:145, shootRate:0.55, maxAmmo:3, bulletDmg:900, bulletColor:'#ffaa00',  abilities:[{name:'Megaescudo',icon:'🛡️',key:'Q',desc:'Escudo 6s'},    {name:'Barril',    icon:'🛢️',key:'E',desc:'Barril rodante'},   {name:'Embiste',     icon:'🐂',key:'F',desc:'Carga empujando'}], unlockAt:2, unlockDesc:'Completa Nivel 2',  stats:{poder:4,vida:5,velocidad:1} },
  { id:'mage',        name:'Maga Arcana',   icon:'🧙‍♀️',class:'Mago',          desc:'Magia poderosa con proyectiles de área.',                                                   color:'#8844cc', hatColor:'#6622aa', skinColor:'#ffe8e0', shirtColor:'#663399', hp:4000, speed:185, shootRate:0.35, maxAmmo:5, bulletDmg:600, bulletColor:'#cc44ff',  abilities:[{name:'Barrera',  icon:'🔮',key:'Q',desc:'Barrera mágica 4s'},{name:'Nova',       icon:'✨',key:'E',desc:'Explosión 360°'},   {name:'Parpadeo',    icon:'🌟',key:'F',desc:'Teleportación'}],  unlockAt:3, unlockDesc:'Completa Nivel 3',  stats:{poder:5,vida:2,velocidad:3} },
  { id:'medic',       name:'Doctor Caos',   icon:'🏥', class:'Soporte',         desc:'Se cura en arbustos. Sus bombas también curan.',                                            color:'#ffffff', hatColor:'#ff4444', skinColor:'#ffd5b0', shirtColor:'#eeeeee', hp:6000, speed:175, shootRate:0.3,  maxAmmo:5, bulletDmg:450, bulletColor:'#00ff88',  abilities:[{name:'Curación', icon:'💊',key:'Q',desc:'Regenera 1000 HP'},{name:'Bomba Bio', icon:'☣️',key:'E',desc:'Veneno en área'},   {name:'Boost',       icon:'💉',key:'F',desc:'Velocidad +100% 3s'}],unlockAt:4, unlockDesc:'Completa Nivel 4',  stats:{poder:2,vida:4,velocidad:3} },
  { id:'sniper_hero', name:'Ojo de Águila', icon:'🎯', class:'Francotirador',   desc:'Disparo de largo alcance con bala perforante.',                                             color:'#446633', hatColor:'#223311', skinColor:'#e0c8a0', shirtColor:'#335522', hp:3800, speed:170, shootRate:0.6,  maxAmmo:3, bulletDmg:1200,bulletColor:'#88ff44',  abilities:[{name:'Camuflaje',icon:'🍃',key:'Q',desc:'Invisible en arbus.'},{name:'Mina',       icon:'💥',key:'E',desc:'Mina explosiva'},    {name:'Rollo',       icon:'↩️',key:'F',desc:'Rollo evasivo'}],  unlockAt:5, unlockDesc:'Completa Nivel 5',  stats:{poder:5,vida:2,velocidad:2} },
  { id:'pyro',        name:'Pirocrático',   icon:'🔥', class:'Incendiario',     desc:'Domina el fuego con explosiones masivas.',                                                color:'#ff4400', hatColor:'#ff8800', skinColor:'#ffccaa', shirtColor:'#cc2200', hp:4500, speed:190, shootRate:0.28, maxAmmo:5, bulletDmg:550, bulletColor:'#ff6600',  abilities:[{name:'Muro Fuego',icon:'🔥',key:'Q',desc:'Muro bloquea y daña'},{name:'Mega Bomba',icon:'💥',key:'E',desc:'Auto-900, -1900 a cercanos'},{name:'Dash Fuego',icon:'⚡',key:'F',desc:'Dash en llamas'}],   unlockAt:6, unlockDesc:'Completa Nivel 6', stats:{poder:4,vida:3,velocidad:3} },
  { id:'cyber',       name:'Cyber Ninja',   icon:'🤖', class:'Tecnológico',    desc:'Guerrero del futuro con tecnología avanzada.',                                             color:'#00ffff', hatColor:'#0088ff', skinColor:'#e0f0ff', shirtColor:'#004488', hp:4200, speed:210, shootRate:0.22, maxAmmo:7, bulletDmg:480, bulletColor:'#00ffff',  abilities:[{name:'Escudo EM',icon:'🛡️',key:'Q',desc:'Escudo EM 4s'},{name:'Drone',     icon:'🚁',key:'E',desc:'Drone atacante'},{name:'Tele Dash', icon:'⚡',key:'F',desc:'Tele-dash corto'}],  unlockAt:7, unlockDesc:'Completa Nivel 7',  stats:{poder:3,vida:3,velocidad:4} },
  { id:'spectre',     name:'Espectro',      icon:'👻', class:'Fantasmal',      desc:'Ser etéreo que atraviesa paredes temporalmente.',                                           color:'#8844ff', hatColor:'#aa66ff', skinColor:'#e0d0ff', shirtColor:'#5522aa', hp:3200, speed:240, shootRate:0.20, maxAmmo:4, bulletDmg:650, bulletColor:'#aa44ff',  abilities:[{name:'Forma Etérea',icon:'👻',key:'Q',desc:'Atraviesa paredes 3s'},{name:'Vórtice del Vacío',icon:'🌌',key:'E',desc:'Atrae y daña enemigos'},{name:'Aparición Súbita',icon:'💫',key:'F',desc:'Teleport con daño fantasmal'}],    unlockAt:8, unlockDesc:'Completa Nivel 8',  stats:{poder:4,vida:2,velocidad:5} },
  { id:'titan',       name:'Titán',         icon:'⚔️', class:'Guerrero',        desc:'El guerrero definitivo. Equilibrado y poderoso.',                                           color:'#ffcc00', hatColor:'#ff8800', skinColor:'#ffddaa', shirtColor:'#886600', hp:7000, speed:180, shootRate:0.30, maxAmmo:5, bulletDmg:580, bulletColor:'#ffcc00',  abilities:[{name:'Escudo Divino',icon:'🛡️',key:'Q',desc:'Escudo 5s'},{name:'Golpe Titan',icon:'💥',key:'E',desc:'Golpe masivo'},{name:'Dash Titan',icon:'⚡',key:'F',desc:'Dash poderoso'}],   unlockAt:9, unlockDesc:'Completa Nivel 9',  stats:{poder:4,vida:4,velocidad:3} },
  { id:'vampire',     name:'Conde Sombra',  icon:'🧛', class:'Vampiro',        desc:'Drena vida de enemigos. Más fuerte en la oscuridad.',                                        color:'#440044', hatColor:'#660066', skinColor:'#e0d0ff', shirtColor:'#220022', hp:4000, speed:195, shootRate:0.24, maxAmmo:5, bulletDmg:520, bulletColor:'#ff00ff',  abilities:[{name:'Drenar',   icon:'🩸',key:'Q',desc:'Drena 500 HP'},{name:'Muro Sangre',icon:'🔴',key:'E',desc:'Explota y envenena 5s'},{name:'Dash Sombra',icon:'👻',key:'F',desc:'Dash invisible'}],  unlockAt:10, unlockDesc:'Completa Nivel 10', stats:{poder:4,vida:3,velocidad:4} },
  { id:'storm',       name:'Tormenta',      icon:'⚡', class:'Elemental',       desc:'Controla el rayo y el trueno. Ataques de área eléctricos.',                                  color:'#0044aa', hatColor:'#0066ff', skinColor:'#aaccff', shirtColor:'#002266', hp:4800, speed:175, shootRate:0.26, maxAmmo:6, bulletDmg:510, bulletColor:'#00aaff',  abilities:[{name:'Rayo Cadena',icon:'⚡',key:'Q',desc:'Rayo que salta entre enemigos'},{name:'Tormenta Eléctrica',icon:'🌩️',key:'E',desc:'Tormenta de rayos en área'},{name:'Teleport Eléctrico',icon:'💫',key:'F',desc:'Teleport con daño eléctrico'}],   unlockAt:11, unlockDesc:'Completa Nivel 11', stats:{poder:4,vida:3,velocidad:3} },
  { id:'chronos',     name:'Cronos',        icon:'⏰', class:'Temporal',       desc:'Manipula el tiempo. Ralentiza enemigos y acelera ataques.',                                    color:'#800080', hatColor:'#a020a0', skinColor:'#e0d0f0', shirtColor:'#400040', hp:3800, speed:220, shootRate:0.22, maxAmmo:6, bulletDmg:490, bulletColor:'#aa00aa',  abilities:[{name:'Ralentizar',icon:'⏱️',key:'Q',desc:'Ralentiza 3s'},{name:'Rewind',    icon:'↩️',key:'E',desc:'Guarda posición'},{name:'Flash',      icon:'💨',key:'F',desc:'Rewind 5s, -800 a enemigos (2x)'}],   unlockAt:12, unlockDesc:'Completa Nivel 12', stats:{poder:3,vida:3,velocidad:5} },
  { id:'crystal',     name:'Prisma',        icon:'💎', class:'Cristalino',      desc:'Cuerpo de cristal refracta ataques. Alto daño reflectivo.',                                  color:'#00ffff', hatColor:'#008888', skinColor:'#e0ffff', shirtColor:'#006666', hp:5500, speed:165, shootRate:0.32, maxAmmo:4, bulletDmg:500, bulletColor:'#00ffff',  abilities:[{name:'Espejo Cristalino',icon:'🔮',key:'Q',desc:'Refleja y amplifica daño'},{name:'Ruptura Prismática',icon:'💎',key:'E',desc:'Explosión de cristales fragmentados'},{name:'Barrera de Hielo',icon:'❄️',key:'F',desc:'Muro de hielo que ralentiza'}],   unlockAt:13, unlockDesc:'Completa Nivel 13', stats:{poder:5,vida:4,velocidad:2} },
  { id:'phoenix',     name:'Fénix',         icon:'🔥', class:'Mítico',         desc:'Renace de las cenizas. Inmune a fuego, revive con 30% HP y daña al asesino.',                                  color:'#ff4400', hatColor:'#ff8800', skinColor:'#ffccaa', shirtColor:'#cc2200', hp:4500, speed:185, shootRate:0.28, maxAmmo:5, bulletDmg:560, bulletColor:'#ff6600',  abilities:[{name:'Renacer',  icon:'🔥',key:'Q',desc:'Revive (30s cooldown)'},{name:'Explosión',icon:'💥',key:'E',desc:'AOE al morir'},{name:'Vuelo',     icon:'🦅',key:'F',desc:'Vuela 2s'}],        unlockAt:14, unlockDesc:'Completa Nivel 14', stats:{poder:4,vida:3,velocidad:4} },
  { id:'void_walker', name:'Caminante Vacío',icon:'🌑', class:'Cósmico',        desc:'Origen del vacío. Absorbe energía y distorsiona realidad.',                                      color:'#1a1a2e', hatColor:'#2a2a4e', skinColor:'#3a3a5e', shirtColor:'#0a0a1e', hp:4200, speed:190, shootRate:0.25, maxAmmo:5, bulletDmg:540, bulletColor:'#4a4a8e',  abilities:[{name:'Teleport',icon:'🌀',key:'Q',desc:'Teleporta a portal'},{name:'Portal',    icon:'🌀',key:'E',desc:'Crea portal'},{name:'Distorsión',icon:'🌌',key:'F',desc:'Inmoviliza 2s'}], unlockAt:15, unlockDesc:'Completa Nivel 15', stats:{poder:4,vida:3,velocidad:4} },
  { id:'demolition',  name:'Demolidor',     icon:'💣', class:'Explosivo',      desc:'Experto en explosiones. Coloca cargas remotas estratégicamente.',                                    color:'#884400', hatColor:'#aa6600', skinColor:'#ffccaa', shirtColor:'#663300', hp:4000, speed:180, shootRate:0.30, maxAmmo:6, bulletDmg:500, bulletColor:'#ff8800',  abilities:[{name:'Carga',    icon:'💣',key:'Q',desc:'Coloca explosivo'},{name:'Detonar',  icon:'💥',key:'E',desc:'Detona cargas'},{name:'Granada',  icon:'🔥',key:'F',desc:'Lanza granada'}],   unlockAt:21, unlockDesc:'Completa Nivel 21', stats:{poder:4,vida:3,velocidad:3} },
  { id:'illusionist', name:'Ilusionista',   icon:'🎭', class:'Místico',         desc:'Crea ilusiones para confundir a los enemigos.',                                                  color:'#8844aa', hatColor:'#aa66cc', skinColor:'#e0d0ff', shirtColor:'#552277', hp:3800, speed:200, shootRate:0.26, maxAmmo:5, bulletDmg:520, bulletColor:'#cc88ff',  abilities:[{name:'Espejismo Múltiple',icon:'👥',key:'Q',desc:'Crea 3 clones que atacan'},{name:'Laberinto Mental',icon:'🌀',key:'E',desc:'Confunde y desorienta enemigos'},{name:'Teleportación Sombría',icon:'✨',key:'F',desc:'Teleport con daño ilusorio'}],   unlockAt:22, unlockDesc:'Completa Nivel 22', stats:{poder:3,vida:3,velocidad:5} },
  { id:'shotgunner',  name:'Escopetero',   icon:'🔫', class:'Escopeta',       desc:'Dispara ráfagas de perdigones. Crea muros de bloqueo.',                                          color:'#cc4444', hatColor:'#882222', skinColor:'#ffccaa', shirtColor:'#aa3333', hp:4500, speed:175, shootRate:0.45, maxAmmo:4, bulletDmg:350, bulletColor:'#ff6666',  abilities:[{name:'Muro Bloqueo',icon:'🧱',key:'Q',desc:'Crea muro temporal'},{name:'Escopeta Doble',icon:'💥',key:'E',desc:'Doble ráfaga'},{name:'Recarga Rápida',icon:'⚡',key:'F',desc:'Recarga instantánea'}], unlockAt:24, unlockDesc:'Completa Nivel 24', stats:{poder:4,vida:3,velocidad:3} },
  { id:'hypnotist',  name:'Hipnotizador',  icon:'🌀', class:'Mental',          desc:'Dispara ráfagas de 3 balas. Hipnotiza enemigos para luchar por ti.',                                  color:'#aa44ff', hatColor:'#6622aa', skinColor:'#e0d0ff', shirtColor:'#5533aa', hp:3800, speed:190, shootRate:0.35, maxAmmo:6, bulletDmg:480, bulletColor:'#cc88ff',  abilities:[{name:'Hipnosis',  icon:'👁️',key:'Q',desc:'Hipnotiza enemigo'},{name:'Confusión', icon:'💫',key:'E',desc:'Confunde cercanos'},{name:'Barrera Mental',icon:'🛡️',key:'F',desc:'Escudo mental'}],  unlockAt:25, unlockDesc:'Completa Nivel 25', stats:{poder:4,vida:2,velocidad:4} },
  { id:'gambler',    name:'Jugador',       icon:'🎲', class:'Suerte',          desc:'25% de daño crítico extra. Ralentiza enemigos y sus proyectiles.',                                      color:'#ffcc00', hatColor:'#aa8800', skinColor:'#ffeecc', shirtColor:'#cc9900', hp:3900, speed:195, shootRate:0.32, maxAmmo:5, bulletDmg:520, bulletColor:'#ffdd00',  abilities:[{name:'Ralentizar',icon:'⏱',key:'Q',desc:'Ralentiza enemigos'},{name:'Suerte',    icon:'🎰',key:'E',desc:'50% daño extra'},{name:'Pausa',     icon:'⏸',key:'F',desc:'Pausa balas 2s'}],        unlockAt:26, unlockDesc:'Completa Nivel 26', stats:{poder:4,vida:3,velocidad:4} },
  { id:'bomber',     name:'Bombardero',    icon:'💣', class:'Explosivo',      desc:'Ataca lanzando bombas explosivas como habilidad especial.',                                          color:'#ff6600', hatColor:'#cc4400', skinColor:'#ffccaa', shirtColor:'#aa3300', hp:4200, speed:180, shootRate:0.35, maxAmmo:6, bulletDmg:650, bulletColor:'#ff8800',  abilities:[{name:'Bomba',    icon:'💣',key:'Q',desc:'Lanza bomba'},{name:'Múltiple', icon:'💥',key:'E',desc:'3 bombas'},{name:'Granada',  icon:'🔥',key:'F',desc:'Granada rápida'}],        unlockAt:27, unlockDesc:'Completa Nivel 27', stats:{poder:4,vida:3,velocidad:3} },
  { id:'legend',      name:'Legendario',    icon:'👑', class:'Divino',         desc:'El héroe definitivo. Solo para los más dignos. Desbloqueado por logros.',                       color:'#ffd700', hatColor:'#ffaa00', skinColor:'#ffeecc', shirtColor:'#cc8800', hp:8000, speed:200, shootRate:0.20, maxAmmo:8, bulletDmg:650, bulletColor:'#ffd700',  abilities:[{name:'Corona',   icon:'👑',key:'Q',desc:'Invencible 4s'},{name:'Juicio',    icon:'⚖️',key:'E',desc:'Daño masivo'},{name:'Ascensión',icon:'✨',key:'F',desc:'Curación total'}],   unlockAt:'legendary', unlockDesc:'Desbloquea logro Legendario', stats:{poder:5,vida:5,velocidad:5} },
  // Shop heroes
  { id:'shadow',     name:'Sombra',        icon:'🌑', class:'Sombra',         desc:'Se funde con las sombras. Invisible en oscuridad, teletransporte instantáneo.',                        color:'#1a1a2e', hatColor:'#0a0a1e', skinColor:'#2a2a4e', shirtColor:'#050510', hp:3500, speed:220, shootRate:0.28, maxAmmo:6, bulletDmg:490, bulletColor:'#4a4a8e',  abilities:[{name:'Manto de Oscuridad',icon:'🌑',key:'Q',desc:'Invisibilidad y regeneración'},{name:'Paso Sombrío',icon:'👻',key:'E',desc:'Teleport con clones'},{name:'Ejecución Umbral',icon:'⚔️',key:'F',desc:'Daño masivo a enemigos debilitados'}],   unlockAt:'shop', unlockDesc:'Tienda: 500 💰', price:500, stats:{poder:3,vida:2,velocidad:5} },
  { id:'thunder',    name:'Trueno',        icon:'⚡', class:'Eléctrico',       desc:'Canaliza electricidad. Daño en cadena, aturde enemigos.',                                           color:'#00aaff', hatColor:'#0088cc', skinColor:'#88ddff', shirtColor:'#006699', hp:4000, speed:195, shootRate:0.30, maxAmmo:5, bulletDmg:550, bulletColor:'#00ccff',  abilities:[{name:'Tormenta Eléctrica',icon:'⛈️',key:'Q',desc:'Rayos en cadena'},{name:'Campo Electromagnético',icon:'🌀',key:'E',desc:'Atrae y daña'},{name:'Rayo Celestial',icon:'☁️',key:'F',desc:'Rayo masivo'},{name:'Velocidad Relámpago',icon:'💨',key:'R',desc:'Dash eléctrico'}],        unlockAt:'shop', unlockDesc:'Tienda: 750 💰', price:750, stats:{poder:5,vida:3,velocidad:4} },
  { id:'nature',     name:'Naturaleza',    icon:'🌿', class:'Natural',         desc:'Control de la naturaleza. Enredaderas, curación, veneno.',                                           color:'#44aa44', hatColor:'#228822', skinColor:'#88cc88', shirtColor:'#116611', hp:4200, speed:185, shootRate:0.32, maxAmmo:5, bulletDmg:510, bulletColor:'#66cc66',  abilities:[{name:'Bosque Encantado',icon:'🌳',key:'Q',desc:'Crea bosque con enredaderas'},{name:'Regeneración Vital',icon:'💚',key:'E',desc:'Curación continua'},{name:'Tormenta de Espinas',icon:'🌹',key:'F',desc:'Explosión de espinas'},{name:'Raíces de la Tierra',icon:'🌱',key:'R',desc:'Inmoviliza área'}],        unlockAt:'shop', unlockDesc:'Tienda: 600 💰', price:600, stats:{poder:3,vida:5,velocidad:3} },
  { id:'frost',      name:'Escarcha',      icon:'❄️', class:'Hielo',           desc:'Domina el hielo. Congela enemigos, crea escudos de hielo.',                                          color:'#88ddff', hatColor:'#66aacc', skinColor:'#cceeff', shirtColor:'#4488cc', hp:3800, speed:190, shootRate:0.30, maxAmmo:5, bulletDmg:520, bulletColor:'#aaddff',  abilities:[{name:'Ventisca',icon:'🌨️',key:'Q',desc:'Tormenta de hielo'},{name:'Muro Glacial',icon:'🧊',key:'E',desc:'Muro de hielo'},{name:'Deslizamiento',icon:'⛸️',key:'F',desc:'Dash helado'},{name:'Avalancha',icon:'🏔️',key:'T',desc:'Avalancha masiva'}],        unlockAt:'shop', unlockDesc:'Tienda: 800 💰', price:800, stats:{poder:4,vida:3,velocidad:4} },
  { id:'blaze',      name:'Llama',         icon:'🔥', class:'Fuego',           desc:'Fuego purificador. Daño continuo, explosiones en cadena.',                                          color:'#ff6600', hatColor:'#cc4400', skinColor:'#ffccaa', shirtColor:'#aa3300', hp:3600, speed:200, shootRate:0.26, maxAmmo:6, bulletDmg:540, bulletColor:'#ff8800',  abilities:[{name:'Bola Fuego',icon:'🔥',key:'Q',desc:'Bola de fuego'},{name:'Rastro Ardiente',icon:'💥',key:'E',desc:'Rastro en llamas'},{name:'Explosión Ígnea',icon:'💫',key:'F',desc:'Explosión de fuego'},{name:'Infierno',icon:'🌋',key:'T',desc:'Campo de lava'}],        unlockAt:'shop', unlockDesc:'Tienda: 900 💰', price:900, stats:{poder:5,vida:2,velocidad:5} },
  { id:'void',       name:'Vacío',         icon:'🌑', class:'Cósmico',         desc:'Poder del vacío. Manipula el espacio y la realidad.',                                             color:'#2a2a4e', hatColor:'#1a1a3e', skinColor:'#3a3a5e', shirtColor:'#0a0a2e', hp:4000, speed:185, shootRate:0.28, maxAmmo:5, bulletDmg:560, bulletColor:'#4a4a8e',  abilities:[{name:'Ruptura Dimensional',icon:'🌀',key:'Q',desc:'Ruptura espacial'},{name:'Vórtice Vacío',icon:'🌌',key:'E',desc:'Atrae enemigos'},{name:'Desvanecer',icon:'👻',key:'F',desc:'Invisibilidad temporal'},{name:'Colapso',icon:'⚫',key:'T',desc:'Colapso gravitacional'}],        unlockAt:'shop', unlockDesc:'Tienda: 1000 💰', price:1000, stats:{poder:4,vida:4,velocidad:3} },
  { id:'sonic',      name:'Sónico',        icon:'💨', class:'Velocidad',       desc:'Maestro del sonido. Controla vibraciones y ondas de choque.',                                             color:'#00ffcc', hatColor:'#00cc99', skinColor:'#aaffee', shirtColor:'#008866', hp:3200, speed:280, shootRate:0.20, maxAmmo:8, bulletDmg:420, bulletColor:'#00ffaa',  abilities:[{name:'Eco Sónico',icon:'🔊',key:'Q',desc:'Eco que rebota'},{name:'Barrera Sonora',icon:'🔊',key:'E',desc:'Muro de sonido'},{name:'Velocidad Sónica',icon:'💨',key:'F',desc:'Dash de sonido'},{name:'Concierto Devastador',icon:'🎸',key:'T',desc:'Explosión musical'}],        unlockAt:'shop', unlockDesc:'Tienda: 1200 💰', price:1200, stats:{poder:3,vida:2,velocidad:5} },
  { id:'techno',     name:'Tecnomante',    icon:'🤖', class:'Tecnológico',    desc:'Domina la tecnología. Crea torretas y escudos de energía.',                                      color:'#00ccff', hatColor:'#0099cc', skinColor:'#66ddff', shirtColor:'#006699', hp:4300, speed:185, shootRate:0.30, maxAmmo:6, bulletDmg:550, bulletColor:'#00aaff',  abilities:[{name:'Sátase Láser',icon:'🛰️',key:'Q',desc:'Ataque orbital'},{name:'Campo EM',icon:'📡',key:'E',desc:'Campo electromagnético'},{name:'Teletransporte',icon:'⚡',key:'F',desc:'Teletransporte corto'},{name:'Sobrecarga',icon:'💥',key:'T',desc:'Explosión tecnológica'}],   unlockAt:42, unlockDesc:'Completa Nivel 42', stats:{poder:4,vida:4,velocidad:2} },
];

let unlockedLevels = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,38]);
let secretLevelsUnlocked = new Set();
let unlockedHeroes = new Set(['ranger','ninja','tank','mage','medic','sniper_hero','pyro','cyber','spectre','titan','vampire','storm','chronos','crystal','phoenix','void_walker','demolition','illusionist','shotgunner','hypnotist','gambler','bomber','techno']);
let purchasedHeroes = new Set();
let selectedHeroId = 'ranger';
let heroSelectPreviewId = 'ranger';
let heroSelectPendingLevel = null;
let globalDamageMultiplier = 1.0;

let comboCount = 0;
let comboTimer = 0;
let comboDamageMultiplier = 1.0;
let meteors = [];
let meteorTimer = 0;
let blockWalls = [];
let traps = [];
let boomerangs = [];
let laserRays = [];
let invisibilityPads = [];
let medkits = [];
let hardMode = false;

// ── Local Storage ───────────────────────────
function saveProgress(){
  const data={
    unlockedLevels:Array.from(unlockedLevels),
    unlockedHeroes:Array.from(unlockedHeroes),
    purchasedHeroes:Array.from(purchasedHeroes),
    secretLevelsUnlocked:Array.from(secretLevelsUnlocked),
    achievements:Array.from(achievements.entries()).map(([id,ach])=>({id,unlocked:ach.unlocked,progress:ach.progress})),
    selectedHeroId,
    globalDamageMultiplier,
    hardMode,
    coins
  };
  localStorage.setItem('brawlBlastProgress',JSON.stringify(data));
}

function loadProgress(){
  const s=localStorage.getItem('brawlBlastProgress');
  if(s){
    try{
      const d=JSON.parse(s);
      unlockedLevels=new Set(d.unlockedLevels||[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,38,41,42,43,44]);
      unlockedHeroes=new Set(d.unlockedHeroes||['ranger','ninja','tank','mage','medic','sniper_hero','pyro','cyber','spectre','titan','vampire','storm','chronos','crystal','phoenix','void_walker','demolition','illusionist','shotgunner','hypnotist','gambler','bomber']);
      purchasedHeroes=new Set(d.purchasedHeroes||[]);
      secretLevelsUnlocked=new Set(d.secretLevelsUnlocked||[]);
      if(d.achievements){
        d.achievements.forEach(a=>{
          const existing=achievements.get(a.id);
          if(existing){
            existing.unlocked=a.unlocked;
            existing.progress=a.progress;
          }
        });
      }
      selectedHeroId=d.selectedHeroId||'ranger';
      heroSelectPreviewId=selectedHeroId;
      globalDamageMultiplier=d.globalDamageMultiplier||1.0;
      hardMode=d.hardMode||false;
      coins=d.coins||0;
      // Check for legendary hero unlock
      if(achievements.get('legendary')?.unlocked&&!unlockedHeroes.has('legend')){
        unlockedHeroes.add('legend');
      }
    }catch(e){
      console.error('Error loading progress:',e);
    }
  }
}

// Load progress on startup
loadProgress();

// ── Achievements System ────────────────────
const ACHIEVEMENT_DEFS = [
  { id:'first_blood', name:'Primera Sangre', icon:'🩸', desc:'Elimina tu primer enemigo', unlocked:false },
  { id:'sharpshooter', name:'Francotirador', icon:'🎯', desc:'Acerta 50 disparos sin fallar', unlocked:false, progress:0, target:50 },
  { id:'survivor', name:'Superviviente', icon:'🛡️', desc:'Completa un nivel sin recibir daño', unlocked:false },
  { id:'speed_demon', name:'Demonio de Velocidad', icon:'⚡', desc:'Completa un nivel en menos de 60 segundos', unlocked:false },
  { id:'boss_slayer', name:'Matajefes', icon:'👑', desc:'Derrota a un jefe', unlocked:false },
  { id:'multikill', name:'Multikill', icon:'💀', desc:'Elimina 3 enemigos en 2 segundos', unlocked:false },
  { id:'coin_collector', name:'Cazador de Monedas', icon:'💰', desc:'Recoge 100 monedas', unlocked:false, progress:0, target:100 },
  { id:'tank_destroyer', name:'Destructotanques', icon:'🔥', desc:'Elimina a 3 tanques en una partida', unlocked:false, progress:0, target:3 },
  { id:'perfect_run', name:'Partida Perfecta', icon:'⭐', desc:'Completa un nivel sin recibir daño y sin morir', unlocked:false },
  { id:'hero_collector', name:'Coleccionista de Héroes', icon:'🦸', desc:'Desbloquea todos los héroes', unlocked:false },
  { id:'level_master', name:'Maestro de Niveles', icon:'🏆', desc:'Completa todos los niveles', unlocked:false },
  { id:'legendary', name:'Legendario', icon:'👑', desc:'Desbloquea todos los logros excepto este', unlocked:false },
  { id:'combo_master', name:'Maestro de Combos', icon:'⚡', desc:'Alcanza un combo de x10', unlocked:false, progress:0, target:10 },
  { id:'bomb_expert', name:'Experto en Bombas', icon:'💣', desc:'Elimina 50 enemigos con bombas', unlocked:false, progress:0, target:50 },
  { id:'shield_master', name:'Maestro de Escudos', icon:'🛡️', desc:'Bloquea 1000 de daño con escudos', unlocked:false, progress:0, target:1000 },
  { id:'dash_master', name:'Maestro de Dash', icon:'💨', desc:'Usa dash 100 veces', unlocked:false, progress:0, target:100 },
  { id:'crystal_collector', name:'Coleccionista de Cristales', icon:'💎', desc:'Usa 25 tiles de cristal', unlocked:false, progress:0, target:25 },
  { id:'void_master', name:'Maestro del Vacío', icon:'🌌', desc:'Sobrevive 10 tiles de vacío', unlocked:false, progress:0, target:10 },
  { id:'gravity_master', name:'Maestro de Gravedad', icon:'🌍', desc:'Usa 30 tiles de gravedad', unlocked:false, progress:0, target:30 },
  { id:'mirror_master', name:'Maestro de Espejos', icon:'🪞', desc:'Usa 20 tiles de espejo', unlocked:false, progress:0, target:20 },
  { id:'freeze_master', name:'Maestro de Hielo', icon:'❄️', desc:'Congela 25 enemigos', unlocked:false, progress:0, target:25 },
  { id:'magnetic_master', name:'Maestro Magnético', icon:'🧲', desc:'Usa 40 tiles magnéticos', unlocked:false, progress:0, target:40 },
  { id:'chaos_master', name:'Maestro del Caos', icon:'🌀', desc:'Sobrevive 15 tiles de caos', unlocked:false, progress:0, target:15 },
  { id:'ocean_master', name:'Maestro del Océano', icon:'🌊', desc:'Usa 35 tiles de agua', unlocked:false, progress:0, target:35 },
  { id:'dungeon_master', name:'Maestro de Mazmorras', icon:'🏰', desc:'Usa 30 tiles de mazmorra', unlocked:false, progress:0, target:30 },
  { id:'heal_tile_master', name:'Maestro de Curación', icon:'💚', desc:'Usa 50 tiles de curación', unlocked:false, progress:0, target:50, coinReward:40 },
  { id:'gimmick_master', name:'Maestro de Gimmicks', icon:'🎮', desc:'Completa todos los niveles con gimmicks especiales', unlocked:false, coinReward:200 },
  { id:'cheater', name:'Tramposo', icon:'🎮', desc:'Usa un código de trampa', unlocked:false, coinReward:100 },
  { id:'regeneration_master', name:'Maestro de Regeneración', icon:'💖', desc:'Completa nivel 32 con gimmick regeneration', unlocked:false, coinReward:80 },
  { id:'explosive_survivor', name:'Superviviente Explosivo', icon:'🔥', desc:'Completa nivel 33 con gimmick explosive_traps', unlocked:false, coinReward:100 },
  { id:'combo_king', name:'Rey del Combo', icon:'🔥', desc:'Alcanza combo de 50x', unlocked:false, coinReward:150 },
  { id:'bullet_hell', name:'Infierno de Balas', icon:'🔫', desc:'Dispara 1000 balas en una partida', unlocked:false, progress:0, target:1000, coinReward:50 },
  { id:'no_ammo_hero', name:'Héroe Sin Munición', icon:'🚫', desc:'Completa un nivel solo con habilidades especiales', unlocked:false, coinReward:100 },
  { id:'speed_runner', name:'Corredor Veloz', icon:'🏃', desc:'Completa 10 niveles en menos de 30 segundos', unlocked:false, progress:0, target:10, coinReward:75 },
  { id:'perfect_aim', name:'Puntería Perfecta', icon:'🎯', desc:'Acerta 100 disparos seguidos', unlocked:false, progress:0, target:100, coinReward:50 },
  { id:'shield_breaker', name:'Rompeescudos', icon:'🛡️', desc:'Destruye 100 escudos enemigos', unlocked:false, progress:0, target:100, coinReward:50 },
  { id:'crit_master', name:'Maestro Crítico', icon:'💎', desc:'Obtén 100 críticos en total', unlocked:false, progress:0, target:100, coinReward:75 },
  { id:'bomb_chain', name:'Cadena Explosiva', icon:'💥', desc:'Elimina 5 enemigos con una sola bomba', unlocked:false, coinReward:80 },
  { id:'dash_avoider', name:'Esquivador', icon:'💨', desc:'Esquiva 100 balas con dash', unlocked:false, progress:0, target:100, coinReward:50 },
  { id:'heal_tile_master', name:'Maestro de Curación', icon:'💚', desc:'Usa 50 tiles de curación', unlocked:false, progress:0, target:50, coinReward:40 },
  { id:'gimmick_master', name:'Maestro de Gimmicks', icon:'🎮', desc:'Completa todos los niveles con gimmicks especiales', unlocked:false, coinReward:200 },
  { id:'crystal_reflector', name:'Reflector Cristalino', icon:'🔮', desc:'Refleja 1000 puntos de daño con Prisma', unlocked:false, progress:0, target:1000, coinReward:75 },
  { id:'ice_wall_master', name:'Maestro del Hielo', icon:'❄️', desc:'Congela 50 enemigos con barreras de hielo', unlocked:false, progress:0, target:50, coinReward:60 },
];
let achievements = new Map();
ACHIEVEMENT_DEFS.forEach(a => achievements.set(a.id, {...a, unlocked:false, progress:0}));

let totalShots = 0;
let hits = 0;
let currentStreak = 0;
let maxStreak = 0;
let bombsKills = 0;
let dashCount = 0;
let medicHealTotal = 0;
let ninjaStealthKills = 0;
let levelStartTime = 0;
let damageTakenInLevel = 0;
let coins = 0;
let coinsOnGround = [];

function unlockAchievement(id) {
  const ach = achievements.get(id);
  if (ach && !ach.unlocked) {
    ach.unlocked = true;
    const coinReward = ach.coinReward || 50;
    coins += coinReward;
    spawnFloatText(canvas.width/2, canvas.height/2 - 100, `🏆 ${ach.name}!`, '#FFD700', 28);
    spawnFloatText(canvas.width/2, canvas.height/2 - 60, `+${coinReward} 💰`, '#FFD700', 24);
    shakeAmt = 8;
    addKillMsg(`🏆 Logro: ${ach.name} (+${coinReward} 💰)`);
    // Check for legendary hero unlock
    if(id==='legendary'&&!unlockedHeroes.has('legend')){
      unlockedHeroes.add('legend');
      spawnFloatText(canvas.width/2, canvas.height/2 - 150, `👑 ¡HÉROE LEGENDARIO DESBLOQUEADO!`, '#FFD700', 32);
    }
    saveProgress();
  }
}

function updateAchievementProgress(id, amount) {
  const ach = achievements.get(id);
  if (ach && !ach.unlocked && ach.target) {
    ach.progress = (ach.progress || 0) + amount;
    if (ach.progress >= ach.target) {
      unlockAchievement(id);
    }
    saveProgress();
  }
}

function checkAchievements() {
  // Check hero collector
  if (unlockedHeroes.size === HERO_DEFS.length - 1) unlockAchievement('hero_collector');
  // Check level master
  if (unlockedLevels.size === LEVEL_CONFIGS.filter(l=>!l.secret).length) unlockAchievement('level_master');
  // Check tank destroyer
  if (player && player.hp > 0 && player.hp < 100) unlockAchievement('tank_destroyer');
  // Check ultimate master (all achievements except legendary)
  const allUnlocked=Array.from(achievements.values()).filter(a=>a.id!=='legendary').every(a=>a.unlocked);
  if(allUnlocked) unlockAchievement('legendary');
  // Check secret level unlocks
  checkSecretLevelUnlocks();
}

function checkSecretLevelUnlocks(){
  // Secret level 34: perfect run achievement
  const perfectRun = achievements.get('perfect_run');
  if(perfectRun && perfectRun.unlocked && !secretLevelsUnlocked.has(34)){
    secretLevelsUnlocked.add(34);
    unlockedLevels.add(34);
    saveProgress();
    spawnFloatText(canvas.width/2,canvas.height/2,'🔮 NIVEL SECRETO DESBLOQUEADO: SALA SECRETA!','#ff00ff',28);
  }
  // Secret level 35: 1000 coins
  if(coins >= 1000 && !secretLevelsUnlocked.has(35)){
    secretLevelsUnlocked.add(35);
    unlockedLevels.add(35);
    saveProgress();
    spawnFloatText(canvas.width/2,canvas.height/2,'💎 NIVEL SECRETO DESBLOQUEADO: TESORO OCULTO!','#ffd700',28);
  }
  // Secret level 36: all achievements
  const allAchievements = Array.from(achievements.values()).every(a=>a.unlocked);
  if(allAchievements && !secretLevelsUnlocked.has(36)){
    secretLevelsUnlocked.add(36);
    unlockedLevels.add(36);
    saveProgress();
    spawnFloatText(canvas.width/2,canvas.height/2,'👑 NIVEL SECRETO DESBLOQUEADO: ARENA LEGENDARIA!','#ff4400',32);
  }
}

// ── Input ──────────────────────────────
const keys = {};
const mouse = { x:0, y:0, down:false };
let chatOpen = false;
const touchInput = {
  moveX: 0, moveY: 0, shooting: false, activeAimId: null, activeMoveId: null,
  aimX: window.innerWidth * 0.7, aimY: window.innerHeight * 0.5
};
const isMobileLike = () => window.matchMedia('(pointer: coarse), (max-width: 760px)').matches;

function updateOrientationGate() {
  document.body.classList.toggle('mobile-landscape-required', isMobileLike());
  resize();
}

async function requestLandscapeMode() {
  if(!isMobileLike()) return;
  try {
    if(!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    }
  } catch (_) {}
  try {
    await screen.orientation?.lock?.('landscape');
  } catch (_) {}
  updateOrientationGate();
}

document.getElementById('rotateFullscreenBtn')?.addEventListener('click', requestLandscapeMode);
window.addEventListener('resize', updateOrientationGate);
window.addEventListener('orientationchange', () => setTimeout(updateOrientationGate, 250));
updateOrientationGate();

window.addEventListener('keydown', e => {
  if (chatOpen) return;
  keys[e.code] = true;
  if (e.code==='Escape' && gameState==='playing') showMenu();
  if (e.code==='KeyR' && gameState==='playing') reloadAmmo();
  if (e.code==='KeyQ' && gameState==='playing') useSpecial('shield');
  if (e.code==='KeyE' && gameState==='playing') useSpecial('bomb');
  if (e.code==='KeyF' && gameState==='playing') useSpecial('dash');
  if (e.code==='KeyT' && gameState==='playing') useSpecial('ultimate');
  if (e.code==='KeyT' && gameState==='playing' && gameMode==='multi' && e.shiftKey) openChat();
  
  // Secret command to unlock hidden level
  if (e.code==='KeyL' && keys['KeyO'] && keys['KeyG'] && keys['KeyI'] && keys['KeyC']) {
    if (!unlockedLevels.has(38)) {
      unlockedLevels.add(38);
      secretLevelsUnlocked.add(38);
      saveProgress();
      spawnFloatText(canvas.width/2, canvas.height/2, '🔓 NIVEL SECRETO DESBLOQUEADO: CÁMARAS DE CRISTAL!', '#00ffff', 32);
    }
  }
  
  // Money cheat code - C+A+S+H
  if (e.code==='KeyH' && keys['KeyC'] && keys['KeyA'] && keys['KeyS']) {
    coins += 6000;
    saveProgress();
    spawnFloatText(canvas.width/2, canvas.height/2, '💰 +6000 MONEDAS!', '#ffd700', 32);
  }
  
  // Level 38 unlock code - C+R+Y+S+T+A+L
  if (e.code==='KeyL' && keys['KeyC'] && keys['KeyR'] && keys['KeyY'] && keys['KeyS'] && keys['KeyT'] && keys['KeyA']) {
    if (!unlockedLevels.has(38)) {
      unlockedLevels.add(38);
      secretLevelsUnlocked.add(38);
      saveProgress();
      spawnFloatText(canvas.width/2, canvas.height/2, '🔓 NIVEL 38 DESBLOQUEADO!', '#00ffff', 32);
    }
  }
  
  // All achievements unlock code - A+C+H+I+E+V
  if (e.code==='KeyV' && keys['KeyA'] && keys['KeyC'] && keys['KeyH'] && keys['KeyI'] && keys['KeyE']) {
    achievements.forEach((ach, id) => {
      if (!ach.unlocked) {
        ach.unlocked = true;
        ach.progress = ach.target || 1;
      }
    });
    saveProgress();
    spawnFloatText(canvas.width/2, canvas.height/2, '🏆 TODOS LOS LOGROS DESBLOQUEADOS!', '#ffd700', 32);
  }
  
  // Secret code to unlock legendario hero on character select
  if (e.code==='Digit6' && e.shiftKey && gameState==='menu' && document.getElementById('heroSelect').style.display==='flex'){
    if(!unlockedHeroes.has('legend')){
      unlockedHeroes.add('legend');
      saveProgress();
      buildHeroGrid();
      spawnFloatText(canvas.width/2,canvas.height/2,'👑 LEGENDARIO DESBLOQUEADO!','#ffd700',32);
    }
  }
  // Secret code to unlock Omega level
  if (e.code==='KeyO' && e.shiftKey && e.ctrlKey && gameState==='menu'){
    if(!secretLevelsUnlocked.has(37)){
      secretLevelsUnlocked.add(37);
      unlockedLevels.add(37);
      saveProgress();
      spawnFloatText(canvas.width/2,canvas.height/2,'🌟 CÓDIGO OMEGA: NIVEL SECRETO DESBLOQUEADO!','#00ffff',32);
    }
  }
  // O key opens command console in main menu
  if (e.code==='KeyO' && gameState==='menu' && document.getElementById('menu').style.display==='flex'){
    showCommandConsole();
  }
  // W key cleans all codes in main menu
  if (e.code==='KeyW' && gameState==='menu' && document.getElementById('menu').style.display==='flex'){
    cleanAllCodes();
  }
  // Level selector shortcuts
  if (gameState==='menu' && document.getElementById('levelSelect').style.display==='flex'){
    // Z key toggles hardmode
    if (e.code==='KeyZ'){
      const toggle = document.getElementById('hardModeToggle');
      toggle.checked = !toggle.checked;
      toggleHardMode();
    }
    // Arrow key navigation
    if (e.code==='ArrowLeft' || e.code==='ArrowRight' || e.code==='ArrowUp' || e.code==='ArrowDown'){
      e.preventDefault();
      navigateLevelGrid(e.code);
    }
  }
});
window.addEventListener('keyup', e => keys[e.code] = false);
canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mousedown', e => { mouse.down=true; if(gameState==='playing') tryShoot(e); });
canvas.addEventListener('mouseup', () => mouse.down = false);
canvas.addEventListener('contextmenu', e => e.preventDefault());

function setAimPoint(x, y) {
  mouse.x = x; mouse.y = y;
  touchInput.aimX = x; touchInput.aimY = y;
}

canvas.addEventListener('pointerdown', e => {
  if(e.pointerType !== 'touch' || gameState !== 'playing') return;
  e.preventDefault();
  if(e.clientX < window.innerWidth * 0.35) return;
  touchInput.activeAimId = e.pointerId;
  touchInput.shooting = true;
  setAimPoint(e.clientX, e.clientY);
  tryShootAt(e.clientX, e.clientY);
});
canvas.addEventListener('pointermove', e => {
  if(e.pointerType !== 'touch' || touchInput.activeAimId !== e.pointerId) return;
  e.preventDefault();
  setAimPoint(e.clientX, e.clientY);
});
function endTouchAim(e) {
  if(e.pointerType === 'touch' && touchInput.activeAimId === e.pointerId) {
    touchInput.activeAimId = null;
    touchInput.shooting = false;
  }
}
canvas.addEventListener('pointerup', endTouchAim);
canvas.addEventListener('pointercancel', endTouchAim);

function setMobileControlsVisible(visible) {
  const el = document.getElementById('mobileControls');
  if(!el) return;
  el.classList.toggle('active', visible && isMobileLike());
}

function bindHoldButton(el, onDown, onUp) {
  if(!el) return;
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
    onDown(e);
  });
  const finish = e => {
    e.preventDefault();
    onUp?.(e);
  };
  el.addEventListener('pointerup', finish);
  el.addEventListener('pointercancel', finish);
}

function setupMobileControls() {
  const stick = document.getElementById('mobileStick');
  const knob = document.getElementById('mobileKnob');
  const fire = document.getElementById('mobileFireBtn');
  const reload = document.getElementById('mobileReloadBtn');
  const chat = document.getElementById('mobileChatBtn');
  const menu = document.getElementById('mobileMenuBtn');
  if(!stick || !knob) return;

  const resetStick = () => {
    touchInput.moveX = 0; touchInput.moveY = 0; touchInput.activeMoveId = null;
    knob.style.transform = 'translate(0px, 0px)';
  };
  const updateStick = e => {
    const rect = stick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = rect.width * 0.34;
    const len = Math.hypot(dx, dy);
    if(len > max) { dx = dx / len * max; dy = dy / len * max; }
    touchInput.moveX = dx / max;
    touchInput.moveY = dy / max;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  stick.addEventListener('pointerdown', e => {
    e.preventDefault();
    touchInput.activeMoveId = e.pointerId;
    stick.setPointerCapture?.(e.pointerId);
    updateStick(e);
  });
  stick.addEventListener('pointermove', e => {
    if(touchInput.activeMoveId !== e.pointerId) return;
    e.preventDefault();
    updateStick(e);
  });
  stick.addEventListener('pointerup', e => { if(touchInput.activeMoveId === e.pointerId) resetStick(); });
  stick.addEventListener('pointercancel', e => { if(touchInput.activeMoveId === e.pointerId) resetStick(); });

  bindHoldButton(fire, e => {
    touchInput.shooting = true;
    if(touchInput.activeAimId === null) aimAtBestMobileTarget();
    tryShootAt(mouse.x, mouse.y);
  }, () => { touchInput.shooting = false; });
  reload?.addEventListener('pointerdown', e => { e.preventDefault(); if(gameState==='playing') reloadAmmo(); });
  chat?.addEventListener('pointerdown', e => { e.preventDefault(); if(gameState==='playing' && gameMode==='multi') openChat(); });
  menu?.addEventListener('pointerdown', e => { e.preventDefault(); if(gameState==='playing') showMenu(); });
}

setupMobileControls();

// Chat input
const chatInputEl = document.getElementById('chatInput');
chatInputEl.addEventListener('keydown', e => {
  if (e.code==='Enter') { sendChat(chatInputEl.value); chatInputEl.value=''; closeChat(); }
  if (e.code==='Escape') closeChat();
  e.stopPropagation();
});
function openChat() { chatOpen=true; chatInputEl.style.display='block'; chatInputEl.focus(); }
function closeChat() { chatOpen=false; chatInputEl.style.display='none'; chatInputEl.blur(); }
function sendChat(text) { if(text.trim() && ws && ws.readyState===1) { ws.send(JSON.stringify({type:'chat',text:text.trim()})); addChatMsg('yo', text, true); } }

// Command console input
const commandInputEl = document.getElementById('commandInput');
commandInputEl.addEventListener('keydown', e => {
  if (e.code==='Enter') { executeCommand(); }
  if (e.code==='Escape') closeCommandConsole();
  e.stopPropagation();
});

// ── WebSocket Multiplayer ─────────────────
function connectToServer() {
  const name = document.getElementById('playerName').value.trim() || 'Jugador';
  const room = document.getElementById('roomName').value.trim() || 'arena1';
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${protocol}://${location.host}`;

  setLobbyStatus('🔄 Conectando...');
  if (ws) { ws.close(); }
  ws = new WebSocket(url);

  ws.onopen = () => {
    setConnDot(true);
    ws.send(JSON.stringify({ type:'join', room, name, hero: selectedHeroId }));
  };

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    handleServerMsg(msg);
  };

  ws.onerror = () => setLobbyStatus('❌ Error de conexión. ¿Está el servidor corriendo?');
  ws.onclose = () => {
    setConnDot(false);
    if (gameState === 'playing') addKillMsg('📡 Oponente desconectado');
  };
}

function handleServerMsg(msg) {
  switch(msg.type) {
    case 'joined':
      myPlayerId = msg.playerId;
      setLobbyStatus(`✅ Conectado como ${msg.playerId === 'p1' ? 'Jugador 1 (HOST)':'Jugador 2'}. Sala: ${msg.roomId}`);
      updateSlot(msg.playerId, document.getElementById('playerName').value, selectedHeroId, true);
      break;

    case 'player_joined':
      opponentName = msg.name;
      opponentHeroId = msg.hero;
      updateSlot(msg.playerId, msg.name, msg.hero, true);
      setLobbyStatus(`✅ ¡${msg.name} se unió! (${msg.playerCount}/2)`);
      if (msg.playerCount === 2) {
        document.getElementById('btnStartLobby').classList.add('ready');
        setLobbyStatus('✅ ¡Los dos están listos! El host puede iniciar.');
      }
      break;

    case 'ready':
      multiReady = true;
      msg.players.forEach(p => {
        if (p.id !== myPlayerId) { opponentName = p.name; opponentHeroId = p.hero; }
        updateSlot(p.id, p.name, p.hero, true);
      });
      setLobbyStatus('✅ ¡Sala completa! Pulsa INICIAR.');
      document.getElementById('btnStartLobby').classList.add('ready');
      break;

    case 'start':
      startGame(msg.level, 'multi');
      break;

    case 'opponent_state':
      opponentState = msg.data;
      if (opponent) {
        opponent.x = msg.data.x;
        opponent.y = msg.data.y;
        opponent.angle = msg.data.angle;
        opponent.hp = msg.data.hp;
        opponent.shieldActive = msg.data.shieldActive;
        opponent.invisible = msg.data.invisible;
        opponent.inBush = msg.data.inBush;
        opponent.walkCycle = msg.data.walkCycle;
        if (msg.data.alive === false && opponent.alive) {
          opponent.alive = false;
          opponent.deathAnim = 1;
        }
      }
      break;

    case 'opponent_shoot':
      if (msg.bullet) opponentBullets.push({ ...msg.bullet, alive:true, trail:[], age:0 });
      break;

    case 'opponent_special':
      handleOpponentSpecial(msg.specialType, msg.data);
      break;

    case 'opponent_hit':
      // Our bullet hit the opponent - update their HP
      opponentHp = msg.hp;
      if (opponent) { opponent.hp = msg.hp; if(!msg.alive) { opponent.alive=false; opponent.deathAnim=1; } }
      document.getElementById('oppHpFill').style.width = (opponentHp/opponentMaxHp*100)+'%';
      break;

    case 'game_over':
      if (gameState === 'playing') {
        const iWon = msg.winner === myPlayerId;
        showOverlay(iWon, true);
      }
      break;

    case 'opponent_left':
      addKillMsg('📡 Oponente abandonó la partida');
      if (gameState === 'playing') showOverlay(true, true);
      break;

    case 'chat':
      addChatMsg(msg.name, msg.text, msg.from === myPlayerId);
      break;

    case 'error':
      setLobbyStatus('❌ ' + msg.msg);
      break;
  }
}

function handleOpponentSpecial(type, data) {
  if (!opponent) return;
  if (type === 'bomb') {
    bombs.push({ x: data.x, y: data.y, isMine: false, timer: 0.15, alive: true, owner: 'opponent', radius: data.radius || 100, damage: data.damage || 1000, color: data.color || '#ff6600' });
  } else if (type === 'shield') {
    opponent.shieldActive = true;
    opponent.shieldTimer = data.duration || 3;
  }
}

function sendMyState() {
  if (!ws || ws.readyState !== 1 || !player) return;
  ws.send(JSON.stringify({ type:'state', data: {
    x: player.x, y: player.y, angle: player.angle,
    hp: player.hp, alive: player.alive,
    shieldActive: player.shieldActive, invisible: player.invisible,
    inBush: player.inBush, walkCycle: player.walkCycle,
  }}));
}

function sendMyShot(bullet) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify({ type:'shoot', bullet: { x:bullet.x, y:bullet.y, vx:bullet.vx, vy:bullet.vy, damage:bullet.damage, color:bullet.color, size:bullet.size, piercing:bullet.piercing, owner:'opponent' } }));
}

function reportHit(hp, alive) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify({ type:'hit', hp, alive, killedBy: myPlayerId }));
}

// ── Lobby UI helpers ───────────────────────
function setLobbyStatus(msg) { document.getElementById('lobbyStatus').innerHTML = msg; }
function setConnDot(online) {
  const dot = document.getElementById('connDot');
  dot.className = 'conn-dot ' + (online ? 'conn-online':'conn-offline');
  document.getElementById('connLabel').textContent = online ? 'Online':'Desconectado';
}
function updateSlot(playerId, name, heroId, filled) {
  const slot = document.getElementById(playerId === 'p1' ? 'slot1':'slot2');
  const h = HERO_DEFS.find(x=>x.id===heroId) || HERO_DEFS[0];
  slot.className = 'player-slot' + (filled?' filled':'');
  slot.innerHTML = `<div class="slot-icon">${h.icon}</div><div class="slot-name">${name}</div><div class="slot-hero">${h.class}</div>`;
}

function resetPanelScroll(id) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if(el) el.scrollTop = 0;
  });
}

function showLobby() {
  hideAllScreens();
  document.getElementById('lobby').style.display = 'flex';
  resetPanelScroll('lobby');
  gameState = 'lobby';
}

function startMultiGame() {
  if (!multiReady && document.getElementById('lobbyPlayers').querySelectorAll('.filled').length < 2) {
    setLobbyStatus('⚠️ Espera a que se conecte tu oponente.');
    return;
  }
  if (ws && ws.readyState===1) {
    ws.send(JSON.stringify({ type:'start', level: currentLevel || 1 }));
  }
}

// ── Chat/Kill Feed ──────────────────────
function addChatMsg(from, text, isMe) {
  const box = document.getElementById('chatBox');
  const msg = document.createElement('div');
  msg.className = 'chat-msg' + (isMe?' mine':'');
  msg.style.color = isMe ? '#00ffcc' : '#ff6666';
  msg.textContent = `${from}: ${text}`;
  box.appendChild(msg);
  if (box.children.length > 6) box.removeChild(box.firstChild);
  setTimeout(() => { if(msg.parentNode) msg.parentNode.removeChild(msg); }, 6000);
}
function addKillMsg(text) {
  const feed = document.getElementById('killFeed');
  const msg = document.createElement('div');
  msg.className = 'kill-msg';
  msg.textContent = text;
  feed.appendChild(msg);
  if (feed.children.length > 4) feed.removeChild(feed.firstChild);
  setTimeout(() => { if(msg.parentNode) msg.parentNode.removeChild(msg); }, 5000);
}

// ── Level Configs ────────────────────────
const LEVEL_CONFIGS = [
  { id:1, name:'Desierto Salvaje', bg:'#c8884a', diff:'FÁCIL',   diffClass:'diff-easy', enemies:6,  enemyTypes:['grunt','grunt','scout'],  theme:'desert',  icon:'🏜', gimmick:null },
  { id:2, name:'Bosque Maldito',   bg:'#3a6e3a', diff:'FÁCIL',   diffClass:'diff-easy', enemies:8,  enemyTypes:['grunt','scout','grunt'],  theme:'forest',  icon:'🌲', gimmick:null },
  { id:3, name:'Volcán Ardiente',  bg:'#8b2500', diff:'MEDIO',   diffClass:'diff-med',  enemies:10, enemyTypes:['grunt','brute','scout'],  theme:'volcano', icon:'🌋', gimmick:'lava' },
  { id:4, name:'Tundra Helada',    bg:'#a0c8e0', diff:'MEDIO',   diffClass:'diff-med',  enemies:12, enemyTypes:['brute','scout','sniper'], theme:'ice',     icon:'❄', gimmick:'ice' },
  { id:5, name:'Ciudad Oscura',    bg:'#1a1a2e', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:15, enemyTypes:['brute','sniper','brute'], theme:'city',    icon:'🌆', gimmick:null },
  { id:6, name:'Jefe Final',       bg:'#2e0a2e', diff:'JEFE',    diffClass:'diff-boss', enemies:5,  enemyTypes:['boss'],                   theme:'boss',    icon:'💀', gimmick:null },
  { id:7, name:'Pantano Tóxico',  bg:'#2a4a2a', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:14, enemyTypes:['toxic','scout','toxic'],   theme:'swamp',   icon:'🐸', gimmick:'poison' },
  { id:8, name:'Torre del Cielo',  bg:'#1a2a4a', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:16, enemyTypes:['flyer','sniper','flyer'],  theme:'sky',     icon:'☁', gimmick:'wind' },
  { id:9, name:'Fábrica Abandonada',bg:'#3a3a3a', diff:'EXTREMO', diffClass:'diff-boss', enemies:18, enemyTypes:['mech','brute','mech'],    theme:'factory', icon:'⚙', gimmick:'conveyor' },
  { id:10, name:'Cripta Oscura',  bg:'#1a0020', diff:'EXTREMO', diffClass:'diff-boss', enemies:20, enemyTypes:['vampire','chaos','vampire'], theme:'crypt',   icon:'🧛', gimmick:'darkness' },
  { id:11, name:'Tormenta Final', bg:'#001030', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:16, enemyTypes:['storm','flyer','storm'],   theme:'storm',   icon:'⚡', gimmick:'lightning' },
  { id:12, name:'Nexo Temporal', bg:'#200040', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:18, enemyTypes:['temporal','vampire','temporal'],  theme:'nexus',   icon:'🌀', gimmick:'time' },
  { id:13, name:'Reino Cristal',  bg:'#004060', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:20, enemyTypes:['prism','mech','prism'],    theme:'crystal', icon:'💎', gimmick:'gravity' },
  { id:14, name:'Infierno',       bg:'#4a0000', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:22, enemyTypes:['ember','chaos','ember'], theme:'inferno', icon:'🔥', gimmick:'mirror' },
  { id:15, name:'El Vacío',       bg:'#000000', diff:'EXTREMO', diffClass:'diff-boss', enemies:24, enemyTypes:['voidling','storm','voidling'],   theme:'void',    icon:'🌑', gimmick:'freeze' },
  { id:16, name:'JEFE SUPREMO',   bg:'#1a0000', diff:'JEFE',    diffClass:'diff-boss', enemies:1,  enemyTypes:['boss'],                   theme:'boss',    icon:'👑', gimmick:null },
  { id:17, name:'Campo Magnético',bg:'#2a1a4a', diff:'EXTREMO', diffClass:'diff-boss', enemies:18, enemyTypes:['piercer','guardian','piercer'],theme:'boss',    icon:'🧲', gimmick:'magnetic' },
  { id:18, name:'Tormenta Caos',  bg:'#4a2a4a', diff:'EXTREMO', diffClass:'diff-boss', enemies:20, enemyTypes:['hive','chaos','hive'],      theme:'boss',    icon:'🌀', gimmick:'chaos' },
  { id:19, name:'Fortaleza',     bg:'#1a3a1a', diff:'EXTREMO', diffClass:'diff-boss', enemies:22, enemyTypes:['guardian','piercer','guardian'],theme:'boss',    icon:'🏰', gimmick:'magnetic' },
  { id:20, name:'Apocalipsis',    bg:'#3a1a1a', diff:'LENDARIO', diffClass:'diff-boss', enemies:25, enemyTypes:['hive','voidling','hive'],   theme:'boss',    icon:'☠️', gimmick:'chaos' },
  // World 2
  { id:21, name:'Lago Eterno',    bg:'#004488', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:18, enemyTypes:['fire_walker','scout','fire_walker'], theme:'ocean',   icon:'🌊', gimmick:'water' },
  { id:22, name:'Mazmorra Pinchos',bg:'#4a2a2a', diff:'EXTREMO', diffClass:'diff-boss', enemies:20, enemyTypes:['hammer','brute','hammer'],     theme:'dungeon', icon:'⚔️', gimmick:'water' },
  { id:23, name:'Rey del Fuego',  bg:'#8b2500', diff:'JEFE',    diffClass:'diff-boss', enemies:8,  enemyTypes:['fire_walker','hammer','boss'], theme:'volcano', icon:'🔥', gimmick:'water' },
  // World 3 - New levels with meteor gimmick
  { id:24, name:'Lluvia de Fuego', bg:'#4a1a00', diff:'EXTREMO', diffClass:'diff-boss', enemies:20, enemyTypes:['shotgun','ghost','shotgun'], theme:'volcano', icon:'☄️', gimmick:'meteors' },
  { id:25, name:'Ciénaga Maldita', bg:'#1a3a1a', diff:'EXTREMO', diffClass:'diff-boss', enemies:22, enemyTypes:['ghost','toxic','ghost'], theme:'swamp', icon:'👻', gimmick:'poison' },
  { id:26, name:'Tormenta Cósmica', bg:'#0a0a2a', diff:'LENDARIO', diffClass:'diff-boss', enemies:25, enemyTypes:['shotgun','voidling','shotgun'], theme:'void', icon:'🌌', gimmick:'meteors' },
  // World 4 - New levels with returning enemies gimmick
  { id:27, name:'Necrópolis', bg:'#2a1a2a', diff:'EXTREMO', diffClass:'diff-boss', enemies:18, enemyTypes:['ghost','ghost','ghost'], theme:'crypt', icon:'💀', gimmick:'returning' },
  { id:28, name:'Fortaleza Olvidada', bg:'#3a3a4a', diff:'EXTREMO', diffClass:'diff-boss', enemies:20, enemyTypes:['hammer','berserker','hammer'], theme:'dungeon', icon:'🏰', gimmick:'returning' },
  { id:29, name:'Infierno Bombas', bg:'#4a2a00', diff:'LENDARIO', diffClass:'diff-boss', enemies:22, enemyTypes:['bomber','fire_walker','bomber'], theme:'volcano', icon:'💣', gimmick:'returning' },
  // New boss level
  { id:30, name:'JEFE FINAL SUPREMO', bg:'#000000', diff:'JEFE', diffClass:'diff-boss', enemies:1, enemyTypes:['supreme_boss'], theme:'boss', icon:'👑', gimmick:'meteors' },
  // World 5 - New levels with new gimmicks
  { id:31, name:'Cámara de Tiempo', bg:'#1a0030', diff:'EXTREMO', diffClass:'diff-boss', enemies:16, enemyTypes:['healer','brute','healer'], theme:'void', icon:'⏱', gimmick:'time_warp' },
  { id:40, name:'Tormenta Eléctrica', bg:'#1a1a3a', diff:'EXTREMO', diffClass:'diff-boss', enemies:20, enemyTypes:['guardian','hive','guardian','hive'], theme:'storm', icon:'⚡', gimmick:'thunder_power' },
  { id:41, name:'Arena del Regreso', bg:'#2a1a2e', diff:'EXTREMO', diffClass:'diff-boss', enemies:22, enemyTypes:['boss','hive','healer','melee','hive'], theme:'dungeon', icon:'🔄', gimmick:'returning' },
  { id:42, name:'Cámara Cuántica', bg:'#220044', diff:'EXTREMO', diffClass:'diff-boss', enemies:18, enemyTypes:['glitch','gravity_well','glitch'], theme:'void', icon:'⚛', gimmick:'quantum_shift' },
  { id:43, name:'Tormenta Magnética', bg:'#001144', diff:'EXTREMO', diffClass:'diff-boss', enemies:20, enemyTypes:['mimic','gravity_well','mimic'], theme:'city', icon:'🧲', gimmick:'magnetic_storm' },
  { id:44, name:'Desafío Clásico', bg:'#c8844a', diff:'EXTREMO', diffClass:'diff-boss', enemies:16, enemyTypes:['glitch','mimic','gravity_well'], theme:'desert', icon:'🏜', gimmick:'poison' },
  { id:32, name:'Santuario Curativo', bg:'#004400', diff:'EXTREMO', diffClass:'diff-boss', enemies:18, enemyTypes:['passive_healer','toxic','passive_healer'], theme:'forest', icon:'💚', gimmick:'regeneration' },
  { id:33, name:'Cámara Explosiva', bg:'#4a0000', diff:'LENDARIO', diffClass:'diff-boss', enemies:20, enemyTypes:['explosive','berserker','explosive'], theme:'volcano', icon:'💥', gimmick:'explosive_traps' },
    // Void Lord boss level
  { id:39, name:'SEÑOR DEL VACÍO', bg:'#0a0a1a', diff:'JEFE FINAL', diffClass:'diff-boss', enemies:1, enemyTypes:['void_lord'], theme:'void', icon:'🌌', gimmick:'void_storm' },
  // Secret levels
  { id:34, name:'Sala Secreta', bg:'#ff00ff', diff:'SECRETO', diffClass:'diff-boss', enemies:15, enemyTypes:['ghost','voidling','ghost'], theme:'void', icon:'🔮', gimmick:'mirror', secret:true, unlockCondition:'perfect_run' },
  { id:35, name:'Tesoro Oculto', bg:'#ffd700', diff:'SECRETO', diffClass:'diff-boss', enemies:12, enemyTypes:['passive_healer','healer','passive_healer'], theme:'forest', icon:'💎', gimmick:'regeneration', secret:true, unlockCondition:'coins_1000' },
  { id:36, name:'Arena Legendaria', bg:'#ff4400', diff:'SECRETO', diffClass:'diff-boss', enemies:25, enemyTypes:['boss','supreme_boss','boss'], theme:'boss', icon:'👑', gimmick:'meteors', secret:true, unlockCondition:'all_achievements' },
  { id:37, name:'Código Omega', bg:'#00ffff', diff:'SECRETO', diffClass:'diff-boss', enemies:20, enemyTypes:['temporal','prism','temporal'], theme:'nexus', icon:'🌟', gimmick:'time_warp', secret:true, unlockCondition:'code_omega' },
  // New levels
  { id:38, name:'Cámaras de Cristal', bg:'#00ffff', diff:'DIFÍCIL', diffClass:'diff-hard', enemies:18, enemyTypes:['crystal_shard','ice_elemental','crystal_shard'], theme:'crystal', icon:'💎', gimmick:'crystal_mines' },
  { id:40, name:'Fortaleza Sombría', bg:'#444466', diff:'EXTREMO', diffClass:'diff-extreme', enemies:22, enemyTypes:['shadow_assassin','ice_elemental','shadow_assassin'], theme:'void', icon:'🌑', gimmick:'shadow_realm' },
];

const cam = { x:0, y:0, targetX:0, targetY:0 };
const TILE = 64;
let mapW = 25, mapH = 20;
let tileMap = [];
let destructibles = [];
let bushTiles = [];
let mapConfig = null;

function generateMap(cfg) {
  mapConfig = cfg;
  tileMap = []; destructibles = []; bushTiles = [];
  const W=mapW, H=mapH;
  for(let y=0;y<H;y++){tileMap[y]=[];for(let x=0;x<W;x++)tileMap[y][x]=0;}
  for(let x=0;x<W;x++){tileMap[0][x]=1;tileMap[H-1][x]=1;}
  for(let y=0;y<H;y++){tileMap[y][0]=1;tileMap[y][W-1]=1;}
  const walls=[{x:4,y:3,w:1,h:4},{x:8,y:2,w:4,h:1},{x:13,y:5,w:1,h:3},{x:3,y:8,w:3,h:1},{x:7,y:7,w:1,h:5},{x:11,y:9,w:4,h:1},{x:16,y:3,w:1,h:5},{x:20,y:6,w:3,h:1},{x:18,y:10,w:1,h:4},{x:4,y:13,w:5,h:1},{x:10,y:12,w:1,h:4},{x:15,y:14,w:4,h:1},{x:20,y:13,w:1,h:4},{x:6,y:16,w:3,h:1},{x:13,y:17,w:5,h:1}];
  walls.forEach(p=>{for(let dy=0;dy<p.h;dy++)for(let dx=0;dx<p.w;dx++){let ty=p.y+dy,tx=p.x+dx;if(ty>0&&ty<H-1&&tx>0&&tx<W-1)tileMap[ty][tx]=1;}});
  const bpos=[{x:6,y:5},{x:7,y:5},{x:12,y:3},{x:13,y:3},{x:5,y:11},{x:19,y:8},{x:20,y:8},{x:9,y:15},{x:10,y:15},{x:16,y:16},{x:22,y:16},{x:3,y:4},{x:3,y:5},{x:14,y:12},{x:15,y:12},{x:8,y:13},{x:21,y:3},{x:21,y:4},{x:11,y:6},{x:6,y:18}];
  bpos.forEach(b=>{if(tileMap[b.y]&&tileMap[b.y][b.x]===0){tileMap[b.y][b.x]=2;bushTiles.push({tx:b.x,ty:b.y});}});
  const dpos=[{x:5,y:6,t:'barrel'},{x:14,y:7,t:'barrel'},{x:9,y:10,t:'crate'},{x:18,y:5,t:'crate'},{x:3,y:15,t:'rock'},{x:21,y:12,t:'rock'},{x:12,y:15,t:'barrel'},{x:7,y:17,t:'crate'},{x:16,y:11,t:'barrel'},{x:22,y:4,t:'rock'},{x:6,y:9,t:'crate'},{x:20,y:16,t:'barrel'},{x:9,y:4,t:'crate'},{x:17,y:8,t:'barrel'},{x:2,y:11,t:'rock'},{x:23,y:9,t:'crate'},{x:11,y:16,t:'barrel'},{x:4,y:7,t:'rock'}];
  dpos.forEach(d=>{if(tileMap[d.y]&&tileMap[d.y][d.x]===0){destructibles.push({x:d.x*TILE+TILE/2,y:d.y*TILE+TILE/2,type:d.t,hp:d.t==='rock'?80:d.t==='barrel'?40:60,maxHp:d.t==='rock'?80:d.t==='barrel'?40:60,alive:true,anim:0,shakeX:0});tileMap[d.y][d.x]=d.t==='barrel'?3:d.t==='crate'?4:5;}});
  if(cfg.theme==='volcano'){for(let y=8;y<12;y++){tileMap[y][12]=6;tileMap[y][13]=6;}}
  if(cfg.theme==='ice'){for(let y=3;y<7;y++){tileMap[y][10]=6;tileMap[y][11]=6;}}
  
  // Level gimmicks
  if(cfg.gimmick==='poison'){
    // Poison pools that damage over time
    for(let i=0;i<8;i++){
      const px=5+Math.floor(Math.random()*15),py=5+Math.floor(Math.random()*10);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=7;
    }
  }
  if(cfg.gimmick==='water'){
    // Water tiles - more water for levels 21 and 22
    const waterCount=(cfg.id===21||cfg.id===22)?12:8;
    for(let i=0;i<waterCount;i++){
      const px=4+Math.floor(Math.random()*18),py=4+Math.floor(Math.random()*13);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=6;
    }
  }
  if(cfg.gimmick==='wind'){
    // Wind tiles that push entities
    for(let i=0;i<6;i++){
      const px=3+Math.floor(Math.random()*19),py=3+Math.floor(Math.random()*14);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=8;
    }
  }
  if(cfg.gimmick==='conveyor'){
    // Conveyor belts that move in one direction
    for(let y=5;y<15;y++){for(let x=8;x<17;x++){if(tileMap[y]&&tileMap[y][x]===0)tileMap[y][x]=9;}}
  }
  if(cfg.gimmick==='teleport'){
    // Teleporter pairs
    tileMap[3][3]=10;tileMap[21][16]=10;
    tileMap[3][16]=11;tileMap[21][3]=11;
  }
  if(cfg.gimmick==='darkness'){
    // Darkness tiles - reduce visibility
    for(let i=0;i<10;i++){
      const px=4+Math.floor(Math.random()*17),py=4+Math.floor(Math.random()*12);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=12;
    }
  }
  if(cfg.gimmick==='lightning'){
    // Lightning tiles - random damage (more for storm level)
    const count=cfg.id===11?8:6;
    for(let i=0;i<count;i++){
      const px=3+Math.floor(Math.random()*19),py=3+Math.floor(Math.random()*14);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=13;
    }
  }
  if(cfg.gimmick==='time'){
    // Time tiles - slow movement
    for(let i=0;i<5;i++){
      const px=4+Math.floor(Math.random()*17),py=4+Math.floor(Math.random()*12);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=14;
    }
  }
  if(cfg.gimmick==='thunder_power'){
    // Place more water tiles like level 21 (ocean theme)
    const waterCount=12; // Same as level 21
    for(let i=0;i<waterCount;i++){
      const px=4+Math.floor(Math.random()*18),py=4+Math.floor(Math.random()*13);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=6;
    }
    // Place thunder power tiles (extra damage for 3 seconds)
    for(let i=0;i<6;i++){
      const px=5+Math.floor(Math.random()*15),py=5+Math.floor(Math.random()*10);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=28;
    }
    // Enable returning enemies mechanic
    enemies.forEach(e=>{
      if(e.alive){
        e.returning=true;
        e.returnTimer=5;
      }
    });
  }
  if(cfg.gimmick==='crystal'){
    // Crystal tiles - reflect damage
  }
  if(cfg.gimmick==='quantum_shift'){
    // Quantum shift tiles - random teleportation
    for(let i=0;i<8;i++){
      const px=4+Math.floor(Math.random()*17),py=4+Math.floor(Math.random()*12);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=29; // Quantum tile
    }
  }
  if(cfg.gimmick==='magnetic_storm'){
    // Magnetic storm tiles - pull/push entities
    for(let i=0;i<6;i++){
      const px=5+Math.floor(Math.random()*15),py=5+Math.floor(Math.random()*10);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=30; // Magnetic tile
    }
  }
  if(cfg.gimmick==='poison'){
    // Poison tiles - constant damage
    for(let i=0;i<4;i++){
      const px=3+Math.floor(Math.random()*19),py=3+Math.floor(Math.random()*14);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=15;
    }
  }
  if(cfg.gimmick==='inferno'){
    // Inferno tiles - constant fire damage
    for(let i=0;i<6;i++){
      const px=2+Math.floor(Math.random()*21),py=2+Math.floor(Math.random()*16);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=16;
    }
  }
  if(cfg.gimmick==='void'){
    // Void tiles - teleport randomly
    for(let i=0;i<3;i++){
      const px=5+Math.floor(Math.random()*15),py=5+Math.floor(Math.random()*10);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=17;
    }
  }
  if(cfg.gimmick==='void_storm'){
    // Void storm - intense void effects for Void Lord level
    for(let i=0;i<8;i++){
      const px=3+Math.floor(Math.random()*19),py=3+Math.floor(Math.random()*14);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=17;
    }
    // Add void vortex tiles
    for(let i=0;i<4;i++){
      const px=6+Math.floor(Math.random()*13),py=6+Math.floor(Math.random()*8);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=18;
    }
  }
  if(cfg.gimmick==='gravity'){
    // Gravity tiles - pull player toward center
    for(let i=0;i<4;i++){
      const px=6+Math.floor(Math.random()*13),py=6+Math.floor(Math.random()*8);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=18;
    }
  }
  if(cfg.gimmick==='mirror'){
    // Mirror tiles - reverse controls
    for(let i=0;i<3;i++){
      const px=4+Math.floor(Math.random()*17),py=4+Math.floor(Math.random()*12);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=19;
    }
  }
  if(cfg.gimmick==='freeze'){
    // Freeze tiles - stop movement briefly
    for(let i=0;i<4;i++){
      const px=3+Math.floor(Math.random()*19),py=3+Math.floor(Math.random()*14);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=20;
    }
  }
  if(cfg.gimmick==='magnetic'){
    // Magnetic tiles - pull bullets toward center
    for(let i=0;i<5;i++){
      const px=5+Math.floor(Math.random()*15),py=5+Math.floor(Math.random()*10);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=21;
    }
  }
  if(cfg.gimmick==='chaos'){
    // Chaos tiles - random effects
    for(let i=0;i<6;i++){
      const px=4+Math.floor(Math.random()*17),py=4+Math.floor(Math.random()*12);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=22;
    }
  }
  if(cfg.gimmick==='water'){
    // Water lakes - shootable but not passable
    for(let i=0;i<5;i++){
      const px=5+Math.floor(Math.random()*15),py=5+Math.floor(Math.random()*10);
      if(tileMap[py]&&tileMap[py][px]===0)tileMap[py][px]=23;
    }
  }
  if(cfg.gimmick==='meteors'){
    // No special tiles needed, meteors fall from sky
    meteorTimer=1+Math.random()*2;
  }
  if(cfg.gimmick==='spikes'){
    // Spike blocks - release spikes when destroyed
    for(let i=0;i<6;i++){
      const px=4+Math.floor(Math.random()*17),py=4+Math.floor(Math.random()*12);
      if(tileMap[py]&&tileMap[py][px]===0){
        destructibles.push({x:px*TILE+TILE/2,y:py*TILE+TILE/2,type:'spike_block',hp:50,maxHp:50,alive:true,anim:0,shakeX:0});
        tileMap[py][px]=24;
      }
    }
  }
  if(cfg.gimmick==='returning'){
    // Returning enemies gimmick - enemies respawn after death
    // Handled in enemy death logic
  }
  if(cfg.gimmick==='bridge'){
    // Bridge system: fill map with water, create narrow bridge paths
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(tileMap[y][x]===0){
          tileMap[y][x]=23; // Water
        }
      }
    }
    // Create horizontal bridges
    const bridges=[
      {x:2,y:5,w:21,h:1},
      {x:2,y:10,w:21,h:1},
      {x:2,y:15,w:21,h:1},
      {x:8,y:3,w:1,h:15},
      {x:16,y:3,w:1,h:15}
    ];
    bridges.forEach(b=>{
      for(let dy=0;dy<b.h;dy++){
        for(let dx=0;dx<b.w;dx++){
          const ty=b.y+dy,tx=b.x+dx;
          if(ty>0&&ty<H-1&&tx>0&&tx<W-1){
            tileMap[ty][tx]=0; // Bridge (walkable)
          }
        }
      }
    });
    // Add some destructibles on bridges
    const bridgeDestructibles=[
      {x:5,y:5,t:'barrel'},{x:10,y:5,t:'crate'},{x:15,y:5,t:'barrel'},
      {x:5,y:10,t:'crate'},{x:12,y:10,t:'barrel'},{x:18,y:10,t:'crate'},
      {x:7,y:15,t:'barrel'},{x:14,y:15,t:'crate'}
    ];
    bridgeDestructibles.forEach(d=>{
      if(tileMap[d.y]&&tileMap[d.y][d.x]===0){
        destructibles.push({x:d.x*TILE+TILE/2,y:d.y*TILE+TILE/2,type:d.t,hp:d.t==='barrel'?40:60,maxHp:d.t==='barrel'?40:60,alive:true,anim:0,shakeX:0});
        tileMap[d.y][d.x]=d.t==='barrel'?3:4;
      }
    });
  }
  if(cfg.gimmick==='time_warp'){
    // Time warp gimmick: scattered time tiles that slow down enemies
    const timeTiles=[{x:5,y:5},{x:10,y:3},{x:15,y:8},{x:8,y:12},{x:18,y:14},{x:12,y:16},{x:4,y:9},{x:20,y:6}];
    timeTiles.forEach(t=>{
      if(tileMap[t.y]&&tileMap[t.y][t.x]===0){
        tileMap[t.y][t.x]=14; // Time tile
      }
    });
  }
  if(cfg.gimmick==='regeneration'){
    // Regeneration gimmick: scattered heal tiles that restore HP
    const healTiles=[{x:6,y:6},{x:12,y:4},{x:18,y:10},{x:9,y:13},{x:15,y:15},{x:5,y:11},{x:20,y:8}];
    healTiles.forEach(t=>{
      if(tileMap[t.y]&&tileMap[t.y][t.x]===0){
      }
    });
  }
  if(cfg.gimmick==='crystal_mines'){
    // Crystal mines gimmick: hidden crystal mines that explode on contact
    for(let i=0;i<8;i++){
      const px=4+Math.floor(Math.random()*17),py=4+Math.floor(Math.random()*12);
      if(tileMap[py]&&tileMap[py][px]===0){
        tileMap[py][px]=31; // Crystal mine tile
      }
    }
  }
  if(cfg.gimmick==='shadow_realm'){
    // Shadow realm gimmick: areas that reduce visibility and slow movement
    for(let i=0;i<6;i++){
      const px=5+Math.floor(Math.random()*15),py=5+Math.floor(Math.random()*10);
      if(tileMap[py]&&tileMap[py][px]===0){
        tileMap[py][px]=32; // Shadow realm tile
      }
    }
  }
}

function isSolid(tx,ty){if(tx<0||ty<0||tx>=mapW||ty>=mapH)return true;const t=tileMap[ty]?.[tx];if(t===1||t===3||t===4||t===5||t===23||t===24||t===26||t===27)return true;if(blockWalls.some(w=>w.alive&&w.x===tx&&w.y===ty))return true;return false;}
function worldToTile(wx,wy){return{tx:Math.floor(wx/TILE),ty:Math.floor(wy/TILE)};}
function isInBush(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===2;}
function canEnemySeeThroughBush(enemy,tx,ty){const pin=isInBush(tx,ty),ein=isInBush(enemy.x,enemy.y);if(pin&&!ein)return Math.hypot(enemy.x-tx,enemy.y-ty)<130;return true;}
function isInPoison(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===7;}
function isInWind(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===8;}
function isInConveyor(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===9;}
function isInTeleporter(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&(tileMap[ty][tx]===10||tileMap[ty][tx]===11);}
function isInDarkness(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===12;}
function isInLightning(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===13;}
function isInTime(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===14;}
function isInCrystal(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===15;}
function isInInferno(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===16;}
function isInVoid(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===17;}
function isInGravity(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===18;}
function isInMirror(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===19;}
function isInFreeze(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===20;}
function isInMagnetic(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===21;}
function isInChaos(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===22;}
function isInWater(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===23;}
function isInSpikeBlock(wx,wy){const{tx,ty}=worldToTile(wx,wy);return tileMap[ty]&&tileMap[ty][tx]===24;}
function isInMeteors(){return mapConfig.gimmick==='meteors';}

// ── Player ───────────────────────────────
const BULLET_SPEED = 420;
let player = null;
let opponent = null;  // The remote player in multi mode

function createPlayer(heroDef, spawnX, spawnY) {
  return {
    x:spawnX||2.5*TILE, y:spawnY||2.5*TILE, vx:0, vy:0,
    hp:heroDef.hp, maxHp:heroDef.hp, radius:22, angle:0,
    ammo:heroDef.maxAmmo, maxAmmo:heroDef.maxAmmo,
    reloadTimer:0, reloadRate:1.8,
    shootCooldown:0, shootRate:heroDef.shootRate,
    alive:true, walkCycle:0, bodyBob:0, hitFlash:0,
    color:heroDef.color, hatColor:heroDef.hatColor, skinColor:heroDef.skinColor, shirtColor:heroDef.shirtColor,
    heroId:heroDef.id, heroName:heroDef.name, heroDef:heroDef,
    bulletDmg:heroDef.bulletDmg, bulletColor:heroDef.bulletColor,
    speed:heroDef.speed,
    shieldActive:false, shieldTimer:0, dashActive:false, dashTimer:0,
    boosted:false, boostTimer:0, invisible:false, invisibleTimer:0,
    invincible:0, inBush:false, deathAnim:0,
    isOpponent: false,
    regenTimer: 0,
    controlsReversed: false,
    reflectActive: false, reflectTimer: 0,
    canRevive: false,
    reviveUsed: false,
    absorbActive: false, absorbTimer: 0,
    portal1: null, portal2: null,
    flying: false, flyingTimer: 0,
    rewindUses: 2,
    rewindHistory: [],
  };
}

function createOpponent(heroId, spawnX, spawnY) {
  const heroDef = HERO_DEFS.find(h=>h.id===heroId) || HERO_DEFS[0];
  const opp = createPlayer(heroDef, spawnX, spawnY);
  opp.isOpponent = true;
  return opp;
}

// ── Enemies ──────────────────────────────
let enemies = [];

const ENEMY_TYPES = {
  grunt:  {name:'Grunt', hp:800,  speed:90,  damage:200,radius:20,shootRate:1.2,color:'#ff4444',helmetColor:'#882222',shirtColor:'#aa3333',range:280,score:100,size:1.0,bulletColor:'#ff6600',bulletSize:7,  pattern:'chase'},
  scout:  {name:'Scout', hp:500,  speed:130, damage:150,radius:18,shootRate:0.9,color:'#ff8800',helmetColor:'#884400',shirtColor:'#cc6600',range:320,score:150,size:0.9,bulletColor:'#ffcc00',bulletSize:6,  pattern:'strafe'},
  brute:  {name:'Brute', hp:1800, speed:70,  damage:400,radius:26,shootRate:2.0,color:'#aa44ff',helmetColor:'#551188',shirtColor:'#7733cc',range:200,score:200,size:1.2,bulletColor:'#cc44ff',bulletSize:12, pattern:'chase'},
  sniper: {name:'Sniper',hp:600,  speed:80,  damage:350,radius:19,shootRate:2.5,color:'#44ff88',helmetColor:'#226644',shirtColor:'#339966',range:500,score:250,size:1.0,bulletColor:'#00ffcc',bulletSize:5,  pattern:'retreat'},
  boss:   {name:'BOSS',  hp:12000,speed:55,  damage:600,radius:38,shootRate:0.7,color:'#ff0066',helmetColor:'#880033',shirtColor:'#cc0055',range:400,score:2000,size:1.8,bulletColor:'#ff00ff',bulletSize:16,pattern:'boss'},
  toxic:  {name:'Tóxico', hp:700,  speed:110, damage:180,radius:22,shootRate:1.0,color:'#00aa00',helmetColor:'#006600',shirtColor:'#008800',range:300,score:180,size:1.0,bulletColor:'#00ff00',bulletSize:8,  pattern:'strafe', poison:true},
  flyer:  {name:'Volador',hp:550,  speed:180, damage:120,radius:16,shootRate:0.8,color:'#88ccff',helmetColor:'#4488cc',shirtColor:'#66aadd',range:350,score:160,size:0.85,bulletColor:'#aaddff',bulletSize:5, pattern:'aerial', flying:true},
  mech:   {name:'Meca',  hp:2500, speed:60,  damage:500,radius:30,shootRate:1.8,color:'#666666',helmetColor:'#444444',shirtColor:'#555555',range:250,score:300,size:1.4,bulletColor:'#888888',bulletSize:14, pattern:'chase', shield:true},
  chaos:  {name:'Caos',  hp:1000, speed:140, damage:280,radius:24,shootRate:1.1,color:'#ff00ff',helmetColor:'#aa00aa',shirtColor:'#cc00cc',range:320,score:350,size:1.1,bulletColor:'#ff88ff',bulletSize:10, pattern:'chaos', teleport:true},
  vampire:{name:'Vampiro',hp:1200,speed:150, damage:250,radius:22,shootRate:1.0,color:'#880088',helmetColor:'#440044',shirtColor:'#660066',range:340,score:400,size:1.1,bulletColor:'#ff00ff',bulletSize:9,  pattern:'chase', lifesteal:true},
  storm:  {name:'Tormenta',hp:900,  speed:170, damage:220,radius:20,shootRate:0.85,color:'#0066ff',helmetColor:'#0033aa',shirtColor:'#0044cc',range:360,score:380,size:1.0,bulletColor:'#00aaff',bulletSize:8,  pattern:'strafe', chain:true},
  temporal:{name:'Temporal',hp:1100,speed:160, damage:240,radius:21,shootRate:0.95,color:'#800080',helmetColor:'#400040',shirtColor:'#600060',range:330,score:450,size:1.05,bulletColor:'#aa00aa',bulletSize:9, pattern:'strafe', timeSlow:true},
  prism:  {name:'Prisma', hp:1300, speed:145, damage:280,radius:23,shootRate:1.05,color:'#00ffff',helmetColor:'#006666',shirtColor:'#008888',range:310,score:480,size:1.1,bulletColor:'#00ffff',bulletSize:10, pattern:'reflect', reflect:true},
  ember:  {name:'Brasa', hp:950,  speed:185, damage:260,radius:19,shootRate:0.88,color:'#ff6600',helmetColor:'#cc4400',shirtColor:'#ff5500',range:370,score:420,size:0.95,bulletColor:'#ff8800',bulletSize:8,  pattern:'chase', explodeOnDeath:true},
  voidling:{name:'Vacío', hp:1400, speed:155, damage:300,radius:25,shootRate:0.92,color:'#1a1a2e',helmetColor:'#0a0a1e',shirtColor:'#2a2a4e',range:350,score:500,size:1.15,bulletColor:'#4a4a8e',bulletSize:11, pattern:'phase', phase:true},
  piercer:{name:'Perforador',hp:1000,speed:150, damage:220,radius:20,shootRate:1.0,color:'#ff0088',helmetColor:'#880044',shirtColor:'#cc0066',range:340,score:550,size:1.0,bulletColor:'#ff00aa',bulletSize:8, pattern:'retreat', piercing:true},
  guardian:{name:'Guardián',hp:2000,speed:70, damage:350,radius:28,shootRate:1.5,color:'#88ff00',helmetColor:'#448800',shirtColor:'#66aa00',range:280,score:600,size:1.3,bulletColor:'#aaff00',bulletSize:13, pattern:'chase', dynamicShield:true},
  hive:{name:'Colmena',hp:1500,speed:90, damage:180,radius:26,shootRate:1.8,color:'#ffaa00',helmetColor:'#886600',shirtColor:'#cc8800',range:300,score:700,size:1.25,bulletColor:'#ffcc00',bulletSize:10, pattern:'chase', droneSpawner:true},
  fire_walker:{name:'Caminante Fuego',hp:1600,speed:140,damage:280,radius:24,shootRate:1.0,color:'#ff4400',helmetColor:'#cc2200',shirtColor:'#ff6600',range:320,score:550,size:1.1,bulletColor:'#ff8800',bulletSize:9, pattern:'chase', fireCircle:true},
  hammer:{name:'Martillo',hp:2200,speed:65,damage:450,radius:30,shootRate:2.2,color:'#886644',helmetColor:'#554422',shirtColor:'#aa8866',range:180,score:650,size:1.3,bulletColor:'#ccaa44',bulletSize:14, pattern:'chase', hammerSlam:true},
  shotgun:{name:'Escopeta',hp:1100,speed:95,damage:150,radius:22,shootRate:2.5,color:'#cc4444',helmetColor:'#882222',shirtColor:'#aa3333',range:200,score:580,size:1.1,bulletColor:'#ff6666',bulletSize:8, pattern:'chase', shotgun:true},
  ghost:{name:'Fantasma',hp:800,speed:200,damage:180,radius:18,shootRate:0.8,color:'#cccccc',helmetColor:'#888888',shirtColor:'#aaaaaa',range:350,score:450,size:0.9,bulletColor:'#ffffff',bulletSize:6, pattern:'chase', ghost:true, hauntOnDeath:true},
  bomber:{name:'Bombardero',hp:1300,speed:100,damage:200,radius:24,shootRate:0.6,color:'#ff8800',helmetColor:'#cc4400',shirtColor:'#ff6600',range:350,score:600,size:1.15,bulletColor:'#ffaa00',bulletSize:10, pattern:'strafe', bombThrower:true},
  berserker:{name:'Berserker',hp:1800,speed:120,damage:400,radius:26,shootRate:1.5,color:'#aa0000',helmetColor:'#660000',shirtColor:'#880000',range:120,score:700,size:1.25,bulletColor:'#ff0000',bulletSize:12, pattern:'chase', swordSlash:true},
  melee:{name:'Melee',hp:1600,speed:140,damage:350,radius:24,shootRate:0,color:'#ff4444',helmetColor:'#aa2222',shirtColor:'#cc3333',range:80,score:550,size:1.2,bulletColor:'#ff6666',bulletSize:0, pattern:'chase', meleeOnly:true},
  healer:{name:'Sanador',hp:900,speed:100,damage:150,radius:22,shootRate:1.5,color:'#00ff00',helmetColor:'#00aa00',shirtColor:'#00cc00',range:280,score:550,size:1.0,bulletColor:'#88ff88',bulletSize:8, pattern:'strafe', healsNearby:true},
  passive_healer:{name:'Sanador Pasivo',hp:1200,speed:85,damage:180,radius:24,shootRate:1.2,color:'#44ff44',helmetColor:'#22aa22',shirtColor:'#33cc33',range:300,score:600,size:1.1,bulletColor:'#66ff66',bulletSize:9, pattern:'chase', passiveHeal:true},
  explosive:{name:'Explosivo',hp:1000,speed:130,damage:250,radius:23,shootRate:1.0,color:'#ff4400',helmetColor:'#cc2200',shirtColor:'#ff6600',range:320,score:650,size:1.15,bulletColor:'#ff8800',bulletSize:10, pattern:'chase', explodeOnDeath:true, explosionDamage:1200, explosionRadius:180},
  spy:{name:'Espía',hp:1500,speed:180,damage:350,radius:22,shootRate:1.2,color:'#2a2a2a',helmetColor:'#1a1a1a',shirtColor:'#333333',range:200,score:750,size:1.1,bulletColor:'#444444',bulletSize:10, pattern:'ambush', invisible:true, hammerSlam:true},
  supreme_boss:{name:'JEFE SUPREMO',hp:25000,speed:60,damage:800,radius:45,shootRate:0.5,color:'#ffd700',helmetColor:'#ff8800',shirtColor:'#cc6600',range:500,score:5000,size:2.2,bulletColor:'#ffcc00',bulletSize:20,pattern:'boss',multiAttack:true},
  void_lord:{name:'SEÑOR DEL VACÍO',hp:30000,speed:45,damage:900,radius:50,shootRate:0.6,color:'#1a1a2e',helmetColor:'#0a0a1e',shirtColor:'#2a2a4e',range:600,score:8000,size:2.5,bulletColor:'#4a4a8e',bulletSize:22,pattern:'void_lord', multiPhase:true, voidAbilities:true},
  // New unique enemies
  glitch:{name:'Glitch',hp:1100,speed:120,damage:200,radius:18,shootRate:0.7,color:'#ff00ff',helmetColor:'#aa00aa',shirtColor:'#ff00ff',range:350,score:480,size:0.9,bulletColor:'#ff88ff',bulletSize:6, pattern:'chase', teleportRandom:true},
  gravity_well:{name:'Pozo Gravedad',hp:1800,speed:45,damage:300,radius:28,shootRate:1.8,color:'#4444ff',helmetColor:'#2222aa',shirtColor:'#3333cc',range:400,score:520,size:1.3,bulletColor:'#6666ff',bulletSize:12, pattern:'chase', gravityPull:true},
  mimic:{name:'Mímico',hp:900,speed:95,damage:180,radius:20,shootRate:1.0,color:'#888888',helmetColor:'#555555',shirtColor:'#777777',range:350,score:450,size:1.0,bulletColor:'#aaaaaa',bulletSize:7, pattern:'chase', copyPlayer:true, homing:true},
  // New enemies for this update
  crystal_shard:{name:'Fragmento Cristal',hp:900,speed:160,damage:200,radius:20,shootRate:0.9,color:'#00ffff',helmetColor:'#008888',shirtColor:'#00aaaa',range:340,score:400,size:1.0,bulletColor:'#00ffff',bulletSize:8, pattern:'strafe', shardBurst:true},
  ice_elemental:{name:'Elemental de Hielo',hp:1100,speed:130,damage:180,radius:22,shootRate:1.1,color:'#00ccff',helmetColor:'#0066aa',shirtColor:'#0088cc',range:300,score:450,size:1.1,bulletColor:'#66ddff',bulletSize:9, pattern:'chase', iceAura:true},
  shadow_assassin:{name:'Asesino Sombrío',hp:800,speed:220,damage:250,radius:18,shootRate:0.7,color:'#444466',helmetColor:'#222233',shirtColor:'#333344',range:280,score:500,size:0.9,bulletColor:'#8888aa',bulletSize:7, pattern:'ambush', shadowStrike:true, invisible:true},
};

const SPAWN_POSITIONS=[{x:22,y:1},{x:22,y:18},{x:1,y:18},{x:12,y:1},{x:12,y:18},{x:22,y:10},{x:1,y:10},{x:5,y:18},{x:19,y:1},{x:22,y:5}];

function spawnEnemies(cfg){
  enemies=[];
  // In multiplayer, enemies are optional (both fight each other + bots)
  // Reduce enemy count slightly in multi to keep it fun
  const count = gameMode==='multi' ? Math.ceil(cfg.enemies * 0.5) : cfg.enemies;
  const types=cfg.enemyTypes;
  let spawns=[...SPAWN_POSITIONS];
  // Apply hardmode multiplier
  const hardModeMultiplier = hardMode ? 1.8 : 1.0; // 80% stronger in hardmode
  for(let i=0;i<count;i++){
    const t=types[i%types.length],def=ENEMY_TYPES[t],sp=spawns[i%spawns.length];
    const baseHp=def.hp*(1+(cfg.id-1)*0.15)*hardModeMultiplier;
    const baseDamage=def.damage*hardModeMultiplier;
    enemies.push({x:sp.x*TILE+TILE/2,y:sp.y*TILE+TILE/2,vx:0,vy:0,hp:baseHp,maxHp:baseHp,radius:def.radius,speed:def.speed,damage:baseDamage,range:def.range,shootRate:def.shootRate,shootCooldown:Math.random()*2,def,alive:true,angle:0,walkCycle:Math.random()*Math.PI*2,hitFlash:0,deathAnim:0,stateTimer:0,state:'patrol',patrolAngle:Math.random()*Math.PI*2,strafeDir:Math.random()<0.5?1:-1,strafeTimer:2,score:def.score,bossPhase:1,phased:false,phaseTimer:2+Math.random(),frozen:false,frozenTimer:0,shieldActive:false,shieldTimer:0,droneSpawnTimer:3+Math.random(),glitchTimer:0,gravityTimer:0,mimicTimer:0});
  }
}
let bullets = [];
let fireWalls = [];

function fireBullet(x,y,vx,vy,owner,damage,color,size,piercing=false,isRayo=false,options={}){
  // Handle double shot and knockback for shotgunner
  let finalDamage = damage;
  let finalKnockback = 0;
  
  if(options.isDoubleShot && player.doubleShotCount > 0 && owner === 'player') {
    finalDamage = damage * player.doubleShotDamage;
    finalKnockback = player.doubleShotKnockback || 0;
    player.doubleShotCount--;
  }
  
  // Handle distance-based damage scaling for tank
  if(owner === 'enemy' && options.startX && options.startY) {
    const dist = Math.hypot(x - options.startX, y - options.startY);
    const distanceMultiplier = 1 + (dist / 500); // 1x damage at start, up to 2x at 500 pixels
    finalDamage = damage * distanceMultiplier;
  }
  
  const b={x,y,vx,vy,owner,damage:finalDamage,color,size,alive:true,trail:[],piercing,age:0,hitEnemies:new Set(),isRayo,knockback:finalKnockback};
  bullets.push(b);
  if(owner==='player' && gameMode==='multi') sendMyShot(b);
  return b;
}

function getBestMobileTarget() {
  if(!player) return null;
  const candidates = [
    ...enemies.filter(e => e.alive),
    ...(gameMode === 'multi' && opponent && opponent.alive ? [opponent] : [])
  ];
  let best = null;
  let bestScore = Infinity;
  candidates.forEach(t => {
    const d = Math.hypot(t.x - player.x, t.y - player.y);
    if(d > 760) return;
    const sx = t.x - cam.x;
    const sy = t.y - cam.y;
    const onScreen = sx > -80 && sy > -80 && sx < canvas.width + 80 && sy < canvas.height + 80;
    const score = d + (onScreen ? 0 : 300);
    if(score < bestScore) { best = t; bestScore = score; }
  });
  return best;
}

function aimAtBestMobileTarget() {
  if(!player) return;
  const target = getBestMobileTarget();
  if(target) setAimPoint(target.x - cam.x, target.y - cam.y);
  else setAimPoint(
    player.x - cam.x + Math.cos(player.angle || 0) * 220,
    player.y - cam.y + Math.sin(player.angle || 0) * 220
  );
}

function tryShootAt(clientX, clientY){
  if(!player||!player.alive) return;
  if(player.ammo<=0){reloadAmmo();return;}
  if(player.shootCooldown>0) return;
  const wx=clientX+cam.x,wy=clientY+cam.y;
  const dx=wx-player.x,dy=wy-player.y,dist=Math.hypot(dx,dy);
  if(!dist) return;
  const spd=BULLET_SPEED*(player.heroId==='sniper_hero'?1.4:1);
  const piercing=player.heroId==='sniper_hero';
  const damage=player.bulletDmg*globalDamageMultiplier*(player.damageBoost||1)*comboDamageMultiplier;
  
  // Shotgun hero: fires 5 pellets in spread
  if(player.heroId==='shotgunner'){
    for(let s=-2;s<=2;s++){
      const ang=Math.atan2(dy,dx)+s*0.12;
      fireBullet(player.x,player.y,Math.cos(ang)*spd,Math.sin(ang)*spd,'player',damage*0.45,player.bulletColor,7,false);
    }
  }
  // Hypnotist hero: fires 3-bullet burst
  else if(player.heroId==='hypnotist'){
    for(let i=0;i<3;i++){
      const ang=Math.atan2(dy,dx)+(i-1)*0.08;
      fireBullet(player.x,player.y,Math.cos(ang)*spd,Math.sin(ang)*spd,'player',damage,player.bulletColor,8,false);
    }
  }
  // Gambler hero: 25% chance for critical damage
  else if(player.heroId==='gambler'){
    const isCrit = Math.random() < 0.25;
    const actualDamage = isCrit ? damage * 1.5 : damage;
    fireBullet(player.x,player.y,(dx/dist)*spd,(dy/dist)*spd,'player',actualDamage,player.bulletColor,9,false);
    if(isCrit){
      spawnFloatText(player.x,player.y-40,'¡CRÍTICO!','#ffcc00',18);
    }
  }
  // Bomber hero: primary attack is explosive bomb
  else if(player.heroId==='bomber'){
    const ang=Math.atan2(dy,dx);
    bombs.push({x:player.x+Math.cos(ang)*30,y:player.y+Math.sin(ang)*30,isMine:false,timer:0.15,alive:true,owner:'player',radius:100,damage:player.bulletDmg*2,color:player.bulletColor});
    spawnParticles(player.x,player.y,8,player.bulletColor,100,false,4);
  }
  // Normal shot
  else{
    fireBullet(player.x,player.y,(dx/dist)*spd,(dy/dist)*spd,'player',damage,player.bulletColor,9,piercing);
  }
  
  // Update combo on hit
  comboCount++;
  comboTimer=2; // 2 seconds to maintain combo
  comboDamageMultiplier=1+(comboCount*0.1); // 10% damage per combo hit
  if(comboCount>1){
    spawnFloatText(player.x,player.y-80,`COMBO x${comboCount}!`,'#ffcc00',20);
  }
  
  player.ammo--;
  player.shootCooldown=player.shootRate;
  updateAmmoUI();
  player.vx-=(dx/dist)*40;player.vy-=(dy/dist)*40;
  spawnParticles(player.x,player.y,4,player.bulletColor,15,false);
  if(player.ammo===0) player.reloadTimer=player.reloadRate;
  totalShots++;
  currentStreak++;
  if(currentStreak>maxStreak)maxStreak=currentStreak;
  updateAchievementProgress('sharpshooter',1);
}

function tryShoot(e){
  tryShootAt(e.clientX, e.clientY);
}

function reloadAmmo(){
  if(player&&player.ammo<player.maxAmmo&&player.reloadTimer<=0){
    // Normal reload for all heroes
    player.reloadTimer=player.reloadRate;
  }
}

function updateAmmoUI(){
  const bar=document.getElementById('ammoBar');bar.innerHTML='';
  for(let i=0;i<player.maxAmmo;i++){const d=document.createElement('div');d.className='ammo-dot'+(i<player.ammo?'':' empty');bar.appendChild(d);}
}

// ── Specials ──────────────────────────────
function useSpecial(type){
  if(!player||!player.alive) return;
  const sp=specials[type];if(sp.cd>0) return;
  if(type==='shield'){
    const h=player.heroId;
    if(h==='medic'){player.hp=Math.min(player.maxHp,player.hp+1000);spawnFloatText(player.x,player.y-60,'+1000 HP','#00ff88',22);spawnParticles(player.x,player.y,16,'#00ff88',100,false,6);}
    else if(h==='sniper_hero'){player.invisible=true;player.invisibleTimer=8;spawnFloatText(player.x,player.y-60,'¡CAMUFLAJE!','#88ff44',20);}
    else if(h==='ninja'){player.invisible=true;player.invisibleTimer=2;spawnFloatText(player.x,player.y-60,'¡INVISIBLE!','#ff0066',20);spawnParticles(player.x,player.y,20,'#ff0066',150,false,4);}
    else if(h==='pyro'){const wx=mouse.x+cam.x,wy=mouse.y+cam.y;const{tx:ttx,ty:tty}=worldToTile(wx,wy);if(!isSolid(ttx,tty)){fireWalls.push({x:ttx,y:tty,timer:5,alive:true});spawnParticles(wx,wy,20,'#ff6600',150,false,6);spawnFloatText(wx,wy-60,'¡MURO FUEGO!','#ff6600',22);}else{spawnFloatText(player.x,player.y-60,'¡NO PUEDO!','#ff4444',18);}}
    else if(h==='cyber'){player.shieldActive=true;player.shieldTimer=4;player.invincible=4;spawnFloatText(player.x,player.y-60,'¡ESCUDO EM!','#00ffff',22);spawnParticles(player.x,player.y,15,'#00ffff',120,false,5);}
    else if(h==='spectre'){
      // Forma Etérea - Enhanced wall crossing with ghost effects
      player.wallCrossing=true;player.wallCrossingTimer=3;player.inWall=false;
      player.invisible=true;player.invisibleTimer=3; // Also invisible while ethereal
      player.speedBoost=1.3;player.speedBoostTimer=3; // Speed boost while ethereal
      
      spawnFloatText(player.x,player.y-60,'👻 FORMA ETÉREA!','#aa44ff',22);
      spawnParticles(player.x,player.y,25,'#aa44ff',160,false,8);
      
      // Create ghost trail effect
      for(let i=0;i<5;i++){
        setTimeout(()=>{
          if(player.wallCrossing){
            spawnParticles(player.x,player.y,8,'#aa44ff',100,false,4);
          }
        },i*100);
      }
    }
    else if(h==='titan'){player.shieldActive=true;player.shieldTimer=5;player.invincible=5;player.damageBoost=(player.damageBoost||1);spawnFloatText(player.x,player.y-60,'¡ESCUDO DIVINO!','#ffcc00',22);spawnParticles(player.x,player.y,15,'#ffcc00',130,false,5);}
    else if(h==='vampire'){player.hp=Math.min(player.maxHp,player.hp+500);spawnFloatText(player.x,player.y-60,'¡DRENAR!','#ff00ff',22);spawnParticles(player.x,player.y,16,'#ff00ff',100,false,6);}
    else if(h==='storm'){
      // Rayo Cadena - Chain lightning that jumps between enemies
      const wx=mouse.x+cam.x,wy=mouse.y+cam.y;
      const dx=wx-player.x,dy=wy-player.y,d=Math.hypot(dx,dy);
      const angle=Math.atan2(dy,dx);
      
      // Find nearest enemy to start chain
      let nearestEnemy=null;
      let nearestDist=Infinity;
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<nearestDist&&dist<400){
            nearestDist=dist;
            nearestEnemy=e;
          }
        }
      });
      
      if(nearestEnemy){
        // Create chain lightning effect
        let chainEnemies=[nearestEnemy];
        let currentEnemy=nearestEnemy;
        
        // Chain up to 4 enemies
        for(let i=0;i<3;i++){
          let nextEnemy=null;
          let nextDist=Infinity;
          enemies.forEach(e=>{
            if(e.alive&&!e.isAlly&&!chainEnemies.includes(e)){
              const dist=Math.hypot(e.x-currentEnemy.x,e.y-currentEnemy.y);
              if(dist<nextDist&&dist<200){
                nextDist=dist;
                nextEnemy=e;
              }
            }
          });
          if(nextEnemy){
            chainEnemies.push(nextEnemy);
            currentEnemy=nextEnemy;
          }else break;
        }
        
        // Deal damage to all chained enemies
        chainEnemies.forEach((e,index)=>{
          const damage=Math.floor(player.bulletDmg*(1.5-index*0.1)); // Increased base damage from 1.0 to 1.5
          e.hp-=damage;
          e.hitFlash=0.5;
          spawnParticles(e.x,e.y,8,'#00aaff',120,false,4);
          spawnFloatText(e.x,e.y-40,'-'+damage,'#00aaff',14);
          
          if(e.hp<=0){
            e.alive=false;
            e.deathAnim=1;
            score+=e.score;
            spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
            spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
            updateEnemyCount();
          }
        });
        
        // Visual chain effect
        let prevX=player.x,prevY=player.y;
        chainEnemies.forEach(e=>{
          // Create lightning line effect
          for(let i=0;i<5;i++){
            const t=i/5;
            const x=prevX+(e.x-prevX)*t;
            const y=prevY+(e.y-prevY)*t;
            spawnParticles(x,y,3,'#00aaff',80,false,2);
          }
          prevX=e.x;
          prevY=e.y;
        });
        
        spawnFloatText(player.x,player.y-60,'⚡ RAYO CADENA!','#00aaff',22);
        spawnParticles(player.x,player.y,25,'#00aaff',180,false,8);
      }else{
        // No enemy found, shoot normal ray
        fireBullet(player.x,player.y,Math.cos(angle)*500,Math.sin(angle)*500,'player',player.bulletDmg,'#00aaff',10);
        spawnFloatText(player.x,player.y-60,'⚡ RAYO!','#00aaff',22);
        spawnParticles(player.x,player.y,20,'#00aaff',150,false,6);
      }
    }
    else if(h==='chronos'){enemies.forEach(e=>{if(e.alive){e.speed*=0.5;spawnFloatText(e.x,e.y-30,'⏱ LENTO','#800080',14);}});spawnFloatText(player.x,player.y-60,'¡RALENTIZAR!','#800080',22);spawnParticles(player.x,player.y,20,'#800080',150,false,6);}
    else if(h==='crystal'){
      // Espejo Cristalino - Take reduced damage but reflect back to enemies
      player.damageBoost=1.5;player.damageBoostTimer=5; // 1.5x damage amplification
      player.damageReduction=0.7;player.damageReductionTimer=5; // 30% damage reduction
      
      // Create reflection retaliation system
      player.retributionActive=true;
      player.retributionTimer=5;
    }
    else if(h==='frost'){
      // Ventisca - Blizzard storm that freezes enemies
      const blizzardRadius=250;
      const iceShardCount=12;
      
      // Create blizzard storm
      for(let i=0;i<iceShardCount;i++){
        const angle=(i/iceShardCount)*Math.PI*2;
        const shardX=player.x+Math.cos(angle)*blizzardRadius;
        const shardY=player.y+Math.sin(angle)*blizzardRadius;
        
        // Create ice shard projectile
        const shard={
          x:player.x,
          y:player.y,
          vx:Math.cos(angle)*350,
          vy:Math.sin(angle)*350,
          owner:'player',
          damage:player.bulletDmg*0.4,
          color:'#aaddff',
          size:5,
          hitEnemies:new Set(),
          age:0,
          maxAge:1.5,
          piercing:true,
          isIce:true,
          trail:[]
        };
        bullets.push(shard);
        
        // Visual ice trail
        for(let j=0;j<6;j++){
          const t=j/6;
          const x=player.x+(shardX-player.x)*t;
          const y=player.y+(shardY-player.y)*t;
          spawnParticles(x,y,2,'#aaddff',80,false,2);
        }
      }
      
      // Apply freeze effects to nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<blizzardRadius*0.7){
            // Freeze enemies
            e.frozen=true;
            e.frozenTimer=2.5;
            e.speed=0;
            
            // Apply ice damage
            e.hp-=player.bulletDmg*0.3;
            e.hitFlash=0.5;
            
            // Create ice crystal effect
            for(let j=0;j<8;j++){
              const angle=(j/8)*Math.PI*2;
              const crystalX=e.x+Math.cos(angle)*15;
              const crystalY=e.y+Math.sin(angle)*15;
              spawnParticles(crystalX,crystalY,3,'#aaddff',100,false,2);
            }
            
            spawnParticles(e.x,e.y,6,'#aaddff',120,false,4);
            spawnFloatText(e.x,e.y-30,'🌨️ CONGELADO!','#aaddff',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create snow effect
      for(let i=0;i<20;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*blizzardRadius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#ffffff',60,false,2);
      }
      
      spawnFloatText(player.x,player.y-60,'🌨️ VENTISCA!','#aaddff',24);
      spawnParticles(player.x,player.y,35,'#aaddff',220,true,12);
      shakeAmt=6;
    }
    else if(h==='void'){
      // Ruptura Dimensional - Spatial rupture that damages and distorts enemies
      const ruptureRadius=200;
      const ruptureCount=8;
      
      // Create dimensional ruptures
      for(let i=0;i<ruptureCount;i++){
        const angle=(i/ruptureCount)*Math.PI*2;
        const ruptureX=player.x+Math.cos(angle)*ruptureRadius;
        const ruptureY=player.y+Math.sin(angle)*ruptureRadius;
        
        // Create spatial distortion
        const distortion={
          x:ruptureX,
          y:ruptureY,
          radius:30,
          timer:3,
          alive:true,
          pullStrength:150,
          damage:player.bulletDmg*0.3
        };
        
        // Add to existing distortions array or create new one
        if(!player.distortions) player.distortions=[];
        player.distortions.push(distortion);
        
        // Visual rupture effect
        for(let j=0;j<10;j++){
          const particleAngle=(j/10)*Math.PI*2;
          const particleRadius=20;
          const x=ruptureX+Math.cos(particleAngle)*particleRadius;
          const y=ruptureY+Math.sin(particleAngle)*particleRadius;
          spawnParticles(x,y,3,'#4a4a8e',100,false,2);
        }
        
        // Create energy particles
        spawnParticles(ruptureX,ruptureY,8,'#6a6aae',120,false,3);
      }
      
      // Apply immediate damage to nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<ruptureRadius){
            // Enhanced spatial damage with distance scaling
            const damageMultiplier=1.5-(dist/ruptureRadius)*0.5; // 1.5x to 1x damage based on distance
            e.hp-=player.bulletDmg*0.4*damageMultiplier;
            e.hitFlash=0.6;
            e.distorted=true;
            e.distortedTimer=3;
            e.slowed=true;
            e.slowedTimer=2;
            e.speed*=0.7;
            
            // Apply dimensional instability - random teleportation
            if(Math.random()<0.3){
              const teleportAngle=Math.random()*Math.PI*2;
              const teleportDistance=30+Math.random()*20;
              e.x+=Math.cos(teleportAngle)*teleportDistance;
              e.y+=Math.sin(teleportAngle)*teleportDistance;
              
              // Create teleport distortion effect
              for(let j=0;j<6;j++){
                const angle=(j/6)*Math.PI*2;
                const x=e.x+Math.cos(angle)*10;
                const y=e.y+Math.sin(angle)*10;
                spawnParticles(x,y,2,'#8a8aae',80,false,2);
              }
              spawnFloatText(e.x,e.y-30,'🌀 INESTABLE!','#8a8aae',12);
            }
            
            // Create enhanced void effect
            for(let j=0;j<12;j++){
              const angle=(j/12)*Math.PI*2;
              const voidX=e.x+Math.cos(angle)*15;
              const voidY=e.y+Math.sin(angle)*15;
              spawnParticles(voidX,voidY,4,'#2a2a4e',100,false,2);
            }
            
            // Create dimensional crack effect
            for(let j=0;j<4;j++){
              const crackAngle=(j/4)*Math.PI*2+Math.random()*0.5;
              const crackLength=20+Math.random()*10;
              const crackX=e.x+Math.cos(crackAngle)*crackLength;
              const crackY=e.y+Math.sin(crackAngle)*crackLength;
              
              // Draw crack line
              for(let k=0;k<5;k++){
                const t=k/5;
                const x=e.x+(crackX-e.x)*t;
                const y=e.y+(crackY-e.y)*t;
                spawnParticles(x,y,2,'#1a1a3e',120,false,2);
              }
            }
            
            spawnParticles(e.x,e.y,8,'#4a4a8e',130,false,4);
            spawnFloatText(e.x,e.y-30,'🌀 RUPTURA!','#4a4a8e',16);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              
              // Enhanced death effect - dimensional collapse
              for(let j=0;j<16;j++){
                const angle=(j/16)*Math.PI*2;
                const x=e.x+Math.cos(angle)*25;
                const y=e.y+Math.sin(angle)*25;
                spawnParticles(x,y,6,'#2a2a4e',180,false,3);
              }
              
              // Create mini black hole at death location
              for(let j=0;j<8;j++){
                const angle=(j/8)*Math.PI*2;
                const radius=15;
                const x=e.x+Math.cos(angle)*radius;
                const y=e.y+Math.sin(angle)*radius;
                spawnParticles(x,y,3,'#000000',150,false,2);
              }
              
              spawnParticles(e.x,e.y,25,e.def.color,200,true,6);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',22);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create dimensional field
      for(let i=0;i<15;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*ruptureRadius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#6a6aae',80,false,2);
      }
      
      spawnFloatText(player.x,player.y-60,'🌀 RUPTURA DIMENSIONAL!','#4a4a8e',22);
      spawnParticles(player.x,player.y,30,'#4a4a8e',180,false,10);
      shakeAmt=5;
    }
    else if(h==='sonic'){
      // Eco Sónico Amplificado - Enhanced sound wave with multiple echoes
      const waveRadius=200;
      const echoCount=3;
      
      // Create sonic field that lasts for echoes
      player.sonicField={
        x:player.x,
        y:player.y,
        radius:waveRadius,
        timer:2,
        alive:true,
        damage:player.bulletDmg*0.6,
        echoCount:echoCount,
        currentEcho:0,
        echoInterval:0.5,
        nextEchoTime:0.5
      };
      
      // Apply immediate damage to enemies in radius
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<waveRadius){
            // Enhanced sound wave damage
            e.hp-=player.bulletDmg*0.6;
            e.hitFlash=0.4;
            
            // Apply powerful sound disruption
            e.vibrated=true;
            e.vibratedTimer=2;
            e.speed*=0.6;
            e.shootRate*=1.8;
            e.disoriented=true;
            e.disorientedTimer=1.5;
            
            // Apply sound corruption
            if(!e.soundCorrupted){
              e.soundCorrupted=true;
              e.soundCorruptedTimer=3;
              e.damageTakenMultiplier=1.3;
            }
            
            // Create enhanced sound effect
            for(let j=0;j<8;j++){
              const angle=(j/8)*Math.PI*2;
              const x=e.x+Math.cos(angle)*15;
              const y=e.y+Math.sin(angle)*15;
              spawnParticles(x,y,3,'#00ffcc',100,false,2);
            }
            
            spawnParticles(e.x,e.y,6,'#00ffaa',120,false,3);
            spawnFloatText(e.x,e.y-30,'🔊 SONIDO POTENTE!','#00ffcc',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              
              // Enhanced death effect
              for(let j=0;j<20;j++){
                const angle=(j/20)*Math.PI*2;
                const radius=30*(j/20);
                const x=e.x+Math.cos(angle)*radius;
                const y=e.y+Math.sin(angle)*radius;
                spawnParticles(x,y,4,'#00ffcc',140,false,2);
              }
              
              spawnParticles(e.x,e.y,25,e.def.color,180,true,8);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',22);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create enhanced sound wave visual
      for(let i=0;i<24;i++){
        const angle=(i/24)*Math.PI*2;
        const radius=waveRadius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,4,'#00ffcc',110,false,2);
      }
      
      // Create inner sound rings
      for(let ring=0;ring<3;ring++){
        const ringRadius=50+ring*40;
        for(let i=0;i<16;i++){
          const angle=(i/16)*Math.PI*2;
          const x=player.x+Math.cos(angle)*ringRadius;
          const y=player.y+Math.sin(angle)*ringRadius;
          spawnParticles(x,y,2,'#00ffaa',90,false,2);
        }
      }
      
      spawnFloatText(player.x,player.y-60,'🔊 ECO SÓNICO AMPLIFICADO!','#00ffcc',24);
      spawnParticles(player.x,player.y,25,'#00ffcc',150,false,8);
      shakeAmt=4;
    }
    else if(h==='techno'){
      // Sátase Láser - Orbital laser strike (Q ability)
      const wx=mouse.x+cam.x,wy=mouse.y+cam.y;
      
      // Create laser warning
      for(let i=0;i<12;i++){
        const warningAngle=(i/12)*Math.PI*2;
        const warningRadius=30;
        const x=wx+Math.cos(warningAngle)*warningRadius;
        const y=wy+Math.sin(warningAngle)*warningRadius;
        spawnParticles(x,y,3,'#ffff00',60,false,2);
      }
      
      // Fire laser after warning
      setTimeout(()=>{
        // Create laser beam from sky
        const laserStartY=wy-300;
        
        // Laser beam visual
        for(let j=0;j<20;j++){
          const t=j/20;
          const x=wx;
          const y=laserStartY+(wy-laserStartY)*t;
          spawnParticles(x,y,4,'#ff0000',100,false,3);
        }
        
        // Create laser explosion
        for(let j=0;j<16;j++){
          const explosionAngle=(j/16)*Math.PI*2;
          const explosionRadius=40;
          const x=wx+Math.cos(explosionAngle)*explosionRadius;
          const y=wy+Math.sin(explosionAngle)*explosionRadius;
          spawnParticles(x,y,5,'#ff6600',120,false,3);
        }
        
        // Damage enemies in laser area
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-wx,e.y-wy);
            if(dist<50){
              // Massive laser damage
              e.hp-=player.bulletDmg*2;
              e.hitFlash=0.8;
              e.burning=true;
              e.burningTimer=2;
              e.burningDamage=player.bulletDmg*0.2;
              
              // Create laser burn effect
              for(let k=0;k<10;k++){
                const burnAngle=(k/10)*Math.PI*2;
                const burnX=e.x+Math.cos(burnAngle)*18;
                const burnY=e.y+Math.sin(burnAngle)*18;
                spawnParticles(burnX,burnY,4,'#ff4400',130,false,3);
              }
              
              spawnParticles(e.x,e.y,10,'#ff0000',150,false,5);
              spawnFloatText(e.x,e.y-30,'🛰️ LÁSER!','#ff0000',18);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Screen shake
        shakeAmt=8;
      },500);
      
      spawnFloatText(player.x,player.y-60,'🛰️ SÁTASE LÁSER!','#00ffff',22);
      spawnParticles(player.x,player.y,25,'#00ffff',180,false,8);
    }
    else if(h==='blaze'){
      // Bola Fuego - Fire ball that explodes on impact
      const wx=mouse.x+cam.x,wy=mouse.y+cam.y;
      const dx=wx-player.x,dy=wy-player.y;
      const angle=Math.atan2(dy,dx);
      
      // Create fire ball
      const fireBall={
        x:player.x,
        y:player.y,
        vx:Math.cos(angle)*400,
        vy:Math.sin(angle)*400,
        owner:'player',
        damage:player.bulletDmg*1.5,
        color:'#ff8800',
        size:10,
        hitEnemies:new Set(),
        age:0,
        maxAge:2,
        piercing:false,
        isFireBall:true,
        trail:[],
        explosionRadius:80
      };
      bullets.push(fireBall);
      
      // Visual fire trail
      for(let i=0;i<12;i++){
        const t=i/12;
        const x=player.x+(wx-player.x)*t;
        const y=player.y+(wy-player.y)*t;
        spawnParticles(x,y,4,'#ff8800',100,false,3);
      }
      
      spawnFloatText(player.x,player.y-60,'🔥 BOLA DE FUEGO!','#ff8800',22);
      spawnParticles(player.x,player.y,25,'#ff8800',180,false,8);
    }
    else if(h==='ranger'){
      // Tiro Certero - Piercing shot that goes through enemies
      const wx=mouse.x+cam.x,wy=mouse.y+cam.y;
      const dx=wx-player.x,dy=wy-player.y;
      const dist=Math.hypot(dx,dy);
      const angle=Math.atan2(dy,dx);
      
      // Create piercing arrow
      const arrow={
        x:player.x,
        y:player.y,
        vx:Math.cos(angle)*600,
        vy:Math.sin(angle)*600,
        owner:'player',
        damage:player.bulletDmg*2,
        color:'#00ccff',
        size:8,
        hitEnemies:new Set(),
        age:0,
        maxAge:2,
        piercing:true,
        isArrow:true,
        trail:[]
      };
      bullets.push(arrow);
      
      // Visual arrow trail
      for(let i=0;i<15;i++){
        const t=i/15;
        const x=player.x+(wx-player.x)*t;
        const y=player.y+(wy-player.y)*t;
        spawnParticles(x,y,3,'#00ccff',100,false,2);
      }
      
      spawnFloatText(player.x,player.y-60,'🎯 TIRO CERTERO!','#00ccff',22);
      spawnParticles(player.x,player.y,20,'#00ccff',150,false,6);
    }
    else if(h==='shadow'){
      // Manto de Oscuridad - Invisibility and regeneration
      player.invisible=true;player.invisibleTimer=4;
      player.shadowRegen=true;player.shadowRegenTimer=4;
      player.shadowRegenRate=150; // 150 HP per second
      
      // Create darkness aura effect
      for(let i=0;i<12;i++){
        const angle=(i/12)*Math.PI*2;
        const x=player.x+Math.cos(angle)*40;
        const y=player.y+Math.sin(angle)*40;
        spawnParticles(x,y,6,'#1a1a2e',120,false,3);
      }
      
      spawnFloatText(player.x,player.y-60,'🌑 MANTO DE OSCURIDAD!','#1a1a2e',22);
      spawnParticles(player.x,player.y,25,'#2a2a4e',160,false,8);
    }
    else if(h==='thunder'){
      // Tormenta Eléctrica - Chain lightning storm
      const stormRadius=300;
      const boltCount=8;
      let chainCount=0;
      
      // Create initial lightning target
      let nearestEnemy=null;
      let nearestDist=Infinity;
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<nearestDist&&dist<stormRadius){
            nearestDist=dist;
            nearestEnemy=e;
          }
        }
      });
      
      if(nearestEnemy){
        // Create chain lightning
        let currentTarget=nearestEnemy;
        let chainTargets=[currentTarget];
        
        // Find chain targets
        for(let i=0;i<3;i++){ // Max 3 chains
          let nextTarget=null;
          let nextDist=Infinity;
          
          enemies.forEach(e=>{
            if(e.alive&&!e.isAlly&&!chainTargets.includes(e)){
              const dist=Math.hypot(e.x-currentTarget.x,e.y-currentTarget.y);
              if(dist<nextDist&&dist<200){ // Chain range 200
                nextDist=dist;
                nextTarget=e;
              }
            }
          });
          
          if(nextTarget){
            chainTargets.push(nextTarget);
            currentTarget=nextTarget;
            chainCount++;
          }else{
            break;
          }
        }
        
        // Create lightning bolts between targets
        let prevX=player.x,prevY=player.y;
        chainTargets.forEach(target=>{
          // Lightning bolt effect
          for(let i=0;i<8;i++){
            const t=i/8;
            const x=prevX+(target.x-prevX)*t;
            const y=prevY+(target.y-prevY)*t;
            spawnParticles(x,y,4,'#00aaff',100,false,2);
          }
          
          // Apply damage
          const damage=player.bulletDmg*(1-chainCount*0.1); // Decreasing damage per chain
          target.hp-=damage;
          target.hitFlash=0.5;
          target.stunned=true;
          target.stunnedTimer=1;
          
          spawnParticles(target.x,target.y,8,'#00aaff',120,false,4);
          spawnFloatText(target.x,target.y-30,'⚡ '+Math.floor(damage),'#00aaff',14);
          
          if(target.hp<=0){
            target.alive=false;
            target.deathAnim=1;
            score+=target.score;
            document.getElementById('scoreDisplay').textContent=score;
            spawnParticles(target.x,target.y,20,target.def.color,160,true,5);
            spawnFloatText(target.x,target.y-50,'+'+target.score,'#FFD700',20);
            updateEnemyCount();
          }
          
          prevX=target.x;
          prevY=target.y;
        });
        
        spawnFloatText(player.x,player.y-60,'⛈️ TORMENTA ELÉCTRICA!','#00aaff',24);
        spawnParticles(player.x,player.y,30,'#00aaff',200,true,10);
        shakeAmt=8;
      }else{
        // No targets, create random lightning bolts
        for(let i=0;i<boltCount;i++){
          const angle=(i/boltCount)*Math.PI*2;
          const endX=player.x+Math.cos(angle)*stormRadius;
          const endY=player.y+Math.sin(angle)*stormRadius;
          
          for(let j=0;j<8;j++){
            const t=j/8;
            const x=player.x+(endX-player.x)*t;
            const y=player.y+(endY-player.y)*t;
            spawnParticles(x,y,3,'#00aaff',80,false,2);
          }
        }
        
        spawnFloatText(player.x,player.y-60,'⛈️ TORMENTA ELÉCTRICA!','#00aaff',24);
        spawnParticles(player.x,player.y,25,'#00aaff',180,false,8);
      }
    }
    else if(h==='nature'){
      // Bosque Encantado - Create enchanted forest with vines
      const forestRadius=280;
      const vineCount=8;
      
      // Create enchanted forest area
      player.enchantedForest={
        x:player.x,
        y:player.y,
        radius:forestRadius,
        timer:6,
        damage:player.bulletDmg*0.2,
        slowStrength:0.6,
        alive:true
      };
      
      // Create vine walls in circle
      for(let i=0;i<vineCount;i++){
        const angle=(i/vineCount)*Math.PI*2;
        const vineX=player.x+Math.cos(angle)*forestRadius;
        const vineY=player.y+Math.sin(angle)*forestRadius;
        const{tx:ttx,ty:tty}=worldToTile(vineX,vineY);
        
        if(ttx>=0&&tty>=0&&ttx<mapW&&tty<mapH){
          // Create vine wall segments
          for(let j=-2;j<=2;j++){
            const vineAngle=angle+Math.PI/2;
            const segX=ttx+Math.floor(Math.cos(vineAngle)*j);
            const segY=tty+Math.floor(Math.sin(vineAngle)*j);
            
            if(segX>=0&&segY>=0&&segX<mapW&&segY<mapH&&tileMap[segY][segX]===0){
              tileMap[segY][segX]=33; // Vine tile
              destructibles.push({
                x:segX*TILE+TILE/2,
                y:segY*TILE+TILE/2,
                type:'vine_wall',
                hp:80,
                maxHp:80,
                alive:true,
                anim:0,
                shakeX:0
              });
            }
          }
        }
      }
      
      // Apply immediate effects to enemies in forest
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<forestRadius){
            // Apply damage
            e.hp-=player.bulletDmg*0.5;
            e.hitFlash=0.5;
            
            // Apply slow
            e.speed*=0.6;
            e.slowed=true;
            e.slowedTimer=4;
            
            // Apply poison
            e.poisoned=true;
            e.poisonTimer=3;
            e.poisonDamage=player.bulletDmg*0.1;
            
            spawnParticles(e.x,e.y,6,'#44aa44',100,false,3);
            spawnFloatText(e.x,e.y-30,'🌿 BOSQUE','#44aa44',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Visual forest effect
      for(let i=0;i<30;i++){
        const angle=(i/30)*Math.PI*2;
        const x=player.x+Math.cos(angle)*forestRadius;
        const y=player.y+Math.sin(angle)*forestRadius;
        spawnParticles(x,y,8,'#44aa44',120,false,4);
      }
      
      // Create trees
      for(let i=0;i<6;i++){
        const angle=(i/6)*Math.PI*2;
        const treeX=player.x+Math.cos(angle)*forestRadius*0.7;
        const treeY=player.y+Math.sin(angle)*forestRadius*0.7;
        const{tx:ttx,ty:tty}=worldToTile(treeX,treeY);
        
        if(ttx>=0&&tty>=0&&ttx<mapW&&tty<mapH&&tileMap[tty][ttx]===0){
          destructibles.push({
            x:ttx*TILE+TILE/2,
            y:tty*TILE+TILE/2,
            type:'tree',
            hp:120,
            maxHp:120,
            alive:true,
            anim:0,
            shakeX:0
          });
          tileMap[tty][ttx]=34; // Tree tile
        }
      }
      
      spawnFloatText(player.x,player.y-60,'🌳 BOSQUE ENCANTADO!','#44aa44',24);
      spawnParticles(player.x,player.y,40,'#44aa44',220,true,12);
      shakeAmt=6;
    }
    else if(h==='phoenix'){player.canRevive=true;spawnFloatText(player.x,player.y-60,'¡RENACER!','#ff4400',22);spawnParticles(player.x,player.y,20,'#ff4400',150,false,6);}
    else if(h==='void_walker'){if(player.portal1&&!player.portal2){player.portal2={x:player.x,y:player.y};spawnFloatText(player.x,player.y-60,'¡PORTAL 2!','#4a4a8e',20);spawnParticles(player.x,player.y,20,'#4a4a8e',150,false,6);}else if(player.portal1&&player.portal2){player.x=player.portal2.x;player.y=player.portal2.y;spawnParticles(player.x,player.y,30,'#4a4a8e',200,true,8);spawnFloatText(player.x,player.y-60,'¡TELEPORT!','#4a4a8e',22);player.portal1=null;player.portal2=null;}else{spawnFloatText(player.x,player.y-60,'¡Crea portal con E!','#ff4444',18);}}
    else if(h==='demolition'){const wx=mouse.x+cam.x,wy=mouse.y+cam.y;player.remoteCharges=player.remoteCharges||[];if(player.remoteCharges.length<3){player.remoteCharges.push({x:wx,y:wy,alive:true});spawnParticles(wx,wy,15,'#ff8800',120,false,5);spawnFloatText(wx,wy-60,'💣 CARGA','#ff8800',18);}else{spawnFloatText(player.x,player.y-60,'¡MÁXIMO!','#ff4444',18);}}
    else if(h==='illusionist'){
      // Espejismo Múltiple - Create 3 attacking clones
      player.clones=player.clones||[];
      if(player.clones.length<3){
        // Create 3 clones in different positions
        for(let i=0;i<3;i++){
          const angleOffset=(i-1)*Math.PI/6; // Spread clones in arc
          const distance=80;
          const cloneX=player.x+Math.cos(player.angle+angleOffset)*distance;
          const cloneY=player.y+Math.sin(player.angle+angleOffset)*distance;
          
          const clone={
            x:cloneX,
            y:cloneY,
            angle:player.angle,
            alive:true,
            timer:10, // Longer duration
            isIllusion:true,
            canShoot:true, // New property: clones can shoot
            shootCooldown:0,
            damage:player.bulletDmg*0.7, // Clones deal 70% damage
            range:400 // Clone shooting range
          };
          player.clones.push(clone);
          
          // Visual effect for each clone
          spawnParticles(cloneX,cloneY,15,'#cc88ff',120,false,5);
        }
        
        spawnFloatText(player.x,player.y-60,'👥 ESPEJISMO MÚLTIPLE!','#cc88ff',22);
        spawnParticles(player.x,player.y,30,'#cc88ff',180,false,8);
      }else{
        spawnFloatText(player.x,player.y-60,'¡MÁXIMO CLONES!','#ff4444',18);
      }
    }
    else if(h==='shotgunner'){const wx=mouse.x+cam.x,wy=mouse.y+cam.y;const{tx:ttx,ty:tty}=worldToTile(wx,wy);if(!isSolid(ttx,tty)){blockWalls.push({x:ttx,y:tty,timer:5,alive:true});spawnParticles(wx,wy,20,'#000000',150,false,6);spawnFloatText(wx,wy-60,'MURO NEGRO','#000000',22);}else{spawnFloatText(player.x,player.y-60,'¡NO PUEDO!','#ff4444',18);}}
    else if(h==='hypnotist'){const wx=mouse.x+cam.x,wy=mouse.y+cam.y;const dx=wx-player.x,dy=wy-player.y,d=Math.hypot(dx,dy);if(d<400){let hypnotizedCount=0;enemies.forEach(e=>{if(e.alive&&!e.isAlly&&Math.hypot(e.x-player.x,e.y-player.y)<400&&hypnotizedCount<5){e.isHypnotized=true;e.hypnotizedOwner=player;e.hypnotizedTimer=8;e.isAlly=true;spawnParticles(e.x,e.y,20,'#aa44ff',180,false,7);spawnFloatText(e.x,e.y-60,'🌀 HYPNOTIZED!','#aa44ff',20);hypnotizedCount++;}});spawnParticles(player.x,player.y,25,'#aa44ff',150,false,6);spawnFloatText(player.x,player.y-60,'👁️ HIPNOSIS!','#aa44ff',22);}else{spawnFloatText(player.x,player.y-60,'¡MUY LEJOS!','#ff4444',18);}}
    else if(h==='gambler'){enemies.forEach(e=>{if(e.alive&&!e.isAlly){e.speed*=0.3;spawnFloatText(e.x,e.y-30,'⏱ RALENTIZADO','#ffcc00',14);}});spawnParticles(player.x,player.y,25,'#ffcc00',150,false,6);spawnFloatText(player.x,player.y-60,'⏱ RALENTIZAR!','#ffcc00',22);}
    else if(h==='bomber'){const wx=mouse.x+cam.x,wy=mouse.y+cam.y;bombs.push({x:wx,y:wy,radius:120,damage:player.bulletDmg*2.5,color:player.bulletColor,isMine:false,timer:0.15,alive:true,owner:'player'});spawnParticles(wx,wy,20,player.bulletColor,150,false,7);spawnFloatText(wx,wy-60,'💣 BOMBA!',player.bulletColor,22);}
    else if(h==='legend'){player.invincible=4;spawnFloatText(player.x,player.y-60,'¡CORONA!','#ffd700',24);spawnParticles(player.x,player.y,25,'#ffd700',200,true,8);}
    else{player.shieldActive=true;player.shieldTimer=h==='tank'?6:3;player.invincible=player.shieldTimer;spawnFloatText(player.x,player.y-60,'¡ESCUDO!','#4488ff',22);spawnParticles(player.x,player.y,12,'#4488ff',80,false,5);}
    if(gameMode==='multi'&&ws&&ws.readyState===1) ws.send(JSON.stringify({type:'special',specialType:'shield',data:{duration:player.shieldTimer||3}}));
    sp.cd=sp.maxCd;
  }
  else if(type==='bomb'){
    const h=player.heroId,wx=mouse.x+cam.x,wy=mouse.y+cam.y;
    let bombData=null;
    if(h==='mage'){for(let a=0;a<12;a++){const ang=(a/12)*Math.PI*2;fireBullet(player.x,player.y,Math.cos(ang)*300,Math.sin(ang)*300,'player',player.bulletDmg*0.8,'#cc44ff',11);}spawnParticles(player.x,player.y,30,'#cc44ff',200,false,7);spawnFloatText(player.x,player.y-70,'¡NOVA!','#cc44ff',24);}
    else if(h==='sniper_hero'){bombs.push({x:player.x,y:player.y,isMine:true,timer:5,armed:1.5,alive:true,owner:'player',radius:80,damage:player.bulletDmg*2,color:'#88ff44'});spawnFloatText(player.x,player.y-60,'¡MINA!','#88ff44',20);}
    else if(h==='medic'){bombData={x:wx,y:wy,radius:120,damage:player.bulletDmg*3,color:'#00ff88'};bombs.push({...bombData,isMine:false,timer:0.15,alive:true,owner:'player',poison:true});spawnFloatText(wx,wy-60,'¡BOMBA BIO!','#00ff88',20);}
    else if(h==='tank'){const dx=wx-player.x,dy=wy-player.y,d=Math.hypot(dx,dy);fireBullet(player.x,player.y,(dx/d)*220,(dy/d)*220,'player',player.bulletDmg*2,'#ffaa00',18,true);spawnFloatText(player.x,player.y-60,'¡BARRIL!','#ffaa00',20);}
    else if(h==='pyro'){damagePlayer(900);bombData={x:player.x,y:player.y,radius:180,damage:1900,color:'#ff4400'};bombs.push({...bombData,isMine:false,timer:0.15,alive:true,owner:'player'});spawnParticles(player.x,player.y,40,'#ff4400',300,true,12);spawnFloatText(player.x,player.y-80,'¡MEGA BOMBA!','#ff4400',28);shakeAmt=20;}
    else if(h==='storm'){
      // Tormenta Eléctrica - Electric storm area effect
      const stormRadius=250;
      const boltCount=12;
      
      // Create lightning bolts in circle around player
      for(let i=0;i<boltCount;i++){
        const angle=(i/boltCount)*Math.PI*2;
        const startX=player.x+Math.cos(angle)*50;
        const startY=player.y+Math.sin(angle)*50;
        const endX=player.x+Math.cos(angle)*stormRadius;
        const endY=player.y+Math.sin(angle)*stormRadius;
        
        // Visual lightning effect
        for(let j=0;j<8;j++){
          const t=j/8;
          const x=startX+(endX-startX)*t;
          const y=startY+(endY-startY)*t;
          spawnParticles(x,y,4,'#00aaff',100,false,3);
        }
        
        // Check if lightning hits enemies
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            // Simple line-circle intersection check
            const distToLine=Math.abs((endY-startY)*e.x-(endX-startX)*e.y+endX*startY-endY*startX)/Math.hypot(endY-startY,endX-startX);
            if(distToLine<30){
              const dist=Math.hypot(e.x-player.x,e.y-player.y);
              if(dist<stormRadius){
                e.hp-=player.bulletDmg*0.8; // Increased from 0.4 to 0.8
                e.hitFlash=0.5;
                spawnParticles(e.x,e.y,6,'#00aaff',120,false,3);
                spawnFloatText(e.x,e.y-30,'⚡ '+Math.floor(player.bulletDmg*0.8),'#00aaff',12);
                
                if(e.hp<=0){
                  e.alive=false;
                  e.deathAnim=1;
                  score+=e.score;
                  spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                  spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                  updateEnemyCount();
                }
              }
            }
          }
        });
      }
      
      spawnFloatText(player.x,player.y-70,'🌩️ TORMENTA ELÉCTRICA!','#00aaff',24);
      spawnParticles(player.x,player.y,30,'#00aaff',200,false,10);
      shakeAmt=8;
    }
    else if(h==='cyber'){const allyDef={name:'Drone Ally',hp:400,speed:180,damage:120,radius:14,shootRate:1.2,color:'#00ffff',helmetColor:'#0088ff',shirtColor:'#0066cc',range:280,score:0,size:0.7,bulletColor:'#00aaff',bulletSize:6,pattern:'chase'};const angleOffset=(Math.random()-0.5)*Math.PI;enemies.push({x:player.x+Math.cos(player.angle+angleOffset)*60,y:player.y+Math.sin(player.angle+angleOffset)*60,vx:0,vy:0,hp:allyDef.hp,maxHp:allyDef.hp,radius:allyDef.radius,speed:allyDef.speed,damage:allyDef.damage,range:allyDef.range,shootRate:allyDef.shootRate,shootCooldown:Math.random(),def:allyDef,alive:true,angle:player.angle,walkCycle:0,hitFlash:0,deathAnim:0,stateTimer:0,state:'chase',patrolAngle:Math.random()*Math.PI*2,strafeDir:1,strafeTimer:2,score:0,bossPhase:1,phased:false,phaseTimer:2,frozen:false,frozenTimer:0,shieldActive:false,shieldTimer:0,isAlly:true,allyOwner:player});spawnParticles(player.x,player.y,20,'#00ffff',180,false,7);spawnFloatText(player.x,player.y-60,'🤖 DRONE ALIADO','#00ffff',22);}
    else if(h==='spectre'){
      // Vórtice del Vacío - Create a vortex bomb that pulls and damages enemies
      bombData={x:wx,y:wy,radius:200,damage:player.bulletDmg*3,color:'#aa44ff'};
      const vortexBomb={
        ...bombData,
        isMine:false,
        timer:3,
        alive:true,
        owner:'player',
        vortex:true,
        pullStrength:800,
        maxRadius:200,
        stages:3,
        currentStage:0,
        stageTimer:0
      };
      bombs.push(vortexBomb);
      spawnParticles(wx,wy,30,'#aa44ff',200,false,10);
      spawnFloatText(wx,wy-70,'🌌 VÓRTICE DEL VACÍO!','#aa44ff',24);
      shakeAmt=10;
    }
    else if(h==='titan'){const dx=wx-player.x,dy=wy-player.y,d=Math.hypot(dx,dy);if(d<150){let dmg=player.bulletDmg*4;enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-player.x,e.y-player.y)<150){if(e.hp/e.maxHp>0.7)dmg*=1.5;e.hp-=dmg;e.hitFlash=0.8;spawnParticles(e.x,e.y,15,'#ffcc00',150,false,5);spawnFloatText(e.x,e.y-40,'-'+Math.floor(dmg),'#ffcc00',18);if(e.hp<=0){e.alive=false;e.deathAnim=1;score+=e.score;document.getElementById('scoreDisplay').textContent=score;spawnParticles(e.x,e.y,20,e.def.color,160,true,5);spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);updateEnemyCount();}}});spawnParticles(player.x,player.y,30,'#ffcc00',250,true,10);spawnFloatText(player.x,player.y-60,'💥 GOLPE TITAN!','#ffcc00',26);shakeAmt=12;}else{spawnFloatText(player.x,player.y-60,'¡MUY LEJOS!','#ff4444',18);}}
    else if(h==='vampire'){bombData={x:wx,y:wy,radius:110,damage:player.bulletDmg*2,color:'#ff00ff'};bombs.push({...bombData,isMine:false,timer:0.15,alive:true,owner:'player',poison:true,poisonDuration:5});spawnParticles(wx,wy,22,'#ff00ff',170,false,6);spawnFloatText(wx,wy-60,'¡MURO SANGRE!','#ff00ff',20);}
    else if(h==='chronos'){if(player.rewindUses>0){player.rewindUses--;player.rewindPos={x:player.x,y:player.y,hp:player.hp,timestamp:Date.now()};player.rewindHistory.push({x:player.x,y:player.y,hp:player.hp,timestamp:Date.now()});if(player.rewindHistory.length>50)player.rewindHistory.shift();spawnFloatText(player.x,player.y-60,'¡REWIND! ('+player.rewindUses+')','#800080',22);spawnParticles(player.x,player.y,20,'#800080',150,false,6);}else{spawnFloatText(player.x,player.y-60,'¡SIN CARGAS!','#ff4444',18);}}
    else if(h==='crystal'){
      // Ruptura Prismática - Crystal fragmentation explosion
      const shardCount=24;
      const explosionRadius=180;
      
      // Create crystal shards in all directions
      for(let i=0;i<shardCount;i++){
        const angle=(i/shardCount)*Math.PI*2;
        const speed=300+Math.random()*200; // Variable speed for more dynamic effect
        const shardDamage=player.bulletDmg*(0.3+Math.random()*0.4); // 30-70% damage
        
        // Create crystal shard bullet
        const shard={
          x:player.x,
          y:player.y,
          vx:Math.cos(angle)*speed,
          vy:Math.sin(angle)*speed,
          owner:'player',
          damage:shardDamage,
          color:'#00ffff',
          size:4+Math.random()*4,
          alive:true,
          isShard:true,
          trail:[],
          radius:8, // Add radius for collision detection
          hitEnemies:new Set(), // Required for bullet system
          age:0, // Required for bullet system
          piercing:false // Crystal shards are not piercing
        };
        bullets.push(shard);
        
        // Visual trail for each shard
        for(let j=0;j<5;j++){
          const trailX=player.x+Math.cos(angle)*j*10;
          const trailY=player.y+Math.sin(angle)*j*10;
          spawnParticles(trailX,trailY,2,'#00ffff',80,false,1);
        }
      }
      
      // Damage enemies in immediate radius
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<explosionRadius){
            const damageMultiplier=1-(dist/explosionRadius)*0.5;
            const damage=Math.floor(player.bulletDmg*1.5*damageMultiplier);
            e.hp-=damage;
            e.hitFlash=0.6;
            e.frozen=true;
            e.frozenTimer=1; // Brief freeze from crystal impact
            
            spawnParticles(e.x,e.y,8,'#00ffff',120,false,4);
            spawnFloatText(e.x,e.y-30,'💎 '+damage,'#00ffff',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create visual crystal burst
      for(let i=0;i<16;i++){
        const angle=(i/16)*Math.PI*2;
        const x=player.x+Math.cos(angle)*30;
        const y=player.y+Math.sin(angle)*30;
        spawnParticles(x,y,10,'#00ffff',150,false,5);
      }
      
      spawnFloatText(player.x,player.y-70,'💎 RUPTURA PRISMÁTICA!','#00ffff',26);
      spawnParticles(player.x,player.y,40,'#00ffff',220,true,12);
      shakeAmt=12;
    }
    else if(h==='shadow'){
      // Manto de Sombras - Create shadow area that damages and slows enemies
      const shadowRadius=200;
      const shadowDuration=4;
      
      // Create shadow zone
      player.shadowZone={
        x:player.x,
        y:player.y,
        radius:shadowRadius,
        timer:shadowDuration,
        damage:player.bulletDmg*0.4,
        slowStrength:0.5,
        alive:true
      };
      
      // Apply immediate effects to enemies in range
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<shadowRadius){
            // Apply damage
            e.hp-=player.bulletDmg*0.8;
            e.hitFlash=0.5;
            
            // Apply slow
            e.speed*=0.5;
            e.slowed=true;
            e.slowedTimer=shadowDuration;
            
            // Apply fear (enemy runs away from shadow center)
            e.fearful=true;
            e.fearfulTimer=2;
            
            spawnParticles(e.x,e.y,6,'#1a1a2e',100,false,3);
            spawnFloatText(e.x,e.y-30,'🌑 MIEDO','#1a1a2e',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Visual shadow zone effect
      for(let i=0;i<20;i++){
        const angle=(i/20)*Math.PI*2;
        const x=player.x+Math.cos(angle)*shadowRadius;
        const y=player.y+Math.sin(angle)*shadowRadius;
        spawnParticles(x,y,8,'#1a1a2e',120,false,4);
      }
      
      spawnFloatText(player.x,player.y-60,'🌑 MANTO DE SOMBRAS!','#1a1a2e',22);
      spawnParticles(player.x,player.y,30,'#1a1a2e',200,true,10);
      shakeAmt=4;
    }
    else if(h==='thunder'){
      // Campo Electromagnético - Electromagnetic field that pulls and damages enemies
      const fieldRadius=250;
      const fieldDuration=3;
      const pullStrength=300;
      
      // Create electromagnetic field
      player.emfField={
        x:player.x,
        y:player.y,
        radius:fieldRadius,
        timer:fieldDuration,
        pullStrength:pullStrength,
        damage:player.bulletDmg*0.3,
        alive:true
      };
      
      // Apply immediate effects to enemies in range
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<fieldRadius){
            // Apply damage
            e.hp-=player.bulletDmg*0.6;
            e.hitFlash=0.5;
            
            // Apply electromagnetic pull
            const angle=Math.atan2(player.y-e.y,player.x-e.x);
            const pullForce=pullStrength*(1-dist/fieldRadius);
            e.vx+=Math.cos(angle)*pullForce;
            e.vy+=Math.sin(angle)*pullForce;
            
            // Apply electromagnetic disruption (stun)
            e.stunned=true;
            e.stunnedTimer=1.5;
            
            spawnParticles(e.x,e.y,6,'#00aaff',100,false,3);
            spawnFloatText(e.x,e.y-30,'🌀 ELECTROMAGNETISMO','#00aaff',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Visual electromagnetic field effect
      for(let i=0;i<24;i++){
        const angle=(i/24)*Math.PI*2;
        const x=player.x+Math.cos(angle)*fieldRadius;
        const y=player.y+Math.sin(angle)*fieldRadius;
        spawnParticles(x,y,8,'#00aaff',120,false,4);
      }
      
      // Create rotating electromagnetic rings
      for(let ring=0;ring<3;ring++){
        const ringRadius=fieldRadius*(0.3+ring*0.3);
        for(let i=0;i<12;i++){
          const angle=(i/12)*Math.PI*2+ring*Math.PI/6;
          const x=player.x+Math.cos(angle)*ringRadius;
          const y=player.y+Math.sin(angle)*ringRadius;
          spawnParticles(x,y,4,'#00ccff',100,false,2);
        }
      }
      
      spawnFloatText(player.x,player.y-60,'🌀 CAMPO ELECTROMAGNÉTICO!','#00aaff',22);
      spawnParticles(player.x,player.y,35,'#00aaff',220,true,12);
      shakeAmt=6;
    }
    else if(h==='nature'){
      // Regeneración Vital - Continuous healing with nature energy
      const healRadius=200;
      const healDuration=5;
      const healAmount=80;
      
      // Create healing area
      player.healingGrove={
        x:player.x,
        y:player.y,
        radius:healRadius,
        timer:healDuration,
        healAmount:healAmount,
        alive:true
      };
      
      // Apply immediate heal
      player.hp=Math.min(player.maxHp,player.hp+healAmount);
      spawnParticles(player.x,player.y,15,'#44aa44',120,false,5);
      spawnFloatText(player.x,player.y-60,'💚 +'+healAmount+' HP','#44aa44',20);
      
      // Apply nature energy to enemies (damage over time)
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<healRadius){
            // Apply nature damage (less effective than healing)
            e.hp-=player.bulletDmg*0.3;
            e.hitFlash=0.5;
            e.natureBleed=true;
            e.natureBleedTimer=2;
            e.natureBleedDamage=player.bulletDmg*0.1;
            
            spawnParticles(e.x,e.y,6,'#44aa44',100,false,3);
            spawnFloatText(e.x,e.y-30,'🌿 NATURALEZA','#44aa44',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Visual healing grove effect
      for(let i=0;i<24;i++){
        const angle=(i/24)*Math.PI*2;
        const x=player.x+Math.cos(angle)*healRadius;
        const y=player.y+Math.sin(angle)*healRadius;
        spawnParticles(x,y,8,'#44aa44',120,false,4);
      }
      
      // Create flowers around the grove
      for(let i=0;i<8;i++){
        const angle=(i/8)*Math.PI*2;
        const flowerX=player.x+Math.cos(angle)*healRadius*0.6;
        const flowerY=player.y+Math.sin(angle)*healRadius*0.6;
        for(let j=0;j<5;j++){
          const petalAngle=(j/5)*Math.PI*2;
          const petalX=flowerX+Math.cos(petalAngle)*8;
          const petalY=flowerY+Math.sin(petalAngle)*8;
          spawnParticles(petalX,petalY,3,'#66cc66',80,false,2);
        }
      }
      
      spawnFloatText(player.x,player.y-60,'💚 REGENERACIÓN VITAL!','#44aa44',22);
      spawnParticles(player.x,player.y,30,'#44aa44',200,true,10);
      shakeAmt=4;
    }
    else if(h==='ranger'){
      // Trampa Cazador - Hunter trap that immobilizes enemies
      const trapRadius=60;
      const trapDuration=4;
      
      // Create hunter trap
      player.hunterTrap={
        x:wx,
        y:wy,
        radius:trapRadius,
        timer:trapDuration,
        alive:true,
        triggerRadius:trapRadius,
        triggered:false
      };
      
      // Visual trap setup
      for(let i=0;i<12;i++){
        const angle=(i/12)*Math.PI*2;
        const x=wx+Math.cos(angle)*trapRadius;
        const y=wy+Math.sin(angle)*trapRadius;
        spawnParticles(x,y,3,'#8B4513',80,false,2);
      }
      
      // Create rope visual
      for(let i=0;i<8;i++){
        const angle=(i/8)*Math.PI*2;
        const ropeX=wx+Math.cos(angle)*trapRadius*0.7;
        const ropeY=wy+Math.sin(angle)*trapRadius*0.7;
        spawnParticles(ropeX,ropeY,2,'#654321',60,false,2);
      }
      
      spawnFloatText(wx,wy-60,'🪤 TRAMPA CAZADOR!','#8B4513',20);
      spawnParticles(wx,wy,20,'#8B4513',120,false,6);
    }
    else if(h==='frost'){
      // Muro Glacial - Ice wall that blocks and slows enemies
      const wallWidth=120;
      const wallHeight=20;
      const wallDuration=5;
      
      // Create ice wall
      player.iceWall={
        x:wx,
        y:wy,
        width:wallWidth,
        height:wallHeight,
        timer:wallDuration,
        alive:true,
        slowStrength:0.5
      };
      
      // Create ice wall segments
      for(let i=0;i<4;i++){
        const segmentX=wx+(i-1.5)*30;
        const segmentY=wy;
        
        // Visual ice wall
        for(let j=0;j<8;j++){
          const x=segmentX+Math.random()*30-15;
          const y=segmentY+Math.random()*wallHeight-wallHeight/2;
          spawnParticles(x,y,4,'#aaddff',80,false,2);
        }
      }
      
      // Apply immediate slow to nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-wx,e.y-wy);
          if(dist<wallWidth){
            // Apply slow effect
            e.speed*=0.5;
            e.slowed=true;
            e.slowedTimer=3;
            
            // Apply ice damage
            e.hp-=player.bulletDmg*0.2;
            e.hitFlash=0.3;
            
            // Create ice crystal effect
            for(let j=0;j<6;j++){
              const angle=(j/6)*Math.PI*2;
              const crystalX=e.x+Math.cos(angle)*12;
              const crystalY=e.y+Math.sin(angle)*12;
              spawnParticles(crystalX,crystalY,3,'#aaddff',80,false,2);
            }
            
            spawnParticles(e.x,e.y,5,'#aaddff',100,false,3);
            spawnFloatText(e.x,e.y-30,'🧊 ENFRIADO!','#aaddff',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create ice fog effect
      for(let i=0;i<15;i++){
        const x=wx+Math.random()*wallWidth-wallWidth/2;
        const y=wy+Math.random()*40-20;
        spawnParticles(x,y,2,'#ffffff',60,false,2);
      }
      
      spawnFloatText(wx,wy-60,'🧊 MURO GLACIAL!','#aaddff',22);
      spawnParticles(wx,wy,25,'#aaddff',150,false,8);
    }
    else if(h==='blaze'){
      // Rastro Ardiente - Fire trail that burns enemies
      const trailLength=200;
      const trailWidth=60;
      
      // Create fire trail
      player.fireTrail={
        x:wx,
        y:wy,
        length:trailLength,
        width:trailWidth,
        timer:4,
        alive:true,
        damagePerSecond:player.bulletDmg*0.3
      };
      
      // Apply immediate burn to nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-wx,e.y-wy);
          if(dist<trailWidth){
            // Apply burn effect
            e.burning=true;
            e.burningTimer=3;
            e.burningDamage=player.bulletDmg*0.15;
            
            // Apply fire damage
            e.hp-=player.bulletDmg*0.4;
            e.hitFlash=0.5;
            
            // Create fire effect
            for(let j=0;j<8;j++){
              const angle=(j/8)*Math.PI*2;
              const fireX=e.x+Math.cos(angle)*15;
              const fireY=e.y+Math.sin(angle)*15;
              spawnParticles(fireX,fireY,4,'#ff8800',100,false,3);
            }
            
            spawnParticles(e.x,e.y,8,'#ff8800',120,false,4);
            spawnFloatText(e.x,e.y-30,'🔥 QUEMANDO!','#ff8800',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create fire trail visual
      for(let i=0;i<20;i++){
        const t=i/20;
        const x=player.x+(wx-player.x)*t;
        const y=player.y+(wy-player.y)*t;
        for(let j=0;j<3;j++){
          const offsetX=Math.random()*trailWidth-trailWidth/2;
          const offsetY=Math.random()*20-10;
          spawnParticles(x+offsetX,y+offsetY,3,'#ff8800',80,false,2);
        }
      }
      
      spawnFloatText(wx,wy-60,'💥 RASTRO ARDIENTE!','#ff8800',22);
      spawnParticles(wx,wy,30,'#ff8800',180,false,10);
    }
    else if(h==='techno'){
      // Campo EM - Electromagnetic field that disrupts enemies
      const emRadius=200;
      const emDuration=5;
      
      // Create electromagnetic field
      player.emField={
        x:wx,
        y:wy,
        radius:emRadius,
        timer:emDuration,
        alive:true,
        disruptionStrength:0.6
      };
      
      // Apply immediate disruption to nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-wx,e.y-wy);
          if(dist<emRadius){
            // Disrupt enemy systems
            e.disrupted=true;
            e.disruptedTimer=3;
            e.speed*=0.4;
            e.shootRate*=2; // Slower shooting
            
            // Apply EMP damage
            e.hp-=player.bulletDmg*0.3;
            e.hitFlash=0.4;
            
            // Create EMP visual effect
            for(let j=0;j<8;j++){
              const angle=(j/8)*Math.PI*2;
              const empX=e.x+Math.cos(angle)*15;
              const empY=e.y+Math.sin(angle)*15;
              spawnParticles(empX,empY,3,'#00aaff',100,false,2);
            }
            
            spawnParticles(e.x,e.y,6,'#00aaff',120,false,4);
            spawnFloatText(e.x,e.y-30,'📡 EMP!','#00aaff',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create EMP field visual
      for(let i=0;i<16;i++){
        const angle=(i/16)*Math.PI*2;
        const x=wx+Math.cos(angle)*emRadius;
        const y=wy+Math.sin(angle)*emRadius;
        
        // Draw EMP waves
        for(let j=0;j<4;j++){
          const t=j/4;
          const waveX=wx+(x-wx)*t;
          const waveY=wy+(y-wy)*t;
          spawnParticles(waveX,waveY,2,'#00ccff',80,false,2);
        }
      }
      
      // Create energy particles
      for(let i=0;i<20;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*emRadius;
        const x=wx+Math.cos(angle)*radius;
        const y=wy+Math.sin(angle)*radius;
        spawnParticles(x,y,3,'#00ffff',60,false,2);
      }
      
      spawnFloatText(wx,wy-60,'📡 CAMPO EM!','#00aaff',22);
      spawnParticles(wx,wy,35,'#00aaff',180,false,10);
    }
    else if(h==='void'){
      // Vórtice Vacío - Void vortex that pulls enemies and damages them
      const vortexRadius=180;
      const vortexDuration=4;
      const pullStrength=200;
      
      // Create void vortex
      player.voidVortex={
        x:wx,
        y:wy,
        radius:vortexRadius,
        timer:vortexDuration,
        pullStrength:pullStrength,
        damage:player.bulletDmg*0.4,
        alive:true,
        rotationSpeed:2,
        particles:[]
      };
      
      // Apply immediate pull and damage to nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-wx,e.y-wy);
          if(dist<vortexRadius){
            // Enhanced pull effect with distance scaling
            const pullAngle=Math.atan2(wy-e.y,wx-e.x);
            const pullMultiplier=1.5-(dist/vortexRadius)*0.5; // Stronger pull at center
            const pullForce=pullStrength*pullMultiplier;
            e.vx+=Math.cos(pullAngle)*pullForce;
            e.vy+=Math.sin(pullAngle)*pullForce;
            
            // Apply enhanced void damage with stacking effect
            const damageMultiplier=1.2+(1-dist/vortexRadius)*0.8; // 2x at center to 1.2x at edge
            e.hp-=player.bulletDmg*0.3*damageMultiplier;
            e.hitFlash=0.6;
            e.slowed=true;
            e.slowedTimer=3;
            e.speed*=0.5;
            e.distorted=true;
            e.distortedTimer=2;
            
            // Apply vortex corruption - damage amplification
            if(!e.vortexCorrupted){
              e.vortexCorrupted=true;
              e.vortexCorruptedTimer=4;
              e.damageTakenMultiplier=1.3; // 30% more damage from all sources
            }
            
            // Apply disorientation - random direction changes
            if(Math.random()<0.4){
              const confusionAngle=Math.random()*Math.PI*2;
              const confusionForce=150;
              e.vx+=Math.cos(confusionAngle)*confusionForce;
              e.vy+=Math.sin(confusionAngle)*confusionForce;
              
              // Create confusion effect
              for(let j=0;j<4;j++){
                const angle=(j/4)*Math.PI*2;
                const x=e.x+Math.cos(angle)*12;
                const y=e.y+Math.sin(angle)*12;
                spawnParticles(x,y,2,'#8a8aae',70,false,2);
              }
              spawnFloatText(e.x,e.y-30,'🌀 DESORIENTADO!','#8a8aae',12);
            }
            
            // Create enhanced void effect with spiral
            for(let j=0;j<12;j++){
              const angle=(j/12)*Math.PI*2+gameTime*3;
              const spiralRadius=15+Math.sin(gameTime*4+j)*5;
              const voidX=e.x+Math.cos(angle)*spiralRadius;
              const voidY=e.y+Math.sin(angle)*spiralRadius;
              spawnParticles(voidX,voidY,3,'#2a2a4e',100,false,2);
            }
            
            // Create energy drain effect
            for(let j=0;j<6;j++){
              const angle=(j/6)*Math.PI*2;
              const drainX=e.x+Math.cos(angle)*20;
              const drainY=e.y+Math.sin(angle)*20;
              const targetX=wx+Math.cos(angle)*5;
              const targetY=wy+Math.sin(angle)*5;
              
              // Draw energy drain line
              for(let k=0;k<3;k++){
                const t=k/3;
                const x=drainX+(targetX-drainX)*t;
                const y=drainY+(targetY-drainY)*t;
                spawnParticles(x,y,2,'#4a4a8e',80,false,2);
              }
            }
            
            spawnParticles(e.x,e.y,8,'#4a4a8e',130,false,4);
            spawnFloatText(e.x,e.y-30,'🌌 VÓRTICE!','#4a4a8e',16);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              
              // Enhanced death effect - vortex implosion
              for(let j=0;j<20;j++){
                const angle=(j/20)*Math.PI*2;
                const spiralRadius=30*(j/20);
                const x=e.x+Math.cos(angle)*spiralRadius;
                const y=e.y+Math.sin(angle)*spiralRadius;
                spawnParticles(x,y,4,'#2a2a4e',150,false,3);
              }
              
              // Create energy burst at vortex center
              for(let j=0;j<10;j++){
                const angle=(j/10)*Math.PI*2;
                const x=wx+Math.cos(angle)*10;
                const y=wy+Math.sin(angle)*10;
                spawnParticles(x,y,5,'#6a6aae',120,false,3);
              }
              
              spawnParticles(e.x,e.y,30,e.def.color,220,true,7);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',24);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create vortex visual effect
      for(let i=0;i<20;i++){
        const angle=(i/20)*Math.PI*2;
        const radius=vortexRadius*0.8;
        const x=wx+Math.cos(angle)*radius;
        const y=wy+Math.sin(angle)*radius;
        
        // Create spiral particles
        for(let j=0;j<5;j++){
          const spiralAngle=angle+(j/5)*Math.PI*2;
          const spiralRadius=radius*(1-j/5);
          const spiralX=wx+Math.cos(spiralAngle)*spiralRadius;
          const spiralY=wy+Math.sin(spiralAngle)*spiralRadius;
          spawnParticles(spiralX,spiralY,3,'#4a4a8e',100,false,2);
        }
      }
      
      // Create dark energy core
      for(let i=0;i<15;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*30;
        const x=wx+Math.cos(angle)*radius;
        const y=wy+Math.sin(angle)*radius;
        spawnParticles(x,y,4,'#1a1a3e',120,false,3);
      }
      
      spawnFloatText(wx,wy-60,'🌌 VÓRTICE VACÍO!','#4a4a8e',22);
      spawnParticles(wx,wy,30,'#2a2a4e',180,false,10);
      shakeAmt=6;
    }
    else if(h==='sonic'){
      // Muro Sónico Amplificado - Enhanced sound wall with multiple effects
      const wx=mouse.x+cam.x,wy=mouse.y+cam.y;
      const wallRadius=150;
      const wallDuration=5;
      const wallWidth=30;
      
      // Create enhanced sound wall
      player.soundWall={
        x:wx,
        y:wy,
        radius:wallRadius,
        width:wallWidth,
        timer:wallDuration,
        alive:true,
        damage:player.bulletDmg*0.6,
        slowStrength:0.4,
        reflectionChance:0.8,
        pulseTimer:0,
        pulseInterval:0.3
      };
      
      // Create wall segments with enhanced properties
      for(let i=0;i<20;i++){
        const angle=(i/20)*Math.PI*2;
        const segmentX=wx+Math.cos(angle)*wallRadius;
        const segmentY=wy+Math.sin(angle)*wallRadius;
        
        // Create enhanced wall segment
        const segment={
          x:segmentX,
          y:segmentY,
          angle:angle,
          radius:wallWidth,
          timer:wallDuration,
          alive:true,
          isWallSegment:true,
          damage:player.bulletDmg*0.3
        };
        
        // Add to walls array
        if(!player.walls) player.walls=[];
        player.walls.push(segment);
        
        // Enhanced visual wall effect
        for(let j=0;j<10;j++){
          const wallAngle=(j/10)*Math.PI*2;
          const wallRadius2=wallWidth;
          const x=segmentX+Math.cos(wallAngle)*wallRadius2;
          const y=segmentY+Math.sin(wallAngle)*wallRadius2;
          spawnParticles(x,y,4,'#00ffcc',120,false,2);
        }
        
        // Create sound wave particles
        spawnParticles(segmentX,segmentY,8,'#00ffaa',140,false,3);
      }
      
      // Apply enhanced damage and effects to enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-wx,e.y-wy);
          if(dist<wallRadius+wallWidth){
            // Apply enhanced sound damage
            e.hp-=player.bulletDmg*0.7;
            e.hitFlash=0.6;
            
            // Apply powerful sound disruption
            e.vibrated=true;
            e.vibratedTimer=3;
            e.speed*=0.4;
            e.shootRate*=2.5;
            
            // Apply enhanced disorientation
            e.disoriented=true;
            e.disorientedTimer=2;
            e.controlsReversed=true;
            e.controlsReversedTimer=1.5;
            
            // Apply sound corruption
            if(!e.soundCorrupted){
              e.soundCorrupted=true;
              e.soundCorruptedTimer=4;
              e.damageTakenMultiplier=1.4;
            }
            
            // Create enhanced disorientation effect
            for(let j=0;j<8;j++){
              const angle=(j/8)*Math.PI*2;
              const x=e.x+Math.cos(angle)*18;
              const y=e.y+Math.sin(angle)*18;
              spawnParticles(x,y,3,'#00ffaa',100,false,2);
            }
            spawnFloatText(e.x,e.y-30,'🔊 DESORIENTADO!','#00ffaa',14);
            
            // Create enhanced sound effect
            for(let j=0;j<10;j++){
              const angle=(j/10)*Math.PI*2;
              const soundX=e.x+Math.cos(angle)*20;
              const soundY=e.y+Math.sin(angle)*20;
              spawnParticles(soundX,soundY,4,'#00ffcc',110,false,2);
            }
            
            spawnParticles(e.x,e.y,8,'#00ffaa',130,false,4);
            spawnFloatText(e.x,e.y-30,'🔊 MURO SÓNICO!','#00ffcc',16);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              
              // Enhanced death effect
              for(let j=0;j<24;j++){
                const angle=(j/24)*Math.PI*2;
                const radius=40*(j/24);
                const x=e.x+Math.cos(angle)*radius;
                const y=e.y+Math.sin(angle)*radius;
                spawnParticles(x,y,5,'#00ffcc',160,false,2);
              }
              
              spawnParticles(e.x,e.y,30,e.def.color,200,true,8);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',22);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create enhanced sound wave visual
      for(let i=0;i<32;i++){
        const angle=(i/32)*Math.PI*2;
        const radius=wallRadius+wallWidth;
        const x=wx+Math.cos(angle)*radius;
        const y=wy+Math.sin(angle)*radius;
        spawnParticles(x,y,4,'#00ffaa',100,false,2);
      }
      
      // Create inner sound rings
      for(let ring=0;ring<4;ring++){
        const ringRadius=40+ring*30;
        for(let i=0;i<20;i++){
          const angle=(i/20)*Math.PI*2;
          const x=wx+Math.cos(angle)*ringRadius;
          const y=wy+Math.sin(angle)*ringRadius;
          spawnParticles(x,y,3,'#00ffcc',80,false,2);
        }
      }
      
      // Create sound field
      for(let i=0;i<30;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*wallRadius;
        const x=wx+Math.cos(angle)*radius;
        const y=wy+Math.sin(angle)*radius;
        spawnParticles(x,y,3,'#00ffcc',90,false,2);
      }
      
      spawnFloatText(wx,wy-60,'🔊 MURO SÓNICO AMPLIFICADO!','#00ffcc',24);
      spawnParticles(wx,wy,40,'#00ffaa',200,false,12);
      shakeAmt=6;
    }
    else if(h==='phoenix'){bombData={x:wx,y:wy,radius:130,damage:player.bulletDmg*3,color:'#ff4400'};bombs.push({...bombData,isMine:false,timer:0.15,alive:true,owner:'player'});spawnParticles(wx,wy,30,'#ff4400',200,true,8);spawnFloatText(wx,wy-60,'¡EXPLOSIÓN!','#ff4400',24);}
    else if(h==='void_walker'){player.portal1={x:player.x,y:player.y};player.portal2=null;spawnFloatText(player.x,player.y-60,'¡PORTAL 1!','#4a4a8e',20);spawnParticles(player.x,player.y,20,'#4a4a8e',150,false,6);}
    else if(h==='demolition'){player.remoteCharges=player.remoteCharges||[];if(player.remoteCharges.length>0){player.remoteCharges.forEach(c=>{if(c.alive){c.alive=false;bombs.push({x:c.x,y:c.y,radius:150,damage:player.bulletDmg*3,color:'#ff8800',isMine:false,timer:0.1,alive:true,owner:'player'});spawnParticles(c.x,c.y,25,'#ff8800',200,true,8);}});spawnFloatText(player.x,player.y-60,'💥 DETONAR!','#ff8800',22);shakeAmt=10;player.remoteCharges=[];}else{spawnFloatText(player.x,player.y-60,'¡SIN CARGAS!','#ff4444',18);}}
    else if(h==='illusionist'){
      // Laberinto Mental - Confuse and disorient enemies
      const confusionRadius=400;
      let confusedCount=0;
      
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<confusionRadius){
            // Multiple confusion effects
            e.confused=true;
            e.confusedTimer=6; // Longer duration
            e.reversed=true; // Controls reversed
            e.reversedTimer=4;
            e.speed*=0.5; // Slowed
            e.slowed=true;
            e.slowedTimer=5;
            
            // Set random target position
            e.targetX=Math.random()*mapW*TILE;
            e.targetY=Math.random()*mapH*TILE;
            
            // Visual effects
            spawnParticles(e.x,e.y,8,'#cc88ff',100,false,4);
            spawnFloatText(e.x,e.y-30,'🌀 LABERINTO','#cc88ff',14);
            confusedCount++;
            
            // Deal some psychic damage
            e.hp-=player.bulletDmg*0.3;
            e.hitFlash=0.3;
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create visual maze effect around player
      for(let i=0;i<12;i++){
        const angle=(i/12)*Math.PI*2;
        const x=player.x+Math.cos(angle)*confusionRadius*0.8;
        const y=player.y+Math.sin(angle)*confusionRadius*0.8;
        spawnParticles(x,y,5,'#cc88ff',80,false,3);
      }
      
      spawnFloatText(player.x,player.y-70,'🌀 LABERINTO MENTAL!','#cc88ff',24);
      spawnParticles(player.x,player.y,35,'#cc88ff',200,false,10);
      shakeAmt=6;
      
      if(confusedCount>0){
        spawnFloatText(player.x,player.y-100,'CONFUNDIDOS: '+confusedCount,'#cc88ff',16);
      }
    }
    else if(h==='shotgunner'){let nearestEnemy=null;let nearestDist=Infinity;enemies.forEach(e=>{if(e.alive&&!e.isAlly){const d=Math.hypot(e.x-player.x,e.y-player.y);if(d<nearestDist){nearestDist=d;nearestEnemy=e;}}});if(nearestEnemy){const ang=Math.atan2(nearestEnemy.y-player.y,nearestEnemy.x-player.x);for(let i=0;i<3;i++){const spread=(i-1)*0.15;fireBullet(player.x,player.y,Math.cos(ang+spread)*350,Math.sin(ang+spread)*350,'player',player.bulletDmg*0.6,player.bulletColor,7,false,{isDoubleShot:true,knockback:150});}spawnParticles(player.x,player.y,30,player.bulletColor,200,false,8);spawnFloatText(player.x,player.y-60,'💥 ESCOPETA DOBLE!','#ff6666',24);shakeAmt=6;player.doubleShotCount=2;player.doubleShotDamage=2.0;player.doubleShotKnockback=150;}else{spawnFloatText(player.x,player.y-60,'¡SIN ENEMIGOS!','#ff4444',18);}}
    else if(h==='hypnotist'){enemies.forEach(e=>{if(e.alive&&!e.isAlly){const d=Math.hypot(e.x-player.x,e.y-player.y);if(d<300){e.confused=true;e.confusedTimer=3;const dx=e.x-player.x,dy=e.y-player.y,dd=Math.hypot(dx,dy);e.patrolAngle=Math.atan2(dy,dx);spawnFloatText(e.x,e.y-30,'💫 HUYE!','#aa44ff',14);}}});spawnParticles(player.x,player.y,25,'#aa44ff',150,false,6);spawnFloatText(player.x,player.y-60,'💫 CONFUSIÓN!','#aa44ff',22);}
    else if(h==='gambler'){const dmgBoost = Math.random() < 0.5 ? 1.5 : 1.0;enemies.forEach(e=>{if(e.alive&&!e.isAlly&&Math.hypot(e.x-player.x,e.y-player.y)<300){e.hp-=player.bulletDmg*2*dmgBoost;e.hitFlash=0.8;spawnParticles(e.x,e.y,15,'#ffcc00',150,false,5);spawnFloatText(e.x,e.y-40,'-'+Math.floor(player.bulletDmg*2*dmgBoost),'#ffcc00',18);if(e.hp<=0){e.alive=false;e.deathAnim=1;score+=e.score;document.getElementById('scoreDisplay').textContent=score;spawnParticles(e.x,e.y,20,e.def.color,160,true,5);spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);updateEnemyCount();}}});spawnParticles(player.x,player.y,30,'#ffcc00',250,true,10);spawnFloatText(player.x,player.y-60,'🎰 SUERTE!','#ffcc00',24);shakeAmt=8;}
    else if(h==='bomber'){for(let i=0;i<3;i++){const ang=(i/3)*Math.PI*2;const bx=player.x+Math.cos(ang)*60,by=player.y+Math.sin(ang)*60;bombs.push({x:bx,y:by,radius:100,damage:player.bulletDmg*2,color:player.bulletColor,isMine:false,timer:0.2,alive:true,owner:'player'});}spawnParticles(player.x,player.y,35,player.bulletColor,220,true,9);spawnFloatText(player.x,player.y-70,'💥 MÚLTIPLE!',player.bulletColor,26);shakeAmt=10;}
    else if(h==='legend'){bombData={x:wx,y:wy,radius:180,damage:player.bulletDmg*4,color:'#ffd700'};bombs.push({...bombData,isMine:false,timer:0.15,alive:true,owner:'player'});spawnParticles(wx,wy,40,'#ffd700',250,true,10);spawnFloatText(wx,wy-70,'¡JUICIO!','#ffd700',28);}
    else{bombData={x:wx,y:wy,radius:100,damage:player.bulletDmg*2.5,color:'#ff6600'};bombs.push({...bombData,isMine:false,timer:0.15,alive:true,owner:'player'});spawnParticles(player.x,player.y,6,'#ff6600',60,false,5);}
    if(bombData&&gameMode==='multi'&&ws&&ws.readyState===1) ws.send(JSON.stringify({type:'special',specialType:'bomb',data:bombData}));
    sp.cd=sp.maxCd;
  }
  else if(type==='dash'){
    const h=player.heroId;
    let dx=0,dy=0;
    if(keys['KeyA']||keys['ArrowLeft'])dx-=1;if(keys['KeyD']||keys['ArrowRight'])dx+=1;
    if(keys['KeyW']||keys['ArrowUp'])dy-=1;if(keys['KeyS']||keys['ArrowDown'])dy+=1;
    if(Math.abs(touchInput.moveX)>0.05)dx+=touchInput.moveX;
    if(Math.abs(touchInput.moveY)>0.05)dy+=touchInput.moveY;
    if(!dx&&!dy){dx=Math.cos(player.angle);dy=Math.sin(player.angle);}
    const dl=Math.hypot(dx,dy);dx/=dl;dy/=dl;
    if(h==='ninja'){player.vx=dx*800;player.vy=dy*800;player.invincible=0.6;spawnParticles(player.x,player.y,15,'#ff0066',200,false,5);}
    else if(h==='mage'){const tx=player.x+dx*200,ty2=player.y+dy*200;const{tx:ttx,ty:tty}=worldToTile(tx,ty2);if(!isSolid(ttx,tty)){spawnParticles(player.x,player.y,15,'#cc44ff',150,false,5);player.x=tx;player.y=ty2;spawnParticles(player.x,player.y,15,'#cc44ff',150,false,5);}}
    else if(h==='medic'){player.boosted=true;player.boostTimer=3;spawnFloatText(player.x,player.y-60,'¡BOOST!','#00ff88',22);}
    else if(h==='tank'){player.vx=dx*600;player.vy=dy*600;player.invincible=0.3;shakeAmt=8;spawnParticles(player.x,player.y,20,'#ffaa00',200,true,7);}
    else if(h==='pyro'){player.vx=dx*750;player.vy=dy*750;player.invincible=0.4;spawnParticles(player.x,player.y,18,'#ff6600',190,false,6);spawnFloatText(player.x,player.y-60,'¡DASH FUEGO!','#ff6600',20);}
    else if(h==='cyber'){const tx=player.x+dx*250,ty2=player.y+dy*250;const{tx:ttx,ty:tty}=worldToTile(tx,ty2);if(!isSolid(ttx,tty)){spawnParticles(player.x,player.y,12,'#00ffff',140,false,4);player.x=tx;player.y=ty2;spawnParticles(player.x,player.y,12,'#00ffff',140,false,4);spawnFloatText(player.x,player.y-60,'¡TELE DASH!','#00ffff',18);}}
    else if(h==='spectre'){
      // Aparición Súbita - Ghost teleport with spectral damage
      const teleportDistance=350;
      const tx=player.x+dx*teleportDistance,ty2=player.y+dy*teleportDistance;
      const{tx:ttx,ty:tty}=worldToTile(tx,ty2);
      
      if(!isSolid(ttx,tty)){
        // Create spectral trail during teleport
        for(let i=0;i<12;i++){
          const t=i/12;
          const x=player.x+(tx-player.x)*t;
          const y=player.y+(ty2-player.y)*t;
          spawnParticles(x,y,3,'#aa44ff',100,false,2);
        }
        
        // Create ghost echoes at start and end positions
        const startEcho={
          x:player.x,
          y:player.y,
          angle:player.angle,
          alive:true,
          timer:2,
          isGhost:true
        };
        
        const endEcho={
          x:tx,
          y:ty2,
          angle:player.angle,
          alive:true,
          timer:2,
          isGhost:true
        };
        
        // Add ghost echoes to game
        if(!player.ghostEchoes) player.ghostEchoes=[];
        player.ghostEchoes.push(startEcho, endEcho);
        
        // Spectral damage to enemies near teleport path
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const distToPath=Math.abs((ty2-player.y)*e.x-(tx-player.x)*e.y+tx*player.y-ty2*player.x)/Math.hypot(ty2-player.y,tx-player.x);
            if(distToPath<40){
              e.hp-=player.bulletDmg*0.5;
              e.hitFlash=0.4;
              e.frozen=true;
              e.frozenTimer=1.5; // Freeze enemies with spectral cold
              
              spawnParticles(e.x,e.y,6,'#aa44ff',90,false,3);
              spawnFloatText(e.x,e.y-30,'💫 '+Math.floor(player.bulletDmg*0.5),'#aa44ff',12);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Perform teleport with ghost effects
        spawnParticles(player.x,player.y,20,'#aa44ff',160,false,7);
        player.x=tx;
        player.y=ty2;
        spawnParticles(player.x,player.y,20,'#aa44ff',160,false,7);
        
        // Post-teleport effects
        player.invisible=true;
        player.invisibleTimer=2;
        player.speedBoost=1.5;
        player.speedBoostTimer=2;
        
        spawnFloatText(player.x,player.y-60,'💫 APARICIÓN SÚBITA!','#aa44ff',20);
        shakeAmt=4;
        
        // Create spectral burst at arrival
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2;
          const burstX=player.x+Math.cos(angle)*30;
          const burstY=player.y+Math.sin(angle)*30;
          spawnParticles(burstX,burstY,4,'#aa44ff',80,false,2);
        }
      }
    }
    else if(h==='titan'){player.vx=dx*720;player.vy=dy*720;player.invincible=0.5;shakeAmt=6;spawnParticles(player.x,player.y,22,'#ffcc00',210,true,7);spawnFloatText(player.x,player.y-60,'¡DASH TITAN!','#ffcc00',20);}
    else if(h==='vampire'){player.invisible=true;player.invisibleTimer=1.5;player.vx=dx*780;player.vy=dy*780;spawnParticles(player.x,player.y,16,'#ff00ff',180,false,5);spawnFloatText(player.x,player.y-60,'¡DASH SOMBRA!','#ff00ff',20);}
    else if(h==='storm'){
      // Teleport Eléctrico - Electric teleport with damage
      const tx=player.x+dx*300,ty2=player.y+dy*300;
      const{tx:ttx,ty:tty}=worldToTile(tx,ty2);
      if(!isSolid(ttx,tty)){
        // Create lightning trail during teleport
        for(let i=0;i<10;i++){
          const t=i/10;
          const x=player.x+(tx-player.x)*t;
          const y=player.y+(ty2-player.y)*t;
          spawnParticles(x,y,3,'#00aaff',120,false,2);
        }
        
        // Damage enemies near teleport path
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const distToPath=Math.abs((ty2-player.y)*e.x-(tx-player.x)*e.y+tx*player.y-ty2*player.x)/Math.hypot(ty2-player.y,tx-player.x);
            if(distToPath<40){
              e.hp-=player.bulletDmg*0.6; // Increased from 0.3 to 0.6
              e.hitFlash=0.5;
              spawnParticles(e.x,e.y,5,'#00aaff',100,false,3);
              spawnFloatText(e.x,e.y-30,'⚡ '+Math.floor(player.bulletDmg*0.6),'#00aaff',12);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Perform teleport
        spawnParticles(player.x,player.y,25,'#00aaff',180,false,8);
        player.x=tx;
        player.y=ty2;
        spawnParticles(player.x,player.y,25,'#00aaff',180,false,8);
        spawnFloatText(player.x,player.y-60,'💫 TELEPORT ELÉCTRICO!','#00aaff',20);
        shakeAmt=4;
      }
    }
    else if(h==='chronos'){if(player.rewindUses>0&&player.rewindHistory.length>0){const fiveSecondsAgo=Date.now()-5000;const pastState=player.rewindHistory.find(s=>s.timestamp<=fiveSecondsAgo)||player.rewindHistory[0];if(pastState){player.x=pastState.x;player.y=pastState.y;player.hp=pastState.hp;player.rewindUses--;enemies.forEach(e=>{if(e.alive){e.hp-=800;e.hitFlash=0.5;spawnParticles(e.x,e.y,8,'#800080',100,false,4);spawnFloatText(e.x,e.y-40,'-800','#800080',15);if(e.hp<=0){e.alive=false;e.deathAnim=1;score+=e.score;document.getElementById('scoreDisplay').textContent=score;spawnParticles(e.x,e.y,20,e.def.color,160,true,5);spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);updateEnemyCount();}}});spawnParticles(player.x,player.y,40,'#800080',300,true,12);spawnFloatText(player.x,player.y-80,'⏱ ¡REWIND 5s!','#800080',32);shakeAmt=15;spawnFloatText(player.x,player.y-110,'('+player.rewindUses+' cargas)','#800080',18);}}else{player.vx=dx*850;player.vy=dy*850;player.invincible=0.5;spawnParticles(player.x,player.y,18,'#800080',180,false,6);spawnFloatText(player.x,player.y-60,'¡FLASH!','#800080',20);}}
    else if(h==='crystal'){
      // Barrera de Hielo - Ice wall that slows enemies
      const wallWidth=120;
      const wallHeight=20;
      const wx=mouse.x+cam.x,wy=mouse.y+cam.y;
      const{tx:ttx,ty:tty}=worldToTile(wx,wy);
      
      if(!isSolid(ttx,tty)){
        // Create ice wall
        const iceWall={
          x:wx,
          y:wy,
          width:wallWidth,
          height:wallHeight,
          timer:8,
          alive:true,
          isIceWall:true,
          slowStrength:0.4 // 40% speed reduction
        };
        
        // Add to blockWalls array for collision
        blockWalls.push({
          x:ttx,
          y:tty,
          timer:8,
          alive:true,
          isIceWall:true
        });
        
        // Apply immediate slow effect to nearby enemies
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-wx,e.y-wy);
            if(dist<wallWidth){
              e.speed*=iceWall.slowStrength;
              e.slowed=true;
              e.slowedTimer=3;
              e.frozen=true;
              e.frozenTimer=1; // Brief freeze
              
              spawnParticles(e.x,e.y,6,'#00ccff',100,false,3);
              spawnFloatText(e.x,e.y-30,'❄️ CONGELADO','#00ccff',14);
              updateAchievementProgress('ice_wall_master',1);
            }
          }
        });
        
        // Create ice crystal visual effects
        for(let i=0;i<12;i++){
          const x=wx+(i-6)*20;
          const y=wy+Math.sin(i)*5;
          spawnParticles(x,y,8,'#00ccff',120,false,4);
        }
        
        // Create frost aura around wall
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2;
          const x=wx+Math.cos(angle)*wallWidth/2;
          const y=wy+Math.sin(angle)*wallHeight/2;
          spawnParticles(x,y,6,'#00ffff',100,false,3);
        }
        
        spawnFloatText(wx,wy-60,'❄️ BARRERA DE HIELO!','#00ccff',22);
        spawnParticles(wx,wy,25,'#00ccff',180,false,8);
        shakeAmt=4;
      }else{
        spawnFloatText(player.x,player.y-60,'👻 DESVANECER!','#4a4a8e',20);
      }
    }
    else if(h==='phoenix'){player.flying=true;player.flyingTimer=2;player.speedBoost=1.8;player.speedBoostTimer=2;spawnParticles(player.x,player.y,20,'#ff4400',160,false,6);spawnFloatText(player.x,player.y-60,'¡VUELO!','#ff4400',20);}
    else if(h==='void_walker'){enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-player.x,e.y-player.y)<200){e.frozen=true;e.frozenTimer=2;spawnFloatText(e.x,e.y-30,'🌌 DISTORSIÓN','#4a4a8e',14);}});spawnParticles(player.x,player.y,20,'#4a4a8e',180,false,6);spawnFloatText(player.x,player.y-60,'¡DISTORSIÓN!','#4a4a8e',22);}
    else if(h==='demolition'){const tx=player.x+dx*150,ty2=player.y+dy*150;bombs.push({x:tx,y:ty2,radius:100,damage:player.bulletDmg*2,color:'#ff8800',isMine:false,timer:0.5,alive:true,owner:'player'});spawnParticles(tx,ty2,15,'#ff8800',140,false,5);spawnFloatText(tx,ty2-40,'🔥 GRANADA','#ff8800',18);}
    else if(h==='illusionist'){
      // Teleportación Sombría - Shadow teleport with illusion damage
      const tx=player.x+dx*250,ty2=player.y+dy*250;
      const{tx:ttx,ty:tty}=worldToTile(tx,ty2);
      if(!isSolid(ttx,tty)){
        // Create illusion trail during teleport
        for(let i=0;i<8;i++){
          const t=i/8;
          const x=player.x+(tx-player.x)*t;
          const y=player.y+(ty2-player.y)*t;
          spawnParticles(x,y,4,'#cc88ff',100,false,2);
        }
        
        // Create illusion decoys at start and end positions
        const startDecoy={
          x:player.x,
          y:player.y,
          angle:player.angle,
          alive:true,
          timer:3,
          isIllusion:true,
          isDecoy:true
        };
        
        const endDecoy={
          x:tx,
          y:ty2,
          angle:player.angle,
          alive:true,
          timer:3,
          isIllusion:true,
          isDecoy:true
        };
        
        // Add decoys to game
        if(!player.illusions) player.illusions=[];
        player.illusions.push(startDecoy, endDecoy);
        
        // Damage enemies near teleport path with illusion damage
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const distToPath=Math.abs((ty2-player.y)*e.x-(tx-player.x)*e.y+tx*player.y-ty2*player.x)/Math.hypot(ty2-player.y,tx-player.x);
            if(distToPath<35){
              e.hp-=player.bulletDmg*0.4;
              e.hitFlash=0.4;
              e.confused=true;
              e.confusedTimer=2; // Brief confusion
              
              spawnParticles(e.x,e.y,6,'#cc88ff',90,false,3);
              spawnFloatText(e.x,e.y-30,'✨ '+Math.floor(player.bulletDmg*0.4),'#cc88ff',12);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Perform teleport
        spawnParticles(player.x,player.y,20,'#cc88ff',160,false,7);
        player.x=tx;
        player.y=ty2;
        spawnParticles(player.x,player.y,20,'#cc88ff',160,false,7);
        spawnFloatText(player.x,player.y-60,'✨ TELEPORTACIÓN SOMBRÍA!','#cc88ff',20);
        shakeAmt=3;
        
        // Brief invisibility after teleport
        player.invisible=true;
        player.invisibleTimer=1;
      }
    }
    else if(h==='shotgunner'){player.ammo=player.maxAmmo;player.reloadTimer=0;updateAmmoUI();spawnParticles(player.x,player.y,15,player.bulletColor,120,false,5);spawnFloatText(player.x,player.y-60,'⚡ RECARGA!','#ff6666',20);}
    else if(h==='hypnotist'){player.shieldActive=true;player.shieldTimer=3;spawnParticles(player.x,player.y,15,'#aa44ff',120,false,5);spawnFloatText(player.x,player.y-60,'🛡️ BARRERA MENTAL!','#aa44ff',20);}
    else if(h==='gambler'){player.vx=dx*800;player.vy=dy*800;player.invincible=0.4;bullets.forEach(b=>{if(b.owner==='enemy'){b.vx*=0.1;b.vy*=0.1;}});spawnParticles(player.x,player.y,20,'#ffcc00',160,false,6);spawnFloatText(player.x,player.y-60,'⏸ PAUSA BALAS!','#ffcc00',20);}
    else if(h==='bomber'){const tx=player.x+dx*180,ty2=player.y+dy*180;bombs.push({x:tx,y:ty2,radius:80,damage:player.bulletDmg*1.5,color:player.bulletColor,isMine:false,timer:0.3,alive:true,owner:'player'});spawnParticles(tx,ty2,18,player.bulletColor,140,false,5);spawnFloatText(tx,ty2-40,'🔥 GRANADA RÁPIDA',player.bulletColor,18);}
    else if(h==='thunder'){
      // Rayo Celestial - Massive lightning strike from above
      const strikeRadius=150;
      const strikeCount=5;
      
      // Create multiple lightning strikes
      for(let i=0;i<strikeCount;i++){
        setTimeout(()=>{
          // Random position around player
          const angle=Math.random()*Math.PI*2;
          const distance=Math.random()*200+100;
          const strikeX=player.x+Math.cos(angle)*distance;
          const strikeY=player.y+Math.sin(angle)*distance;
          
          // Create lightning strike from sky
          for(let j=0;j<20;j++){
            const t=j/20;
            const x=strikeX;
            const y=strikeY-300+(300*t);
            spawnParticles(x,y,6,'#00ccff',150,false,3);
            
            // Damage enemies along lightning path
            enemies.forEach(e=>{
              if(e.alive&&!e.isAlly){
                const dist=Math.hypot(e.x-x,e.y-y);
                if(dist<40){
                  const damage=player.bulletDmg*0.8;
                  e.hp-=damage;
                  e.hitFlash=0.8;
                  e.stunned=true;
                  e.stunnedTimer=2;
                  
                  spawnParticles(e.x,e.y,8,'#00ccff',120,false,4);
                  spawnFloatText(e.x,e.y-30,'☁️ '+Math.floor(damage),'#00ccff',14);
                  
                  if(e.hp<=0){
                    e.alive=false;
                    e.deathAnim=1;
                    score+=e.score;
                    document.getElementById('scoreDisplay').textContent=score;
                    spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                    spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                    updateEnemyCount();
                  }
                }
              }
            });
          }
          
          // Ground impact explosion
          bombs.push({
            x:strikeX,
            y:strikeY,
            radius:strikeRadius,
            damage:player.bulletDmg*1.2,
            color:'#00ccff',
            isLightningStrike:true,
            timer:0.1,
            alive:true
          });
          
          // Visual impact
          spawnParticles(strikeX,strikeY,20,'#00ccff',250,true,10);
          shakeAmt=12;
        },i*100); // Stagger strikes
      }
      
      spawnFloatText(player.x,player.y-60,'☁️ RAYO CELESTIAL!','#00ccff',24);
      spawnParticles(player.x,player.y,40,'#00ccff',200,true,12);
    }
    else if(h==='nature'){
      // Tormenta de Espinas - Thorn storm explosion
      const thornRadius=180;
      const thornCount=24;
      const thornDamage=player.bulletDmg*0.6;
      
      // Create thorn storm
      for(let i=0;i<thornCount;i++){
        const angle=(i/thornCount)*Math.PI*2;
        const thornX=player.x+Math.cos(angle)*thornRadius;
        const thornY=player.y+Math.sin(angle)*thornRadius;
        
        // Create thorn projectile
        const thorn={
          x:player.x,
          y:player.y,
          vx:Math.cos(angle)*400,
          vy:Math.sin(angle)*400,
          owner:'player',
          damage:thornDamage,
          color:'#44aa44',
          size:6,
          hitEnemies:new Set(),
          age:0,
          maxAge:1.5,
          isThorn:true,
          piercing:true,
          trail:[]
        };
        bullets.push(thorn);
        
        // Visual thorn trail
        for(let j=0;j<8;j++){
          const t=j/8;
          const x=player.x+(thornX-player.x)*t;
          const y=player.y+(thornY-player.y)*t;
          spawnParticles(x,y,3,'#44aa44',100,false,2);
        }
      }
      
      // Apply immediate damage to nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<thornRadius*0.5){
            // Heavy damage at center
            e.hp-=player.bulletDmg*1.2;
            e.hitFlash=0.8;
            e.bleeding=true;
            e.bleedingTimer=3;
            e.bleedingDamage=player.bulletDmg*0.15;
            
            spawnParticles(e.x,e.y,10,'#44aa44',140,false,5);
            spawnFloatText(e.x,e.y-30,'🌹 '+Math.floor(player.bulletDmg*1.2),'#44aa44',16);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create rose petals effect
      for(let i=0;i<40;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*thornRadius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#ff6699',80,false,2);
      }
      
      spawnFloatText(player.x,player.y-60,'🌹 TORMENTA DE ESPINAS!','#44aa44',24);
      spawnParticles(player.x,player.y,45,'#44aa44',250,true,15);
      shakeAmt=10;
    }
    else if(h==='legend'){player.hp=player.maxHp;spawnParticles(player.x,player.y,30,'#ffd700',250,true,10);spawnFloatText(player.x,player.y-70,'¡ASCENSIÓN!','#ffd700',28);}
    else if(h==='shadow'){
      // Ejecución Umbral - Massive damage to weakened enemies
      const executeRadius=250;
      const executeThreshold=0.3; // Execute enemies below 30% HP
      let executedCount=0;
      
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<executeRadius){
            const hpPercent=e.hp/e.maxHp;
            if(hpPercent<executeThreshold){
              // Execute the enemy
              const executeDamage=e.hp;
              e.hp=0;
              e.alive=false;
              e.deathAnim=1;
              executedCount++;
              
              // Visual execution effect
              spawnParticles(e.x,e.y,15,'#1a1a2e',180,false,8);
              spawnFloatText(e.x,e.y-40,'⚔️ EJECUTADO','#1a1a2e',18);
              
              // Score and effects
              score+=e.score*2; // Double score for execution
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+(e.score*2)+' (EJECUCIÓN)','#FFD700',20);
              updateEnemyCount();
              
              // Create shadow explosion effect
              for(let i=0;i<8;i++){
                const angle=(i/8)*Math.PI*2;
                const x=e.x+Math.cos(angle)*40;
                const y=e.y+Math.sin(angle)*40;
                spawnParticles(x,y,6,'#1a1a2e',120,false,3);
              }
            }else{
              // Damage non-executable enemies
              const damage=player.bulletDmg*2;
              e.hp-=damage;
              e.hitFlash=0.5;
              spawnParticles(e.x,e.y,8,'#1a1a2e',100,false,4);
              spawnFloatText(e.x,e.y-30,'⚔️ '+damage,'#1a1a2e',14);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        }
      });
      
      // Create shadow execution aura
      for(let i=0;i<16;i++){
        const angle=(i/16)*Math.PI*2;
        const x=player.x+Math.cos(angle)*executeRadius;
        const y=player.y+Math.sin(angle)*executeRadius;
        spawnParticles(x,y,4,'#1a1a2e',100,false,2);
      }
      
      spawnFloatText(player.x,player.y-60,'⚔️ EJECUCIÓN UMBRAL!','#1a1a2e',24);
      spawnParticles(player.x,player.y,25,'#1a1a2e',200,true,10);
      shakeAmt=8;
      
      // Brief invisibility after execution
      player.invisible=true;
      player.invisibleTimer=1.5;
    }
    else if(h==='ranger'){
      // Salto Ágil - Agile jump with mid-air shot
      const jumpDistance=350;
      const jumpHeight=120;
      
      // Calculate jump destination
      const tx=player.x+dx*jumpDistance;
      const ty=player.y+dy*jumpDistance;
      const{tx:ttx,ty:tty}=worldToTile(tx,ty);
      
      if(!isSolid(ttx,tty)){
        // Create jump arc effect
        for(let i=0;i<12;i++){
          const t=i/12;
          const arcHeight=Math.sin(t*Math.PI)*jumpHeight;
          const x=player.x+(tx-player.x)*t;
          const y=player.y+(ty-player.y)*t-arcHeight;
          spawnParticles(x,y,4,'#00ccff',100,false,2);
        }
        
        // Perform jump with arc
        player.x=tx;
        player.y=ty-jumpHeight/2;
        
        // Gravity effect after jump
        setTimeout(()=>{
          if(player.alive){
            player.y+=jumpHeight/2;
            spawnParticles(player.x,player.y,8,'#00ccff',120,false,3);
          }
        },200);
        
        // Mid-air shot in jump direction
        const shootAngle=Math.atan2(dy,dx);
        for(let i=0;i<3;i++){
          const spread=(i-1)*0.1;
          const arrow={
            x:player.x,
            y:player.y,
            vx:Math.cos(shootAngle+spread)*450,
            vy:Math.sin(shootAngle+spread)*450,
            owner:'player',
            damage:player.bulletDmg*0.8,
            color:'#00ccff',
            size:6,
            hitEnemies:new Set(),
            age:0,
            maxAge:1.5,
            piercing:false,
            isArrow:true,
            trail:[]
          };
          bullets.push(arrow);
        }
        
        // Speed boost after landing
        player.speedBoost=1.4;
        player.speedBoostTimer=2;
        
        spawnFloatText(player.x,player.y-60,'🦘 SALTO ÁGIL!','#00ccff',22);
        spawnParticles(player.x,player.y,25,'#00ccff',180,true,8);
        shakeAmt=5;
      }
    }
    else if(h==='frost'){
      // Deslizamiento - Ice slide with freeze trail
      const slideDistance=400;
      const slideWidth=60;
      
      // Calculate slide destination
      const tx=player.x+dx*slideDistance;
      const ty=player.y+dy*slideDistance;
      const{tx:ttx,ty:tty}=worldToTile(tx,ty);
      
      if(!isSolid(ttx,tty)){
        // Create ice slide trail
        for(let i=0;i<15;i++){
          const t=i/15;
          const x=player.x+(tx-player.x)*t;
          const y=player.y+(ty-player.y)*t;
          
          // Create ice trail
          for(let j=0;j<4;j++){
            const offsetX=Math.random()*slideWidth-slideWidth/2;
            const offsetY=Math.random()*20-10;
            spawnParticles(x+offsetX,y+offsetY,3,'#aaddff',80,false,2);
          }
        }
        
        // Perform slide
        player.x=tx;
        player.y=ty;
        
        // Create freeze area at end
        player.freezeArea={
          x:tx,
          y:ty,
          radius:slideWidth,
          timer:3,
          alive:true
        };
        
        // Apply freeze to enemies at destination
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-tx,e.y-ty);
            if(dist<slideWidth){
              // Freeze enemies
              e.frozen=true;
              e.frozenTimer=2;
              e.speed=0;
              
              // Apply ice damage
              e.hp-=player.bulletDmg*0.3;
              e.hitFlash=0.4;
              
              // Create ice crystal effect
              for(let j=0;j<6;j++){
                const angle=(j/6)*Math.PI*2;
                const crystalX=e.x+Math.cos(angle)*12;
                const crystalY=e.y+Math.sin(angle)*12;
                spawnParticles(crystalX,crystalY,3,'#aaddff',80,false,2);
              }
              
              spawnParticles(e.x,e.y,5,'#aaddff',100,false,3);
              spawnFloatText(e.x,e.y-30,'⛸️ CONGELADO!','#aaddff',14);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Speed boost after slide
        player.speedBoost=1.3;
        player.speedBoostTimer=2;
        
        spawnFloatText(player.x,player.y-60,'⛸️ DESLIZAMIENTO!','#aaddff',22);
        spawnParticles(player.x,player.y,30,'#aaddff',200,true,10);
        shakeAmt=4;
      }
    }
    else if(h==='blaze'){
      // Explosión Ígnea - Fire explosion that spreads
      const explosionRadius=150;
      const spreadCount=8;
      
      // Create main explosion
      for(let i=0;i<20;i++){
        const angle=(i/20)*Math.PI*2;
        const radius=Math.random()*explosionRadius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,5,'#ff8800',120,false,3);
      }
      
      // Apply immediate fire damage
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.x,e.y-player.y);
          if(dist<explosionRadius){
            // Apply fire damage
            e.hp-=player.bulletDmg*0.8;
            e.hitFlash=0.6;
            e.burning=true;
            e.burningTimer=2;
            e.burningDamage=player.bulletDmg*0.1;
            
            spawnParticles(e.x,e.y,8,'#ff8800',120,false,4);
            spawnFloatText(e.x,e.y-30,'💫 EXPLOSIÓN!','#ff8800',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Create spreading fire explosions
      for(let i=0;i<spreadCount;i++){
        setTimeout(()=>{
          const angle=(i/spreadCount)*Math.PI*2;
          const spreadX=player.x+Math.cos(angle)*explosionRadius*0.8;
          const spreadY=player.y+Math.sin(angle)*explosionRadius*0.8;
          
          // Create spread explosion
          for(let j=0;j<10;j++){
            const spreadAngle=(j/10)*Math.PI*2;
            const spreadRadius=Math.random()*40;
            const x=spreadX+Math.cos(spreadAngle)*spreadRadius;
            const y=spreadY+Math.sin(spreadAngle)*spreadRadius;
            spawnParticles(x,y,3,'#ff8800',100,false,2);
          }
          
          // Damage enemies in spread
          enemies.forEach(e=>{
            if(e.alive&&!e.isAlly){
              const dist=Math.hypot(e.x-spreadX,e.y-spreadY);
              if(dist<40){
                e.hp-=player.bulletDmg*0.2;
                e.hitFlash=0.3;
                spawnParticles(e.x,e.y,4,'#ff8800',80,false,2);
                
                if(e.hp<=0){
                  e.alive=false;
                  e.deathAnim=1;
                  score+=e.score;
                  document.getElementById('scoreDisplay').textContent=score;
                  spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                  spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                  updateEnemyCount();
                }
              }
            }
          });
        },i*150);
      }
      
      spawnFloatText(player.x,player.y-60,'💫 EXPLOSIÓN ÍGNEA!','#ff8800',24);
      spawnParticles(player.x,player.y,40,'#ff8800',250,true,12);
      shakeAmt=10;
    }
    else if(h==='techno'){
      // Teletransporte - Short range teleport with energy burst
      const teleportDistance=300;
      
      // Calculate teleport destination
      const tx=player.x+dx*teleportDistance;
      const ty=player.y+dy*teleportDistance;
      const{tx:ttx,ty:tty}=worldToTile(tx,ty);
      
      if(!isSolid(ttx,tty)){
        // Create teleport visual effect at origin
        for(let i=0;i<12;i++){
          const angle=(i/12)*Math.PI*2;
          const x=player.x+Math.cos(angle)*20;
          const y=player.y+Math.sin(angle)*20;
          spawnParticles(x,y,4,'#00aaff',100,false,2);
        }
        
        // Create energy trail
        for(let i=0;i<10;i++){
          const t=i/10;
          const x=player.x+(tx-player.x)*t;
          const y=player.y+(ty-player.y)*t;
          spawnParticles(x,y,3,'#00ccff',80,false,2);
        }
        
        // Store original position
        const origX=player.x;
        const origY=player.y;
        
        // Teleport
        player.x=tx;
        player.y=ty;
        
        // Create arrival visual effect
        for(let i=0;i<15;i++){
          const angle=(i/15)*Math.PI*2;
          const x=player.x+Math.cos(angle)*25;
          const y=player.y+Math.sin(angle)*25;
          spawnParticles(x,y,5,'#00ffff',120,false,3);
        }
        
        // Apply enhanced void disruption to nearby enemies
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-player.x,e.y-player.y);
            if(dist<120){
              // Enhanced void disruption with distance scaling
              const damageMultiplier=1.8-(dist/120)*0.8; // 1.8x at center to 1x at edge
              e.hp-=player.bulletDmg*0.3*damageMultiplier;
              e.hitFlash=0.5;
              e.distorted=true;
              e.distortedTimer=3;
              e.speed*=0.5;
              e.slowed=true;
              e.slowedTimer=2;
              
              // Apply phase shift - temporary invulnerability bypass
              if(Math.random()<0.5){
                e.phaseShifted=true;
                e.phaseShiftedTimer=2;
                e.defenseReduction=0.5; // 50% less defense
                
                // Create phase shift effect
                for(let j=0;j<8;j++){
                  const angle=(j/8)*Math.PI*2;
                  const x=e.x+Math.cos(angle)*15;
                  const y=e.y+Math.sin(angle)*15;
                  spawnParticles(x,y,3,'#8a8aae',90,false,2);
                }
                spawnFloatText(e.x,e.y-30,'👻 FASE SHIFT!','#8a8aae',12);
              }
              
              // Apply temporal displacement - speed manipulation
              if(Math.random()<0.4){
                e.temporalDisplaced=true;
                e.temporalDisplacedTimer=3;
                e.speed*=0.3; // Additional slow
                e.shootRate*=2; // Slower shooting
                
                // Create temporal effect
                for(let j=0;j<6;j++){
                  const angle=(j/6)*Math.PI*2;
                  const x=e.x+Math.cos(angle)*12;
                  const y=e.y+Math.sin(angle)*12;
                  spawnParticles(x,y,2,'#6a6aae',70,false,2);
                }
                spawnFloatText(e.x,e.y-30,'⏰ DESPLAZADO!','#6a6aae',12);
              }
              
              // Apply void burn - damage over time
              if(!e.voidBurn){
                e.voidBurn=true;
                e.voidBurnTimer=4;
                e.voidBurnDamage=player.bulletDmg*0.1;
              }
              
              // Create enhanced void effect with dimensional rifts
              for(let j=0;j<10;j++){
                const angle=(j/10)*Math.PI*2+gameTime*2;
                const riftRadius=18+Math.sin(gameTime*3+j)*8;
                const voidX=e.x+Math.cos(angle)*riftRadius;
                const voidY=e.y+Math.sin(angle)*riftRadius;
                spawnParticles(voidX,voidY,3,'#2a2a4e',100,false,2);
              }
              
              // Create dimensional tear effect
              for(let j=0;j<4;j++){
                const tearAngle=(j/4)*Math.PI*2+Math.random()*0.3;
                const tearLength=25+Math.random()*15;
                const tearX=e.x+Math.cos(tearAngle)*tearLength;
                const tearY=e.y+Math.sin(tearAngle)*tearLength;
                
                // Draw tear line
                for(let k=0;k<6;k++){
                  const t=k/6;
                  const x=e.x+(tearX-e.x)*t;
                  const y=e.y+(tearY-e.y)*t;
                  const alpha=1-t;
                  spawnParticles(x,y,2,'#1a1a3e',120*alpha,false,2);
                }
              }
              
              // Create energy absorption effect
              for(let j=0;j<5;j++){
                const angle=(j/5)*Math.PI*2;
                const startX=e.x+Math.cos(angle)*20;
                const startY=e.y+Math.sin(angle)*20;
                const endX=player.x+Math.cos(angle)*5;
                const endY=player.y+Math.sin(angle)*5;
                
                // Draw energy absorption line
                for(let k=0;k<4;k++){
                  const t=k/4;
                  const x=startX+(endX-startX)*t;
                  const y=startY+(endY-startY)*t;
                  spawnParticles(x,y,2,'#4a4a8e',80,false,2);
                }
              }
              
              spawnParticles(e.x,e.y,8,'#4a4a8e',120,false,4);
              spawnFloatText(e.x,e.y-30,'🌌 FASE!','#4a4a8e',16);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                
                // Enhanced death effect - dimensional collapse
                for(let j=0;j<18;j++){
                  const angle=(j/18)*Math.PI*2;
                  const radius=35*(j/18);
                  const x=e.x+Math.cos(angle)*radius;
                  const y=e.y+Math.sin(angle)*radius;
                  spawnParticles(x,y,5,'#2a2a4e',160,false,3);
                }
                
                // Create void portal at death location
                for(let j=0;j<12;j++){
                  const angle=(j/12)*Math.PI*2;
                  const portalRadius=20;
                  const x=e.x+Math.cos(angle)*portalRadius;
                  const y=e.y+Math.sin(angle)*portalRadius;
                  spawnParticles(x,y,4,'#000000',140,false,2);
                }
                
                // Create energy release at player position
                for(let j=0;j<8;j++){
                  const angle=(j/8)*Math.PI*2;
                  const x=player.x+Math.cos(angle)*15;
                  const y=player.y+Math.sin(angle)*15;
                  spawnParticles(x,y,4,'#6a6aae',130,false,3);
                }
                
                spawnParticles(e.x,e.y,35,e.def.color,240,true,8);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',26);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create afterimage effect at origin
        player.afterimage={
          x:origX,
          y:origY,
          timer:1,
          alive:true
        };
        
        spawnFloatText(player.x,player.y-60,'⚡ TELETRANSPORTE!','#00aaff',22);
        spawnParticles(player.x,player.y,35,'#00ffff',200,true,12);
        shakeAmt=4;
      }
    }
    else if(h==='sonic'){
      // Velocidad Sónica Amplificada - Enhanced sonic dash with multiple effects
      const dashDistance=500;
      const dashSpeed=1500;
      const sonicTrailDuration=3;
      
      // Calculate dash destination
      const tx=player.x+dx*dashDistance;
      const ty=player.y+dy*dashDistance;
      const{tx:ttx,ty:tty}=worldToTile(tx,ty);
      
      if(!isSolid(ttx,tty)){
        // Create enhanced sonic trail
        player.sonicTrail={
          startX:player.x,
          startY:player.y,
          endX:tx,
          endY:ty,
          timer:sonicTrailDuration,
          alive:true,
          damage:player.bulletDmg*0.5,
          echoCount:4,
          echoInterval:0.2,
          nextEchoTime:0.2
        };
        
        // Create enhanced sonic boom effect at start
        for(let i=0;i<30;i++){
          const angle=(i/30)*Math.PI*2;
          const radius=40;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          spawnParticles(x,y,5,'#00ffcc',140,false,3);
        }
        
        // Create enhanced sound wave trail during dash
        for(let i=0;i<20;i++){
          const t=i/20;
          const x=player.x+(tx-player.x)*t;
          const y=player.y+(ty-player.y)*t;
          
          // Create enhanced sound wave particles
          for(let j=0;j<8;j++){
            const angle=(j/8)*Math.PI*2;
            const waveRadius=20;
            const px=x+Math.cos(angle)*waveRadius;
            const py=y+Math.sin(angle)*waveRadius;
            spawnParticles(px,py,3,'#00ffaa',120,false,2);
          }
        }
        
        // Apply enhanced damage to enemies along dash path
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            // Check if enemy is near dash path
            const distToPath=Math.abs((ty-player.y)*e.x-(tx-player.x)*e.y+tx*player.y-ty*player.x)/Math.hypot(ty-player.y,tx-player.x);
            const pathLength=Math.hypot(tx-player.x,ty-player.y);
            const t=Math.max(0,Math.min(1,((e.x-player.x)*(tx-player.x)+(e.y-player.y)*(ty-player.y))/(pathLength*pathLength)));
            const closestX=player.x+t*(tx-player.x);
            const closestY=player.y+t*(ty-player.y);
            const distToClosest=Math.hypot(e.x-closestX,e.y-closestY);
            
            if(distToPath<50 && distToClosest<50){
              // Enhanced sonic damage
              e.hp-=player.bulletDmg*0.6;
              e.hitFlash=0.6;
              
              // Apply powerful sonic disruption
              e.vibrated=true;
              e.vibratedTimer=3;
              e.speed*=0.3;
              e.shootRate*=3;
              e.stunned=true;
              e.stunnedTimer=1.5;
              e.disoriented=true;
              e.disorientedTimer=2;
              
              // Apply sound corruption
              if(!e.soundCorrupted){
                e.soundCorrupted=true;
                e.soundCorruptedTimer=5;
                e.damageTakenMultiplier=1.5;
              }
              
              // Create enhanced sonic impact effect
              for(let j=0;j<12;j++){
                const angle=(j/12)*Math.PI*2;
                const x=e.x+Math.cos(angle)*20;
                const y=e.y+Math.sin(angle)*20;
                spawnParticles(x,y,4,'#00ffcc',120,false,2);
              }
              
              spawnParticles(e.x,e.y,8,'#00ffaa',140,false,4);
              spawnFloatText(e.x,e.y-30,'💨 SONICO!','#00ffcc',16);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                
                // Enhanced death effect
                for(let j=0;j<30;j++){
                  const angle=(j/30)*Math.PI*2;
                  const radius=50*(j/30);
                  const x=e.x+Math.cos(angle)*radius;
                  const y=e.y+Math.sin(angle)*radius;
                  spawnParticles(x,y,6,'#00ffcc',180,false,2);
                }
                
                spawnParticles(e.x,e.y,25,e.def.color,200,true,8);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',22);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Perform enhanced dash
        player.vx=dx*dashSpeed;
        player.vy=dy*dashSpeed;
        player.invincible=0.8;
        player.speedBoost=2;
        player.speedBoostTimer=3;
        
        // Create enhanced sonic boom at destination
        for(let i=0;i<35;i++){
          const angle=(i/35)*Math.PI*2;
          const radius=50;
          const x=tx+Math.cos(angle)*radius;
          const y=ty+Math.sin(angle)*radius;
          spawnParticles(x,y,6,'#00ffcc',160,false,3);
        }
        
        // Create enhanced sound waves at destination
        for(let i=0;i<4;i++){
          setTimeout(()=>{
            for(let j=0;j<20;j++){
              const angle=(j/20)*Math.PI*2;
              const waveRadius=60+i*25;
              const x=tx+Math.cos(angle)*waveRadius;
              const y=ty+Math.sin(angle)*waveRadius;
              spawnParticles(x,y,4,'#00ffaa',100,false,2);
            }
          },i*120);
        }
        
        // Create echo field at destination
        player.sonicEchoField={
          x:tx,
          y:ty,
          radius:80,
          timer:2,
          alive:true,
          damage:player.bulletDmg*0.3,
          echoCount:3,
          currentEcho:0,
          echoInterval:0.4,
          nextEchoTime:0.4
        };
        
        player.x=tx;
        player.y=ty;
        
        spawnFloatText(player.x,player.y-60,'💨 VELOCIDAD SÓNICA AMPLIFICADA!','#00ffcc',24);
        spawnParticles(player.x,player.y,50,'#00ffaa',200,true,15);
        shakeAmt=8;
      }
    }
    else if(type==='ultimate'){
      const h=player.heroId;
      // Handle fourth abilities (ultimate abilities)
      if(h==='thunder'){
        // Velocidad Relámpago - Lightning speed dash with damage
        let dx=0,dy=0;
        if(keys['KeyA']||keys['ArrowLeft'])dx-=1;if(keys['KeyD']||keys['ArrowRight'])dx+=1;
        if(keys['KeyW']||keys['ArrowUp'])dy-=1;if(keys['KeyS']||keys['ArrowDown'])dy+=1;
        if(Math.abs(touchInput.moveX)>0.05)dx+=touchInput.moveX;
        if(Math.abs(touchInput.moveY)>0.05)dy+=touchInput.moveY;
        if(dx!==0||dy!==0){
          const len=Math.hypot(dx,dy);
          dx/=len;dy/=len;
          
          // Lightning speed dash
          const dashDistance=400;
          const tx=player.x+dx*dashDistance,ty2=player.y+dy*dashDistance;
          const{tx:ttx,ty:tty}=worldToTile(tx,ty2);
          
          if(!isSolid(ttx,tty)){
            // Create lightning trail during dash
            for(let i=0;i<20;i++){
              const t=i/20;
              const x=player.x+(tx-player.x)*t;
              const y=player.y+(ty2-player.y)*t;
              spawnParticles(x,y,6,'#00ccff',150,false,3);
              
              // Damage enemies along the path
              enemies.forEach(e=>{
                if(e.alive&&!e.isAlly){
                  const dist=Math.hypot(e.x-x,e.y-y);
                  if(dist<35){
                    e.hp-=player.bulletDmg*0.4;
                    e.hitFlash=0.5;
                    e.stunned=true;
                    e.stunnedTimer=1;
                    spawnParticles(e.x,e.y,5,'#00ccff',100,false,3);
                    
                    if(e.hp<=0){
                      e.alive=false;
                      e.deathAnim=1;
                      score+=e.score;
                      document.getElementById('scoreDisplay').textContent=score;
                      spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                      spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                      updateEnemyCount();
                    }
                  }
                }
              });
            }
            
            // Perform dash
            spawnParticles(player.x,player.y,25,'#00ccff',200,true,10);
            player.x=tx;
            player.y=ty2;
            spawnParticles(player.x,player.y,25,'#00ccff',200,true,10);
            
            // Speed boost after dash
            player.speedBoost=1.8;
            player.speedBoostTimer=2;
            
            spawnFloatText(player.x,player.y-60,'💨 VELOCIDAD RELÁMPAGO!','#00ccff',22);
            shakeAmt=8;
          }
        }
      }
      else if(h==='nature'){
        // Raíces de la Tierra - Earth roots area immobilization
        const rootRadius=200;
        
        // Create root area
        player.rootArea={
          x:player.x,
          y:player.y,
          radius:rootRadius,
          timer:4,
          alive:true
        };
        
        // Apply immediate root effects to enemies
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-player.x,e.y-player.y);
            if(dist<rootRadius){
              // Immobilize enemies with roots
              e.rooted=true;
              e.rootedTimer=3;
              e.speed=0;
              
              // Apply nature damage
              e.hp-=player.bulletDmg*0.3;
              e.hitFlash=0.5;
              
              // Create root visual effect
              for(let i=0;i<6;i++){
                const angle=(i/6)*Math.PI*2;
                const rootX=e.x+Math.cos(angle)*20;
                const rootY=e.y+Math.sin(angle)*20;
                spawnParticles(rootX,rootY,4,'#8B4513',100,false,2);
              }
              
              spawnParticles(e.x,e.y,8,'#44aa44',120,false,4);
              spawnFloatText(e.x,e.y-30,'🌱 RAÍCES','#44aa44',14);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create root visual effect
        for(let i=0;i<20;i++){
          const angle=(i/20)*Math.PI*2;
          const x=player.x+Math.cos(angle)*rootRadius;
          const y=player.y+Math.sin(angle)*rootRadius;
          
          // Draw root lines from center to edge
          for(let j=0;j<8;j++){
            const t=j/8;
            const rootX=player.x+(x-player.x)*t;
            const rootY=player.y+(y-player.y)*t;
            spawnParticles(rootX,rootY,3,'#8B4513',80,false,2);
          }
        }
        
        // Create ground cracks
        for(let i=0;i<12;i++){
          const angle=Math.random()*Math.PI*2;
          const distance=Math.random()*rootRadius;
          const crackX=player.x+Math.cos(angle)*distance;
          const crackY=player.y+Math.sin(angle)*distance;
          spawnParticles(crackX,crackY,5,'#654321',60,false,2);
        }
        
        spawnFloatText(player.x,player.y-60,'🌱 RAÍCES DE LA TIERRA!','#44aa44',22);
        spawnParticles(player.x,player.y,35,'#44aa44',200,true,12);
        shakeAmt=5;
      }
      else if(h==='ranger'){
        // Lluvia de Flechas - Arrow rain from above
        const rainRadius=300;
        const arrowCount=20;
        const arrowDamage=player.bulletDmg*0.7;
        
        // Create arrow rain
        for(let i=0;i<arrowCount;i++){
          setTimeout(()=>{
            const angle=Math.random()*Math.PI*2;
            const distance=Math.random()*rainRadius;
            const arrowX=player.x+Math.cos(angle)*distance;
            const arrowY=player.y+Math.sin(angle)*distance;
            
            // Create falling arrow
            const arrow={
              x:arrowX,
              y:arrowY-200, // Start from above
              vx:0,
              vy:300, // Fall down
              owner:'player',
              damage:arrowDamage,
              color:'#00ccff',
              size:6,
              hitEnemies:new Set(),
              age:0,
              maxAge:2,
              piercing:true,
              isArrow:true,
              trail:[],
              isRain:true
            };
            bullets.push(arrow);
            
            // Visual falling effect
            for(let j=0;j<5;j++){
              const t=j/5;
              const x=arrowX;
              const y=arrowY-200+(200)*t;
              spawnParticles(x,y,2,'#00ccff',80,false,2);
            }
          },i*100); // Stagger arrows
        }
        
        // Create rain cloud effect
        for(let i=0;i<30;i++){
          const angle=Math.random()*Math.PI*2;
          const radius=Math.random()*rainRadius;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius-100;
          spawnParticles(x,y,3,'#cccccc',60,false,2);
        }
        
        // Ground impact preparation
        setTimeout(()=>{
          for(let i=0;i<arrowCount;i++){
            const angle=(i/arrowCount)*Math.PI*2;
            const distance=Math.random()*rainRadius;
            const impactX=player.x+Math.cos(angle)*distance;
            const impactY=player.y+Math.sin(angle)*distance;
            spawnParticles(impactX,impactY,5,'#8B7355',100,false,3);
          }
        },1500);
        
        spawnFloatText(player.x,player.y-60,'🏹 LLUVIA DE FLECHAS!','#00ccff',24);
        spawnParticles(player.x,player.y,30,'#00ccff',200,true,10);
        shakeAmt=8;
      }
      else if(h==='frost'){
        // Avalancha - Massive avalanche that crushes enemies
        const avalancheRadius=350;
        const waveCount=3;
        
        // Create avalanche waves
        for(let wave=0;wave<waveCount;wave++){
          setTimeout(()=>{
            const waveRadius=avalancheRadius*(wave+1)/waveCount;
            
            // Create ice wave
            for(let i=0;i<24;i++){
              const angle=(i/24)*Math.PI*2;
              const x=player.x+Math.cos(angle)*waveRadius;
              const y=player.y+Math.sin(angle)*waveRadius;
              
              // Create ice boulder
              const boulder={
                x:x,
                y:y,
                vx:Math.cos(angle)*200,
                vy:Math.sin(angle)*200,
                owner:'player',
                damage:player.bulletDmg*0.6,
                color:'#aaddff',
                size:8,
                hitEnemies:new Set(),
                age:0,
                maxAge:2,
                piercing:true,
                isIce:true,
                trail:[]
              };
              bullets.push(boulder);
              
              // Visual ice effect
              for(let j=0;j<6;j++){
                const t=j/6;
                const bx=player.x+(x-player.x)*t;
                const by=player.y+(y-player.y)*t;
                spawnParticles(bx,by,3,'#aaddff',100,false,2);
              }
            }
            
            // Apply crush damage to enemies in wave
            enemies.forEach(e=>{
              if(e.alive&&!e.isAlly){
                const dist=Math.hypot(e.x-player.x,e.y-player.y);
                if(dist<waveRadius+20){
                  // Crush damage
                  e.hp-=player.bulletDmg*0.4;
                  e.hitFlash=0.5;
                  e.frozen=true;
                  e.frozenTimer=1.5;
                  e.speed=0;
                  
                  // Create ice crystal effect
                  for(let j=0;j<10;j++){
                    const angle=(j/10)*Math.PI*2;
                    const crystalX=e.x+Math.cos(angle)*18;
                    const crystalY=e.y+Math.sin(angle)*18;
                    spawnParticles(crystalX,crystalY,4,'#aaddff',120,false,2);
                  }
                  
                  spawnParticles(e.x,e.y,8,'#aaddff',140,false,4);
                  spawnFloatText(e.x,e.y-30,'🏔️ APLASTADO!','#aaddff',16);
                  
                  if(e.hp<=0){
                    e.alive=false;
                    e.deathAnim=1;
                    score+=e.score;
                    document.getElementById('scoreDisplay').textContent=score;
                    spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                    spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                    updateEnemyCount();
                  }
                }
              }
            });
          },wave*300);
        }
        
        // Create snow storm effect
        for(let i=0;i<40;i++){
          const angle=Math.random()*Math.PI*2;
          const radius=Math.random()*avalancheRadius;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          spawnParticles(x,y,3,'#ffffff',80,false,2);
        }
        
        spawnFloatText(player.x,player.y-60,'🏔️ AVALANCHA!','#aaddff',26);
        spawnParticles(player.x,player.y,45,'#aaddff',280,true,15);
        shakeAmt=12;
      }
      else if(h==='blaze'){
        // Infierno - Hell field of lava and fire
        const infernoRadius=300;
        const lavaDuration=6;
        
        // Create inferno field
        player.infernoField={
          x:player.x,
          y:player.y,
          radius:infernoRadius,
          timer:lavaDuration,
          alive:true,
          damagePerSecond:player.bulletDmg*0.4
        };
        
        // Create lava pools
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2;
          const poolX=player.x+Math.cos(angle)*infernoRadius*0.6;
          const poolY=player.y+Math.sin(angle)*infernoRadius*0.6;
          
          // Visual lava pool
          for(let j=0;j<12;j++){
            const poolAngle=(j/12)*Math.PI*2;
            const radius=Math.random()*25;
            const x=poolX+Math.cos(poolAngle)*radius;
            const y=poolY+Math.sin(poolAngle)*radius;
            spawnParticles(x,y,5,'#ff4400',100,false,3);
          }
        }
        
        // Apply immediate hellfire damage
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-player.x,e.y-player.y);
            if(dist<infernoRadius){
              // Hellfire damage
              e.hp-=player.bulletDmg*1.2;
              e.hitFlash=0.8;
              e.burning=true;
              e.burningTimer=4;
              e.burningDamage=player.bulletDmg*0.2;
              e.slowed=true;
              e.slowedTimer=2;
              e.speed*=0.7;
              
              // Create hellfire effect
              for(let j=0;j<12;j++){
                const angle=(j/12)*Math.PI*2;
                const fireX=e.x+Math.cos(angle)*20;
                const fireY=e.y+Math.sin(angle)*20;
                spawnParticles(fireX,fireY,5,'#ff4400',140,false,3);
              }
              
              spawnParticles(e.x,e.y,12,'#ff8800',160,false,5);
              spawnFloatText(e.x,e.y-30,'🌋 INFIERNO!','#ff4400',18);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create fire pillars
        for(let i=0;i<6;i++){
          setTimeout(()=>{
            const angle=Math.random()*Math.PI*2;
            const radius=Math.random()*infernoRadius*0.8;
            const pillarX=player.x+Math.cos(angle)*radius;
            const pillarY=player.y+Math.sin(angle)*radius;
            
            // Create fire pillar
            for(let j=0;j<15;j++){
              const height=j*10;
              spawnParticles(pillarX,pillarY-height,4,'#ff4400',120,false,2);
            }
            
            // Damage enemies near pillar
            enemies.forEach(e=>{
              if(e.alive&&!e.isAlly){
                const dist=Math.hypot(e.x-pillarX,e.y-pillarY);
                if(dist<30){
                  e.hp-=player.bulletDmg*0.3;
                  e.hitFlash=0.4;
                  spawnParticles(e.x,e.y,6,'#ff4400',100,false,3);
                  
                  if(e.hp<=0){
                    e.alive=false;
                    e.deathAnim=1;
                    score+=e.score;
                    document.getElementById('scoreDisplay').textContent=score;
                    spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                    spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                    updateEnemyCount();
                  }
                }
              }
            });
          },i*400);
        }
        
        spawnFloatText(player.x,player.y-60,'🌋 INFIERNO!','#ff4400',28);
        spawnParticles(player.x,player.y,50,'#ff4400',300,true,18);
        shakeAmt=15;
      }
      else if(h==='techno'){
        // Sátase Láser - Orbital laser strike
        const laserCount=5;
        const laserDuration=6;
        
        // Create orbital laser field
        player.satelliteField={
          x:player.x,
          y:player.y,
          radius:400,
          timer:laserDuration,
          alive:true,
          laserCount:laserCount,
          nextLaserTime:0
        };
        
        // Create satellite visual effect
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2;
          const radius=player.satelliteField.radius*0.8;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          
          // Draw satellite
          for(let j=0;j<10;j++){
            const satAngle=(j/10)*Math.PI*2;
            const satRadius=15;
            const satX=x+Math.cos(satAngle)*satRadius;
            const satY=y+Math.sin(satAngle)*satRadius;
            spawnParticles(satX,satY,2,'#00ffff',80,false,2);
          }
        }
        
        // Schedule laser strikes
        for(let i=0;i<laserCount;i++){
          setTimeout(()=>{
            if(player.satelliteField && player.satelliteField.alive){
              // Random target position
              const angle=Math.random()*Math.PI*2;
              const radius=Math.random()*player.satelliteField.radius*0.7;
              const targetX=player.x+Math.cos(angle)*radius;
              const targetY=player.y+Math.sin(angle)*radius;
              
              // Create laser warning
              for(let j=0;j<12;j++){
                const warningAngle=(j/12)*Math.PI*2;
                const warningRadius=30;
                const x=targetX+Math.cos(warningAngle)*warningRadius;
                const y=targetY+Math.sin(warningAngle)*warningRadius;
                spawnParticles(x,y,3,'#ffff00',60,false,2);
              }
              
              // Fire laser after warning
              setTimeout(()=>{
                // Create laser beam from sky
                const laserStartY=targetY-300;
                
                // Laser beam visual
                for(let j=0;j<20;j++){
                  const t=j/20;
                  const x=targetX;
                  const y=laserStartY+(targetY-laserStartY)*t;
                  spawnParticles(x,y,4,'#ff0000',100,false,3);
                }
                
                // Create laser explosion
                for(let j=0;j<16;j++){
                  const explosionAngle=(j/16)*Math.PI*2;
                  const explosionRadius=40;
                  const x=targetX+Math.cos(explosionAngle)*explosionRadius;
                  const y=targetY+Math.sin(explosionAngle)*explosionRadius;
                  spawnParticles(x,y,5,'#ff6600',120,false,3);
                }
                
                // Damage enemies in laser area
                enemies.forEach(e=>{
                  if(e.alive&&!e.isAlly){
                    const dist=Math.hypot(e.x-targetX,e.y-targetY);
                    if(dist<50){
                      // Massive laser damage
                      e.hp-=player.bulletDmg*2;
                      e.hitFlash=0.8;
                      e.burning=true;
                      e.burningTimer=2;
                      e.burningDamage=player.bulletDmg*0.2;
                      
                      // Create laser burn effect
                      for(let k=0;k<10;k++){
                        const burnAngle=(k/10)*Math.PI*2;
                        const burnX=e.x+Math.cos(burnAngle)*18;
                        const burnY=e.y+Math.sin(burnAngle)*18;
                        spawnParticles(burnX,burnY,4,'#ff4400',130,false,3);
                      }
                      
                      spawnParticles(e.x,e.y,10,'#ff0000',150,false,5);
                      spawnFloatText(e.x,e.y-30,'🛰️ LÁSER!','#ff0000',18);
                      
                      if(e.hp<=0){
                        e.alive=false;
                        e.deathAnim=1;
                        score+=e.score;
                        document.getElementById('scoreDisplay').textContent=score;
                        spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                        spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                        updateEnemyCount();
                      }
                    }
                  }
                });
                
                // Screen shake
                shakeAmt=8;
              },500);
            }
          },i*800);
        }
        
        spawnFloatText(player.x,player.y-60,'🛰️ SÁTASE LÁSER!','#00ffff',28);
        spawnParticles(player.x,player.y,40,'#00ffff',250,true,15);
        shakeAmt=10;
      }
      else if(h==='techno'){
        // Sobrecarga - Technological explosion
        const overloadRadius=250;
        const shockwaveCount=3;
        
        // Create technological explosion
        for(let wave=0;wave<shockwaveCount;wave++){
          setTimeout(()=>{
            const waveRadius=overloadRadius*(wave+1)/shockwaveCount;
            
            // Create shockwave
            for(let i=0;i<20;i++){
              const angle=(i/20)*Math.PI*2;
              const x=player.x+Math.cos(angle)*waveRadius;
              const y=player.y+Math.sin(angle)*waveRadius;
              
              // Energy particles
              spawnParticles(x,y,4,'#00aaff',100,false,2);
            }
            
            // Apply damage to enemies in wave
            enemies.forEach(e=>{
              if(e.alive&&!e.isAlly){
                const dist=Math.hypot(e.x-player.x,e.y-player.y);
                if(dist<waveRadius+20){
                  // Overload damage
                  e.hp-=player.bulletDmg*(1.2-wave*0.2);
                  e.hitFlash=0.6;
                  e.disrupted=true;
                  e.disruptedTimer=2-wave*0.5;
                  e.speed*=0.6;
                  
                  // Create energy disruption effect
                  for(let j=0;j<8;j++){
                    const angle=(j/8)*Math.PI*2;
                    const energyX=e.x+Math.cos(angle)*15;
                    const energyY=e.y+Math.sin(angle)*15;
                    spawnParticles(energyX,energyY,3,'#00ffff',90,false,2);
                  }
                  
                  spawnParticles(e.x,e.y,8,'#00aaff',120,false,4);
                  spawnFloatText(e.x,e.y-30,'💥 SOBRECARGA!','#00aaff',16);
                  
                  if(e.hp<=0){
                    e.alive=false;
                    e.deathAnim=1;
                    score+=e.score;
                    document.getElementById('scoreDisplay').textContent=score;
                    spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                    spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                    updateEnemyCount();
                  }
                }
              }
            });
          },wave*200);
        }
        
        // Create core explosion
        for(let i=0;i<25;i++){
          const angle=(i/25)*Math.PI*2;
          const radius=Math.random()*40;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          spawnParticles(x,y,6,'#00ffff',140,false,3);
        }
        
        // Create energy field
        for(let i=0;i<30;i++){
          const angle=Math.random()*Math.PI*2;
          const radius=Math.random()*overloadRadius;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          spawnParticles(x,y,3,'#00ccff',80,false,2);
        }
        
        // Apply self-buff
        player.damageBoost=1.5;
        player.damageBoostTimer=4;
        player.speedBoost=1.3;
        player.speedBoostTimer=4;
        
        spawnFloatText(player.x,player.y-60,'💥 SOBRECARGA TECNOLÓGICA!','#00ffff',26);
        spawnParticles(player.x,player.y,45,'#00ffff',280,true,15);
        shakeAmt=12;
      }
      else if(h==='void'){
        // Colapso - Gravitational collapse that creates a black hole
        const collapseRadius=150;
        const collapseDuration=5;
        const maxPullStrength=500;
        
        // Create black hole
        player.blackHole={
          x:player.x,
          y:player.y,
          radius:collapseRadius,
          timer:collapseDuration,
          alive:true,
          maxPullStrength:maxPullStrength,
          currentPullStrength:0,
          growthRate:maxPullStrength/collapseDuration,
          stage:'forming',
          stageTimer:0,
          particles:[]
        };
        
        // Formation stage - create event horizon
        for(let i=0;i<20;i++){
          const angle=(i/20)*Math.PI*2;
          const radius=collapseRadius*0.8;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          
          // Create event horizon particles
          for(let j=0;j<8;j++){
            const particleAngle=(j/8)*Math.PI*2;
            const particleRadius=20;
            const px=x+Math.cos(particleAngle)*particleRadius;
            const py=y+Math.sin(particleAngle)*particleRadius;
            spawnParticles(px,py,3,'#1a1a1e',100,false,2);
          }
        }
        
        // Create singularity core
        for(let i=0;i<30;i++){
          const angle=Math.random()*Math.PI*2;
          const radius=Math.random()*20;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          spawnParticles(x,y,4,'#000000',120,false,3);
        }
        
        // Apply enhanced gravitational effects
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-player.x,e.y-player.y);
            if(dist<collapseRadius*1.5){
              // Enhanced gravitational pull with distance scaling
              const pullAngle=Math.atan2(player.y-e.y,player.x-e.x);
              const pullMultiplier=2.5-(dist/(collapseRadius*1.5))*1.5; // 2.5x at center to 1x at edge
              const pullForce=maxPullStrength*0.3*pullMultiplier;
              e.vx+=Math.cos(pullAngle)*pullForce;
              e.vy+=Math.sin(pullAngle)*pullForce;
              
              // Apply enhanced gravitational damage with stacking
              const damageMultiplier=2.0-(dist/(collapseRadius*1.5))*1.0; // 2x at center to 1x at edge
              e.hp-=player.bulletDmg*0.5*damageMultiplier;
              e.hitFlash=0.7;
              e.slowed=true;
              e.slowedTimer=4;
              e.speed*=0.3;
              e.distorted=true;
              e.distortedTimer=4;
              
              // Apply singularity corruption - permanent damage amplification
              if(!e.singularityCorrupted){
                e.singularityCorrupted=true;
                e.singularityCorruptedTimer=6;
                e.damageTakenMultiplier=1.5; // 50% more damage from all sources
                e.defenseReduction=0.4; // 60% less defense
                
                // Create corruption effect
                for(let j=0;j<8;j++){
                  const angle=(j/8)*Math.PI*2;
                  const x=e.x+Math.cos(angle)*20;
                  const y=e.y+Math.sin(angle)*20;
                  spawnParticles(x,y,3,'#8a8aae',100,false,2);
                }
                spawnFloatText(e.x,e.y-30,'⚫ CORRUPTO!','#8a8aae',12);
              }
              
              // Apply spacetime distortion - random teleportation
              if(Math.random()<0.6){
                const teleportAngle=Math.random()*Math.PI*2;
                const teleportDistance=40+Math.random()*30;
                e.x+=Math.cos(teleportAngle)*teleportDistance;
                e.y+=Math.sin(teleportAngle)*teleportDistance;
                
                // Create spacetime tear effect
                for(let j=0;j<6;j++){
                  const angle=(j/6)*Math.PI*2;
                  const tearX=e.x+Math.cos(angle)*15;
                  const tearY=e.y+Math.sin(angle)*15;
                  spawnParticles(tearX,tearY,2,'#1a1a1e',90,false,2);
                }
                spawnFloatText(e.x,e.y-30,'🌌 ESPACIOTIEMPO!','#1a1a1e',12);
              }
              
              // Apply gravitational crush - compression damage
              if(Math.random()<0.4){
                e.crushed=true;
                e.crushedTimer=2;
                e.radius*=0.8; // Shrink enemy
                e.speed*=0.5; // Additional slow
                
                // Create crush effect
                for(let j=0;j<8;j++){
                  const angle=(j/8)*Math.PI*2;
                  const x=e.x+Math.cos(angle)*10;
                  const y=e.y+Math.sin(angle)*10;
                  spawnParticles(x,y,3,'#2a2a4e',80,false,2);
                }
                spawnFloatText(e.x,e.y-30,'🔥 COMPRIMIDO!','#2a2a4e',12);
              }
              
              // Create enhanced gravitational distortion effect
              for(let j=0;j<15;j++){
                const angle=(j/15)*Math.PI*2+gameTime*2;
                const gravRadius=20+Math.sin(gameTime*3+j)*8;
                const gravX=e.x+Math.cos(angle)*gravRadius;
                const gravY=e.y+Math.sin(angle)*gravRadius;
                spawnParticles(gravX,gravY,3,'#2a2a4e',110,false,2);
              }
              
              // Create energy absorption effect
              for(let j=0;j<8;j++){
                const angle=(j/8)*Math.PI*2;
                const startX=e.x+Math.cos(angle)*25;
                const startY=e.y+Math.sin(angle)*25;
                const endX=player.x+Math.cos(angle)*8;
                const endY=player.y+Math.sin(angle)*8;
                
                // Draw energy absorption line
                for(let k=0;k<5;k++){
                  const t=k/5;
                  const x=startX+(endX-startX)*t;
                  const y=startY+(endY-startY)*t;
                  const alpha=1-t;
                  spawnParticles(x,y,2,'#4a4a8e',100*alpha,false,2);
                }
              }
              
              spawnParticles(e.x,e.y,10,'#1a1a3e',150,false,5);
              spawnFloatText(e.x,e.y-30,'⚫ COLAPSO!','#1a1a3e',18);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                
                // Enhanced death effect - complete dimensional collapse
                for(let j=0;j<25;j++){
                  const angle=(j/25)*Math.PI*2;
                  const radius=50*(j/25);
                  const x=e.x+Math.cos(angle)*radius;
                  const y=e.y+Math.sin(angle)*radius;
                  spawnParticles(x,y,6,'#2a2a4e',180,false,3);
                }
                
                // Create singularity implosion
                for(let j=0;j<20;j++){
                  const angle=(j/20)*Math.PI*2;
                  const implosionRadius=30*(1-j/20);
                  const x=e.x+Math.cos(angle)*implosionRadius;
                  const y=e.y+Math.sin(angle)*implosionRadius;
                  spawnParticles(x,y,4,'#000000',160,false,2);
                }
                
                // Create energy burst at black hole center
                for(let j=0;j<15;j++){
                  const angle=(j/15)*Math.PI*2;
                  const x=player.x+Math.cos(angle)*12;
                  const y=player.y+Math.sin(angle)*12;
                  spawnParticles(x,y,5,'#6a6aae',140,false,3);
                }
                
                // Create dimensional tear lines
                for(let j=0;j<6;j++){
                  const tearAngle=(j/6)*Math.PI*2;
                  const tearLength=60+Math.random()*20;
                  const tearX=e.x+Math.cos(tearAngle)*tearLength;
                  const tearY=e.y+Math.sin(tearAngle)*tearLength;
                  
                  // Draw tear line
                  for(let k=0;k<8;k++){
                    const t=k/8;
                    const x=e.x+(tearX-e.x)*t;
                    const y=e.y+(tearY-e.y)*t;
                    const alpha=1-t;
                    spawnParticles(x,y,3,'#1a1a1e',140*alpha,false,2);
                  }
                }
                
                spawnParticles(e.x,e.y,40,e.def.color,260,true,10);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',28);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create gravitational waves
        for(let wave=0;wave<3;wave++){
          setTimeout(()=>{
            if(player.blackHole && player.blackHole.alive){
              const waveRadius=collapseRadius*(1+wave*0.5);
              
              // Create wave ring
              for(let i=0;i<24;i++){
                const angle=(i/24)*Math.PI*2;
                const x=player.x+Math.cos(angle)*waveRadius;
                const y=player.y+Math.sin(angle)*waveRadius;
                spawnParticles(x,y,4,'#4a4a8e',80,false,2);
              }
              
              // Apply enhanced wave damage to enemies
              enemies.forEach(e=>{
                if(e.alive&&!e.isAlly){
                  const dist=Math.hypot(e.x-player.x,e.y-player.y);
                  if(Math.abs(dist-waveRadius)<20){
                    e.hp-=player.bulletDmg*0.4; // Increased from 0.3 to 0.4
                    e.hitFlash=0.5;
                    e.distorted=true;
                    e.distortedTimer=2;
                    e.slowed=true;
                    e.slowedTimer=1;
                    e.speed*=0.7;
                    
                    // Create wave distortion effect
                    for(let j=0;j<8;j++){
                      const angle=(j/8)*Math.PI*2;
                      const waveX=e.x+Math.cos(angle)*15;
                      const waveY=e.y+Math.sin(angle)*15;
                      spawnParticles(waveX,waveY,3,'#2a2a4e',100,false,3);
                    }
                    
                    spawnParticles(e.x,e.y,8,'#4a4a8e',120,false,4);
                    spawnFloatText(e.x,e.y-30,'🌊 ONDA!','#4a4a8e',16);
                    
                    if(e.hp<=0){
                      e.alive=false;
                      e.deathAnim=1;
                      score+=e.score;
                      document.getElementById('scoreDisplay').textContent=score;
                      spawnParticles(e.x,e.y,25,e.def.color,180,true,6);
                      spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',22);
                      updateEnemyCount();
                    }
                  }
                }
              });
            }
          },wave*800);
        }
        
        spawnFloatText(player.x,player.y-60,'⚫ COLAPSO GRAVITACIONAL!','#1a1a3e',28);
        spawnParticles(player.x,player.y,40,'#000000',250,true,15);
        shakeAmt=15;
      }
      else if(h==='sonic'){
        // Concierto Devastador - Devastating concert with multiple sound waves
        const concertRadius=250;
        const concertDuration=6;
        const waveCount=5;
        const maxDamage=player.bulletDmg*2;
        
        // Create concert field
        player.concertField={
          x:player.x,
          y:player.y,
          radius:concertRadius,
          timer:concertDuration,
          alive:true,
          maxDamage:maxDamage,
          currentWave:0,
          waveCount:waveCount,
          waveInterval:concertDuration/waveCount,
          nextWaveTime:0,
          particles:[]
        };
        
        // Create initial concert visual
        for(let i=0;i<30;i++){
          const angle=(i/30)*Math.PI*2;
          const radius=concertRadius*0.8;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          
          // Create musical note particles
          for(let j=0;j<3;j++){
            const noteAngle=(j/3)*Math.PI*2;
            const noteRadius=15;
            const nx=x+Math.cos(noteAngle)*noteRadius;
            const ny=y+Math.sin(noteAngle)*noteRadius;
            spawnParticles(nx,ny,4,'#00ffcc',120,false,2);
          }
        }
        
        // Create music notes
        const musicNotes=['🎵','🎶','🎼','🎤','🎸','🥁','🎹','🎺'];
        for(let i=0;i<16;i++){
          const angle=(i/16)*Math.PI*2;
          const radius=concertRadius*0.6;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          const note=musicNotes[Math.floor(Math.random()*musicNotes.length)];
          spawnFloatText(x,y,note,'#00ffaa',16);
        }
        
        // Apply immediate concert damage
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-player.x,e.y-player.y);
            if(dist<concertRadius){
              // Concert damage
              e.hp-=maxDamage*0.3;
              e.hitFlash=0.6;
              
              // Apply sound disruption
              e.vibrated=true;
              e.vibratedTimer=3;
              e.speed*=0.3;
              e.stunned=true;
              e.stunnedTimer=2;
              e.disoriented=true;
              e.disorientedTimer=3;
              e.shootRate*=3; // Much slower shooting
              
              // Apply sound corruption
              if(!e.soundCorrupted){
                e.soundCorrupted=true;
                e.soundCorruptedTimer=5;
                e.damageTakenMultiplier=1.4; // 40% more damage
                e.defenseReduction=0.3; // 30% less defense
              }
              
              // Create concert effect
              for(let j=0;j<12;j++){
                const angle=(j/12)*Math.PI*2;
                const concertX=e.x+Math.cos(angle)*20;
                const concertY=e.y+Math.sin(angle)*20;
                spawnParticles(concertX,concertY,4,'#00ffcc',110,false,2);
              }
              
              // Create musical notes around enemy
              for(let j=0;j<3;j++){
                const angle=(j/3)*Math.PI*2;
                const noteRadius=25;
                const nx=e.x+Math.cos(angle)*noteRadius;
                const ny=e.y+Math.sin(angle)*noteRadius;
                const note=musicNotes[Math.floor(Math.random()*musicNotes.length)];
                spawnFloatText(nx,ny,note,'#00ffaa',14);
              }
              
              spawnParticles(e.x,e.y,10,'#00ffaa',140,false,4);
              spawnFloatText(e.x,e.y-30,'🎸 CONCIERTO!','#00ffcc',18);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                
                // Enhanced death effect - musical explosion
                for(let j=0;j<20;j++){
                  const angle=(j/20)*Math.PI*2;
                  const radius=40*(j/20);
                  const x=e.x+Math.cos(angle)*radius;
                  const y=e.y+Math.sin(angle)*radius;
                  spawnParticles(x,y,6,'#00ffcc',160,false,3);
                }
                
                // Create musical notes at death
                for(let j=0;j<8;j++){
                  const angle=(j/8)*Math.PI*2;
                  const x=e.x+Math.cos(angle)*30;
                  const y=e.y+Math.sin(angle)*30;
                  const note=musicNotes[Math.floor(Math.random()*musicNotes.length)];
                  spawnFloatText(x,y,note,'#00ffaa',18);
                }
                
                spawnParticles(e.x,e.y,35,e.def.color,220,true,10);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',28);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create concert stage effect
        for(let i=0;i<40;i++){
          const angle=Math.random()*Math.PI*2;
          const radius=Math.random()*concertRadius;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          spawnParticles(x,y,3,'#00ffaa',90,false,2);
        }
        
        // Create speaker effects
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2;
          const radius=concertRadius*0.9;
          const x=player.x+Math.cos(angle)*radius;
          const y=player.y+Math.sin(angle)*radius;
          
          // Create speaker visual
          for(let j=0;j<6;j++){
            const speakerAngle=(j/6)*Math.PI*2;
            const speakerRadius=12;
            const sx=x+Math.cos(speakerAngle)*speakerRadius;
            const sy=y+Math.sin(speakerAngle)*speakerRadius;
            spawnParticles(sx,sy,3,'#00ffcc',100,false,2);
          }
          
          spawnFloatText(x,y,'🔊','#00ffaa',20);
        }
        
        spawnFloatText(player.x,player.y-60,'🎸 CONCIERTO DEVASTADOR!','#00ffcc',32);
        spawnParticles(player.x,player.y,50,'#00ffaa',300,true,20);
        shakeAmt=18;
      }
      sp.cd=specials.ultimate.maxCd;
    }
    else{player.vx=dx*700;player.vy=dy*700;player.invincible=0.3;spawnParticles(player.x,player.y,10,'#00ffcc',180,false,5);}
    dashCount++;
    updateAchievementProgress('dash_master',1);
    sp.cd=specials.dash.maxCd;
  }
  updateSpecialUI();
}

function updateSpecialUI(){
  ['shield','bomb','dash','ultimate'].forEach(t=>{
    const sp=specials[t],key={shield:'Shield',bomb:'Bomb',dash:'Dash',ultimate:'Ultimate'}[t];
    const btn=document.getElementById('btn'+key),cd=document.getElementById('cd'+key);
    if(btn && cd){
      if(sp.cd>0){btn.classList.add('cooldown');cd.style.display='block';cd.textContent=Math.ceil(sp.cd)+'s';}
      else{btn.classList.remove('cooldown');cd.style.display='none';}
    }
  });
}

// ── Particles ────────────────────────────
function spawnParticles(x,y,count,color,speed,gravity=true,size=4){
  for(let i=0;i<count;i++){const ang=Math.random()*Math.PI*2,spd=speed*(0.5+Math.random()*0.5);particles.push({x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:1,decay:1.5+Math.random()*2,color,size:size*(0.5+Math.random()*0.8),gravity:gravity?200:0});}
}
function spawnFloatText(x,y,text,color='#FFD700',size=18){
  floatingTexts.push({x,y,text,color,size,life:1,vy:-60,age:0});
}

// ── Collision ────────────────────────────
function moveEntity(ent,dx,dy){
  const r=ent.radius;let nx=ent.x+dx,ny=ent.y+dy;
  const{tx:a,ty:b}=worldToTile(nx-r,ent.y),{tx:c,ty:d}=worldToTile(nx+r,ent.y);
  const isFireWallA=fireWalls.some(fw=>fw.x===a&&fw.y===b&&fw.alive);
  const isFireWallC=fireWalls.some(fw=>fw.x===c&&fw.y===d&&fw.alive);
  if(isSolid(a,b)||isSolid(c,d)||isFireWallA||isFireWallC)nx=ent.x;
  const{tx:e,ty:f}=worldToTile(ent.x,ny-r),{tx:g,ty:h}=worldToTile(ent.x,ny+r);
  const isFireWallE=fireWalls.some(fw=>fw.x===e&&fw.y===f&&fw.alive);
  const isFireWallG=fireWalls.some(fw=>fw.x===g&&fw.y===h&&fw.alive);
  if(isSolid(e,f)||isSolid(g,h)||isFireWallE||isFireWallG)ny=ent.y;
  ent.x=nx;ent.y=ny;
}

// ── Drawing ───────────────────────────────
function drawCharacter(p, isEnemy=false) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const wc=p.walkCycle||0, bob=Math.sin(wc*8)*3, leg=Math.sin(wc*8)*12;
  const inBush=isInBush(p.x,p.y);
  let alpha = 1;
  if(inBush) alpha = p.isOpponent ? 0.35 : 0.4;
  if(p.hitFlash>0) alpha *= 0.7;
  if(p.invisible) alpha = inBush ? 0.1 : 0.25;
  ctx.globalAlpha = alpha;

  if(p.shieldActive){
    ctx.save();ctx.globalAlpha=alpha*0.4;
    ctx.beginPath();ctx.arc(0,0,34,0,Math.PI*2);
    const sg=ctx.createRadialGradient(0,0,20,0,0,34);
    sg.addColorStop(0,'rgba(100,150,255,0.4)');sg.addColorStop(1,'rgba(50,100,255,0.1)');
    ctx.fillStyle=sg;ctx.fill();ctx.strokeStyle='rgba(100,180,255,0.8)';ctx.lineWidth=3;ctx.stroke();ctx.restore();
  }

  ctx.save();ctx.globalAlpha=alpha*0.3;ctx.beginPath();ctx.ellipse(0,26,18,7,0,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();ctx.restore();

  // Legs
  ctx.save();ctx.translate(0,8);
  for(const[lx,lf] of [[-8,1],[8,-1]]){
    ctx.save();ctx.translate(lx,8);ctx.rotate(leg*0.06*lf);
    ctx.fillStyle=isEnemy?'#333':p.shirtColor||'#1a3a8a';
    if(!isEnemy)ctx.fillStyle='#1a3a8a';
    ctx.beginPath();ctx.roundRect(-5,0,10,14,3);ctx.fill();
    ctx.fillStyle='#333';ctx.beginPath();ctx.roundRect(-6,12,12,6,2);ctx.fill();
    ctx.restore();
  }ctx.restore();

  // Body
  ctx.fillStyle=p.shirtColor;ctx.beginPath();ctx.roundRect(-13,-8,26,20,5);ctx.fill();
  if(p.isOpponent){
    // Red trim for opponent
    ctx.strokeStyle='rgba(255,80,80,0.6)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-13,-8,26,20,5);ctx.stroke();
  }

  // Head
  ctx.save();ctx.translate(0,-14+bob*0.5);
  ctx.fillStyle=p.skinColor;ctx.beginPath();ctx.arc(0,-2,15,0,Math.PI*2);ctx.fill();
  const ex=Math.cos(p.angle)*3,ey=Math.sin(p.angle)*2;
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.ellipse(-5+ex,-4+ey,4,4,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(5+ex,-4+ey,4,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=p.isOpponent?'#ff2200':'#1a1a3a';
  ctx.beginPath();ctx.ellipse(-5+ex*1.3,-4+ey*1.3,2.5,2.5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(5+ex*1.3,-4+ey*1.3,2.5,2.5,0,0,Math.PI*2);ctx.fill();
  // Hat
  ctx.fillStyle=p.hatColor;
  ctx.beginPath();ctx.ellipse(0,-14,17,6,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.roundRect(-10,-28,20,16,4);ctx.fill();
  if(p.isOpponent){ctx.fillStyle='#ff4444';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('👾',0,-18);}
  else{ctx.fillStyle='#fff';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('★',0,-18);}
  ctx.restore();

  // Gun
  ctx.save();ctx.rotate(p.angle);ctx.translate(16,2);
  ctx.fillStyle='#2a2a2a';ctx.beginPath();ctx.roundRect(0,-4,22,8,3);ctx.fill();
  ctx.fillStyle=p.bulletColor||'#00ccff';ctx.beginPath();ctx.arc(22,0,3,0,Math.PI*2);ctx.fill();
  ctx.restore();

  // HP bar
  if(p.hp<p.maxHp){
    const hpPct=p.hp/p.maxHp;
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.beginPath();ctx.roundRect(-22,28,44,6,3);ctx.fill();
    ctx.fillStyle=p.isOpponent?'#ff4444':hpPct>0.5?'#00ff88':hpPct>0.25?'#ffaa00':'#ff3355';
    ctx.beginPath();ctx.roundRect(-22,28,44*hpPct,6,3);ctx.fill();
  }

  // Name tag (in multi)
  if(gameMode==='multi'){
    const nm = p.isOpponent ? opponentName : (document.getElementById('playerName')?.value||'Tú');
    ctx.save();ctx.globalAlpha=0.85;
    ctx.fillStyle=p.isOpponent?'#ff6666':'#00ffcc';
    ctx.font='bold 11px Arial';ctx.textAlign='center';
    ctx.fillText(nm,0,-42);ctx.restore();
  }

  if(inBush&&!p.isOpponent){
    ctx.save();ctx.globalAlpha=0.85;ctx.fillStyle='#00ff88';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('🍃 OCULTO',0,-42);ctx.restore();
  }
  ctx.restore();
}

function drawCoins(){
  coinsOnGround.forEach(c=>{
    if(!c.alive)return;
    const bob=Math.sin(c.bobOffset)*3;
    ctx.save();
    ctx.translate(c.x,c.y+bob);
    ctx.fillStyle='#FFD700';
    ctx.beginPath();
    ctx.arc(0,0,8,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#FFAA00';
    ctx.beginPath();
    ctx.arc(0,0,5,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#FFD700';
    ctx.font='bold 10px Arial';
    ctx.textAlign='center';
    ctx.fillText('💰',0,4);
    ctx.restore();
  });
}

function drawEnemy(e){
  if(!e.alive){if(e.deathAnim>0)drawDeathExplosion(e);return;}
  ctx.save();ctx.translate(e.x,e.y);
  const def=e.def,sc=def.size,wc=e.walkCycle,bob=Math.sin(wc*8)*2,leg=Math.sin(wc*8)*10;
  ctx.scale(sc,sc);
  if(e.hitFlash>0)ctx.globalAlpha=0.7+Math.sin(e.hitFlash*30)*0.3;
  if(e.phased){ctx.globalAlpha*=0.5;ctx.strokeStyle='#4a4a8e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.stroke();}
  if(e.frozen){ctx.globalAlpha*=0.7;ctx.fillStyle='#00ffff';ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();}
  if(e.invisible){ctx.globalAlpha*=0.3;ctx.strokeStyle='#2a2a2a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.stroke();}
  if(e.shieldActive){ctx.strokeStyle='#88ff00';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=0.3;ctx.fillStyle='#88ff00';ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
  if(def.name==='BOSS'){const g=ctx.createRadialGradient(0,0,20,0,0,60);g.addColorStop(0,'rgba(255,0,100,0.3)');g.addColorStop(1,'rgba(255,0,100,0)');ctx.save();ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,60,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.save();ctx.globalAlpha=0.25;ctx.beginPath();ctx.ellipse(0,26,18,7,0,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();ctx.restore();
  ctx.save();ctx.translate(0,8);
  for(const[lx,lf] of [[-8,1],[8,-1]]){ctx.save();ctx.translate(lx,8);ctx.rotate(leg*0.05*lf);ctx.fillStyle='#333';ctx.beginPath();ctx.roundRect(-4,0,9,13,3);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.roundRect(-5,11,10,5,2);ctx.fill();ctx.restore();}
  ctx.restore();
  ctx.fillStyle=def.shirtColor;ctx.beginPath();ctx.roundRect(-12,-8,24,18,4);ctx.fill();
  ctx.save();ctx.translate(0,-14+bob*0.5);
  ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(0,-1,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=def.helmetColor;ctx.beginPath();ctx.arc(0,-4,15,Math.PI,0);ctx.fill();
  const ex=Math.cos(e.angle)*3,ey=Math.sin(e.angle)*2;
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-4+ex,-3+ey,4,3,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(4+ex,-3+ey,4,3,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ff2200';ctx.beginPath();ctx.ellipse(-4+ex*1.2,-3+ey*1.2,2.5,2.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(4+ex*1.2,-3+ey*1.2,2.5,2.5,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  ctx.save();ctx.rotate(e.angle);ctx.translate(14,2);ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.roundRect(0,-3,def.name==='BOSS'?28:18,7,2);ctx.fill();ctx.fillStyle=def.bulletColor;ctx.beginPath();ctx.arc(def.name==='BOSS'?26:16,0,3,0,Math.PI*2);ctx.fill();ctx.restore();
  const hp=e.hp/e.maxHp,bw=def.name==='BOSS'?80:40;
  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(-bw/2,32,bw,7,3);ctx.fill();
  ctx.fillStyle=hp>0.5?'#ff4444':hp>0.25?'#ffaa00':'#ff0000';ctx.beginPath();ctx.roundRect(-bw/2,32,bw*hp,7,3);ctx.fill();
  if(def.name==='BOSS'){ctx.fillStyle='#fff';ctx.font='bold 13px Arial Black';ctx.textAlign='center';ctx.fillText('⚡ BOSS ⚡',0,50);}
  ctx.restore();
}

function drawDeathExplosion(e){
  const t=e.deathAnim;if(t<=0)return;
  ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=t;
  const r=50*(1-t),g=ctx.createRadialGradient(0,0,0,0,0,r);
  g.addColorStop(0,'rgba(255,200,0,0.8)');g.addColorStop(0.5,'rgba(255,80,0,0.5)');g.addColorStop(1,'rgba(255,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawTile(tx,ty,t,cfg){
  const wx=tx*TILE,wy=ty*TILE,s=TILE;ctx.save();
  if(t===0){
    const even=(tx+ty)%2===0;
    const colors={desert:even?'#c8844a':'#d4956e',forest:even?'#5a8a3a':'#6aa04a',volcano:even?'#7a2000':'#9a3000',ice:even?'#a8d8f0':'#b8e8ff',city:even?'#2a2a3e':'#1e1e2e',boss:even?'#2e002e':'#3e103e',swamp:even?'#2a4a2a':'#3a5a3a',sky:even?'#1a2a4a':'#2a3a5a',factory:even?'#3a3a3a':'#4a4a4a',chaos:even?'#4a0a4a':'#5a1a5a',crypt:even?'#1a0020':'#2a0040',storm:even?'#001030':'#002060',nexus:even?'#200040':'400080',crystal:even?'#004060':'#0080a0',inferno:even?'#4a0000':'8a0000',void:even?'#000000':'1a1a2e',gravity:even?'#1a1a3a':'2a2a5a',mirror:even?'#4a4a6a':'5a5a8a',freeze:even?'#004466':'006688'};
    ctx.fillStyle=colors[cfg.theme]||'#c8844a';ctx.fillRect(wx,wy,s,s);
  } else if(t===1){
    const wc={desert:'#8b5e3c',forest:'#3a5a2a',volcano:'#3a1000',ice:'#4a7a9e',city:'#0a0a1e',boss:'#1a001a',swamp:'#1a3a1a',sky:'#0a1a3a',factory:'#2a2a2a',chaos:'#2a0a2a',crypt:'#0a0010',storm:'#000820',nexus:'#100020',crystal:'#002040',inferno:'#2a0000',void:'#0a0a1a',gravity:'#0a0a2a',mirror:'#2a2a4a',freeze:'#002244',spy:'#1a1a2e'};
    ctx.fillStyle=wc[cfg.theme]||'#8b5e3c';ctx.fillRect(wx,wy,s,s);
    ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(wx,wy,s,8);ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(wx,wy+s-6,s,6);
  } else if(t===2){
    ctx.fillStyle=cfg.theme==='desert'?'#8aaa4a':cfg.theme==='ice'?'#6090c0':cfg.theme==='swamp'?'#4a8a4a':'#4a7a2a';ctx.fillRect(wx,wy,s,s);
    const bc=cfg.theme==='desert'?['#aacc55','#88aa33']:cfg.theme==='ice'?['#80b0e0','#60a0d0']:cfg.theme==='swamp'?['#66cc66','#44aa44']:['#66aa33','#44882a'];
    [[0.3,0.4,13],[0.7,0.5,12],[0.5,0.3,14],[0.2,0.65,11],[0.75,0.7,11]].forEach(([bx,by,br],i)=>{ctx.fillStyle=bc[i%2];ctx.beginPath();ctx.arc(wx+s*bx,wy+s*by,br,0,Math.PI*2);ctx.fill();});
  } else if(t===6){
    if(cfg.theme==='volcano'){
      const g=ctx.createLinearGradient(wx,wy,wx,wy+s);g.addColorStop(0,'#ff4400');g.addColorStop(1,'#cc2200');ctx.fillStyle=g;ctx.fillRect(wx,wy,s,s);
      ctx.globalAlpha=0.5+Math.sin(gameTime*3+tx+ty)*0.3;ctx.fillStyle='#ff8800';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,8,0,Math.PI*2);ctx.fill();
    } else if(cfg.theme==='ocean'){
      const g=ctx.createLinearGradient(wx,wy,wx,wy+s);g.addColorStop(0,'#0066cc');g.addColorStop(1,'#004499');ctx.fillStyle=g;ctx.fillRect(wx,wy,s,s);
      ctx.globalAlpha=0.4+Math.sin(gameTime*4+tx+ty)*0.3;ctx.fillStyle='#00aaff';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,10,0,Math.PI*2);ctx.fill();
    } else if(cfg.theme==='dungeon'){
      const g=ctx.createLinearGradient(wx,wy,wx,wy+s);g.addColorStop(0,'#4a3a2a');g.addColorStop(1,'#3a2a1a');ctx.fillStyle=g;ctx.fillRect(wx,wy,s,s);
      ctx.globalAlpha=0.3+Math.sin(gameTime*3+tx+ty)*0.2;ctx.fillStyle='#6a5a4a';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,8,0,Math.PI*2);ctx.fill();
    } else {ctx.fillStyle='#88ccee';ctx.fillRect(wx,wy,s,s);}
  } else if(t===7){
    // Poison pool
    ctx.fillStyle='#006600';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.6+Math.sin(gameTime*4+tx+ty)*0.3;ctx.fillStyle='#00ff00';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,20,0,Math.PI*2);ctx.fill();
  } else if(t===8){
    // Wind tile
    ctx.fillStyle='#4488ff';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.4+Math.sin(gameTime*5+tx+ty)*0.2;ctx.fillStyle='#aaddff';
    ctx.beginPath();ctx.moveTo(wx+s*0.2,wy+s*0.8);ctx.lineTo(wx+s*0.5,wy+s*0.2);ctx.lineTo(wx+s*0.8,wy+s*0.8);ctx.fill();
  } else if(t===9){
    // Conveyor belt
    ctx.fillStyle='#555555';ctx.fillRect(wx,wy,s,s);
    ctx.strokeStyle='#888888';ctx.lineWidth=3;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(wx,wy+s*0.25+i*s*0.25);ctx.lineTo(wx+s,wy+s*0.25+i*s*0.25);ctx.stroke();}
  } else if(t===10||t===11){
    // Teleporter
    ctx.fillStyle='#aa00aa';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.5+Math.sin(gameTime*6+tx+ty)*0.4;ctx.fillStyle='#ff00ff';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,25,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('🌀',wx+s*0.5,wy+s*0.6);
  } else if(t===12){
    // Darkness tile
    ctx.fillStyle='#1a0020';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.7+Math.sin(gameTime*7+tx+ty)*0.2;ctx.fillStyle='#440044';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,15,0,Math.PI*2);ctx.fill();
  } else if(t===25){
    // Damage boost tile
    ctx.fillStyle='#ffcc00';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.6+Math.sin(gameTime*8+tx+ty)*0.4;ctx.fillStyle='#ff8800';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('⚡',wx+s*0.5,wy+s*0.6);
  } else if(t===26){
    // Enemy turret
    ctx.fillStyle='#666666';ctx.fillRect(wx,wy,s,s);
    ctx.fillStyle='#888888';ctx.fillRect(wx+2,wy+2,s-4,s-4);
    ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,8,0,Math.PI*2);ctx.fill();
  } else if(t===27){
    // Laser ray
    ctx.fillStyle='#ff0000';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.8+Math.sin(gameTime*10+tx+ty)*0.2;ctx.fillStyle='#ff6600';ctx.fillRect(wx+2,wy+2,s-4,s-4);
  } else if(t===28){
    // Thunder power tile
    ctx.fillStyle='#001030';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.6+Math.sin(gameTime*12)*0.4;ctx.fillStyle='#00aaff';ctx.beginPath();ctx.moveTo(wx+s*0.5,wy+s*0.1);ctx.lineTo(wx+s*0.3,wy+s*0.5);ctx.lineTo(wx+s*0.7,wy+s*0.5);ctx.lineTo(wx+s*0.5,wy+s*0.9);ctx.fill();
    ctx.globalAlpha=0.8+Math.sin(gameTime*8)*0.2;ctx.strokeStyle='#00ffff';ctx.lineWidth=3;ctx.strokeRect(wx+1,wy+1,s-2,s-2);
    ctx.fillStyle='#fff';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('⚡',wx+s*0.5,wy+s*0.6);
  } else if(t===29){
    // Quantum shift tile
    ctx.fillStyle='#220044';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.7+Math.sin(gameTime*15+tx+ty)*0.3;ctx.fillStyle='#ff00ff';ctx.beginPath();ctx.moveTo(wx+s*0.2,wy+s*0.2);ctx.lineTo(wx+s*0.8,wy+s*0.5);ctx.lineTo(wx+s*0.2,wy+s*0.8);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText('⚛',wx+s*0.5,wy+s*0.6);
  } else if(t===30){
    // Magnetic storm tile
    ctx.fillStyle='#001144';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.6+Math.sin(gameTime*12+tx+ty)*0.4;ctx.fillStyle='#6666ff';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#aaaaff';ctx.lineWidth=2;
    for(let i=0;i<4;i++){
      const angle=(gameTime*3+i*Math.PI/2)%(Math.PI*2);
      ctx.beginPath();ctx.moveTo(wx+s*0.5,wy+s*0.5);ctx.lineTo(wx+s*0.5+Math.cos(angle)*15,wy+s*0.5+Math.sin(angle)*15);ctx.stroke();
    }
  } else if(t===13){
    // Lightning tile
    ctx.fillStyle='#001030';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.4+Math.sin(gameTime*8+tx+ty)*0.5;ctx.fillStyle='#00aaff';ctx.beginPath();ctx.moveTo(wx+s*0.5,wy+s*0.1);ctx.lineTo(wx+s*0.3,wy+s*0.5);ctx.lineTo(wx+s*0.7,wy+s*0.5);ctx.lineTo(wx+s*0.5,wy+s*0.9);ctx.fill();
  } else if(t===14){
    // Time tile
    ctx.fillStyle='#200040';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.3+Math.sin(gameTime*3+tx+ty)*0.3;ctx.fillStyle='#800080';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('⏰',wx+s*0.5,wy+s*0.6);
  } else if(t===15){
    // Crystal tile
    ctx.fillStyle='#004060';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.4+Math.sin(gameTime*4+tx+ty)*0.4;ctx.fillStyle='#00ffff';ctx.beginPath();ctx.moveTo(wx+s*0.5,wy+s*0.1);ctx.lineTo(wx+s*0.9,wy+s*0.5);ctx.lineTo(wx+s*0.5,wy+s*0.9);ctx.lineTo(wx+s*0.1,wy+s*0.5);ctx.fill();
  } else if(t===16){
    // Inferno tile
    ctx.fillStyle='#4a0000';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.5+Math.sin(gameTime*6+tx+ty)*0.4;ctx.fillStyle='#ff4400';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,20,0,Math.PI*2);ctx.fill();
  } else if(t===17){
    // Void tile
    ctx.fillStyle='#000000';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.3+Math.sin(gameTime*2+tx+ty)*0.3;ctx.fillStyle='#1a1a2e';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,22,0,Math.PI*2);ctx.fill();
  } else if(t===18){
    // Gravity tile
    ctx.fillStyle='#1a1a3a';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.4+Math.sin(gameTime*3+tx+ty)*0.3;ctx.fillStyle='#6666ff';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('⬇',wx+s*0.5,wy+s*0.6);
  } else if(t===19){
    // Mirror tile
    ctx.fillStyle='#4a4a6a';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.3+Math.sin(gameTime*4+tx+ty)*0.4;ctx.fillStyle='#8888aa';ctx.beginPath();ctx.moveTo(wx+s*0.2,wy+s*0.2);ctx.lineTo(wx+s*0.8,wy+s*0.8);ctx.moveTo(wx+s*0.8,wy+s*0.2);ctx.lineTo(wx+s*0.2,wy+s*0.8);ctx.stroke();
  } else if(t===20){
    // Freeze tile
    ctx.fillStyle='#004466';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.4+Math.sin(gameTime*2+tx+ty)*0.5;ctx.fillStyle='#88ccff';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('❄',wx+s*0.5,wy+s*0.6);
  } else if(t===21){
    // Magnetic tile
    ctx.fillStyle='#2a1a4a';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.4+Math.sin(gameTime*3+tx+ty)*0.4;ctx.fillStyle='#8844ff';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,20,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#aa66ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx+s*0.2,wy+s*0.5);ctx.lineTo(wx+s*0.8,wy+s*0.5);ctx.moveTo(wx+s*0.5,wy+s*0.2);ctx.lineTo(wx+s*0.5,wy+s*0.8);ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('🧲',wx+s*0.5,wy+s*0.6);
  } else if(t===22){
    // Chaos tile
    ctx.fillStyle='#4a2a4a';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.5+Math.sin(gameTime*5+tx+ty)*0.4;ctx.fillStyle='#ff00ff';ctx.beginPath();ctx.moveTo(wx+s*0.3,wy+s*0.2);ctx.lineTo(wx+s*0.7,wy+s*0.5);ctx.lineTo(wx+s*0.3,wy+s*0.8);ctx.lineTo(wx+s*0.7,wy+s*0.2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('🌀',wx+s*0.5,wy+s*0.6);
  } else if(t===23){
    // Water lake tile
    ctx.fillStyle='#0066aa';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.6+Math.sin(gameTime*3+tx+ty)*0.3;ctx.fillStyle='#00aaff';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('🌊',wx+s*0.5,wy+s*0.6);
  } else if(t===24){
    // Spike block tile
    ctx.fillStyle='#666666';ctx.fillRect(wx,wy,s,s);
    ctx.strokeStyle='#888888';ctx.lineWidth=2;ctx.strokeRect(wx+2,wy+2,s-4,s-4);
    ctx.fillStyle='#ff4444';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('🔺',wx+s*0.5,wy+s*0.6);
  } else if(t===25){
    // Heal tile
    ctx.fillStyle='#006600';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.5+Math.sin(gameTime*4+tx+ty)*0.4;ctx.fillStyle='#00ff00';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('💚',wx+s*0.5,wy+s*0.6);
  } else if(t===26){
    // Explosive trap tile
    ctx.fillStyle='#663300';ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.5+Math.sin(gameTime*5+tx+ty)*0.4;ctx.fillStyle='#ff6600';ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText('💥',wx+s*0.5,wy+s*0.6);
  }
  ctx.restore();
}

function drawDestructible(d){
  if(!d.alive)return;
  ctx.save();ctx.translate(d.x+d.shakeX,d.y);
  const hp=d.hp/d.maxHp;
  ctx.save();ctx.globalAlpha=0.25;ctx.beginPath();ctx.ellipse(0,22,18,6,0,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();ctx.restore();
  if(d.type==='barrel'){ctx.fillStyle=hp>0.5?'#8B6914':'#4b2904';ctx.beginPath();ctx.roundRect(-14,-22,28,44,8);ctx.fill();ctx.strokeStyle='#4a3a0a';ctx.lineWidth=4;[-8,0,8].forEach(y=>{ctx.beginPath();ctx.moveTo(-14,y);ctx.lineTo(14,y);ctx.stroke();});ctx.fillStyle='rgba(255,0,0,0.7)';ctx.font='14px Arial';ctx.textAlign='center';ctx.fillText('☠',0,4);}
  else if(d.type==='crate'){ctx.fillStyle=hp>0.5?'#cc9944':'#884400';ctx.beginPath();ctx.roundRect(-18,-18,36,36,4);ctx.fill();ctx.strokeStyle='#886622';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(18,0);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(0,18);ctx.stroke();ctx.fillStyle='rgba(255,220,0,0.6)';ctx.font='14px Arial';ctx.textAlign='center';ctx.fillText('★',0,5);}
  else if(d.type==='spike_block'){ctx.fillStyle=hp>0.5?'#888888':'#555555';ctx.beginPath();ctx.roundRect(-18,-18,36,36,4);ctx.fill();ctx.strokeStyle='#666666';ctx.lineWidth=3;ctx.strokeRect(-18,-18,36,36);ctx.fillStyle='#ff4444';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('🔺',0,5);}
  else{ctx.fillStyle=hp>0.5?'#888':'#444';ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(20,-10);ctx.lineTo(18,18);ctx.lineTo(-18,18);ctx.lineTo(-20,-10);ctx.closePath();ctx.fill();}
  if(hp<0.7){ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(5,10);ctx.stroke();}
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.beginPath();ctx.roundRect(-16,26,32,5,2);ctx.fill();
  ctx.fillStyle=hp>0.5?'#ffaa00':'#ff4400';ctx.beginPath();ctx.roundRect(-16,26,32*hp,5,2);ctx.fill();
  ctx.restore();
}

function drawBomb(b){
  if(!b.alive)return;
  ctx.save();ctx.translate(b.x,b.y);
  if(b.isMine){
    ctx.fillStyle=b.armed>0?'#446633':'#88ff44';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=b.armed>0?'#223311':'#44ff22';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText('⚡',0,4);
  } else {
    const pulse=1+Math.sin(gameTime*20)*0.15;ctx.scale(pulse,pulse);
    ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff6600';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#ff6600';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('💣',0,5);
  }
  ctx.restore();
}

function drawBullet(b){
  ctx.save();
  b.trail.forEach((t,i)=>{ctx.globalAlpha=(i/b.trail.length)*0.4;ctx.fillStyle=b.color;const s=b.size*(i/b.trail.length)*0.7;ctx.beginPath();ctx.arc(t.x,t.y,s,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=0.3;ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.size*2,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.size*0.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawMap(){
  const cfg=mapConfig;
  const bgColors={desert:'#d4956e',forest:'#6aa04a',volcano:'#6a1800',ice:'#a8d8f0',city:'#1a1a2e',boss:'#1a001a',crypt:'#1a0020',storm:'#001030',nexus:'#200040',crystal:'#004060',inferno:'#4a0000',void:'#000000',gravity:'#1a1a3a',mirror:'#4a4a6a',freeze:'#004466',magnetic:'#2a1a4a',chaos:'#4a2a4a',ocean:'#004488',dungeon:'#4a2a2a',spy:'#1a1a2e'};
  ctx.fillStyle=bgColors[cfg.theme]||'#c8844a';ctx.fillRect(0,0,mapW*TILE,mapH*TILE);
  for(let y=0;y<mapH;y++)for(let x=0;x<mapW;x++)drawTile(x,y,tileMap[y][x],cfg);
  destructibles.forEach(d=>drawDestructible(d));
  // Draw fire walls
  fireWalls.forEach(fw=>{
    if(!fw.alive)return;
    const wx=fw.x*TILE,wy=fw.y*TILE,s=TILE;
    ctx.save();
    ctx.globalAlpha=0.7+Math.sin(gameTime*8)*0.2;
    const g=ctx.createLinearGradient(wx,wy,wx,wy+s);
    g.addColorStop(0,'#ff4400');g.addColorStop(0.5,'#ff8800');g.addColorStop(1,'#ff4400');
    ctx.fillStyle=g;ctx.fillRect(wx,wy,s,s);
    ctx.globalAlpha=0.5+Math.sin(gameTime*12)*0.3;
    ctx.fillStyle='#ffaa00';
    ctx.beginPath();ctx.arc(wx+s*0.5,wy+s*0.5,15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('🔥',wx+s*0.5,wy+s*0.6);
    ctx.restore();
  });
  // Draw remote charges
  if(player&&player.remoteCharges){
    player.remoteCharges.forEach(c=>{
      if(!c.alive)return;
      ctx.save();
      ctx.globalAlpha=0.9+Math.sin(gameTime*8)*0.1;
      ctx.fillStyle='#ff4400';
      ctx.beginPath();ctx.arc(c.x-cam.x,c.y-cam.y,18,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#ff0000';ctx.lineWidth=3;ctx.stroke();
      // Pulsing ring
      ctx.globalAlpha=0.5+Math.sin(gameTime*12)*0.3;
      ctx.strokeStyle='#ff8800';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(c.x-cam.x,c.y-cam.y,24+Math.sin(gameTime*10)*4,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText('💣',c.x-cam.x,c.y-cam.y+6);
      ctx.restore();
    });
  }
  // Draw clone (poisonous pineapple)
  if(player&&player.clone&&player.clone.alive){
    ctx.save();
    ctx.translate(player.clone.x-cam.x,player.clone.y-cam.y);
    ctx.globalAlpha=0.6+Math.sin(gameTime*5)*0.2;
    ctx.fillStyle='#ffcc00';
    ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#ff8800';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('🍍',0,6);
    // Poison aura
    ctx.globalAlpha=0.3+Math.sin(gameTime*8)*0.2;
    ctx.fillStyle='#00ff00';
    ctx.beginPath();ctx.arc(0,0,35,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  // Draw ally drones
  enemies.forEach(e=>{
    if(e.isAlly&&e.alive){
      ctx.save();
      ctx.translate(e.x-cam.x,e.y-cam.y);
      ctx.fillStyle='#00ffff';
      ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#0088ff';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText('🤖',0,4);
      ctx.restore();
    }
  });
  // Draw meteors
  meteors.forEach(m=>{
    if(!m.alive)return;
    ctx.save();
    ctx.translate(m.x-cam.x,m.y-cam.y);
    ctx.fillStyle='#ff4400';
    ctx.beginPath();ctx.arc(0,0,m.radius,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#ff8800';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#ffcc00';ctx.font='bold 24px Arial';ctx.textAlign='center';ctx.fillText('☄️',0,8);
    // Trail
    ctx.globalAlpha=0.5;
    ctx.fillStyle='#ff6600';
    ctx.beginPath();ctx.moveTo(0,-m.radius);ctx.lineTo(-15,-m.radius-40);ctx.lineTo(15,-m.radius-40);ctx.closePath();ctx.fill();
    ctx.restore();
  });
  // Draw block walls
  blockWalls.forEach(w=>{
    if(!w.alive)return;
    ctx.save();
    ctx.translate(w.x*TILE-cam.x,w.y*TILE-cam.y);
    ctx.fillStyle='#000000';
    ctx.fillRect(0,0,TILE,TILE);
    ctx.strokeStyle='#333333';ctx.lineWidth=3;ctx.strokeRect(0,0,TILE,TILE);
    ctx.restore();
  });
  // Draw traps
  traps.forEach(t=>{
    if(!t.alive)return;
    ctx.save();
    ctx.translate(t.x-cam.x,t.y-cam.y);
    ctx.fillStyle=t.color;
    ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('🪤',0,5);
    ctx.restore();
  });
  // Laser rays are now drawn as tiles, no need for separate drawing
}

function drawBushesOverlay(){
  bushTiles.forEach(b=>{
    if(tileMap[b.ty]&&tileMap[b.ty][b.tx]===2){
      const wx=b.tx*TILE,wy=b.ty*TILE,s=TILE;
      ctx.save();ctx.globalAlpha=0.65;
      const cfg=mapConfig,bc=cfg.theme==='desert'?['#aacc55','#88aa33']:cfg.theme==='ice'?['#80b0e0','#60a0d0']:['#66aa33','#44882a'];
      [[0.3,0.4,14],[0.7,0.5,13],[0.5,0.3,15],[0.2,0.65,12],[0.75,0.7,12]].forEach(([bx,by,br],i)=>{ctx.fillStyle=bc[i%2];ctx.beginPath();ctx.arc(wx+s*bx,wy+s*by,br,0,Math.PI*2);ctx.fill();});
      ctx.restore();
    }
  });
}

function drawParticles(){particles.forEach(p=>{ctx.save();ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore();});}
function drawFloatTexts(){floatingTexts.forEach(ft=>{ctx.save();ctx.globalAlpha=ft.life;ctx.fillStyle=ft.color;ctx.font=`bold ${ft.size}px Arial Black`;ctx.textAlign='center';ctx.strokeStyle='rgba(0,0,0,0.8)';ctx.lineWidth=3;ctx.strokeText(ft.text,ft.x,ft.y);ctx.fillText(ft.text,ft.x,ft.y);ctx.restore();});}

function drawMinimap(){
  mmCtx.clearRect(0,0,minimapCanvas.width,minimapCanvas.height);
  mmCtx.fillStyle='rgba(0,0,0,0.7)';mmCtx.fillRect(0,0,minimapCanvas.width,minimapCanvas.height);
  const sx=minimapCanvas.width/mapW,sy=minimapCanvas.height/mapH;
  for(let y=0;y<mapH;y++)for(let x=0;x<mapW;x++){const t=tileMap[y][x];if(t===1){mmCtx.fillStyle='#555';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===2){mmCtx.fillStyle='#3a6';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===3||t===4||t===5){mmCtx.fillStyle='#884';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===12){mmCtx.fillStyle='#440044';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===13){mmCtx.fillStyle='#004488';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===14){mmCtx.fillStyle='#800080';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===15){mmCtx.fillStyle='#0080a0';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===16){mmCtx.fillStyle='#8a0000';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===17){mmCtx.fillStyle='#1a1a2e';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===18){mmCtx.fillStyle='#2a2a5a';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===19){mmCtx.fillStyle='#5a5a8a';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===20){mmCtx.fillStyle='#006688';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===23){mmCtx.fillStyle='#0066aa';mmCtx.fillRect(x*sx,y*sy,sx,sy);}else if(t===24){mmCtx.fillStyle='#666666';mmCtx.fillRect(x*sx,y*sy,sx,sy);}}
  enemies.filter(e=>e.alive&&!e.isAlly).forEach(e=>{mmCtx.fillStyle=e.def.color;mmCtx.beginPath();mmCtx.arc(e.x/TILE*sx,e.y/TILE*sy,3,0,Math.PI*2);mmCtx.fill();});
  enemies.filter(e=>e.isAlly&&e.alive).forEach(e=>{mmCtx.fillStyle='#00ffff';mmCtx.beginPath();mmCtx.arc(e.x/TILE*sx,e.y/TILE*sy,3,0,Math.PI*2);mmCtx.fill();});
  if(player&&player.alive){mmCtx.fillStyle='#00ccff';mmCtx.beginPath();mmCtx.arc(player.x/TILE*sx,player.y/TILE*sy,4,0,Math.PI*2);mmCtx.fill();mmCtx.strokeStyle='#fff';mmCtx.lineWidth=1;mmCtx.stroke();}
  if(player.clone&&player.clone.alive){mmCtx.fillStyle='#ffcc00';mmCtx.beginPath();mmCtx.arc(player.clone.x/TILE*sx,player.clone.y/TILE*sy,3,0,Math.PI*2);mmCtx.fill();}
  if(opponent&&opponent.alive&&gameMode==='multi'){mmCtx.fillStyle='#ff4444';mmCtx.beginPath();mmCtx.arc(opponent.x/TILE*sx,opponent.y/TILE*sy,4,0,Math.PI*2);mmCtx.fill();}
}

// ── AI ─────────────────────────────────
function updateEnemy(e,dt){
  if(!e.alive||!player||!player.alive)return;
  e.walkCycle+=dt;e.shootCooldown-=dt;e.stateTimer-=dt;if(e.hitFlash>0)e.hitFlash-=dt*5;
  if(e.frozen){e.frozenTimer-=dt;if(e.frozenTimer<=0)e.frozen=false;else return;}
  
  // Handle slowed timer from rayo ability
  if(e.slowed){
    e.slowedTimer-=dt;
    if(e.slowedTimer<=0){
      e.slowed=false;
      e.speed*=2; // Restore original speed
      spawnFloatText(e.x,e.y-30,'⚡ VELOCIDAD RESTAURADA','#00aaff',12);
    }
  }
  
  // Handle shock damage from rayo ability
  if(e.shockTimer>0){
    e.shockTimer-=dt;
    e.lastShockTime+=dt;
    
    // Shock every second for more impactful damage
    if(e.lastShockTime>=e.shockInterval){
      e.lastShockTime=0;
      const shockDmg=100; // Increased damage for more impact
      e.hp-=shockDmg;
      spawnParticles(e.x,e.y,8,'#00aaff',120,false,4);
      spawnFloatText(e.x,e.y-30,'⚡ '+shockDmg,'#00aaff',14);
      
      // Stronger visual feedback
      spawnParticles(e.x,e.y,12,'#ffffff',100,false,3);
      
      if(e.hp<=0){
        e.alive=false;
        e.deathAnim=1;
        score+=e.score;
        spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
        spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
        updateEnemyCount();
      }
    }
  }
  // Target nearest player (including opponent in multi, and clone if exists)
  // Allies target enemies instead
  let target=player;
  if(e.isAlly){
    // Find nearest enemy
    let nearestEnemy=null;
    let nearestDist=Infinity;
    enemies.forEach(en=>{
      if(en.alive&&!en.isAlly){
        const d=Math.hypot(en.x-e.x,en.y-e.y);
        if(d<nearestDist){nearestDist=d;nearestEnemy=en;}
      }
    });
    if(nearestEnemy)target=nearestEnemy;
  }
  else{
    if(player.clone&&player.clone.alive){
      const dp=Math.hypot(player.x-e.x,player.y-e.y),dc=Math.hypot(player.clone.x-e.x,player.clone.y-e.y);
      if(dc<dp)target=player.clone;
    }
    if(gameMode==='multi'&&opponent&&opponent.alive){
      const dp=Math.hypot(player.x-e.x,player.y-e.y),do_=Math.hypot(opponent.x-e.x,opponent.y-e.y);
      if(do_<dp)target=opponent;
    }
  }
  const dx=target.x-e.x,dy=target.y-e.y,dist=Math.hypot(dx,dy);
  e.angle=Math.atan2(dy,dx);
  // Boss phase transitions for level 16 (Supreme Boss)
  if(e.def.name==='BOSS'&&currentLevel===16){
    if(e.hp<e.maxHp*0.75&&e.bossPhase===1){
      e.bossPhase=2;e.speed*=1.2;e.shootRate*=0.8;
      spawnParticles(e.x,e.y,20,'#ff6600',200,true,8);
      spawnFloatText(e.x,e.y-60,'⚡ FASE 2','#ff6600',28);
    }
    if(e.hp<e.maxHp*0.5&&e.bossPhase===2){
      e.bossPhase=3;e.speed*=1.3;e.shootRate*=0.7;
      spawnParticles(e.x,e.y,25,'#ff00ff',200,true,8);
      spawnFloatText(e.x,e.y-60,'🌀 FASE 3','#ff00ff',28);
    }
    if(e.hp<e.maxHp*0.25&&e.bossPhase===3){
      e.bossPhase=4;e.speed*=1.5;e.shootRate*=0.5;
      spawnParticles(e.x,e.y,30,'#ff0000',250,true,10);
      spawnFloatText(e.x,e.y-60,'💀 FASE FINAL','#ff0000',32);
      shakeAmt=15;
    }
  }
  // Boss phase transitions for level 23 (Rey del Fuego - unique stages)
  else if(e.def.name==='BOSS'&&currentLevel===23){
    if(e.hp<e.maxHp*0.7&&e.bossPhase===1){
      e.bossPhase=2;e.speed*=1.5;e.shootRate*=0.6;e.damage*=1.3;
      spawnParticles(e.x,e.y,30,'#ff4400',250,true,10);
      spawnFloatText(e.x,e.y-60,'🔥 FASE ÍGNEA','#ff4400',30);
      shakeAmt=8;
      // Spawn fire walkers
      for(let i=0;i<2;i++){
        const angle=(i/2)*Math.PI*2;
        enemies.push({
          x:e.x+Math.cos(angle)*100,y:e.y+Math.sin(angle)*100,
          def:ENEMY_TYPES.fire_walker,hp:ENEMY_TYPES.fire_walker.hp,maxHp:ENEMY_TYPES.fire_walker.hp,
          speed:ENEMY_TYPES.fire_walker.speed,damage:ENEMY_TYPES.fire_walker.damage,radius:ENEMY_TYPES.fire_walker.radius,
          shootRate:ENEMY_TYPES.fire_walker.shootRate,color:ENEMY_TYPES.fire_walker.color,helmetColor:ENEMY_TYPES.fire_walker.helmetColor,
          shirtColor:ENEMY_TYPES.fire_walker.shirtColor,range:ENEMY_TYPES.fire_walker.range,score:ENEMY_TYPES.fire_walker.score,
          size:ENEMY_TYPES.fire_walker.size,bulletColor:ENEMY_TYPES.fire_walker.bulletColor,bulletSize:ENEMY_TYPES.fire_walker.bulletSize,
          pattern:ENEMY_TYPES.fire_walker.pattern,fireCircle:true,alive:true,walkCycle:0,shootCooldown:0,stateTimer:0,hitFlash:0,frozen:false,bossPhase:1
        });
      }
    }
    if(e.hp<e.maxHp*0.4&&e.bossPhase===2){
      e.bossPhase=3;e.speed*=0.7;e.shootRate*=0.4;e.damage*=1.8;
      spawnParticles(e.x,e.y,35,'#ff8800',300,true,12);
      spawnFloatText(e.x,e.y-60,'💥 FASE EXPLOSIVA','#ff8800',32);
      shakeAmt=12;
      // Create explosive mines around boss
      for(let i=0;i<4;i++){
        const angle=(i/4)*Math.PI*2;
        bombs.push({
          x:e.x+Math.cos(angle)*150,y:e.y+Math.sin(angle)*150,
          radius:80,damage:player.bulletDmg*2,color:'#ff4400',
          isMine:true,timer:3,armed:0.5,alive:true,owner:'enemy'
        });
      }
    }
    if(e.hp<e.maxHp*0.15&&e.bossPhase===3){
      e.bossPhase=4;e.speed*=2.0;e.shootRate*=0.3;e.damage*=2.0;
      spawnParticles(e.x,e.y,40,'#ff0000',350,true,15);
      spawnFloatText(e.x,e.y-70,'☠️ FASE FINAL: FUEGO ETERNO','#ff0000',36);
      shakeAmt=20;
      // Spawn hammers
      for(let i=0;i<2;i++){
        const angle=(i/2)*Math.PI*2+Math.PI/4;
        enemies.push({
          x:e.x+Math.cos(angle)*120,y:e.y+Math.sin(angle)*120,
          def:ENEMY_TYPES.hammer,hp:ENEMY_TYPES.hammer.hp,maxHp:ENEMY_TYPES.hammer.hp,
          speed:ENEMY_TYPES.hammer.speed,damage:ENEMY_TYPES.hammer.damage,radius:ENEMY_TYPES.hammer.radius,
          shootRate:ENEMY_TYPES.hammer.shootRate,color:ENEMY_TYPES.hammer.color,helmetColor:ENEMY_TYPES.hammer.helmetColor,
          shirtColor:ENEMY_TYPES.hammer.shirtColor,range:ENEMY_TYPES.hammer.range,score:ENEMY_TYPES.hammer.score,
          size:ENEMY_TYPES.hammer.size,bulletColor:ENEMY_TYPES.hammer.bulletColor,bulletSize:ENEMY_TYPES.hammer.bulletSize,
          pattern:ENEMY_TYPES.hammer.pattern,hammerSlam:true,alive:true,walkCycle:0,shootCooldown:0,stateTimer:0,hitFlash:0,frozen:false,bossPhase:1,hammerTimer:0,meleeTimer:0,glitchTimer:0,gravityTimer:0,mimicTimer:0
        });
      }
    }
  }
  else if(e.def.name==='BOSS'&&e.hp<e.maxHp*0.4&&e.bossPhase===1){
    e.bossPhase=2;e.speed*=1.4;e.shootRate*=0.6;spawnParticles(e.x,e.y,20,'#ff00ff',200,true,8);spawnFloatText(e.x,e.y-60,'¡FURIA!','#ff00ff',28);
  }
  const canSee=canEnemySeeThroughBush(e,target.x,target.y);
  let mx=0,my=0;
  if(e.def.pattern==='chase'){
    if(e.confused){
      e.confusedTimer-=dt;
      if(e.confusedTimer<=0)e.confused=false;
      mx=Math.cos(e.patrolAngle)*e.speed*1.2;
      my=Math.sin(e.patrolAngle)*e.speed*1.2;
    }
    else if(dist>e.radius+30&&canSee){
      mx=dx/dist*e.speed;
      my=dy/dist*e.speed;
    }
    else if(!canSee){
      e.patrolAngle+=dt*1.5;
      mx=Math.cos(e.patrolAngle)*e.speed*0.5;
      my=Math.sin(e.patrolAngle)*e.speed*0.5;
    }
  }
  else if(e.def.pattern==='strafe'){
    if(e.strafeTimer<=0){
      e.strafeDir*=-1;
      e.strafeTimer=1.5+Math.random();
    }
    e.strafeTimer-=dt;
    if(!canSee){
      e.patrolAngle+=dt;
      mx=Math.cos(e.patrolAngle)*e.speed*0.4;
      my=Math.sin(e.patrolAngle)*e.speed*0.4;
    }
    else if(dist>200){
      mx=dx/dist*e.speed;
      my=dy/dist*e.speed;
    }
    else if(dist<120){
      mx=-dx/dist*e.speed*0.5;
      my=-dy/dist*e.speed*0.5;
    }
    else{
      const p={x:-dy/dist,y:dx/dist};
      mx=p.x*e.speed*e.strafeDir;
      my=p.y*e.speed*e.strafeDir;
    }
  }
  else if(e.def.pattern==='retreat'){
    if(!canSee){
      e.patrolAngle+=dt*0.8;
      mx=Math.cos(e.patrolAngle)*e.speed*0.3;
      my=Math.sin(e.patrolAngle)*e.speed*0.3;
    }
    else if(dist<250){
      mx=-dx/dist*e.speed;
      my=-dy/dist*e.speed;
    }
    else{
      const p={x:-dy/dist,y:dx/dist};
      mx=p.x*e.speed*0.7;
      my=p.y*e.speed*0.7;
    }
  }
  else if(e.def.pattern==='boss'){
    if(e.bossPhase===1){
      if(dist>e.radius+50&&canSee){
        mx=dx/dist*e.speed;
        my=dy/dist*e.speed;
      }
    }
    else{
      const p={x:-dy/dist,y:dx/dist};
      mx=dx/dist*e.speed*0.6+p.x*e.speed*0.8;
      my=dy/dist*e.speed*0.6+p.y*e.speed*0.8;
    }
  }
  else if(e.def.pattern==='void_lord'){
    // Void Lord multi-phase behavior
    if(!e.phase)e.phase=1;
    if(!e.phaseTimer)e.phaseTimer=0;
    
    e.phaseTimer+=dt;
    
    // Phase transitions
    if(e.phase===1&&e.hp<e.maxHp*0.7){
      e.phase=2;
      e.phaseTimer=0;
      spawnParticles(e.x,e.y,50,'#4a4a8e',300,true,12);
      spawnFloatText(e.x,e.y-80,'🌌 FASE 2: REALIDAD DISTORSIONADA','#4a4a8e',32);
      shakeAmt=15;
    }
    if(e.phase===2&&e.hp<e.maxHp*0.3){
      e.phase=3;
      e.phaseTimer=0;
      spawnParticles(e.x,e.y,60,'#1a1a2e',350,true,15);
      spawnFloatText(e.x,e.y-80,'👑 FASE 3: VACÍO ABSOLUTO','#1a1a2e',36);
      shakeAmt=20;
    }
    
    if(e.phase===1){
      // Phase 1: Standard movement with void portals
      if(dist>e.radius+60&&canSee){
        mx=dx/dist*e.speed;
        my=dy/dist*e.speed;
      }
      // Create void portals periodically
      if(e.phaseTimer>4){
        e.phaseTimer=0;
        const portalX=e.x+Math.random()*200-100;
        const portalY=e.y+Math.random()*200-100;
        spawnParticles(portalX,portalY,20,'#4a4a8e',150,false,8);
        spawnFloatText(portalX,portalY-30,'🌀 PORTAL','#4a4a8e',16);
      }
    }
    else if(e.phase===2){
      // Phase 2: Teleportation and reality distortion
      if(e.phaseTimer>3){
        e.phaseTimer=0;
        // Teleport near player
        const teleportDist=200;
        const angle=Math.random()*Math.PI*2;
        const targetX=player.x+Math.cos(angle)*teleportDist;
        const targetY=player.y+Math.sin(angle)*teleportDist;
        spawnParticles(e.x,e.y,30,'#4a4a8e',200,true,10);
        e.x=targetX;
        e.y=targetY;
        spawnParticles(e.x,e.y,30,'#4a4a8e',200,true,10);
        spawnFloatText(e.x,e.y-60,'🌌 TELEPORT','#4a4a8e',20);
        shakeAmt=8;
      }
      // Erratic movement
      if(dist>e.radius+80){
        mx=dx/dist*e.speed*1.2;
        my=dy/dist*e.speed*1.2;
      }
    }
    else if(e.phase===3){
      // Phase 3: Aggressive pursuit with void explosion
      if(dist>e.radius+100){
        mx=dx/dist*e.speed*1.5;
        my=dy/dist*e.speed*1.5;
      }
      // Void explosion every 2 seconds
      if(e.phaseTimer>2){
        e.phaseTimer=0;
        spawnParticles(e.x,e.y,40,'#1a1a2e',250,true,12);
        spawnFloatText(e.x,e.y-80,'💥 EXPLOSIÓN DE VACÍO','#1a1a2e',24);
        shakeAmt=12;
        // Damage player if close
        if(dist<200){
          damagePlayer(500);
          spawnFloatText(player.x,player.y-40,'-500','#ff0000',18);
        }
      }
    }
  }
  else if(e.def.pattern==='reflect'){
    if(dist>150&&canSee){
      mx=dx/dist*e.speed*0.8;
      my=dy/dist*e.speed*0.8;
    }
    else if(dist<100){
      mx=-dx/dist*e.speed*0.6;
      my=-dy/dist*e.speed*0.6;
    }
    else{
      const p={x:-dy/dist,y:dx/dist};
      mx=p.x*e.speed*0.9;
      my=p.y*e.speed*0.9;
    }
  }
  else if(e.def.pattern==='phase'){
    if(e.phaseTimer<=0){
      e.phased=!e.phased;
      e.phaseTimer=2+Math.random();
    }
    e.phaseTimer-=dt;
    if(!e.phased){
      if(dist>e.radius+30&&canSee){
        mx=dx/dist*e.speed;
        my=dy/dist*e.speed;
      }
    }
    else{
      e.patrolAngle+=dt*2;
      mx=Math.cos(e.patrolAngle)*e.speed*1.2;
      my=Math.sin(e.patrolAngle)*e.speed*1.2;
    }
  }
  moveEntity(e,mx*dt,my*dt);
  // Temporal enemy ability: slow player when near
  if(e.def.timeSlow&&dist<200&&canSee){
    player.speed=player.heroDef.speed*0.5;
    if(Math.random()<0.02)spawnFloatText(player.x,player.y-30,'⏱ LENTO','#800080',14);
  }
  // Guardian enemy: dynamic shield
  if(e.def.dynamicShield){
    e.shieldTimer-=dt;
    if(e.shieldTimer<=0){
      e.shieldActive=!e.shieldActive;
      e.shieldTimer=4+Math.random()*3;
      if(e.shieldActive){
        spawnFloatText(e.x,e.y-40,'🛡️ ESCUDO','#88ff00',16);
        spawnParticles(e.x,e.y,10,'#88ff00',100,false,4);
      }
    }
  }
  // Hive enemy: spawn drones
  if(e.def.droneSpawner){
    e.droneSpawnTimer-=dt;
    if(e.droneSpawnTimer<=0&&enemies.filter(en=>en.droneOwner===e).length<2){
      e.droneSpawnTimer=5+Math.random()*2;
      const droneDef={name:'Drone',hp:300,speed:200,damage:100,radius:12,shootRate:1.5,color:'#ffcc00',helmetColor:'#886600',shirtColor:'#cc8800',range:250,score:0,size:0.6,bulletColor:'#ffaa00',bulletSize:5,pattern:'chase'};
      const angleOffset=(Math.random()-0.5)*Math.PI;
      enemies.push({
        x:e.x+Math.cos(e.angle+angleOffset)*50,y:e.y+Math.sin(e.angle+angleOffset)*50,
        vx:0,vy:0,hp:droneDef.hp,maxHp:droneDef.hp,radius:droneDef.radius,speed:droneDef.speed,
        damage:droneDef.damage,range:droneDef.range,shootRate:droneDef.shootRate,shootCooldown:Math.random(),
        def:droneDef,alive:true,angle:e.angle,walkCycle:0,hitFlash:0,deathAnim:0,stateTimer:0,
        state:'chase',patrolAngle:Math.random()*Math.PI*2,strafeDir:1,strafeTimer:2,score:0,
        bossPhase:1,phased:false,phaseTimer:2,frozen:false,frozenTimer:0,shieldActive:false,shieldTimer:0,
        droneOwner:e,isDrone:true
      });
      spawnFloatText(e.x,e.y-30,'🐝 DRONE','#ffcc00',14);
      spawnParticles(e.x,e.y,8,'#ffcc00',80,false,3);
    }
  }
  // Ghost timer - disappears after 10 seconds
  if(e.isGhost){
    e.ghostTimer-=dt;
    if(e.ghostTimer<=0){
      e.alive=false;
      spawnParticles(e.x,e.y,15,'#cccccc',120,false,5);
      spawnFloatText(e.x,e.y-40,'👻 DESVANECER','#cccccc',16);
    }
  }
  // Fire walker enemy: damages player when close with fire circle
  if(e.def.fireCircle&&dist<120&&canSee){
    if(Math.random()<0.05){
      damagePlayer(150);
      spawnFloatText(player.x,player.y-30,'🔥 FUEGO','#ff4400',14);
      spawnParticles(player.x,player.y,5,'#ff4400',80,false,3);
    }
  }
  // Hammer enemy: slam attack when close
  if(e.def.hammerSlam&&dist<150&&canSee){
    e.hammerTimer=(e.hammerTimer||0)+dt;
    if(e.hammerTimer>3){
      e.hammerTimer=0;
      // Slam attack
      if(Math.hypot(e.x-player.x,e.y-player.y)<120){
        damagePlayer(e.damage);
        shakeAmt=10;
        spawnParticles(player.x,player.y,20,'#ffaa00',180,true,7);
        spawnFloatText(player.x,player.y-60,'¡GOLPE MARTILLO!','#ffaa00',22);
      }
    }
  }
  // Melee-only enemy: direct contact damage
  if(e.def.meleeOnly&&dist<80&&canSee){
    e.meleeTimer=(e.meleeTimer||0)+dt;
    if(e.meleeTimer>1.5){
      e.meleeTimer=0;
      // Melee attack
      if(Math.hypot(e.x-player.x,e.y-player.y)<60){
        damagePlayer(e.damage);
        shakeAmt=8;
        spawnParticles(player.x,player.y,15,'#ff4444',150,true,6);
        spawnFloatText(player.x,player.y-50,'¡ATAQUE MELEE!','#ff4444',20);
      }
    }
  }
  // Glitch enemy: random teleportation
  if(e.def.teleportRandom){
    e.glitchTimer=(e.glitchTimer||0)+dt;
    if(e.glitchTimer>2){
      e.glitchTimer=0;
      // Random teleport
      const newX=2+Math.random()*(mapW-4);
      const newY=2+Math.random()*(mapH-4);
      if(tileMap[Math.floor(newY/TILE)]&&tileMap[Math.floor(newY/TILE)][Math.floor(newX/TILE)]===0){
        spawnParticles(e.x,e.y,20,'#ff00ff',180,false,8);
        e.x=newX*TILE+TILE/2;
        e.y=newY*TILE+TILE/2;
        spawnParticles(e.x,e.y,20,'#ff00ff',180,false,8);
        spawnFloatText(e.x,e.y-40,'¡GLITCH TELEPORT!','#ff00ff',18);
      }
    }
  }
  // Gravity Well enemy: pulls player and enemies
  if(e.def.gravityPull){
    e.gravityTimer=(e.gravityTimer||0)+dt;
    if(e.gravityTimer>0.5){
      e.gravityTimer=0;
      // Pull nearby entities
      enemies.forEach(other=>{
        if(other!==e&&other.alive){
          const dx=e.x-other.x, dy=e.y-other.y, dist=Math.hypot(dx,dy);
          if(dist<200 && dist>50){
            const force=150/(dist*dist);
            other.vx-=dx/dist*force*dt;
            other.vy-=dy/dist*force*dt;
          }
        }
      });
      // Pull player
      if(player&&player.alive){
        const dx=e.x-player.x, dy=e.y-player.y, dist=Math.hypot(dx,dy);
        if(dist<250 && dist>60){
          const force=200/(dist*dist);
          player.vx+=dx/dist*force*dt;
          player.vy+=dy/dist*force*dt;
        }
      }
      // Visual effect
      if(Math.random()<0.1){
        spawnParticles(e.x+Math.random()*60-30,e.y+Math.random()*60-30,3,'#6666ff',120,false,4);
      }
    }
  }
  // Mimic enemy: copies selected hero appearance
  if(e.def.copyPlayer){
    e.mimicTimer=(e.mimicTimer||0)+dt;
    if(e.mimicTimer>3){
      e.mimicTimer=0;
      // Copy selected hero appearance
      const heroDef=HERO_DEFS.find(h=>h.id===selectedHeroId);
      if(heroDef){
        e.color=heroDef.color;
        e.helmetColor=heroDef.hatColor;
        e.shirtColor=heroDef.shirtColor;
        e.size=heroDef.size||1.0;
        spawnParticles(e.x,e.y,15,'#888888',150,false,6);
        spawnFloatText(e.x,e.y-40,'¡MÍMICO!','#888888',18);
      }
    }
  }
  // Spy enemy: invisibility
  if(e.def.invisible){
    e.invisibleTimer=(e.invisibleTimer||0)+dt;
    if(e.invisibleTimer>4){
      e.invisibleTimer=0;
      e.invisible=!e.invisible;
      if(e.invisible){
        spawnParticles(e.x,e.y,15,'#2a2a2a',120,false,5);
      }else{
        spawnParticles(e.x,e.y,15,'#444444',120,false,5);
      }
    }
  }
  // Void Lord special abilities
  if(e.def.voidAbilities){
    if(e.phase===1){
      // Phase 1: Void bullet spread
      if(e.shootCooldown<=0){
        e.shootCooldown=e.def.shootRate;
        const bulletCount=5;
        for(let i=0;i<bulletCount;i++){
          const angle=e.angle+(i-bulletCount/2)*0.3;
          fireBulletEnemy(e.x,e.y,Math.cos(angle)*400,Math.sin(angle)*400,e.def.damage*0.6,e.def.bulletColor,e.def.bulletSize,{startX:e.x,startY:e.y});
        }
        spawnParticles(e.x,e.y,15,e.def.bulletColor,150,false,6);
      }
    }
    else if(e.phase===2){
      // Phase 2: Homing void missiles
      if(e.shootCooldown<=0){
        e.shootCooldown=e.def.shootRate*1.5;
        if(player&&player.alive){
          const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);
          fireBulletEnemy(e.x,e.y,(dx/d)*500,(dy/d)*500,e.def.damage*0.8,'#4a4a8e',e.def.bulletSize+4,{startX:e.x,startY:e.y});
          spawnParticles(e.x,e.y,20,'#4a4a8e',180,false,8);
        }
      }
    }
    else if(e.phase===3){
      // Phase 3: Rapid fire void barrage
      if(e.shootCooldown<=0){
        e.shootCooldown=e.def.shootRate*0.5;
        const angles=[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5];
        angles.forEach(angle=>{
          fireBulletEnemy(e.x,e.y,Math.cos(e.angle+angle)*600,Math.sin(e.angle+angle)*600,e.def.damage*0.4,'#1a1a2e',e.def.bulletSize);
        });
        spawnParticles(e.x,e.y,25,'#1a1a2e',200,true,10);
      }
    }
  }
  // Healer enemy: heals nearby enemies
  if(e.def.healsNearby){
    e.healTimer=(e.healTimer||0)+dt;
    if(e.healTimer>2){
      e.healTimer=0;
      const healRadius=200;
      const healAmount=150;
      enemies.forEach(other=>{
        if(other.alive&&other!==e&&!other.isAlly&&Math.hypot(other.x-e.x,other.y-e.y)<healRadius){
          other.hp=Math.min(other.maxHp,other.hp+healAmount);
          spawnParticles(other.x,other.y,10,'#00ff00',100,false,4);
          spawnFloatText(other.x,other.y-30,'+'+healAmount,'#00ff00',14);
        }
      });
      spawnParticles(e.x,e.y,15,'#00ff00',120,false,5);
      spawnFloatText(e.x,e.y-50,'💚 CURACIÓN','#00ff00',18);
    }
  }
  // Passive healer enemy: heals itself over time
  if(e.def.passiveHeal){
    e.passiveHealTimer=(e.passiveHealTimer||0)+dt;
    if(e.passiveHealTimer>1){
      e.passiveHealTimer=0;
      const healAmount=50;
      if(e.hp<e.maxHp){
        e.hp=Math.min(e.maxHp,e.hp+healAmount);
        spawnParticles(e.x,e.y,8,'#44ff44',80,false,3);
        if(Math.random()<0.3)spawnFloatText(e.x,e.y-30,'+'+healAmount,'#44ff44',12);
      }
    }
  }
  if(dist<e.range&&e.shootCooldown<=0&&canSee&&!target.invisible){
    const bspd=BULLET_SPEED*0.85;
    if(e.def.name==='BOSS'){
      if(currentLevel===16){
        // Level 16 Supreme Boss - multiple phase attacks
        if(e.bossPhase===1){
          // Phase 1: Single shot
          const sp=(Math.random()-0.5)*0.1,ang=e.angle+sp;
          fireBulletEnemy(e.x+Math.cos(ang)*30,e.y+Math.sin(ang)*30,Math.cos(ang)*bspd,Math.sin(ang)*bspd,e.def.damage,e.def.bulletColor,e.def.bulletSize);
        }
        else if(e.bossPhase===2){
          // Phase 2: Triple spread
          for(let s=-1;s<=1;s++){const ang=e.angle+s*0.3;fireBulletEnemy(e.x+Math.cos(ang)*30,e.y+Math.sin(ang)*30,Math.cos(ang)*bspd,Math.sin(ang)*bspd,e.def.damage*0.8,e.def.bulletColor,e.def.bulletSize);}
        }
        else if(e.bossPhase===3){
          // Phase 3: Spiral attack
          for(let i=0;i<8;i++){const ang=e.angle+(i-4)*0.4;fireBulletEnemy(e.x+Math.cos(ang)*30,e.y+Math.sin(ang)*30,Math.cos(ang)*bspd*0.9,Math.sin(ang)*bspd*0.9,e.def.damage*0.6,e.def.bulletColor,e.def.bulletSize);}
        }
        else if(e.bossPhase===4){
          // Phase 4: Desperation - omnidirectional burst
          for(let i=0;i<12;i++){const ang=(i/12)*Math.PI*2;fireBulletEnemy(e.x+Math.cos(ang)*30,e.y+Math.sin(ang)*30,Math.cos(ang)*bspd*0.8,Math.sin(ang)*bspd*0.8,e.def.damage*0.5,e.def.bulletColor,e.def.bulletSize);}
          shakeAmt=5;
        }
      }
      else if(e.bossPhase===2){
        // Regular boss phase 2: 5-way spread
        for(let s=-2;s<=2;s++){const ang=e.angle+s*0.2;fireBulletEnemy(e.x+Math.cos(ang)*30,e.y+Math.sin(ang)*30,Math.cos(ang)*bspd,Math.sin(ang)*bspd,e.def.damage,e.def.bulletColor,e.def.bulletSize);}
      }
      else{
        // Regular boss phase 1: single shot
        const sp=(Math.random()-0.5)*0.15,ang=e.angle+sp;
        fireBulletEnemy(e.x+Math.cos(ang)*28,e.y+Math.sin(ang)*28,Math.cos(ang)*bspd,Math.sin(ang)*bspd,e.def.damage,e.def.bulletColor,e.def.bulletSize);
      }
    }
    else if(e.def.name==='Sniper'){fireBulletEnemy(e.x+Math.cos(e.angle)*30,e.y+Math.sin(e.angle)*30,Math.cos(e.angle)*bspd*1.3,Math.sin(e.angle)*bspd*1.3,e.def.damage,e.def.bulletColor,e.def.bulletSize);}
    else if(e.def.shotgun){for(let s=-2;s<=2;s++){const ang=e.angle+s*0.15;fireBulletEnemy(e.x+Math.cos(ang)*28,e.y+Math.sin(ang)*28,Math.cos(ang)*bspd*0.9,Math.sin(ang)*bspd*0.9,e.def.damage*0.4,e.def.bulletColor,e.def.bulletSize);}}
    else if(e.def.bombThrower){const sp=(Math.random()-0.5)*0.2,ang=e.angle+sp;bombs.push({x:e.x+Math.cos(ang)*40,y:e.y+Math.sin(ang)*40,isMine:false,timer:2,armed:0.5,alive:true,owner:'enemy',radius:80,damage:e.def.damage,color:e.def.bulletColor});}
    else if(e.def.swordSlash){if(mx<e.def.range*1.5){const slashAngle=e.angle;for(let i=-1;i<=1;i++){const ang=slashAngle+i*0.3;fireBulletEnemy(e.x+Math.cos(ang)*35,e.y+Math.sin(ang)*35,Math.cos(ang)*bspd*1.2,Math.sin(ang)*bspd*1.2,e.def.damage*0.8,e.def.bulletColor,e.def.bulletSize);}}}
    else if(e.def.multiAttack){
      // Supreme boss multi-attack: shoots in 8 directions
      for(let i=0;i<8;i++){const ang=(i/8)*Math.PI*2;fireBulletEnemy(e.x+Math.cos(ang)*40,e.y+Math.sin(ang)*40,Math.cos(ang)*bspd,Math.sin(ang)*bspd,e.def.damage*0.6,e.def.bulletColor,e.def.bulletSize);}
      shakeAmt=8;
    }
    else if(e.def.piercing){const sp=(Math.random()-0.5)*0.1,ang=e.angle+sp;fireBulletEnemy(e.x+Math.cos(ang)*28,e.y+Math.sin(ang)*28,Math.cos(ang)*bspd,Math.sin(ang)*bspd,e.def.damage,e.def.bulletColor,e.def.bulletSize,true);}
    else if(e.def.homing){fireBulletEnemy(e.x,e.y,0,0,e.def.damage,e.def.bulletColor,e.def.bulletSize,false,true);} // Homing projectile
    else{const sp=(Math.random()-0.5)*0.15,ang=e.angle+sp;fireBulletEnemy(e.x+Math.cos(ang)*28,e.y+Math.sin(ang)*28,Math.cos(ang)*bspd,Math.sin(ang)*bspd,e.def.damage,e.def.bulletColor,e.def.bulletSize);}
    e.shootCooldown=e.shootRate;spawnParticles(e.x+Math.cos(e.angle)*30,e.y+Math.sin(e.angle)*30,3,e.def.bulletColor,80,false);
  }
  if(Math.hypot(mx,my)>5)e.walkCycle+=dt*2;
}

function fireBulletEnemy(x,y,vx,vy,damage,color,size,piercing=false,homing=false,options={}){
  // Handle distance-based damage scaling for tank enemies
  let finalDamage = damage;
  if(options.startX && options.startY) {
    const dist = Math.hypot(x - options.startX, y - options.startY);
    const distanceMultiplier = 1 + (dist / 500); // 1x damage at start, up to 2x at 500 pixels
    finalDamage = damage * distanceMultiplier;
  }
  
  bullets.push({x,y,vx,vy,owner:'enemy',damage:finalDamage,color,size,alive:true,trail:[],piercing,age:0,homing});
}

// ── Bombs ──────────────────────────────
function explodeBomb(b){
  b.alive=false;
  spawnParticles(b.x,b.y,30,'#ff6600',200,true,7);spawnParticles(b.x,b.y,15,'#fff',100,false,4);
  spawnFloatText(b.x,b.y-60,'💥 BOOM!','#ff6600',28);shakeAmt=10;flashColor='rgba(255,150,0,0.2)';flashAlpha=1;
  enemies.forEach(e=>{if(!e.alive)return;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<b.radius){const dmg=Math.floor(b.damage*(1-d/b.radius*0.5));e.hp-=dmg;e.hitFlash=0.8;if(e.hp<=0){e.alive=false;e.deathAnim=1;score+=e.score;document.getElementById('scoreDisplay').textContent=score;spawnParticles(e.x,e.y,20,e.def.color,150,true,6);if(!e.isReturning)updateEnemyCount();handleEnemyDeath(e);if(b.owner==='player'){bombsKills++;updateAchievementProgress('bomb_master',1);}}}});
  destructibles.forEach(d=>{
    if(!d.alive)return;
    if(Math.hypot(d.x-b.x,d.y-b.y)<b.radius){
      d.hp-=b.damage*0.5;
      if(d.hp<=0){
        d.alive=false;
        const{tx,ty}=worldToTile(d.x,d.y);
        if(tileMap[ty]&&tileMap[ty][tx]!==1)tileMap[ty][tx]=0;
        spawnParticles(d.x,d.y,15,'#aa8833',120,true,5);
        if(d.type==='spike_block'){
          spawnParticles(d.x,d.y,30,'#ff4400',250,true,10);
          spawnFloatText(d.x,d.y-60,'💥 EXPLOSIÓN MASIVA!','#ff4400',24);
          shakeAmt=15;
          flashColor='rgba(255,100,0,0.3)';
          flashAlpha=1;
          const spikeRadius=150;
          const spikeDamage=800;
          enemies.forEach(e=>{
            if(e.alive&&!e.isAlly&&Math.hypot(d.x-e.x,d.y-e.y)<spikeRadius){
              const dmg=Math.floor(spikeDamage*(1-Math.hypot(d.x-e.x,d.y-e.y)/spikeRadius*0.5));
              e.hp-=dmg;
              e.hitFlash=0.8;
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                if(!e.isReturning)updateEnemyCount();
                handleEnemyDeath(e);
              }
            }
          });
          if(player&&player.alive&&Math.hypot(d.x-player.x,d.y-player.y)<spikeRadius){
            if(!player.shieldActive){
              const dmg=Math.floor(spikeDamage*(1-Math.hypot(d.x-player.x,d.y-player.y)/spikeRadius*0.5));
              damagePlayer(dmg);
              spawnFloatText(player.x,player.y-50,'-'+dmg,'#ff4400',20);
            }
          }
        }
      }
    }
  });
  // Damage player if bomb is from enemy
  if(b.owner==='enemy'&&player&&player.alive){
    const d=Math.hypot(player.x-b.x,player.y-b.y);
    if(d<b.radius&&!player.shieldActive){
      const dmg=Math.floor(b.damage*(1-d/b.radius*0.5));
      damagePlayer(dmg);
      spawnFloatText(player.x,player.y-50,'-'+dmg,'#ff6600',18);
    }
  }
  // In multi: bomb from player can damage opponent
  if(gameMode==='multi'&&opponent&&opponent.alive&&b.owner==='player'){
    const d=Math.hypot(opponent.x-b.x,opponent.y-b.y);
    if(d<b.radius&&!opponent.shieldActive){
      const dmg=Math.floor(b.damage*(1-d/b.radius*0.5)*0.7);
      opponent.hp-=dmg;
      spawnFloatText(opponent.x,opponent.y-50,'-'+dmg,'#ff6600',18);
      document.getElementById('oppHpFill').style.width=(opponent.hp/opponentMaxHp*100)+'%';
      if(opponent.hp<=0){opponent.alive=false;opponent.deathAnim=1;addKillMsg('💥 ¡Eliminaste al oponente con una bomba!');}
    }
  }
}

// Handle enemy death with special abilities
function handleEnemyDeath(e){
  if(e.def.explodeOnDeath){
    // Ember explosion on death
    const radius=120;
    const damage=e.def.damage*1.5;
    spawnParticles(e.x,e.y,25,'#ff6600',200,true,8);
    spawnFloatText(e.x,e.y-60,'💥 EXPLOSIÓN!','#ff4400',24);
    shakeAmt=8;
    // Damage player if in range
    if(player&&player.alive){
      const d=Math.hypot(player.x-e.x,player.y-e.y);
      if(d<radius&&!player.shieldActive){
        const dmg=Math.floor(damage*(1-d/radius*0.5));
        damagePlayer(dmg);
      }
    }
    // Damage opponent in multi
    if(gameMode==='multi'&&opponent&&opponent.alive){
      const d=Math.hypot(opponent.x-e.x,opponent.y-e.y);
      if(d<radius&&!opponent.shieldActive){
        const dmg=Math.floor(damage*(1-d/radius*0.5)*0.7);
        opponent.hp-=dmg;
        spawnFloatText(opponent.x,opponent.y-50,'-'+dmg,'#ff4444',18);
        document.getElementById('oppHpFill').style.width=(opponent.hp/opponentMaxHp*100)+'%';
        if(opponent.hp<=0){opponent.alive=false;opponent.deathAnim=1;addKillMsg('💥 ¡Eliminaste al oponente con explosión!');}
      }
    }
  }
  // Ghost spawns on death
  if(e.def.hauntOnDeath){
    const ghostDef=ENEMY_TYPES.ghost;
    enemies.push({
      x:e.x,y:e.y,vx:0,vy:0,hp:ghostDef.hp,maxHp:ghostDef.hp,radius:ghostDef.radius,speed:ghostDef.speed,
      damage:ghostDef.damage,range:ghostDef.range,shootRate:ghostDef.shootRate,shootCooldown:Math.random(),
      def:ghostDef,alive:true,angle:0,walkCycle:0,hitFlash:0,deathAnim:0,stateTimer:0,
      state:'chase',patrolAngle:Math.random()*Math.PI*2,strafeDir:1,strafeTimer:2,score:0,
      bossPhase:1,phased:false,phaseTimer:2,frozen:false,frozenTimer:0,shieldActive:false,shieldTimer:0,
      isGhost:true,ghostTimer:10,ghostOwner:e
    });
    spawnParticles(e.x,e.y,20,'#cccccc',180,false,6);
    spawnFloatText(e.x,e.y-60,'👻 FANTASMA!','#cccccc',22);
  }
  // Explosive enemy death logic
  if(e.def.explosionDamage){
    const explosionRadius=e.def.explosionRadius||180;
    const explosionDmg=e.def.explosionDamage;
    spawnParticles(e.x,e.y,30,'#ff4400',250,true,10);
    spawnFloatText(e.x,e.y-60,'💥 EXPLOSIÓN!','#ff4400',28);
    shakeAmt=15;
    flashColor='rgba(255,100,0,0.3)';
    flashAlpha=1;
    enemies.forEach(other=>{
      if(other.alive&&other!==e){
        const d=Math.hypot(other.x-e.x,other.y-e.y);
        if(d<explosionRadius){
          const dmg=Math.floor(explosionDmg*(1-d/explosionRadius*0.5));
          other.hp-=dmg;
          other.hitFlash=0.8;
          spawnParticles(other.x,other.y,10,'#ff6600',120,false,4);
          spawnFloatText(other.x,other.y-30,'-'+dmg,'#ff6600',16);
          if(other.hp<=0){
            other.alive=false;
            other.deathAnim=1;
            score+=other.score;
            document.getElementById('scoreDisplay').textContent=score;
            spawnParticles(other.x,other.y,20,other.def.color,150,true,5);
            spawnFloatText(other.x,other.y-50,'+'+other.score,'#FFD700',20);
            updateEnemyCount();
          }
        }
      }
    });
    if(player&&player.alive){
      const d=Math.hypot(player.x-e.x,player.y-e.y);
      if(d<explosionRadius){
        const dmg=Math.floor(explosionDmg*(1-d/explosionRadius*0.5));
        damagePlayer(dmg);
        spawnFloatText(player.x,player.y-40,'-'+dmg,'#ff4444',18);
      }
    }
  }  
  // Returning enemies gimmick - respawn after delay
  if((mapConfig.gimmick==='returning'||mapConfig.gimmick==='bridge')&&!e.isGhost){
    const spawnDelay=5+Math.random()*3;
    setTimeout(()=>{
      if(gameState==='playing'&&(mapConfig.gimmick==='returning'||mapConfig.gimmick==='bridge')){
        const sp=SPAWN_POSITIONS[Math.floor(Math.random()*SPAWN_POSITIONS.length)];
        enemies.push({
          x:sp.x*TILE+TILE/2,y:sp.y*TILE+TILE/2,vx:0,vy:0,
          hp:e.def.hp*(1+(mapConfig.id-1)*0.15),maxHp:e.def.hp*(1+(mapConfig.id-1)*0.15),
          radius:e.def.radius,speed:e.def.speed,damage:e.def.damage,range:e.def.range,
          shootRate:e.def.shootRate,shootCooldown:Math.random()*2,def:e.def,alive:true,
          angle:0,walkCycle:Math.random()*Math.PI*2,hitFlash:0,deathAnim:0,stateTimer:0,
          state:'patrol',patrolAngle:Math.random()*Math.PI*2,strafeDir:Math.random()<0.5?1:-1,
          strafeTimer:2,score:0,bossPhase:1,phased:false,phaseTimer:2+Math.random(),
          frozen:false,frozenTimer:0,shieldActive:false,shieldTimer:0,isReturning:true
        });
        spawnParticles(sp.x*TILE+TILE/2,sp.y*TILE+TILE/2,20,e.def.color,150,false,6);
        spawnFloatText(sp.x*TILE+TILE/2,sp.y*TILE+TILE/2-60,'⚡ REGRESO!',e.def.color,18);
      }
    },spawnDelay*1000);
  }
}

// ── Update ──────────────────────────────
function update(ts){
  const dt=Math.min((ts-lastTime)/1000,0.05);lastTime=ts;
  if(gameState!=='playing'){requestAnimationFrame(update);return;}
  gameTime+=dt;shakeAmt*=0.85;if(flashAlpha>0)flashAlpha-=dt*3;

  ['shield','bomb','dash','ultimate'].forEach(t=>{if(specials[t].cd>0){specials[t].cd-=dt;if(specials[t].cd<0)specials[t].cd=0;}});
  updateSpecialUI();

  // ── Player update ──
  if(player && player.alive){
    let dx=0,dy=0;
    if(keys['KeyA']||keys['ArrowLeft'])dx-=1;if(keys['KeyD']||keys['ArrowRight'])dx+=1;
    if(keys['KeyW']||keys['ArrowUp'])dy-=1;if(keys['KeyS']||keys['ArrowDown'])dy+=1;
    if(Math.abs(touchInput.moveX)>0.05)dx+=touchInput.moveX;
    if(Math.abs(touchInput.moveY)>0.05)dy+=touchInput.moveY;
    const dl=Math.hypot(dx,dy);
    if(dl>0){dx/=dl;dy/=dl;player.walkCycle+=dt*10;player.bodyBob=Math.sin(player.walkCycle)*3;}
    const spd=player.speed*(player.boosted?2:1)*(player.speedBoost||1);
    player.vx=(player.vx||0)*0.85+dx*spd*0.15;
    player.vy=(player.vy||0)*0.85+dy*spd*0.15;
    player.x+=player.vx*dt;player.y+=player.vy*dt;
    player.angle=Math.atan2(mouse.y+cam.y-player.y,mouse.x+cam.x-player.x);
    if(touchInput.shooting && isMobileLike()){
      if(touchInput.activeAimId === null) aimAtBestMobileTarget();
      tryShootAt(mouse.x, mouse.y);
    }
    const{tx,ty}=worldToTile(player.x,player.y);
    // Heal tile logic
    if(tileMap[ty]&&tileMap[ty][tx]===25){
      if(player.hp<player.maxHp&&Math.random()<0.05){
        const healAmount=100;
        player.hp=Math.min(player.maxHp,player.hp+healAmount);
        spawnParticles(player.x,player.y,8,'#00ff00',80,false,3);
        spawnFloatText(player.x,player.y-40,'+'+healAmount,'#00ff00',14);
        updateAchievementProgress('heal_tile_master',1);
      }
    }
    // Quantum shift tile logic
    if(tileMap[ty]&&tileMap[ty][tx]===29){
      if(Math.random()<0.02){
        // Random teleport player
        const newX=2+Math.random()*(mapW-4);
        const newY=2+Math.random()*(mapH-4);
        if(tileMap[Math.floor(newY/TILE)]&&tileMap[Math.floor(newY/TILE)][Math.floor(newX/TILE)]===0){
          spawnParticles(player.x,player.y,30,'#ff00ff',200,false,10);
          player.x=newX*TILE+TILE/2;
          player.y=newY*TILE+TILE/2;
          spawnParticles(player.x,player.y,30,'#ff00ff',200,false,10);
          spawnFloatText(player.x,player.y-60,'⚛ CUÁNTICO!','#ff00ff',24);
        }
      }
    }
    // Magnetic storm tile logic
    if(tileMap[ty]&&tileMap[ty][tx]===30){
      // Apply magnetic force to nearby entities
      enemies.forEach(e=>{
        if(e.alive){
          const dx=player.x-e.x, dy=player.y-e.y, dist=Math.hypot(dx,dy);
          if(dist<300 && dist>80){
            const force=100/(dist*dist);
            e.vx+=dx/dist*force*dt;
            e.vy+=dy/dist*force*dt;
          }
        }
      });
      // Visual effect
      if(Math.random()<0.1){
        spawnParticles(player.x+Math.random()*100-50,player.y+Math.random()*100-50,5,'#6666ff',150,false,5);
      }
    }
    // Wall crossing for Spectre
    if(player.wallCrossing){
      player.wallCrossingTimer-=dt;
      const currentlyInWall=isSolid(tx,ty);
      if(currentlyInWall){
        player.inWall=true;
      }else if(player.inWall&&!currentlyInWall){
        // Exited wall, disable ability
        player.wallCrossing=false;
        player.inWall=false;
        spawnFloatText(player.x,player.y-60,'¡SALISTE DE PARED!','#aa44ff',18);
      }
      if(player.wallCrossingTimer<=0&&!player.inWall){
        player.wallCrossing=false;
        spawnFloatText(player.x,player.y-60,'¡TIEMPO AGOTADO!','#aa44ff',18);
      }
      if(!player.wallCrossing&&isSolid(tx,ty)){
        player.x-=player.vx*dt;player.y-=player.vy*dt;
      }
    }else if(isSolid(tx,ty)){
      player.x-=player.vx*dt;player.y-=player.vy*dt;
    }
    // Crystal reflect timer
    if(player.reflectTimer){
      player.reflectTimer-=dt;
      if(player.reflectTimer<=0){
        player.reflectActive=false;
        player.reflectTimer=null;
      }
    }
    player.inBush=isInBush(player.x,player.y);
    // Health regeneration for all heroes
    player.regenTimer+=dt;
    if(player.regenTimer>=1 && player.hp<player.maxHp){
      player.hp+=player.maxHp*0.02;
      player.hp=Math.min(player.hp,player.maxHp);
      player.regenTimer=0;
      document.getElementById('hpFill').style.width=(player.hp/player.maxHp*100)+'%';
    }
    if(player.invincible>0)player.invincible-=dt;
    if(player.shieldActive){player.shieldTimer-=dt;if(player.shieldTimer<=0){player.shieldActive=false;}}
    if(player.reflectActive){player.reflectTimer-=dt;if(player.reflectTimer<=0){player.reflectActive=false;}}
    if(player.absorbActive){player.absorbTimer-=dt;if(player.absorbTimer<=0){player.absorbActive=false;}}
    if(player.flying){player.flyingTimer-=dt;if(player.flyingTimer<=0){player.flying=false;}}
    if(player.invisible){player.invisibleTimer-=dt;if(player.invisibleTimer<=0){player.invisible=false;}}
    if(player.boosted){player.boostTimer-=dt;if(player.boostTimer<=0){player.boosted=false;}}
    if(player.shootCooldown>0)player.shootCooldown-=dt;
    if(player.reloadTimer>0){player.reloadTimer-=dt;if(player.reloadTimer<=0){player.ammo=player.maxAmmo;updateAmmoUI();}}
    // Chronos rewind history tracking
    if(player.heroId==='chronos'){
      player.rewindHistory.push({x:player.x,y:player.y,hp:player.hp,timestamp:Date.now()});
      if(player.rewindHistory.length>300)player.rewindHistory.shift();
    }
    // Auto-fire when holding mouse
    if(mouse.down && player.shootCooldown<=0) tryShoot({clientX:mouse.x,clientY:mouse.y});
    // Handle flying (ignore gravity)
    if(player.flying){
      player.vy-=300*dt;
    }
    // Handle portal
    if(player.portal1&&!player.portal2){
      const d=Math.hypot(player.x-player.portal1.x,player.y-player.portal1.y);
      if(d>100){player.portal2={x:player.x,y:player.y};spawnFloatText(player.x,player.y-30,'¡PORTAL 2!','#4a4a8e',14);}
    }
    // Handle reversed controls
    if(player.controlsReversed){
      const temp=keys['KeyA']||keys['ArrowLeft'];
      keys['KeyA']=keys['KeyD']||keys['ArrowRight'];
      keys['ArrowLeft']=keys['ArrowRight'];
      keys['KeyD']=temp;
      keys['ArrowRight']=keys['ArrowLeft'];
    }
    // Level gimmicks
    if(isInPoison(player.x,player.y)){if(gameTime%0.3<dt){damagePlayer(80);spawnFloatText(player.x,player.y-30,'☠ VENENO','#00ff00',14);}}
    if(isInWind(player.x,player.y)){player.vx+=Math.sin(gameTime*3)*300*dt;player.vy-=200*dt;}
    if(isInConveyor(player.x,player.y)){player.vx+=150*dt;}
    if(isInTeleporter(player.x,player.y)){
      if(tileMap[ty][tx]===10){player.x=21*TILE+TILE/2;player.y=16*TILE+TILE/2;spawnParticles(player.x,player.y,20,'#aa00ff',150,false,6);}
      else if(tileMap[ty][tx]===11){player.x=21*TILE+TILE/2;player.y=3*TILE+TILE/2;spawnParticles(player.x,player.y,20,'#aa00ff',150,false,6);}
    }
    if(isInDarkness(player.x,player.y)){
      if(player.heroId==='vampire')player.speed=player.speed*1.3;
    }
    if(isInLightning(player.x,player.y)){
      if(Math.random()<0.05){damagePlayer(150);spawnFloatText(player.x,player.y-30,'⚡ RAYO','#00aaff',14);}
    }
    if(isInTime(player.x,player.y)){
      if(player.heroId==='chronos')player.speed=player.speed*1.4;
      else player.speed=player.speed*0.4;
      if(Math.random()<0.02)spawnFloatText(player.x,player.y-30,'⏱ LENTO','#800080',14);
    }
    if(isInCrystal(player.x,player.y)){
      if(player.heroId==='crystal')player.shieldActive=true;
      else if(Math.random()<0.05)damagePlayer(30);
    }
    if(isInInferno(player.x,player.y)){
      if(player.heroId!=='phoenix'){damagePlayer(80);spawnFloatText(player.x,player.y-30,'🔥 FUEGO','#ff4400',14);}
    }
    if(isInVoid(player.x,player.y)){
      if(Math.random()<0.05){player.x=5*TILE+TILE/2;player.y=10*TILE+TILE/2;spawnParticles(player.x,player.y,20,'#1a1a2e',200,false,6);spawnFloatText(player.x,player.y-30,'🌑 TELEPORT','#1a1a2e',14);}
    }
    if(isInGravity(player.x,player.y)){
      const centerX=mapW*TILE/2,centerY=mapH*TILE/2;
      const dx=centerX-player.x,dy=centerY-player.y,d=Math.hypot(dx,dy);
      if(d>50){player.vx+=(dx/d)*500*dt;player.vy+=(dy/d)*500*dt;}
      if(Math.random()<0.02)spawnFloatText(player.x,player.y-30,'⬇ GRAVEDAD','#6666ff',14);
    }
    if(isInMirror(player.x,player.y)){
      player.controlsReversed=true;
      if(Math.random()<0.02)spawnFloatText(player.x,player.y-30,'↔ ESPEJO','#8888aa',14);
    }else{
      player.controlsReversed=false;
    }
    if(isInFreeze(player.x,player.y)){
      if(Math.random()<0.08){player.vx=0;player.vy=0;player.shootCooldown+=0.5;spawnFloatText(player.x,player.y-30,'❄ CONGELADO','#00ffff',14);}
    }
    if(isInMagnetic(player.x,player.y)){
      if(Math.random()<0.03)spawnFloatText(player.x,player.y-30,'🧲 MAGNÉTICO','#8844ff',14);
    }
    if(isInChaos(player.x,player.y)){
      const chaosEffect=Math.floor(Math.random()*4);
      if(chaosEffect===0){player.vx=(Math.random()-0.5)*400;player.vy=(Math.random()-0.5)*400;spawnFloatText(player.x,player.y-30,'🌀 EMPUJE','#ff00ff',14);}
      else if(chaosEffect===1){player.shootCooldown+=0.3;spawnFloatText(player.x,player.y-30,'⏱ RETRASO','#ff00ff',14);}
      else if(chaosEffect===2){damagePlayer(20);spawnFloatText(player.x,player.y-30,'💥 DAÑO','#ff00ff',14);}
    }
    // Clone timer and poison effect
    if(player.clone&&player.clone.alive){
      player.clone.timer-=dt;
      if(player.clone.timer<=0){
        player.clone.alive=false;
        spawnFloatText(player.x,player.y-60,'🍍 PIÑA DESAPARECE','#ffcc00',18);
      }
      // Poison nearby enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.clone.x,e.y-player.clone.y);
          if(dist<60){
            if(Math.random()<0.1){
              e.hp-=30;
              spawnParticles(e.x,e.y,5,'#00ff00',80,false,3);
              spawnFloatText(e.x,e.y-30,'☠ VENENO','#00ff00',14);
            }
          }
        }
      });
    }
    
    // Sonic field update
    if(player.sonicField && player.sonicField.alive){
      player.sonicField.timer-=dt;
      player.sonicField.echoInterval-=dt;
      
      // Create echo waves
      if(player.sonicField.echoInterval <= 0 && player.sonicField.currentEcho < player.sonicField.echoCount){
        player.sonicField.currentEcho++;
        player.sonicField.echoInterval = player.sonicField.echoInterval;
        
        // Apply echo damage to enemies in radius
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-player.sonicField.x,e.y-player.sonicField.y);
            if(dist<player.sonicField.radius){
              // Echo damage
              e.hp-=player.sonicField.damage*0.5;
              e.hitFlash=0.3;
              
              // Apply sound disruption
              e.vibrated=true;
              e.vibratedTimer=1;
              e.speed*=0.7;
              
              // Create echo effect
              spawnParticles(e.x,e.y,3,'#00ffaa',80,false,2);
              spawnFloatText(e.x,e.y-30,'🔊 ECO!','#00ffaa',12);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,15,e.def.color,120,true,4);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',18);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create echo visual
        for(let i=0;i<16;i++){
          const angle=(i/16)*Math.PI*2;
          const x=player.sonicField.x+Math.cos(angle)*player.sonicField.radius;
          const y=player.sonicField.y+Math.sin(angle)*player.sonicField.radius;
          spawnParticles(x,y,2,'#00ffcc',70,false,2);
        }
      }
      
      if(player.sonicField.timer <= 0){
        player.sonicField.alive = false;
      }
    }
    
    // Sonic trail update
    if(player.sonicTrail && player.sonicTrail.alive){
      player.sonicTrail.timer-=dt;
      player.sonicTrail.echoInterval-=dt;
      
      // Create trail echoes
      if(player.sonicTrail.echoInterval <= 0 && player.sonicTrail.currentEcho < player.sonicTrail.echoCount){
        player.sonicTrail.currentEcho++;
        player.sonicTrail.echoInterval = player.sonicTrail.echoInterval;
        
        // Apply trail damage to enemies near trail
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            // Check if enemy is near trail
            const distToPath=Math.abs((player.sonicTrail.endY-player.sonicTrail.startY)*e.x-(player.sonicTrail.endX-player.sonicTrail.startX)*e.y+player.sonicTrail.endX*player.sonicTrail.startY-player.sonicTrail.endY*player.sonicTrail.startX)/Math.hypot(player.sonicTrail.endY-player.sonicTrail.startY,player.sonicTrail.endX-player.sonicTrail.startX);
            const pathLength=Math.hypot(player.sonicTrail.endX-player.sonicTrail.startX,player.sonicTrail.endY-player.sonicTrail.startY);
            const t=Math.max(0,Math.min(1,((e.x-player.sonicTrail.startX)*(player.sonicTrail.endX-player.sonicTrail.startX)+(e.y-player.sonicTrail.startY)*(player.sonicTrail.endY-player.sonicTrail.startY))/(pathLength*pathLength)));
            const closestX=player.sonicTrail.startX+t*(player.sonicTrail.endX-player.sonicTrail.startX);
            const closestY=player.sonicTrail.startY+t*(player.sonicTrail.endY-player.sonicTrail.startY);
            const distToClosest=Math.hypot(e.x-closestX,e.y-closestY);
            
            if(distToPath<30 && distToClosest<30){
              // Trail damage
              e.hp-=player.sonicTrail.damage*0.4;
              e.hitFlash=0.3;
              
              // Apply sound disruption
              e.vibrated=true;
              e.vibratedTimer=1;
              e.speed*=0.8;
              
              // Create trail effect
              spawnParticles(e.x,e.y,2,'#00ffaa',70,false,2);
              spawnFloatText(e.x,e.y-30,'🔊 ESTELA!','#00ffaa',12);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,12,e.def.color,100,true,4);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',18);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create trail visual
        for(let i=0;i<12;i++){
          const t=i/12;
          const x=player.sonicTrail.startX+(player.sonicTrail.endX-player.sonicTrail.startX)*t;
          const y=player.sonicTrail.startY+(player.sonicTrail.endY-player.sonicTrail.startY)*t;
          spawnParticles(x,y,2,'#00ffcc',60,false,2);
        }
      }
      
      if(player.sonicTrail.timer <= 0){
        player.sonicTrail.alive = false;
      }
    }
    
    // Sonic echo field update
    if(player.sonicEchoField && player.sonicEchoField.alive){
      player.sonicEchoField.timer-=dt;
      player.sonicEchoField.echoInterval-=dt;
      
      // Create echo field waves
      if(player.sonicEchoField.echoInterval <= 0 && player.sonicEchoField.currentEcho < player.sonicEchoField.echoCount){
        player.sonicEchoField.currentEcho++;
        player.sonicEchoField.echoInterval = player.sonicEchoField.echoInterval;
        
        // Apply echo field damage to enemies in radius
        enemies.forEach(e=>{
          if(e.alive&&!e.isAlly){
            const dist=Math.hypot(e.x-player.sonicEchoField.x,e.y-player.sonicEchoField.y);
            if(dist<player.sonicEchoField.radius){
              // Echo field damage
              e.hp-=player.sonicEchoField.damage*0.6;
              e.hitFlash=0.4;
              
              // Apply sound disruption
              e.vibrated=true;
              e.vibratedTimer=1.5;
              e.speed*=0.6;
              e.shootRate*=1.5;
              
              // Create echo field effect
              spawnParticles(e.x,e.y,3,'#00ffaa',90,false,2);
              spawnFloatText(e.x,e.y-30,'🔊 CAMPO!','#00ffaa',12);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,15,e.def.color,140,true,4);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        });
        
        // Create echo field visual
        for(let i=0;i<12;i++){
          const angle=(i/12)*Math.PI*2;
          const x=player.sonicEchoField.x+Math.cos(angle)*player.sonicEchoField.radius;
          const y=player.sonicEchoField.y+Math.sin(angle)*player.sonicEchoField.radius;
          spawnParticles(x,y,2,'#00ffcc',80,false,2);
        }
      }
      
      if(player.sonicEchoField.timer <= 0){
        player.sonicEchoField.alive = false;
      }
    }
    // Ally drone shooting
    enemies.forEach(e=>{
      if(e.isAlly&&e.alive){
        e.shootCooldown-=dt;
        if(e.shootCooldown<=0){
          // Find nearest enemy
          let nearestEnemy=null;
          let nearestDist=Infinity;
          enemies.forEach(en=>{
            if(en.alive&&!en.isAlly){
              const d=Math.hypot(en.x-e.x,en.y-e.y);
              if(d<nearestDist){nearestDist=d;nearestEnemy=en;}
            }
          });
          if(nearestEnemy&&nearestDist<e.range){
            const dx=nearestEnemy.x-e.x,dy=nearestEnemy.y-e.y,d=Math.hypot(dx,dy);
            fireBulletEnemy(e.x,e.y,(dx/d)*350,(dy/d)*350,e.damage,e.def.bulletColor,e.def.bulletSize,{startX:e.x,startY:e.y});
            e.shootCooldown=e.shootRate;
          }
        }
      }
    });
    // Combo timer
    if(comboTimer>0){
      comboTimer-=dt;
      if(comboTimer<=0){
        comboCount=0;
        comboDamageMultiplier=1.0;
      }
    }
    // Meteor gimmick
    if(mapConfig.gimmick==='meteors'){
      meteorTimer-=dt;
      if(meteorTimer<=0){
        meteorTimer=2+Math.random()*3;
        const mx=Math.random()*mapW*TILE;
        const my=-50;
        meteors.push({x:mx,y:my,vx:0,vy:300+Math.random()*200,radius:40,damage:400,alive:true});
        spawnParticles(mx,my,10,'#ff4400',80,false,4);
      }
    }
    meteors.forEach(m=>{
      if(!m.alive)return;
      m.y+=m.vy*dt;
      if(m.y>mapH*TILE+100)m.alive=false;
      // Damage player on impact
      if(player&&player.alive&&Math.hypot(m.x-player.x,m.y-player.y)<m.radius+player.radius){
        if(!player.shieldActive){
          damagePlayer(m.damage);
          spawnFloatText(player.x,player.y-40,'☄️ METEORO','#ff4400',18);
        }
        m.alive=false;
        spawnParticles(m.x,m.y,20,'#ff4400',150,true,8);
        shakeAmt=8;
      }
      // Damage enemies on impact (but not bosses)
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly&&!e.def.name.includes('BOSS')&&!e.def.name.includes('JEFE')&&Math.hypot(m.x-e.x,m.y-e.y)<m.radius+e.radius){
          e.hp-=m.damage;
          e.hitFlash=0.8;
          if(e.hp<=0){
            e.alive=false;
            e.deathAnim=1;
            score+=e.score;
            document.getElementById('scoreDisplay').textContent=score;
            spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
            spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
            if(!e.isReturning)updateEnemyCount();
          }
        }
      });
    });
    meteors=meteors.filter(m=>m.alive);
    // Boomerangs update
    boomerangs.forEach(b=>{
      if(!b.alive)return;
      b.x+=b.vx*dt;
      b.y+=b.vy*dt;
      b.timer-=dt;
      const distFromStart=Math.hypot(b.x-b.startX,b.y-b.startY);
      if(!b.returning&&distFromStart>=b.maxDistance){
        b.returning=true;
      }
      if(b.returning){
        const toPlayer=player?{x:player.x,y:player.y}:{x:b.startX,y:b.startY};
        const dx=toPlayer.x-b.x,dy=toPlayer.y-b.y,d=Math.hypot(dx,dy);
        if(d>10){
          b.vx=(dx/d)*600;
          b.vy=(dy/d)*600;
        }
      }
      if(b.timer<=0||distFromStart<10&&b.returning){
        b.alive=false;
      }
      // Damage enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly&&Math.hypot(b.x-e.x,b.y-e.y)<b.radius+e.radius){
          e.hp-=b.damage;
          e.hitFlash=0.8;
          if(e.hp<=0){
            e.alive=false;
            e.deathAnim=1;
            score+=e.score;
            document.getElementById('scoreDisplay').textContent=score;
            spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
            spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
            if(!e.isReturning)updateEnemyCount();
          }
        }
      });
    });
    boomerangs=boomerangs.filter(b=>b.alive);
    // Block walls update
    blockWalls.forEach(w=>{
      if(!w.alive)return;
      w.timer-=dt;
      if(w.timer<=0)w.alive=false;
    });
    blockWalls=blockWalls.filter(w=>w.alive);
    laserRays=laserRays.filter(lr=>lr.alive);
    invisibilityPads=invisibilityPads.filter(pad=>pad.alive);
    // Traps update
    traps.forEach(t=>{
      if(!t.alive)return;
      t.x+=t.vx*dt;
      t.y+=t.vy*dt;
      t.vy+=400*dt; // Gravity
      t.timer-=dt;
      if(t.timer<=0)t.alive=false;
      // Bounce off walls
      const{tx,ty}=worldToTile(t.x,t.y);
      if(isSolid(tx,ty)){
        if(t.bounces>0){
          t.vx*=-0.8;
          t.vy*=-0.8;
          t.bounces--;
          spawnParticles(t.x,t.y,8,t.color,80,false,3);
        }else{
          t.alive=false;
          // Explode on impact
          enemies.forEach(e=>{
            if(e.alive&&!e.isAlly&&Math.hypot(e.x-t.x,e.y-t.y)<t.radius){
              e.hp-=t.damage;
              e.hitFlash=0.8;
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          });
          spawnParticles(t.x,t.y,15,t.color,120,true,6);
          shakeAmt=4;
        }
      }
    });
    traps=traps.filter(t=>t.alive);
    // Hypnotized enemies timer
    enemies.forEach(e=>{
      if(e.isHypnotized){
        e.hypnotizedTimer-=dt;
        if(e.hypnotizedTimer<=0){
          e.isHypnotized=false;
          e.isAlly=false;
          e.hypnotizedOwner=null;
          spawnFloatText(e.x,e.y-40,'🌀 DESPIERTA!','#aa44ff',16);
        }
      }
    });
    // Reset block walls and traps on level start
    if(gameState==='playing'&&(blockWalls.length>0||traps.length>0)){
      blockWalls=[];
      traps=[];
    }
    // Reset boomerangs on level start
    if(gameState==='playing'&&boomerangs.length>0){
      boomerangs=[];
    }
    // Reset enemy turrets on level start
    if(gameState==='playing'&&enemyTurrets.length>0){
      enemyTurrets=[];
    }
    // Reset invisibility pads and medkits on level start
    if(gameState==='playing'&&(invisibilityPads.length>0||medkits.length>0)){
      invisibilityPads=[];
      medkits=[];
    }
    document.getElementById('hpFill').style.width=(player.hp/player.maxHp*100)+'%';
    const hpFill=document.getElementById('hpFill');
    hpFill.className='hud-hp-fill'+(player.hp/player.maxHp<0.3?' low':'');
    // Send state to opponent ~15fps
    if(gameMode==='multi'&&Math.floor(gameTime*15)!==Math.floor((gameTime-dt)*15))sendMyState();
  }

  // ── Crystal aura update ──
  if(player.crystalAura){
    player.crystalAuraTimer-=dt;
    if(player.crystalAuraTimer<=0){
      player.crystalAura=false;
    }
  }
  
  // ── Retribution update ──
  if(player.retributionActive){
    player.retributionTimer-=dt;
    if(player.retributionTimer<=0){
      player.retributionActive=false;
    }
  }
  
  // ── Damage reduction update ──
  if(player.damageReduction){
    player.damageReductionTimer-=dt;
    if(player.damageReductionTimer<=0){
      player.damageReduction=null;
    }
  }
  
  // ── Shadow regeneration update ──
  if(player.shadowRegen){
    player.shadowRegenTimer-=dt;
    if(player.shadowRegenTimer>0){
      const regenAmount=player.shadowRegenRate*dt;
      player.hp=Math.min(player.maxHp,player.hp+regenAmount);
      if(Math.random()<dt*2){ // Show regen effect occasionally
        spawnParticles(player.x,player.y,2,'#1a1a2e',80,false,2);
      }
    }else{
      player.shadowRegen=false;
    }
  }
  
  // ── Shadow zone update ──
  if(player.shadowZone){
    player.shadowZone.timer-=dt;
    if(player.shadowZone.timer>0){
      // Update shadow zone position to follow player
      player.shadowZone.x=player.x;
      player.shadowZone.y=player.y;
      
      // Apply continuous effects to enemies in range
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.shadowZone.x,e.y-player.shadowZone.y);
          if(dist<player.shadowZone.radius){
            // Apply damage over time
            if(Math.random()<dt*2){ // Damage tick
              e.hp-=player.shadowZone.damage;
              e.hitFlash=0.3;
              spawnParticles(e.x,e.y,3,'#1a1a2e',80,false,2);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        }
      });
      
      // Visual effect - occasional shadow particles
      if(Math.random()<dt*3){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*player.shadowZone.radius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#1a1a2e',60,false,2);
      }
    }else{
      player.shadowZone.alive=false;
    }
  }
  
  // ── Electromagnetic field update ──
  if(player.emfField){
    player.emfField.timer-=dt;
    if(player.emfField.timer>0){
      // Update EMF position to follow player
      player.emfField.x=player.x;
      player.emfField.y=player.y;
      
      // Apply continuous effects to enemies in range
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.emfField.x,e.y-player.emfField.y);
          if(dist<player.emfField.radius){
            // Apply electromagnetic pull
            const angle=Math.atan2(player.emfField.y-e.y,player.emfField.x-e.x);
            const pullForce=player.emfField.pullStrength*(1-dist/player.emfField.radius)*dt;
            e.vx+=Math.cos(angle)*pullForce;
            e.vy+=Math.sin(angle)*pullForce;
            
            // Apply damage over time
            if(Math.random()<dt*3){ // Damage tick
              e.hp-=player.emfField.damage;
              e.hitFlash=0.3;
              spawnParticles(e.x,e.y,3,'#00aaff',80,false,2);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        }
      });
      
      // Visual effect - rotating electromagnetic particles
      if(Math.random()<dt*4){
        const angle=gameTime*2+Math.random()*Math.PI*2;
        const radius=Math.random()*player.emfField.radius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#00aaff',60,false,2);
      }
    }else{
      player.emfField.alive=false;
    }
  }
  
  // ── Enchanted forest update ──
  if(player.enchantedForest){
    player.enchantedForest.timer-=dt;
    if(player.enchantedForest.timer>0){
      // Update forest position to follow player
      player.enchantedForest.x=player.x;
      player.enchantedForest.y=player.y;
      
      // Apply continuous effects to enemies in forest
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.enchantedForest.x,e.y-player.enchantedForest.y);
          if(dist<player.enchantedForest.radius){
            // Apply damage over time
            if(Math.random()<dt*2){ // Damage tick
              e.hp-=player.enchantedForest.damage;
              e.hitFlash=0.3;
              spawnParticles(e.x,e.y,3,'#44aa44',80,false,2);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        }
      });
      
      // Visual effect - floating leaves
      if(Math.random()<dt*3){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*player.enchantedForest.radius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#66cc66',60,false,2);
      }
    }else{
      player.enchantedForest.alive=false;
    }
  }
  
  // ── Healing grove update ──
  if(player.healingGrove){
    player.healingGrove.timer-=dt;
    if(player.healingGrove.timer>0){
      // Update grove position to follow player
      player.healingGrove.x=player.x;
      player.healingGrove.y=player.y;
      
      // Apply continuous healing to player
      if(Math.random()<dt*2){ // Heal tick
        const healAmount=player.healingGrove.healAmount*0.3;
        player.hp=Math.min(player.maxHp,player.hp+healAmount);
        if(Math.random()<dt*4){ // Show heal effect occasionally
          spawnParticles(player.x,player.y,2,'#44aa44',80,false,2);
        }
      }
      
      // Apply continuous damage to enemies in grove
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.healingGrove.x,e.y-player.healingGrove.y);
          if(dist<player.healingGrove.radius){
            // Apply nature damage over time
            if(Math.random()<dt*3){ // Damage tick
              e.hp-=player.bulletDmg*0.1;
              e.hitFlash=0.3;
              spawnParticles(e.x,e.y,3,'#44aa44',80,false,2);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        }
      });
      
      // Visual effect - glowing flowers
      if(Math.random()<dt*4){
        const angle=gameTime+Math.random()*Math.PI*2;
        const radius=Math.random()*player.healingGrove.radius;
        const x=player.x+Math.cos(angle)*radius;
        const y=player.y+Math.sin(angle)*radius;
        spawnParticles(x,y,3,'#66cc66',60,false,2);
      }
    }else{
      player.healingGrove.alive=false;
    }
  }
  
  // ── Hunter trap update ──
  if(player.hunterTrap){
    player.hunterTrap.timer-=dt;
    if(player.hunterTrap.timer>0){
      // Check for enemies in trap range
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly&&!player.hunterTrap.triggered){
          const dist=Math.hypot(e.x-player.hunterTrap.x,e.y-player.hunterTrap.y);
          if(dist<player.hunterTrap.triggerRadius){
            // Trigger trap
            player.hunterTrap.triggered=true;
            
            // Immobilize enemy
            e.rooted=true;
            e.rootedTimer=3;
            e.speed=0;
            
            // Apply trap damage
            e.hp-=player.bulletDmg*0.5;
            e.hitFlash=0.5;
            
            // Visual trap activation
            for(let i=0;i<12;i++){
              const angle=(i/12)*Math.PI*2;
              const x=player.hunterTrap.x+Math.cos(angle)*player.hunterTrap.radius;
              const y=player.hunterTrap.y+Math.sin(angle)*player.hunterTrap.radius;
              spawnParticles(x,y,4,'#8B4513',100,false,2);
            }
            
            // Create lasso effect around enemy
            for(let i=0;i<8;i++){
              const angle=(i/8)*Math.PI*2;
              const lassoX=e.x+Math.cos(angle)*20;
              const lassoY=e.y+Math.sin(angle)*20;
              spawnParticles(lassoX,lassoY,3,'#654321',80,false,2);
            }
            
            spawnParticles(e.x,e.y,8,'#8B4513',120,false,4);
            spawnFloatText(e.x,e.y-30,'🪤 ATRAPADO!','#8B4513',14);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              document.getElementById('scoreDisplay').textContent=score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Visual trap effect
      if(!player.hunterTrap.triggered && Math.random()<dt*2){
        const angle=Math.random()*Math.PI*2;
        const x=player.hunterTrap.x+Math.cos(angle)*player.hunterTrap.radius*0.5;
        const y=player.hunterTrap.y+Math.sin(angle)*player.hunterTrap.radius*0.5;
        spawnParticles(x,y,2,'#8B4513',60,false,2);
      }
    }else{
      player.hunterTrap.alive=false;
    }
  }
  
  // ── Ice wall update ──
  if(player.iceWall){
    player.iceWall.timer-=dt;
    if(player.iceWall.timer>0){
      // Apply continuous slow to enemies near wall
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.iceWall.x,e.y-player.iceWall.y);
          if(dist<player.iceWall.width){
            // Apply slow effect
            if(!e.slowed || e.slowedTimer<1){
              e.speed*=0.7;
              e.slowed=true;
              e.slowedTimer=1;
              
              // Visual ice effect
              if(Math.random()<dt*2){
                spawnParticles(e.x,e.y,2,'#aaddff',60,false,2);
              }
            }
          }
        }
      });
      
      // Visual ice fog effect
      if(Math.random()<dt*3){
        const x=player.iceWall.x+Math.random()*player.iceWall.width-player.iceWall.width/2;
        const y=player.iceWall.y+Math.random()*20-10;
        spawnParticles(x,y,2,'#ffffff',50,false,2);
      }
    }else{
      player.iceWall.alive=false;
    }
  }
  
  // ── Fire trail update ──
  if(player.fireTrail){
    player.fireTrail.timer-=dt;
    if(player.fireTrail.timer>0){
      // Apply continuous burn to enemies in trail
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.fireTrail.x,e.y-player.fireTrail.y);
          if(dist<player.fireTrail.width){
            // Apply burn damage over time
            if(Math.random()<dt*3){
              e.hp-=player.fireTrail.damagePerSecond*dt;
              e.hitFlash=0.3;
              e.burning=true;
              e.burningTimer=1;
              
              // Visual fire effect
              spawnParticles(e.x,e.y,3,'#ff8800',80,false,2);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        }
      });
      
      // Visual fire trail effect
      if(Math.random()<dt*4){
        const x=player.fireTrail.x+Math.random()*20-10;
        const y=player.fireTrail.y+Math.random()*player.fireTrail.width-player.fireTrail.width/2;
        spawnParticles(x,y,3,'#ff8800',70,false,2);
      }
    }else{
      player.fireTrail.alive=false;
    }
  }
  
  // ── Freeze area update ──
  if(player.freezeArea){
    player.freezeArea.timer-=dt;
    if(player.freezeArea.timer>0){
      // Apply continuous freeze to enemies in area
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.freezeArea.x,e.y-player.freezeArea.y);
          if(dist<player.freezeArea.radius){
            // Apply freeze effect
            if(!e.frozen || e.frozenTimer<1){
              e.frozen=true;
              e.frozenTimer=1;
              e.speed=0;
              
              // Visual ice effect
              if(Math.random()<dt*2){
                for(let j=0;j<4;j++){
                  const angle=Math.random()*Math.PI*2;
                  const crystalX=e.x+Math.cos(angle)*10;
                  const crystalY=e.y+Math.sin(angle)*10;
                  spawnParticles(crystalX,crystalY,2,'#aaddff',60,false,2);
                }
              }
            }
          }
        }
      });
      
      // Visual freeze area effect
      if(Math.random()<dt*3){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*player.freezeArea.radius;
        const x=player.freezeArea.x+Math.cos(angle)*radius;
        const y=player.freezeArea.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#aaddff',50,false,2);
      }
    }else{
      player.freezeArea.alive=false;
    }
  }
  
  // ── Inferno field update ──
  if(player.infernoField){
    player.infernoField.timer-=dt;
    if(player.infernoField.timer>0){
      // Apply continuous hellfire damage to enemies in field
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.infernoField.x,e.y-player.infernoField.y);
          if(dist<player.infernoField.radius){
            // Apply hellfire damage over time
            if(Math.random()<dt*4){
              e.hp-=player.infernoField.damagePerSecond*dt;
              e.hitFlash=0.4;
              e.burning=true;
              e.burningTimer=2;
              e.burningDamage=player.bulletDmg*0.1;
              e.slowed=true;
              e.slowedTimer=1;
              e.speed*=0.8;
              
              // Visual hellfire effect
              for(let j=0;j<6;j++){
                const angle=(j/6)*Math.PI*2;
                const fireX=e.x+Math.cos(angle)*15;
                const fireY=e.y+Math.sin(angle)*15;
                spawnParticles(fireX,fireY,3,'#ff4400',100,false,2);
              }
              
              spawnParticles(e.x,e.y,5,'#ff8800',120,false,3);
              
              if(e.hp<=0){
                e.alive=false;
                e.deathAnim=1;
                score+=e.score;
                document.getElementById('scoreDisplay').textContent=score;
                spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                updateEnemyCount();
              }
            }
          }
        }
      });
      
      // Visual lava pool effect
      if(Math.random()<dt*5){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*player.infernoField.radius*0.8;
        const x=player.infernoField.x+Math.cos(angle)*radius;
        const y=player.infernoField.y+Math.sin(angle)*radius;
        spawnParticles(x,y,4,'#ff4400',90,false,2);
      }
    }else{
      player.infernoField.alive=false;
    }
  }
  
    
  // ── EM field update ──
  if(player.emField){
    player.emField.timer-=dt;
    if(player.emField.timer>0){
      // Apply continuous disruption to enemies in field
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.emField.x,e.y-player.emField.y);
          if(dist<player.emField.radius){
            // Apply disruption effect
            if(!e.disrupted || e.disruptedTimer<1){
              e.disrupted=true;
              e.disruptedTimer=1;
              e.speed*=0.8;
              e.shootRate*=1.2;
              
              // Visual EMP effect
              if(Math.random()<dt*2){
                spawnParticles(e.x,e.y,2,'#00aaff',70,false,2);
              }
            }
          }
        }
      });
      
      // Visual EM field effect
      if(Math.random()<dt*3){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*player.emField.radius;
        const x=player.emField.x+Math.cos(angle)*radius;
        const y=player.emField.y+Math.sin(angle)*radius;
        spawnParticles(x,y,3,'#00ffff',60,false,2);
      }
    }else{
      player.emField.alive=false;
    }
  }
  
  // ── Afterimage update ──
  if(player.afterimage){
    player.afterimage.timer-=dt;
    if(player.afterimage.timer<=0){
      player.afterimage.alive=false;
    }
  }
  
  // ── Satellite field update ──
  if(player.satelliteField){
    player.satelliteField.timer-=dt;
    if(player.satelliteField.timer<=0){
      player.satelliteField.alive=false;
    }
  }
  
  // ── Spatial distortions update ──
  if(player.distortions){
    player.distortions=player.distortions.filter(distortion=>distortion.alive);
    player.distortions.forEach(distortion=>{
      // Update timer
      distortion.timer-=dt;
      if(distortion.timer<=0){
        distortion.alive=false;
        spawnParticles(distortion.x,distortion.y,10,'#4a4a8e',120,false,4);
        return;
      }
      
      // Apply pull effect to enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-distortion.x,e.y-distortion.y);
          if(dist<distortion.radius+50){
            // Apply pull force
            const pullAngle=Math.atan2(distortion.y-e.y,distortion.x-e.x);
            const pullForce=distortion.pullStrength*(1-dist/(distortion.radius+50))*dt;
            e.vx+=Math.cos(pullAngle)*pullForce;
            e.vy+=Math.sin(pullAngle)*pullForce;
            
            // Apply distortion damage over time
            if(Math.random()<dt*2){
              e.hp-=distortion.damage*dt;
              e.hitFlash=0.3;
              
              spawnParticles(e.x,e.y,3,'#2a2a4e',80,false,2);
            }
          }
        }
      });
      
      // Visual distortion effect
      if(Math.random()<dt*3){
        const angle=Math.random()*Math.PI*2;
        const radius=distortion.radius*0.8;
        const x=distortion.x+Math.cos(angle)*radius;
        const y=distortion.y+Math.sin(angle)*radius;
        spawnParticles(x,y,2,'#6a6aae',70,false,2);
      }
    });
  }
  
  // ── Void vortex update ──
  if(player.voidVortex){
    player.voidVortex.timer-=dt;
    if(player.voidVortex.timer>0){
      // Update rotation
      player.voidVortex.rotationAngle=(player.voidVortex.rotationAngle||0)+player.voidVortex.rotationSpeed*dt;
      
      // Apply continuous pull and damage to enemies
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.voidVortex.x,e.y-player.voidVortex.y);
          if(dist<player.voidVortex.radius){
            // Apply pull force
            const pullAngle=Math.atan2(player.voidVortex.y-e.y,player.voidVortex.x-e.x);
            const pullForce=player.voidVortex.pullStrength*(1-dist/player.voidVortex.radius)*dt;
            e.vx+=Math.cos(pullAngle)*pullForce;
            e.vy+=Math.sin(pullAngle)*pullForce;
            
            // Apply vortex damage over time
            if(Math.random()<dt*3){
              e.hp-=player.voidVortex.damage*dt;
              e.hitFlash=0.4;
              e.slowed=true;
              e.slowedTimer=1;
              e.speed*=0.8;
              
              // Create vortex effect
              for(let j=0;j<4;j++){
                const angle=(j/4)*Math.PI*2;
                const vortexX=e.x+Math.cos(angle)*10;
                const vortexY=e.y+Math.sin(angle)*10;
                spawnParticles(vortexX,vortexY,2,'#4a4a8e',70,false,2);
              }
              
              spawnParticles(e.x,e.y,4,'#2a2a4e',90,false,3);
            }
          }
        }
      });
      
      // Visual vortex effect
      if(Math.random()<dt*4){
        const angle=Math.random()*Math.PI*2;
        const radius=player.voidVortex.radius*0.7;
        const x=player.voidVortex.x+Math.cos(angle)*radius;
        const y=player.voidVortex.y+Math.sin(angle)*radius;
        spawnParticles(x,y,3,'#4a4a8e',80,false,2);
      }
      
      // Create spiral particles
      for(let i=0;i<8;i++){
        const spiralAngle=player.voidVortex.rotationAngle+(i/8)*Math.PI*2;
        const spiralRadius=player.voidVortex.radius*0.6;
        const x=player.voidVortex.x+Math.cos(spiralAngle)*spiralRadius;
        const y=player.voidVortex.y+Math.sin(spiralAngle)*spiralRadius;
        spawnParticles(x,y,2,'#1a1a3e',60,false,2);
      }
    }else{
      player.voidVortex.alive=false;
    }
  }
  
  // ── Void phase update ──
  if(player.voidPhase){
    player.voidPhaseTimer-=dt;
    if(player.voidPhaseTimer<=0){
      player.voidPhase=false;
    }
  }
  
  // ── Void afterimage update ──
  if(player.voidAfterimage){
    player.voidAfterimage.timer-=dt;
    if(player.voidAfterimage.timer<=0){
      player.voidAfterimage.alive=false;
    }
  }
  
  // ── Black hole update ──
  if(player.blackHole){
    player.blackHole.timer-=dt;
    player.blackHole.stageTimer+=dt;
    
    if(player.blackHole.timer>0){
      // Update pull strength based on stage
      if(player.blackHole.stage==='forming' && player.blackHole.stageTimer>1){
        player.blackHole.stage='active';
        player.blackHole.currentPullStrength=player.blackHole.maxPullStrength;
      }else if(player.blackHole.stage==='active' && player.blackHole.timer<1){
        player.blackHole.stage='collapsing';
        player.blackHole.currentPullStrength=player.blackHole.maxPullStrength*0.5;
      }
      
      // Apply gravitational effects
      enemies.forEach(e=>{
        if(e.alive&&!e.isAlly){
          const dist=Math.hypot(e.x-player.blackHole.x,e.y-player.blackHole.y);
          if(dist<player.blackHole.radius*2){
            // Apply gravitational pull
            const pullAngle=Math.atan2(player.blackHole.y-e.y,player.blackHole.x-e.x);
            const pullForce=player.blackHole.currentPullStrength*(1-dist/(player.blackHole.radius*2))*dt;
            e.vx+=Math.cos(pullAngle)*pullForce;
            e.vy+=Math.sin(pullAngle)*pullForce;
            
            // Apply distortion effects
            if(dist<player.blackHole.radius){
              e.distorted=true;
              e.distortedTimer=1;
              e.speed*=0.3;
              e.slowed=true;
              e.slowedTimer=1;
              
              // Apply damage over time
              if(Math.random()<dt*4){
                e.hp-=player.bulletDmg*0.4*dt;
                e.hitFlash=0.5;
                
                // Create distortion effect
                for(let j=0;j<6;j++){
                  const angle=(j/6)*Math.PI*2;
                  const gravX=e.x+Math.cos(angle)*15;
                  const gravY=e.y+Math.sin(angle)*15;
                  spawnParticles(gravX,gravY,3,'#2a2a4e',90,false,2);
                }
                
                spawnParticles(e.x,e.y,6,'#1a1a3e',110,false,3);
              }
            }
          }
        }
      });
      
      // Visual black hole effects
      if(Math.random()<dt*5){
        const angle=Math.random()*Math.PI*2;
        const radius=player.blackHole.radius*0.9;
        const x=player.blackHole.x+Math.cos(angle)*radius;
        const y=player.blackHole.y+Math.sin(angle)*radius;
        spawnParticles(x,y,3,'#1a1a1e',100,false,2);
      }
      
      // Create accretion disk
      for(let i=0;i<12;i++){
        const diskAngle=player.blackHole.stageTimer*2+(i/12)*Math.PI*2;
        const diskRadius=player.blackHole.radius*0.7;
        const x=player.blackHole.x+Math.cos(diskAngle)*diskRadius;
        const y=player.blackHole.y+Math.sin(diskAngle)*diskRadius;
        spawnParticles(x,y,2,'#4a4a8e',70,false,2);
      }
      
      // Create singularity core
      for(let i=0;i<8;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*15;
        const x=player.blackHole.x+Math.cos(angle)*radius;
        const y=player.blackHole.y+Math.sin(angle)*radius;
        spawnParticles(x,y,3,'#000000',90,false,3);
      }
    }else{
      player.blackHole.alive=false;
    }
  }
  
  
  // ── Clones update ──
  if(player.clones){
    player.clones=player.clones.filter(clone=>clone.alive);
    player.clones.forEach(clone=>{
      // Update timer
      clone.timer-=dt;
      if(clone.timer<=0){
        clone.alive=false;
        spawnParticles(clone.x,clone.y,10,'#cc88ff',120,false,4);
        return;
      }
      
      // Update walk cycle for animation
      clone.walkCycle=(clone.walkCycle||0)+dt*10;
      
      // Clone shooting logic
      if(clone.canShoot){
        clone.shootCooldown-=dt;
        if(clone.shootCooldown<=0){
          // Find nearest enemy for clone to shoot at
          let nearestEnemy=null;
          let nearestDist=Infinity;
          enemies.forEach(e=>{
            if(e.alive&&!e.isAlly){
              const dist=Math.hypot(e.x-clone.x,e.y-clone.y);
              if(dist<nearestDist&&dist<clone.range){
                nearestDist=dist;
                nearestEnemy=e;
              }
            }
          });
          
          if(nearestEnemy){
            const dx=nearestEnemy.x-clone.x,dy=nearestEnemy.y-clone.y,d=Math.hypot(dx,dy);
            const angle=Math.atan2(dy,dx);
            fireBullet(clone.x,clone.y,Math.cos(angle)*400,Math.sin(angle)*400,'player',clone.damage,'#cc88ff',8);
            clone.shootCooldown=0.8; // Clone shoot rate
          }
        }
      }
    });
  }
  
  // ── Illusion decoys update ──
  if(player.illusions){
    player.illusions=player.illusions.filter(illusion=>illusion.alive);
    player.illusions.forEach(illusion=>{
      illusion.timer-=dt;
      if(illusion.timer<=0){
        illusion.alive=false;
        spawnParticles(illusion.x,illusion.y,8,'#cc88ff',100,false,3);
      }
    });
  }
  
  // ── Ghost echoes update ──
  if(player.ghostEchoes){
    player.ghostEchoes=player.ghostEchoes.filter(echo=>echo.alive);
    player.ghostEchoes.forEach(echo=>{
      echo.timer-=dt;
      if(echo.timer<=0){
        echo.alive=false;
        spawnParticles(echo.x,echo.y,6,'#aa44ff',80,false,2);
      }
    });
  }

  // ── Opponent update (in multi) ──
  if(gameMode==='multi'&&opponent){
    if(opponent.shieldTimer>0){opponent.shieldTimer-=dt;if(opponent.shieldTimer<=0)opponent.shieldActive=false;}
    if(opponent.deathAnim>0){opponent.deathAnim-=dt*2;}
  }

  // ── Enemies ──
  enemies.forEach(e=>{if(e.alive&&!e.isAlly)updateEnemy(e,dt);if(e.deathAnim>0)e.deathAnim-=dt*2;});

  // ── Bombs ──
  bombs.forEach(b=>{
    if(!b.alive)return;
    // Enhanced vortex attraction for Spectre bomb
    if(b.vortex){
      b.timer-=dt;
      b.stageTimer+=dt;
      
      // Progress through stages
      if(b.stageTimer>=1 && b.currentStage<b.stages-1){
        b.currentStage++;
        b.stageTimer=0;
      }
      
      const stageRadius=b.maxRadius*(1-b.currentStage*0.2); // Shrinking radius
      const stageDamage=b.damage*(1-b.currentStage*0.3); // Decreasing damage
      
      enemies.forEach(e=>{
        if(!e.alive||e.isAlly)return;
        const dist=Math.hypot(e.x-b.x,e.y-b.y);
        if(dist<stageRadius){
          // Pull force based on distance
          const dx=b.x-e.x,dy=b.y-e.y,d=Math.hypot(dx,dy);
          if(d>0){
            const force=b.pullStrength*(1-dist/stageRadius)*dt;
            e.vx+=(dx/d)*force;
            e.vy+=(dy/d)*force;
            
            // Damage based on proximity to center
            const damageMultiplier=1-(dist/stageRadius)*0.5;
            const damage=Math.floor(stageDamage*damageMultiplier);
            e.hp-=damage;
            e.hitFlash=0.5;
            
            // Visual feedback
            spawnParticles(e.x,e.y,4,'#aa44ff',90,false,2);
            spawnFloatText(e.x,e.y-20,'🌌 '+damage,'#aa44ff',12);
            
            if(e.hp<=0){
              e.alive=false;
              e.deathAnim=1;
              score+=e.score;
              spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
              spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
              updateEnemyCount();
            }
          }
        }
      });
      
      // Visual vortex effect
      for(let i=0;i<12;i++){
        const angle=(i/12)*Math.PI*2+gameTime*3;
        const x=b.x+Math.cos(angle)*stageRadius;
        const y=b.y+Math.sin(angle)*stageRadius;
        spawnParticles(x,y,6,'#aa44ff',120,false,3);
      }
      
      // Center vortex effect
      spawnParticles(b.x,b.y,8,'#aa44ff',150,false,4);
      
      if(b.timer<=0)explodeBomb(b);
    }
    else if(b.isMine){if(b.armed>0){b.armed-=dt;return;}enemies.forEach(e=>{if(!e.alive)return;if(Math.hypot(e.x-b.x,e.y-b.y)<b.radius*0.4)explodeBomb(b);});
      if(gameMode==='multi'&&opponent&&opponent.alive&&Math.hypot(opponent.x-b.x,opponent.y-b.y)<b.radius*0.4)explodeBomb(b);}
    else{b.timer-=dt;if(b.timer<=0)explodeBomb(b);}
  });
  bombs=bombs.filter(b=>b.alive);

  // Draw fire walls
  fireWalls.forEach(fw=>{
    if(!fw.alive)return;
    fw.timer-=dt;
    if(fw.timer<=0){fw.alive=false;return;}
    // Damage enemies touching the fire wall
    enemies.forEach(e=>{
      if(!e.alive||e.isAlly)return;
      const{tx:etx,ty:ety}=worldToTile(e.x,e.y);
      if(etx===fw.x&&ety===fw.y){
        e.hp-=200*dt;
        handleEnemyDeath(e);
      }
    });
  });
  fireWalls=fireWalls.filter(fw=>fw.alive);

  // Update thunder power tiles
  if(player&&player.alive&&mapConfig.gimmick==='thunder_power'){
    const{tx,ty}=worldToTile(player.x,player.y);
    if(tileMap[ty]&&tileMap[ty][tx]===28){
      if(!player.thunderPowerActive){
        player.thunderPowerActive=true;
        player.thunderPowerTimer=3; // 3 seconds of thunder power
        player.damageBoost=3.0; // 3x damage
        spawnFloatText(player.x,player.y-60,'⚡ THUNDER POWER x3!','#00aaff',24);
        spawnParticles(player.x,player.y,25,'#00aaff',180,false,10);
      }
    }
  }
  
  // Update combo system
  comboTimer-=dt;
  if(comboTimer<=0){
    comboDamageMultiplier=1;
    comboCount=0;
  }
  
  // Update enemy turrets
  if(mapConfig.gimmick==='spy_equipment'){
    enemyTurrets.forEach(turret=>{
      if(!turret.alive)return;
      turret.cooldown-=dt;
      if(turret.cooldown<=0&&player&&player.alive){
        const dx=player.x-turret.x;
        const dy=player.y-turret.y;
        const dist=Math.hypot(dx,dy);
        if(dist<turret.range){
          turret.cooldown=turret.fireRate;
          const angle=Math.atan2(dy,dx);
          fireBulletEnemy(turret.x,turret.y,Math.cos(angle)*400,Math.sin(angle)*400,turret.damage,turret.color,turret.bulletSize);
          spawnParticles(turret.x,turret.y,10,turret.color,100,false,4);
        }
      }
    });
  }

  
  // ── Bullets ──
  const allBullets=[...bullets,...opponentBullets];
  [...bullets,...opponentBullets].forEach(b=>{
    if(!b.alive)return;
    b.age+=dt;if(b.age>3){b.alive=false;return;}
    
        
    b.trail.push({x:b.x,y:b.y});if(b.trail.length>8)b.trail.shift();
    
    // Homing projectile logic
    if(b.homing && b.owner==='enemy' && player && player.alive){
      const dx=player.x-b.x, dy=player.y-b.y, dist=Math.hypot(dx,dy);
      if(dist>0){
        const homingSpeed=300;
        const angle=Math.atan2(dy,dx);
        b.vx=Math.cos(angle)*homingSpeed;
        b.vy=Math.sin(angle)*homingSpeed;
      }
    }
    
    // Magnetic tiles pull bullets toward center
    const{tx,ty}=worldToTile(b.x,b.y);
    if(isInMagnetic(b.x,b.y)){
      const centerX=mapW*TILE/2,centerY=mapH*TILE/2;
      const dx=centerX-b.x,dy=centerY-b.y,d=Math.hypot(dx,dy);
      if(d>30){b.vx+=(dx/d)*200*dt;b.vy+=(dy/d)*200*dt;}
    }
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(isSolid(tx,ty)&&tileMap[ty][tx]!==23){
            
      b.alive=false;spawnParticles(b.x,b.y,5,b.color,60,false,3);
      const destr=destructibles.find(d=>d.alive&&Math.hypot(d.x-b.x,d.y-b.y)<36);
      if(destr){destr.hp-=b.owner==='player'?300:100;if(destr.hp<=0){destr.alive=false;const{tx:dx,ty:dy}=worldToTile(destr.x,destr.y);if(tileMap[dy]&&tileMap[dy][dx]!==1)tileMap[dy][dx]=0;spawnParticles(destr.x,destr.y,15,'#aa8833',120,true,5);spawnFloatText(destr.x,destr.y-30,'💥','#fff',24);shakeAmt=4;score+=destr.type==='crate'?75:50;}}
      return;
    }
    // Player bullets hit enemies
    if(b.owner==='player'){
      enemies.forEach(e=>{if(!e.alive||e.isAlly)return;if(Math.hypot(b.x-e.x,b.y-e.y)<e.radius+b.size){if(b.piercing&&b.hitEnemies.has(e))return;b.hitEnemies.add(e);
        let dmg=b.damage;
        
        // Rayo ability: damage multiplier based on enemies hit
        if(b.isRayo){
          const enemiesHit = b.hitEnemies.size;
          const multiplier = 1 + (enemiesHit - 1) * 0.3; // 30% more damage per additional enemy
          dmg = Math.floor(b.damage * multiplier);
          if(enemiesHit > 1){
            spawnFloatText(player.x,player.y-100,'⚡ MULTIPLICADOR x'+multiplier.toFixed(1),'#00aaff',18);
          }
        }
        
                
        // Resonance ability: special handling for sonic resonance waves
        if(b.isResonance){
          // Apply resonance effects
          e.vibrated=true;
          e.vibratedTimer=2;
          e.speed*=0.6;
          e.shootRate*=1.5;
          
          // Chance to stun
          if(Math.random()<b.stunChance){
            e.stunned=true;
            e.stunnedTimer=1.5;
            
            // Create stun effect
            for(let j=0;j<6;j++){
              const angle=(j/6)*Math.PI*2;
              const x=e.x+Math.cos(angle)*12;
              const y=e.y+Math.sin(angle)*12;
              spawnParticles(x,y,2,'#00ffaa',80,false,2);
            }
            spawnFloatText(e.x,e.y-30,'🎵 ATURDIDO!','#00ffaa',12);
          }
          
          // Create resonance effect
          for(let j=0;j<8;j++){
            const angle=(j/8)*Math.PI*2;
            const resonanceX=e.x+Math.cos(angle)*15;
            const resonanceY=e.y+Math.sin(angle)*15;
            spawnParticles(resonanceX,resonanceY,3,'#00ffcc',90,false,2);
          }
          
          spawnFloatText(e.x,e.y-30,'🎵 RESONANCIA!','#00ffcc',14);
        }
        
        if(e.shieldActive){dmg*=0.5;spawnFloatText(e.x,e.y-40,'🛡️','#88ff00',12);}e.hp-=dmg;e.hitFlash=0.5;spawnParticles(b.x,b.y,6,b.color,100,false,4);spawnFloatText(e.x,e.y-40,'-'+dmg,'#ff4444',15);hits++;if(player.invisible)ninjaStealthKills++;if(!b.piercing)b.alive=false;
        
        // Apply knockback if bullet has knockback
        if(b.knockback && b.knockback > 0){
          const dx = e.x - b.x;
          const dy = e.y - b.y;
          const dist = Math.hypot(dx, dy);
          if(dist > 0){
            const knockbackForce = b.knockback / dist;
            e.vx += dx * knockbackForce;
            e.vy += dy * knockbackForce;
            spawnParticles(e.x, e.y, 3, '#ffaa00', 80, false, 2);
            spawnFloatText(e.x, e.y - 50, '💥 KNOCKBACK!', '#ffaa00', 12);
          }
        }
        // Rayo bullet effects: slow and shock damage
        if(b.isRayo){
          e.speed*=0.5; // Slow enemy by 50%
          e.slowed=true;
          e.slowedTimer=5; // 5 seconds
          e.shockTimer=5; // 5 seconds of shock damage
          e.shockInterval=1; // Shock every 1 second
          e.lastShockTime=0;
          spawnFloatText(e.x,e.y-50,'⚡ RALENTIZADO','#00aaff',16);
          spawnParticles(e.x,e.y,10,'#00aaff',120,false,5);
        }
        if(e.hp<=0){e.alive=false;e.deathAnim=1;score+=e.score;document.getElementById('scoreDisplay').textContent=score;spawnParticles(e.x,e.y,20,e.def.color,160,true,5);spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);shakeAmt=5;flashColor='rgba(255,200,0,0.12)';flashAlpha=1;updateEnemyCount();unlockAchievement('first_blood');if(player.invisible)updateAchievementProgress('ninja_ghost',1);lastDamageSource=e;}else{comboCount++;comboTimer=3;comboDamageMultiplier=1+comboCount*0.02;spawnFloatText(player.x,player.y-100,'🔥 COMBO x'+comboCount,'#ff8800',16);}}});
    }
    // Player bullets hit opponent in multi
    if(b.owner==='player'&&gameMode==='multi'&&opponent&&opponent.alive&&!opponent.shieldActive&&!opponent.invisible){
      if(Math.hypot(b.x-opponent.x,b.y-opponent.y)<opponent.radius+b.size){
        const dmg=Math.floor(b.damage*0.7); // slightly reduced PvP damage
        opponent.hp-=dmg;
        spawnParticles(b.x,b.y,8,b.color,120,false,5);
        spawnFloatText(opponent.x,opponent.y-40,'-'+dmg,'#ff4444',16);
        b.alive=false;
        document.getElementById('oppHpFill').style.width=(Math.max(0,opponent.hp)/opponentMaxHp*100)+'%';
        if(opponent.hp<=0){opponent.alive=false;opponent.deathAnim=1;addKillMsg('🎯 ¡Eliminaste al oponente!');}
      }
    }
    // Enemy/opponent bullets hit player
    if((b.owner==='enemy'||b.owner==='opponent')&&player&&player.alive&&player.invincible<=0&&!player.shieldActive&&!player.invisible){
      if(Math.hypot(b.x-player.x,b.y-player.y)<player.radius+b.size){
        if(player.inBush&&Math.random()<0.4){b.alive=false;return;}
        const amt=b.damage;
        const prevAlive=player.alive;
        // Crystal retribution damage
        if(player.heroId==='crystal'&&player.retributionActive){
          // Player takes damage normally, but also damages nearby enemies
          const retributionRadius=250;
          const retributionDamage=amt*0.8; // 80% of damage taken is reflected
          
          // Damage all nearby enemies
          enemies.forEach(e=>{
            if(e.alive&&!e.isAlly){
              const dist=Math.hypot(e.x-player.x,e.y-player.y);
              if(dist<retributionRadius){
                const damageMultiplier=1-(dist/retributionRadius)*0.5; // More damage closer to player
                const finalDamage=Math.floor(retributionDamage*damageMultiplier);
                e.hp-=finalDamage;
                e.hitFlash=0.5;
                
                spawnParticles(e.x,e.y,6,'#00ffff',120,false,3);
                spawnFloatText(e.x,e.y-30,'🔮 '+finalDamage,'#00ffff',14);
                updateAchievementProgress('crystal_reflector',finalDamage);
                
                if(e.hp<=0){
                  e.alive=false;
                  e.deathAnim=1;
                  score+=e.score;
                  document.getElementById('scoreDisplay').textContent=score;
                  spawnParticles(e.x,e.y,20,e.def.color,160,true,5);
                  spawnFloatText(e.x,e.y-50,'+'+e.score,'#FFD700',20);
                  updateEnemyCount();
                }
              }
            }
          });
          
          // Visual retribution effect
          for(let i=0;i<12;i++){
            const angle=(i/12)*Math.PI*2;
            const x=player.x+Math.cos(angle)*retributionRadius;
            const y=player.y+Math.sin(angle)*retributionRadius;
            spawnParticles(x,y,4,'#00ffff',100,false,2);
          }
          
          spawnParticles(player.x,player.y,15,'#00ffff',140,false,6);
          spawnFloatText(player.x,player.y-60,'🔮 RETRIBUCIÓN!','#00ffff',18);
        }
        // Titan damage boost on hit
        if(player.heroId==='titan'&&player.shieldActive){
          player.damageBoost=(player.damageBoost||1)*1.01;
          spawnFloatText(player.x,player.y-80,'⬆ DAÑO+'+(Math.floor((player.damageBoost-1)*100))+'%','#ffcc00',14);
        }
        // Find the enemy that fired this bullet
        let sourceEntity=null;
        if(b.owner==='enemy'){
          sourceEntity=enemies.find(e=>e.alive&&Math.hypot(e.x-b.x,e.y-b.y)<200);
        }
        damagePlayer(amt,sourceEntity);
        b.alive=false;
        if(gameMode==='multi'){
          reportHit(player.hp,player.alive);
          if(prevAlive&&!player.alive){addKillMsg('💀 ¡Fuiste eliminado!');showOverlay(false,true);}
        }
      }
    }
  });
  bullets=bullets.filter(b=>b.alive);
  opponentBullets=opponentBullets.filter(b=>b.alive);

  particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.life-=p.decay*dt;});
  particles=particles.filter(p=>p.life>0);
  floatingTexts.forEach(ft=>{ft.y+=ft.vy*dt;ft.life-=dt*1.2;ft.age+=dt;});
  floatingTexts=floatingTexts.filter(ft=>ft.life>0);

  // ── Coins ──
  coinsOnGround.forEach(c=>{
    if(!c.alive)return;
    c.bobOffset+=dt*5;
    if(player&&player.alive){
      const d=Math.hypot(c.x-player.x,c.y-player.y);
      if(d<40){
        coins+=c.amount;
        c.alive=false;
        spawnParticles(c.x,c.y,10,'#FFD700',120,false,4);
        spawnFloatText(c.x,c.y-40,'+'+c.amount+' 💰','#FFD700',18);
        const coinDisplay=document.getElementById('coinDisplay');
        if(coinDisplay)coinDisplay.textContent=coins+' 💰';
      }
    }
  });
  coinsOnGround=coinsOnGround.filter(c=>c.alive);

  if(player){
    cam.targetX=player.x-canvas.width/2;cam.targetY=player.y-canvas.height/2;
    cam.targetX=Math.max(0,Math.min(cam.targetX,mapW*TILE-canvas.width));
    cam.targetY=Math.max(0,Math.min(cam.targetY,mapH*TILE-canvas.height));
    cam.x+=(cam.targetX-cam.x)*0.1;cam.y+=(cam.targetY-cam.y)*0.1;
  }

  // Win conditions
  const aliveEnemies=enemies.filter(e=>e.alive).length;
  if(gameMode==='solo'){
    if(player&&!player.alive)showOverlay(false,false);
    else if(aliveEnemies===0&&gameState==='playing'){
      const levelTime=(Date.now()-levelStartTime)/1000;
      if(damageTakenInLevel===0)unlockAchievement('survivor');
      if(levelTime<60)unlockAchievement('speed_demon');
      if(mapConfig.theme==='boss')unlockAchievement('boss_slayer');
      checkAchievements();
      const nextHero=HERO_DEFS.find(h=>h.unlockAt===currentLevel&&!unlockedHeroes.has(h.id));
      if(nextHero){unlockedHeroes.add(nextHero.id);unlockedLevels.add(currentLevel+1);showUnlockScreen(nextHero);saveProgress();}
      else{unlockedLevels.add(currentLevel+1);showOverlay(true,false);saveProgress();}
    }
  } else {
    // In multi: both need to kill all enemies AND defeat each other
    if(player&&!player.alive){}// handled by reportHit
    else if(aliveEnemies===0&&opponent&&!opponent.alive&&player&&player.alive){showOverlay(true,true);}
    else if(aliveEnemies===0&&opponent&&opponent.alive&&player&&player.alive){
      // All enemies dead, now PvP only - show hint
    }
  }

  requestAnimationFrame(render);
}

let lastDamageSource = null;

function damagePlayer(amt, sourceEntity=null){
  if(!player||player.invincible>0||player.shieldActive)return;
  lastDamageSource = sourceEntity;
  
  // Apply damage reduction if active
  if(player.damageReduction){
    amt = Math.floor(amt * player.damageReduction);
    spawnFloatText(player.x,player.y-80,'🛡️ -'+Math.floor(amt*(1-player.damageReduction))+'','#00ffff',14);
  }
  
  player.hp-=amt;player.hitFlash=0.5;player.invincible=0.4;shakeAmt=5;
  flashColor='rgba(255,0,0,0.15)';flashAlpha=1;
  spawnParticles(player.x,player.y,8,'#ff4444',100,false,5);
  damageTakenInLevel+=amt;
  currentStreak=0;
  if(player.hp<=0){
    player.hp=0;
    // Phoenix revive check
    if(player.heroId==='phoenix'&&player.canRevive){
      player.canRevive=false;
      specials.shield.cd=30; // 30 second cooldown
      player.hp=player.maxHp*0.3;
      player.alive=true;
      player.invincible=2;
      spawnParticles(player.x,player.y,40,'#ff4400',300,true,12);
      spawnFloatText(player.x,player.y-80,'🔥 ¡RENACER!','#ff4400',32);
      shakeAmt=20;
      // Deal 6000 damage to killer
      if(lastDamageSource){
        if(lastDamageSource.alive){
          lastDamageSource.hp-=6000;
          lastDamageSource.hitFlash=1;
          spawnParticles(lastDamageSource.x,lastDamageSource.y,30,'#ff4400',250,true,10);
          spawnFloatText(lastDamageSource.x,lastDamageSource.y-60,'-6000','#ff4400',24);
          if(lastDamageSource.hp<=0){
            lastDamageSource.alive=false;
            lastDamageSource.deathAnim=1;
            score+=lastDamageSource.score;
            document.getElementById('scoreDisplay').textContent=score;
            spawnParticles(lastDamageSource.x,lastDamageSource.y,20,lastDamageSource.def.color,160,true,5);
            spawnFloatText(lastDamageSource.x,lastDamageSource.y-50,'+'+lastDamageSource.score,'#FFD700',20);
            updateEnemyCount();
          }
        }
      }
      lastDamageSource=null;
    } else {
      player.alive=false;
    }
  }
  document.getElementById('hpFill').style.width=(player.hp/player.maxHp*100)+'%';
}

function updateEnemyCount(){document.getElementById('enemyCount').textContent=enemies.filter(e=>e.alive&&!e.isDrone).length;}

// ── Render ──────────────────────────────
function render(ts){
  if(gameState!=='playing'){requestAnimationFrame(update);return;}
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const sx=(Math.random()-0.5)*shakeAmt,sy=(Math.random()-0.5)*shakeAmt;
  ctx.save();ctx.translate(-cam.x+sx,-cam.y+sy);
  drawMap();
  drawCoins();
  bombs.forEach(drawBomb);
  enemies.filter(e=>!e.alive&&e.deathAnim>0).forEach(e=>drawDeathExplosion(e));
  [...bullets,...opponentBullets].filter(b=>b.owner==='enemy'||b.owner==='opponent').forEach(drawBullet);
  // Sort entities by Y for depth
  const allEnts=[...enemies.filter(e=>e.alive),player,gameMode==='multi'?opponent:null].filter(Boolean).sort((a,b)=>a.y-b.y);
  allEnts.forEach(ent=>{
    if(ent===player)drawCharacter(ent,false);
    else if(ent===opponent)drawCharacter(ent,false);
    else drawEnemy(ent);
  });
  
  // Draw player clones
  if(player.clones){
    player.clones=player.clones.filter(clone=>clone.alive);
    player.clones.forEach(clone=>{
      ctx.save();
      ctx.globalAlpha=0.7; // Make clones semi-transparent
      drawCharacter(clone,false);
      ctx.restore();
    });
  }
  
    
  // Draw shadow zone
  if(player.shadowZone && player.shadowZone.alive){
    ctx.save();
    ctx.globalAlpha=0.3+Math.sin(gameTime*3)*0.1; // Pulsating transparency
    ctx.fillStyle='#1a1a2e';
    ctx.beginPath();
    ctx.arc(player.shadowZone.x, player.shadowZone.y, player.shadowZone.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw shadow zone border
    ctx.strokeStyle='#1a1a2e';
    ctx.lineWidth=2;
    ctx.globalAlpha=0.6;
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw electromagnetic field
  if(player.emfField && player.emfField.alive){
    ctx.save();
    
    // Draw rotating electromagnetic rings
    for(let ring=0;ring<3;ring++){
      const ringRadius=player.emfField.radius*(0.3+ring*0.3);
      const rotation=gameTime*2+ring*Math.PI/3;
      
      ctx.strokeStyle='#00aaff';
      ctx.lineWidth=2;
      ctx.globalAlpha=0.4+Math.sin(gameTime*4+ring)*0.2;
      
      ctx.beginPath();
      for(let i=0;i<24;i++){
        const angle=(i/24)*Math.PI*2+rotation;
        const x=player.emfField.x+Math.cos(angle)*ringRadius;
        const y=player.emfField.y+Math.sin(angle)*ringRadius;
        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    // Draw electromagnetic field border
    ctx.strokeStyle='#00ccff';
    ctx.lineWidth=3;
    ctx.globalAlpha=0.6+Math.sin(gameTime*3)*0.2;
    ctx.beginPath();
    ctx.arc(player.emfField.x, player.emfField.y, player.emfField.radius, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw enchanted forest
  if(player.enchantedForest && player.enchantedForest.alive){
    ctx.save();
    
    // Draw forest area with pulsating transparency
    ctx.globalAlpha=0.25+Math.sin(gameTime*2)*0.1;
    ctx.fillStyle='#44aa44';
    ctx.beginPath();
    ctx.arc(player.enchantedForest.x, player.enchantedForest.y, player.enchantedForest.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw forest border with animated pattern
    ctx.strokeStyle='#66cc66';
    ctx.lineWidth=3;
    ctx.globalAlpha=0.6+Math.sin(gameTime*3)*0.2;
    ctx.setLineDash([10,5]);
    ctx.lineDashOffset=gameTime*2;
    ctx.beginPath();
    ctx.arc(player.enchantedForest.x, player.enchantedForest.y, player.enchantedForest.radius, 0, Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.restore();
  }
  
  // Draw healing grove
  if(player.healingGrove && player.healingGrove.alive){
    ctx.save();
    
    // Draw healing area with soft glow
    ctx.globalAlpha=0.3+Math.sin(gameTime*4)*0.15;
    ctx.fillStyle='#66cc66';
    ctx.beginPath();
    ctx.arc(player.healingGrove.x, player.healingGrove.y, player.healingGrove.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw flower petals around the grove
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+gameTime;
      const petalX=player.healingGrove.x+Math.cos(angle)*player.healingGrove.radius*0.8;
      const petalY=player.healingGrove.y+Math.sin(angle)*player.healingGrove.radius*0.8;
      
      ctx.fillStyle='#ff6699';
      ctx.globalAlpha=0.6+Math.sin(gameTime*6+i)*0.3;
      ctx.beginPath();
      ctx.arc(petalX, petalY, 8, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw healing grove border
    ctx.strokeStyle='#44aa44';
    ctx.lineWidth=2;
    ctx.globalAlpha=0.7+Math.sin(gameTime*3)*0.2;
    ctx.beginPath();
    ctx.arc(player.healingGrove.x, player.healingGrove.y, player.healingGrove.radius, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw hunter trap
  if(player.hunterTrap && player.hunterTrap.alive){
    ctx.save();
    
    if(!player.hunterTrap.triggered){
      // Draw inactive trap
      ctx.globalAlpha=0.6+Math.sin(gameTime*2)*0.2;
      ctx.strokeStyle='#8B4513';
      ctx.lineWidth=3;
      
      // Draw rope circle
      ctx.beginPath();
      ctx.arc(player.hunterTrap.x, player.hunterTrap.y, player.hunterTrap.radius, 0, Math.PI*2);
      ctx.stroke();
      
      // Draw rope pattern
      for(let i=0;i<8;i++){
        const angle=(i/8)*Math.PI*2;
        const x1=player.hunterTrap.x+Math.cos(angle)*player.hunterTrap.radius*0.8;
        const y1=player.hunterTrap.y+Math.sin(angle)*player.hunterTrap.radius*0.8;
        const x2=player.hunterTrap.x+Math.cos(angle)*player.hunterTrap.radius;
        const y2=player.hunterTrap.y+Math.sin(angle)*player.hunterTrap.radius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      // Draw trap center
      ctx.fillStyle='#654321';
      ctx.globalAlpha=0.8;
      ctx.beginPath();
      ctx.arc(player.hunterTrap.x, player.hunterTrap.y, 8, 0, Math.PI*2);
      ctx.fill();
      
      // Draw trap icon
      ctx.fillStyle='#ffffff';
      ctx.font='12px Arial';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText('🪤', player.hunterTrap.x, player.hunterTrap.y);
    }else{
      // Draw triggered trap
      ctx.globalAlpha=0.8;
      ctx.strokeStyle='#ff4444';
      ctx.lineWidth=4;
      
      // Draw triggered rope (broken)
      ctx.setLineDash([5,5]);
      ctx.beginPath();
      ctx.arc(player.hunterTrap.x, player.hunterTrap.y, player.hunterTrap.radius, 0, Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw explosion effect
      ctx.fillStyle='#ff6644';
      ctx.globalAlpha=0.4+Math.sin(gameTime*8)*0.3;
      ctx.beginPath();
      ctx.arc(player.hunterTrap.x, player.hunterTrap.y, player.hunterTrap.radius*1.2, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw ice wall
  if(player.iceWall && player.iceWall.alive){
    ctx.save();
    
    // Draw ice wall segments
    ctx.globalAlpha=0.7+Math.sin(gameTime*3)*0.2;
    ctx.fillStyle='#aaddff';
    ctx.strokeStyle='#88ccff';
    ctx.lineWidth=2;
    
    for(let i=0;i<4;i++){
      const x=player.iceWall.x+(i-1.5)*30;
      const y=player.iceWall.y;
      const width=25;
      const height=player.iceWall.height;
      
      // Draw ice block
      ctx.fillRect(x-width/2, y-height/2, width, height);
      ctx.strokeRect(x-width/2, y-height/2, width, height);
      
      // Draw ice crystals
      ctx.fillStyle='#ffffff';
      ctx.globalAlpha=0.6+Math.sin(gameTime*4+i)*0.3;
      for(let j=0;j<3;j++){
        const crystalX=x+Math.random()*width-width/2;
        const crystalY=y+Math.random()*height-height/2;
        ctx.beginPath();
        ctx.arc(crystalX, crystalY, 2, 0, Math.PI*2);
        ctx.fill();
      }
    }
    
    // Draw ice fog
    ctx.fillStyle='#ffffff';
    ctx.globalAlpha=0.2+Math.sin(gameTime*2)*0.1;
    for(let i=0;i<8;i++){
      const x=player.iceWall.x+Math.random()*player.iceWall.width-player.iceWall.width/2;
      const y=player.iceWall.y+Math.random()*30-15;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw fire trail
  if(player.fireTrail && player.fireTrail.alive){
    ctx.save();
    
    // Draw fire trail area
    ctx.globalAlpha=0.4+Math.sin(gameTime*5)*0.2;
    ctx.fillStyle='#ff8800';
    ctx.strokeStyle='#ff6600';
    ctx.lineWidth=2;
    
    // Draw trail segments
    for(let i=0;i<15;i++){
      const t=i/15;
      const x=player.fireTrail.x+(player.x-player.fireTrail.x)*t;
      const y=player.fireTrail.y+(player.y-player.fireTrail.y)*t;
      const width=player.fireTrail.width*(1-t*0.5);
      
      ctx.beginPath();
      ctx.arc(x, y, width/2, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw fire particles
    ctx.fillStyle='#ff4400';
    ctx.globalAlpha=0.6+Math.sin(gameTime*6)*0.3;
    for(let i=0;i<12;i++){
      const t=i/12;
      const x=player.fireTrail.x+(player.x-player.fireTrail.x)*t;
      const y=player.fireTrail.y+(player.y-player.fireTrail.y)*t;
      const offsetX=Math.random()*player.fireTrail.width-player.fireTrail.width/2;
      const offsetY=Math.random()*20-10;
      
      ctx.beginPath();
      ctx.arc(x+offsetX, y+offsetY, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw freeze area
  if(player.freezeArea && player.freezeArea.alive){
    ctx.save();
    
    // Draw freeze area with pulsating effect
    ctx.globalAlpha=0.3+Math.sin(gameTime*4)*0.15;
    ctx.fillStyle='#aaddff';
    ctx.beginPath();
    ctx.arc(player.freezeArea.x, player.freezeArea.y, player.freezeArea.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw ice crystal border
    ctx.strokeStyle='#88ccff';
    ctx.lineWidth=3;
    ctx.globalAlpha=0.7+Math.sin(gameTime*3)*0.2;
    ctx.beginPath();
    ctx.arc(player.freezeArea.x, player.freezeArea.y, player.freezeArea.radius, 0, Math.PI*2);
    ctx.stroke();
    
    // Draw floating ice crystals
    ctx.fillStyle='#ffffff';
    for(let i=0;i<12;i++){
      const angle=(i/12)*Math.PI*2+gameTime;
      const radius=player.freezeArea.radius*0.8;
      const x=player.freezeArea.x+Math.cos(angle)*radius;
      const y=player.freezeArea.y+Math.sin(angle)*radius;
      
      ctx.globalAlpha=0.6+Math.sin(gameTime*5+i)*0.3;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw inferno field
  if(player.infernoField && player.infernoField.alive){
    ctx.save();
    
    // Draw inferno field with hellish glow
    ctx.globalAlpha=0.5+Math.sin(gameTime*3)*0.2;
    ctx.fillStyle='#ff4400';
    ctx.beginPath();
    ctx.arc(player.infernoField.x, player.infernoField.y, player.infernoField.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw lava pools
    ctx.fillStyle='#ff6600';
    ctx.globalAlpha=0.7+Math.sin(gameTime*2)*0.2;
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2;
      const poolX=player.infernoField.x+Math.cos(angle)*player.infernoField.radius*0.6;
      const poolY=player.infernoField.y+Math.sin(angle)*player.infernoField.radius*0.6;
      
      ctx.beginPath();
      ctx.arc(poolX, poolY, 25, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw fire border
    ctx.strokeStyle='#ff8800';
    ctx.lineWidth=4;
    ctx.globalAlpha=0.8+Math.sin(gameTime*4)*0.2;
    ctx.beginPath();
    ctx.arc(player.infernoField.x, player.infernoField.y, player.infernoField.radius, 0, Math.PI*2);
    ctx.stroke();
    
    // Draw fire particles
    ctx.fillStyle='#ffff00';
    for(let i=0;i<16;i++){
      const angle=(i/16)*Math.PI*2+gameTime*2;
      const radius=player.infernoField.radius*(0.5+Math.random()*0.5);
      const x=player.infernoField.x+Math.cos(angle)*radius;
      const y=player.infernoField.y+Math.sin(angle)*radius;
      
      ctx.globalAlpha=0.6+Math.sin(gameTime*6+i)*0.4;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
    
  // Draw EM field
  if(player.emField && player.emField.alive){
    ctx.save();
    
    // Draw EM field with pulsating effect
    ctx.globalAlpha=0.3+Math.sin(gameTime*4)*0.15;
    ctx.fillStyle='#00aaff';
    ctx.beginPath();
    ctx.arc(player.emField.x, player.emField.y, player.emField.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw energy waves
    ctx.strokeStyle='#00ffff';
    ctx.lineWidth=2;
    ctx.globalAlpha=0.6+Math.sin(gameTime*3)*0.2;
    ctx.beginPath();
    ctx.arc(player.emField.x, player.emField.y, player.emField.radius, 0, Math.PI*2);
    ctx.stroke();
    
    // Draw EMP particles
    ctx.fillStyle='#ffffff';
    for(let i=0;i<12;i++){
      const angle=(i/12)*Math.PI*2+gameTime*2;
      const radius=player.emField.radius*0.8;
      const x=player.emField.x+Math.cos(angle)*radius;
      const y=player.emField.y+Math.sin(angle)*radius;
      
      ctx.globalAlpha=0.5+Math.sin(gameTime*5+i)*0.3;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw energy pulses
    ctx.strokeStyle='#00ccff';
    ctx.lineWidth=1;
    for(let i=0;i<3;i++){
      const pulseRadius=player.emField.radius*(0.3+i*0.3);
      ctx.globalAlpha=0.4+Math.sin(gameTime*2+i)*0.2;
      ctx.beginPath();
      ctx.arc(player.emField.x, player.emField.y, pulseRadius, 0, Math.PI*2);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Draw afterimage
  if(player.afterimage && player.afterimage.alive){
    ctx.save();
    
    ctx.globalAlpha=0.3+Math.sin(gameTime*8)*0.2;
    ctx.fillStyle='#00aaff';
    ctx.strokeStyle='#00ffff';
    ctx.lineWidth=2;
    
    // Draw afterimage body
    ctx.beginPath();
    ctx.arc(player.afterimage.x, player.afterimage.y, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    // Draw energy particles around afterimage
    ctx.fillStyle='#ffffff';
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+gameTime*4;
      const x=player.afterimage.x+Math.cos(angle)*20;
      const y=player.afterimage.y+Math.sin(angle)*20;
      
      ctx.globalAlpha=0.6+Math.sin(gameTime*6+i)*0.3;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw satellite field
  if(player.satelliteField && player.satelliteField.alive){
    ctx.save();
    
    // Draw satellite field border
    ctx.strokeStyle='#00ffff';
    ctx.lineWidth=3;
    ctx.globalAlpha=0.5+Math.sin(gameTime*2)*0.2;
    ctx.beginPath();
    ctx.arc(player.satelliteField.x, player.satelliteField.y, player.satelliteField.radius, 0, Math.PI*2);
    ctx.stroke();
    
    // Draw satellites
    ctx.fillStyle='#00aaff';
    ctx.strokeStyle='#00ffff';
    ctx.lineWidth=2;
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+gameTime*0.5;
      const radius=player.satelliteField.radius*0.8;
      const x=player.satelliteField.x+Math.cos(angle)*radius;
      const y=player.satelliteField.y+Math.sin(angle)*radius;
      
      ctx.globalAlpha=0.7+Math.sin(gameTime*3+i)*0.2;
      
      // Satellite body
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      
      // Solar panels
      ctx.fillStyle='#006699';
      ctx.fillRect(x-15, y-2, 10, 4);
      ctx.fillRect(x+5, y-2, 10, 4);
      
      // Satellite antenna
      ctx.strokeStyle='#ffffff';
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y-12);
      ctx.stroke();
      
      // Antenna dish
      ctx.fillStyle='#ff0000';
      ctx.beginPath();
      ctx.arc(x, y-12, 3, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw targeting grid
    ctx.strokeStyle='#00ccff';
    ctx.lineWidth=1;
    ctx.globalAlpha=0.3+Math.sin(gameTime*4)*0.1;
    for(let i=0;i<4;i++){
      const angle=(i/4)*Math.PI*2;
      ctx.beginPath();
      ctx.moveTo(player.satelliteField.x, player.satelliteField.y);
      ctx.lineTo(
        player.satelliteField.x+Math.cos(angle)*player.satelliteField.radius,
        player.satelliteField.y+Math.sin(angle)*player.satelliteField.radius
      );
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Draw spatial distortions
  if(player.distortions){
    player.distortions.forEach(distortion=>{
      if(distortion.alive){
        ctx.save();
        
        // Draw distortion field
        ctx.globalAlpha=0.4+Math.sin(gameTime*4)*0.2;
        ctx.fillStyle='#4a4a8e';
        ctx.beginPath();
        ctx.arc(distortion.x, distortion.y, distortion.radius, 0, Math.PI*2);
        ctx.fill();
        
        // Draw distortion rings
        ctx.strokeStyle='#6a6aae';
        ctx.lineWidth=2;
        ctx.globalAlpha=0.6+Math.sin(gameTime*3)*0.3;
        for(let i=0;i<3;i++){
          const ringRadius=distortion.radius*(0.3+i*0.3);
          ctx.beginPath();
          ctx.arc(distortion.x, distortion.y, ringRadius, 0, Math.PI*2);
          ctx.stroke();
        }
        
        // Draw distortion particles
        ctx.fillStyle='#8a8aae';
        ctx.globalAlpha=0.7+Math.sin(gameTime*5)*0.3;
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2+gameTime*2;
          const radius=distortion.radius*0.6;
          const x=distortion.x+Math.cos(angle)*radius;
          const y=distortion.y+Math.sin(angle)*radius;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI*2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    });
  }
  
  // Draw void vortex
  if(player.voidVortex && player.voidVortex.alive){
    ctx.save();
    
    // Draw vortex field
    ctx.globalAlpha=0.3+Math.sin(gameTime*3)*0.2;
    ctx.fillStyle='#2a2a4e';
    ctx.beginPath();
    ctx.arc(player.voidVortex.x, player.voidVortex.y, player.voidVortex.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw spiral vortex
    ctx.strokeStyle='#4a4a8e';
    ctx.lineWidth=3;
    ctx.globalAlpha=0.6+Math.sin(gameTime*2)*0.2;
    for(let spiral=0;spiral<3;spiral++){
      ctx.beginPath();
      for(let i=0;i<50;i++){
        const angle=(i/50)*Math.PI*4+player.voidVortex.rotationAngle+spiral*Math.PI/3;
        const radius=player.voidVortex.radius*(i/50);
        const x=player.voidVortex.x+Math.cos(angle)*radius;
        const y=player.voidVortex.y+Math.sin(angle)*radius;
        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    
    // Draw vortex core
    ctx.fillStyle='#1a1a3e';
    ctx.globalAlpha=0.8+Math.sin(gameTime*4)*0.2;
    ctx.beginPath();
    ctx.arc(player.voidVortex.x, player.voidVortex.y, 15, 0, Math.PI*2);
    ctx.fill();
    
    // Draw energy particles
    ctx.fillStyle='#6a6aae';
    ctx.globalAlpha=0.7+Math.sin(gameTime*6)*0.3;
    for(let i=0;i<12;i++){
      const angle=(i/12)*Math.PI*2+player.voidVortex.rotationAngle*2;
      const radius=player.voidVortex.radius*0.7;
      const x=player.voidVortex.x+Math.cos(angle)*radius;
      const y=player.voidVortex.y+Math.sin(angle)*radius;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw void afterimage
  if(player.voidAfterimage && player.voidAfterimage.alive){
    ctx.save();
    
    ctx.globalAlpha=0.3+Math.sin(gameTime*8)*0.2;
    ctx.fillStyle='#2a2a4e';
    ctx.strokeStyle='#4a4a8e';
    ctx.lineWidth=2;
    
    // Draw afterimage body
    ctx.beginPath();
    ctx.arc(player.voidAfterimage.x, player.voidAfterimage.y, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    // Draw energy particles around afterimage
    ctx.fillStyle='#6a6aae';
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+gameTime*4;
      const x=player.voidAfterimage.x+Math.cos(angle)*20;
      const y=player.voidAfterimage.y+Math.sin(angle)*20;
      
      ctx.globalAlpha=0.6+Math.sin(gameTime*6+i)*0.3;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw black hole
  if(player.blackHole && player.blackHole.alive){
    ctx.save();
    
    // Draw event horizon
    ctx.globalAlpha=0.8+Math.sin(gameTime*2)*0.2;
    ctx.fillStyle='#000000';
    ctx.beginPath();
    ctx.arc(player.blackHole.x, player.blackHole.y, player.blackHole.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw accretion disk
    ctx.strokeStyle='#4a4a8e';
    ctx.lineWidth=4;
    ctx.globalAlpha=0.6+Math.sin(gameTime*3)*0.3;
    for(let ring=0;ring<3;ring++){
      const ringRadius=player.blackHole.radius*(0.5+ring*0.2);
      ctx.beginPath();
      ctx.arc(player.blackHole.x, player.blackHole.y, ringRadius, 0, Math.PI*2);
      ctx.stroke();
    }
    
    // Draw gravitational lensing effect
    ctx.strokeStyle='#6a6aae';
    ctx.lineWidth=2;
    ctx.globalAlpha=0.4+Math.sin(gameTime*4)*0.2;
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+player.blackHole.stageTimer;
      const radius=player.blackHole.radius*1.2;
      const x=player.blackHole.x+Math.cos(angle)*radius;
      const y=player.blackHole.y+Math.sin(angle)*radius;
      
      ctx.beginPath();
      ctx.moveTo(player.blackHole.x, player.blackHole.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // Draw singularity
    ctx.fillStyle='#1a1a1e';
    ctx.globalAlpha=0.9+Math.sin(gameTime*5)*0.1;
    ctx.beginPath();
    ctx.arc(player.blackHole.x, player.blackHole.y, 20, 0, Math.PI*2);
    ctx.fill();
    
    // Draw energy particles being pulled in
    ctx.fillStyle='#8a8aae';
    ctx.globalAlpha=0.7+Math.sin(gameTime*6)*0.3;
    for(let i=0;i<16;i++){
      const angle=(i/16)*Math.PI*2+player.blackHole.stageTimer*2;
      const radius=player.blackHole.radius*(1.2+Math.random()*0.5);
      const x=player.blackHole.x+Math.cos(angle)*radius;
      const y=player.blackHole.y+Math.sin(angle)*radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Draw sonic field
  if(player.sonicField && player.sonicField.alive){
    ctx.save();
    
    // Draw sonic field with pulsating effect
    ctx.globalAlpha=0.2+Math.sin(gameTime*4)*0.1;
    ctx.fillStyle='#00ffcc';
    ctx.beginPath();
    ctx.arc(player.sonicField.x, player.sonicField.y, player.sonicField.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw sound rings
    for(let ring=0;ring<3;ring++){
      ctx.globalAlpha=0.15-ring*0.05;
      ctx.strokeStyle='#00ffaa';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(player.sonicField.x, player.sonicField.y, player.sonicField.radius*(0.3+ring*0.3), 0, Math.PI*2);
      ctx.stroke();
    }
    
    // Draw sound wave particles
    ctx.globalAlpha=0.8;
    ctx.fillStyle='#00ffcc';
    for(let i=0;i<12;i++){
      const angle=(i/12)*Math.PI*2+gameTime*2;
      const radius=player.sonicField.radius*(0.8+Math.sin(gameTime*3+i)*0.2);
      const x=player.sonicField.x+Math.cos(angle)*radius;
      const y=player.sonicField.y+Math.sin(angle)*radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw echo counter
    ctx.globalAlpha=1;
    ctx.fillStyle='#00ffcc';
    ctx.font='bold 14px Arial';
    ctx.textAlign='center';
    ctx.fillText('ECO: '+player.sonicField.currentEcho+'/'+player.sonicField.echoCount, player.sonicField.x, player.sonicField.y-player.sonicField.radius-20);
    
    ctx.restore();
  }
  
  // Draw sonic trail
  if(player.sonicTrail && player.sonicTrail.alive){
    ctx.save();
    
    // Draw trail line
    ctx.globalAlpha=0.6;
    ctx.strokeStyle='#00ffcc';
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(player.sonicTrail.startX, player.sonicTrail.startY);
    ctx.lineTo(player.sonicTrail.endX, player.sonicTrail.endY);
    ctx.stroke();
    
    // Draw trail particles
    ctx.globalAlpha=0.8;
    ctx.fillStyle='#00ffaa';
    for(let i=0;i<15;i++){
      const t=i/15;
      const x=player.sonicTrail.startX+(player.sonicTrail.endX-player.sonicTrail.startX)*t;
      const y=player.sonicTrail.startY+(player.sonicTrail.endY-player.sonicTrail.startY)*t;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw trail echo counter
    ctx.globalAlpha=1;
    ctx.fillStyle='#00ffcc';
    ctx.font='bold 12px Arial';
    ctx.textAlign='center';
    const midX=(player.sonicTrail.startX+player.sonicTrail.endX)/2;
    const midY=(player.sonicTrail.startY+player.sonicTrail.endY)/2;
    ctx.fillText('ESTELA: '+player.sonicTrail.currentEcho+'/'+player.sonicTrail.echoCount, midX, midY-20);
    
    ctx.restore();
  }
  
  // Draw sonic echo field
  if(player.sonicEchoField && player.sonicEchoField.alive){
    ctx.save();
    
    // Draw echo field with pulsating effect
    ctx.globalAlpha=0.15+Math.sin(gameTime*5)*0.1;
    ctx.fillStyle='#00ffcc';
    ctx.beginPath();
    ctx.arc(player.sonicEchoField.x, player.sonicEchoField.y, player.sonicEchoField.radius, 0, Math.PI*2);
    ctx.fill();
    
    // Draw echo field rings
    for(let ring=0;ring<2;ring++){
      ctx.globalAlpha=0.1-ring*0.03;
      ctx.strokeStyle='#00ffaa';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(player.sonicEchoField.x, player.sonicEchoField.y, player.sonicEchoField.radius*(0.5+ring*0.5), 0, Math.PI*2);
      ctx.stroke();
    }
    
    // Draw echo field particles
    ctx.globalAlpha=0.7;
    ctx.fillStyle='#00ffcc';
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+gameTime*3;
      const radius=player.sonicEchoField.radius*(0.7+Math.sin(gameTime*4+i)*0.3);
      const x=player.sonicEchoField.x+Math.cos(angle)*radius;
      const y=player.sonicEchoField.y+Math.sin(angle)*radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw echo field counter
    ctx.globalAlpha=1;
    ctx.fillStyle='#00ffcc';
    ctx.font='bold 12px Arial';
    ctx.textAlign='center';
    ctx.fillText('CAMPO: '+player.sonicEchoField.currentEcho+'/'+player.sonicEchoField.echoCount, player.sonicEchoField.x, player.sonicEchoField.y-player.sonicEchoField.radius-15);
    
    ctx.restore();
  }
  
  // Draw illusion decoys
  if(player.illusions){
    player.illusions=player.illusions.filter(illusion=>illusion.alive);
    player.illusions.forEach(illusion=>{
      ctx.save();
      ctx.globalAlpha=0.5; // Make decoys more transparent
      drawCharacter(illusion,false);
      ctx.restore();
    });
  }
  
  // Draw ghost echoes
  if(player.ghostEchoes){
    player.ghostEchoes=player.ghostEchoes.filter(echo=>echo.alive);
    player.ghostEchoes.forEach(echo=>{
      ctx.save();
      ctx.globalAlpha=0.3; // Very transparent ghost effect
      drawCharacter(echo,false);
      ctx.restore();
    });
  }
  
  // Draw crystal aura
  if(player.crystalAura){
    ctx.save();
    ctx.globalAlpha=0.3+Math.sin(gameTime*4)*0.2;
    ctx.strokeStyle='#00ffff';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(player.x,player.y,60,0,Math.PI*2);
    ctx.stroke();
    
    // Crystal particles around aura
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+gameTime*2;
      const x=player.x+Math.cos(angle)*60;
      const y=player.y+Math.sin(angle)*60;
      ctx.fillStyle='#00ffff';
      ctx.beginPath();
      ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
  drawBushesOverlay();
  [...bullets,...opponentBullets].filter(b=>b.owner==='player').forEach(drawBullet);
  drawParticles();drawFloatTexts();
  ctx.restore();
  if(flashAlpha>0&&flashColor){ctx.save();ctx.globalAlpha=flashAlpha*0.6;ctx.fillStyle=flashColor;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();}
  drawMinimap();
  requestAnimationFrame(update);
}

// ── Menu Functions ───────────────────────
function hideAllScreens(){
  ['menu','levelSelect','heroSelect','lobby','overlay','unlockScreen','achievements','shop','resetConfirm','commandConsole'].forEach(id=>document.getElementById(id).style.display='none');
  ['hud','specialBar','ammoBar','minimap','escHint','controls','opponentHud','chatBox','killFeed'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('modeBadge').style.display='none';
  document.getElementById('connectionDot').style.display='none';
  setMobileControlsVisible(false);
}

function showMenu(){
  gameState='menu';
  hideAllScreens();
  document.getElementById('menu').style.display='flex';
  resetPanelScroll('menu');
}

function showAchievements(){
  hideAllScreens();
  document.getElementById('achievements').style.display='flex';
  resetPanelScroll('achievements');
  buildAchievementGrid();
}

function buildAchievementGrid(){
  const grid=document.getElementById('achGrid');grid.innerHTML='';
  ACHIEVEMENT_DEFS.forEach(a=>{
    const ach=achievements.get(a.id);
    const card=document.createElement('div');
    card.className='ach-card'+(ach.unlocked?' unlocked':' locked');
    let progressHtml='';
    if(a.target && !ach.unlocked){
      const pct=Math.min(100, (ach.progress||0)/a.target*100);
      progressHtml=`<div class="ach-progress">${ach.progress||0}/${a.target}</div><div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${pct}%"></div></div>`;
    }
    card.innerHTML=`<div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div>${progressHtml}`;
    grid.appendChild(card);
  });
}

function showLevelSelect(){
  hideAllScreens();
  document.getElementById('levelSelect').style.display='flex';
  resetPanelScroll('levelSelect');
  selectedLevelIndex=0;
  // Initialize hardmode toggle state
  document.getElementById('hardModeToggle').checked = hardMode;
  document.getElementById('hardModeIndicator').style.display = hardMode ? 'inline' : 'none';
  buildLevelGrid();
}

let selectedLevelIndex = 0;

function buildLevelGrid(){
  const grid=document.getElementById('levelGrid');grid.innerHTML='';
  LEVEL_CONFIGS.forEach((cfg,index)=>{
    const card=document.createElement('div');card.className='level-card';
    const colors={desert:'linear-gradient(135deg,#c8844a,#d4956e)',forest:'linear-gradient(135deg,#3a6e3a,#5a9e5a)',volcano:'linear-gradient(135deg,#8b2500,#cc4400)',ice:'linear-gradient(135deg,#4a7a9e,#a0c8e0)',city:'linear-gradient(135deg,#1a1a2e,#2a2a4e)',boss:'linear-gradient(135deg,#2e0a2e,#6e0a3e)',swamp:'linear-gradient(135deg,#2a4a2a,#4a8a4a)',sky:'linear-gradient(135deg,#1a2a4a,#3a5a8a)',factory:'linear-gradient(135deg,#3a3a3a,#5a5a5a)',crypt:'linear-gradient(135deg,#1a0020,#4a0040)',storm:'linear-gradient(135deg,#001030,#003070)',nexus:'linear-gradient(135deg,#200040,#500080)',crystal:'linear-gradient(135deg,#004060,#0080a0)',inferno:'linear-gradient(135deg,#4a0000,#8a0000)',void:'linear-gradient(135deg,#000000,#1a1a2e)',gravity:'linear-gradient(135deg,#1a1a3a,#2a2a5a)',mirror:'linear-gradient(135deg,#4a4a6a,#5a5a8a)',freeze:'linear-gradient(135deg,#004466,#006688)',magnetic:'linear-gradient(135deg,#2a1a4a,#4a2a6a)',chaos:'linear-gradient(135deg,#4a2a4a,#6a4a6a)',ocean:'linear-gradient(135deg,#004488,#0066aa)',dungeon:'linear-gradient(135deg,#4a2a2a,#6a4a4a)',spy:'linear-gradient(135deg,#1a1a2e,#2a2a4e)'};
    card.style.background=colors[cfg.theme]||'#333';
    const isSecret=cfg.secret;
    const isUnlocked=unlockedLevels.has(cfg.id);
    if(isSecret && !isUnlocked){
      card.style.opacity='0.3';
      card.style.filter='grayscale(0.8)';
      card.style.cursor='default';
      card.innerHTML=`<div style="font-size:34px">🔒</div><div class="lv-num">?</div><div class="lv-name">SECRETO</div><div class="lv-diff" style="background:#666;color:#fff">???</div>`;
    }else{
      card.innerHTML=`<div style="font-size:34px">${cfg.icon}</div><div class="lv-num">${cfg.id}</div><div class="lv-name">${cfg.name}${isSecret?' ⭐':''}</div><div class="lv-diff ${cfg.diffClass}">${cfg.diff}</div>`;
      card.onclick=()=>startGameFromLevel(cfg.id);
    }
    card.dataset.index=index;
    if(index===selectedLevelIndex)card.style.borderColor='#FFD700';
    grid.appendChild(card);
  });
}

function navigateLevelGrid(keyCode){
  const cards=document.querySelectorAll('.level-card');
  if(cards.length===0)return;
  const cols=4; // Number of columns in grid
  const currentRow=Math.floor(selectedLevelIndex/cols);
  const currentCol=selectedLevelIndex%cols;
  let newIndex=selectedLevelIndex;
  
  if(keyCode==='ArrowLeft')newIndex=Math.max(0,selectedLevelIndex-1);
  else if(keyCode==='ArrowRight')newIndex=Math.min(cards.length-1,selectedLevelIndex+1);
  else if(keyCode==='ArrowUp')newIndex=Math.max(0,selectedLevelIndex-cols);
  else if(keyCode==='ArrowDown')newIndex=Math.min(cards.length-1,selectedLevelIndex+cols);
  
  if(newIndex!==selectedLevelIndex){
    selectedLevelIndex=newIndex;
    cards.forEach(card=>card.style.borderColor='transparent');
    cards[selectedLevelIndex].style.borderColor='#FFD700';
    cards[selectedLevelIndex].scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  if(keyCode==='Enter')startGameFromLevel(LEVEL_CONFIGS[selectedLevelIndex].id);
}

// ── Hero Select ───────────────────────────
function showHeroSelect(fromLevel,levelId=null){
  heroSelectPendingLevel=levelId;heroSelectPreviewId=selectedHeroId;
  hideAllScreens();
  document.getElementById('heroSelect').style.display='flex';
  resetPanelScroll('heroSelect');
  buildHeroGrid();renderHeroPreview(heroSelectPreviewId);
}
function cancelHeroSelect(){heroSelectPendingLevel?showLevelSelect():showMenu();}
function startGameFromLevel(levelId){heroSelectPendingLevel=levelId;showHeroSelect(true,levelId);}
function confirmHeroSelect(){selectedHeroId=heroSelectPreviewId;const lvl=heroSelectPendingLevel||currentLevel||1;heroSelectPendingLevel=null;saveProgress();startGame(lvl,'solo');}

function buildHeroGrid(){
  const grid=document.getElementById('heroGrid');grid.innerHTML='';
  const bgColors={ranger:'linear-gradient(135deg,#0d2550,#1a3a8a)',ninja:'linear-gradient(135deg,#200030,#440044)',tank:'linear-gradient(135deg,#1a2a3a,#2a3a4a)',mage:'linear-gradient(135deg,#200a3e,#4a1a6a)',medic:'linear-gradient(135deg,#002020,#004444)',sniper_hero:'linear-gradient(135deg,#0a1a08,#1a3a14)',pyro:'linear-gradient(135deg,#4a1000,#8a2000)',cyber:'linear-gradient(135deg,#002044,#004088)',spectre:'linear-gradient(135deg,#200044,#400088)',titan:'linear-gradient(135deg,#4a3000,#8a5000)',vampire:'linear-gradient(135deg,#2a002a,#5a005a)',storm:'linear-gradient(135deg,#002050,#004090)',chronos:'linear-gradient(135deg,#400040,#800080)',crystal:'linear-gradient(135deg,#004060,#0080a0)',phoenix:'linear-gradient(135deg,#4a0000,#8a0000)',void_walker:'linear-gradient(135deg,#1a1a2e,#3a3a5e)',legend:'linear-gradient(135deg,#aa8800,#ffcc00)',gambler:'linear-gradient(135deg,#aa8800,#ffcc00)',bomber:'linear-gradient(135deg,#ff6600,#ff8800)',shadow:'linear-gradient(135deg,#1a1a2e,#2a2a4e)',thunder:'linear-gradient(135deg,#0066aa,#00aaff)',nature:'linear-gradient(135deg,#226622,#44aa44)',frost:'linear-gradient(135deg,#4488cc,#88ddff)',blaze:'linear-gradient(135deg,#cc4400,#ff6600)',void:'linear-gradient(135deg,#1a1a2e,#2a2a4e)',sonic:'linear-gradient(135deg,#008866,#00ffcc)'};
  HERO_DEFS.forEach(h=>{
    const locked=!unlockedHeroes.has(h.id);
    const card=document.createElement('div');
    card.className='hero-card'+(locked?' locked':'')+(heroSelectPreviewId===h.id?' selected-hero':'');
    card.style.background=bgColors[h.id]||'#111';
    const dots=(n,c)=>Array.from({length:5},(_,i)=>`<div class="stat-dot" style="background:${i<n?c:'#333'}"></div>`).join('');
    card.innerHTML=`<div class="hero-icon">${h.icon}</div><div class="hero-name">${h.name}</div><div class="hero-class">${h.class}</div><div class="hero-abilities-preview">${h.abilities.map(a=>`<span class="ability-mini">${a.icon}</span>`).join('')}</div><div class="hero-stats">${dots(h.stats.poder,'#ff6600')}${dots(h.stats.vida,'#00ff88')}${dots(h.stats.velocidad,'#00ccff')}</div>${locked?`<div class="lock-overlay"><div class="lock-icon">🔒</div><div class="unlock-req">${h.unlockDesc}</div></div>`:''}${heroSelectPreviewId===h.id&&!locked?'<div class="selected-indicator">✓</div>':''}`;
    if(!locked){card.onclick=()=>{heroSelectPreviewId=h.id;buildHeroGrid();renderHeroPreview(h.id);};}
    grid.appendChild(card);
  });
}

function renderHeroPreview(heroId){
  const h=HERO_DEFS.find(x=>x.id===heroId);if(!h)return;
  const sb=(n,c,l)=>`<div style="font-size:10px;color:#aabbff;margin-bottom:2px">${l}</div><div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${n*20}%;background:${c}"></div></div>`;
  document.getElementById('heroPreview').innerHTML=`<div style="font-size:56px">${h.icon}</div><div class="preview-name">${h.name} <span style="font-size:13px;color:#aabbff;font-weight:400">${h.class}</span></div><div class="preview-desc">${h.desc}</div><div class="preview-abilities">${h.abilities.map(a=>`<div class="preview-ability"><div class="pa-icon">${a.icon}</div><div class="pa-name">${a.name}</div><div class="pa-key">[${a.key}] ${a.desc}</div></div>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;width:100%;margin:6px 0"><div>${sb(h.stats.poder,'#ff6600','⚔ PODER')}</div><div>${sb(h.stats.vida,'#00ff88','❤ VIDA')}</div><div>${sb(h.stats.velocidad,'#00ccff','⚡ VELOCIDAD')}</div></div>`;
}

// ── Start Game ───────────────────────────
function startGame(levelId, mode='solo'){
  requestLandscapeMode();
  currentLevel=levelId;gameMode=mode;
  const cfg=LEVEL_CONFIGS.find(l=>l.id===levelId)||LEVEL_CONFIGS[0];
  score=0;gameTime=0;particles=[];floatingTexts=[];bullets=[];opponentBullets=[];bombs=[];
  specials.shield.cd=0;specials.bomb.cd=0;specials.dash.cd=0;specials.ultimate.cd=0;
  damageTakenInLevel=0;
  levelStartTime=Date.now();
  coinsOnGround=[];
  generateMap(cfg);
  const heroDef=HERO_DEFS.find(h=>h.id===selectedHeroId)||HERO_DEFS[0];

  // Player spawns: p1 top-left, p2 bottom-right (adjust for bridge levels)
  const isP1 = myPlayerId === 'p1' || mode === 'solo';
  let spawnX = isP1 ? 2.5*TILE : 22*TILE;
  let spawnY = isP1 ? 2.5*TILE : 17*TILE;
  // Bridge levels: spawn on middle bridge
  if(cfg.gimmick==='bridge'){
    spawnX = isP1 ? 12*TILE : 12*TILE; // Center of bridge
    spawnY = isP1 ? 10*TILE : 10*TILE; // Middle horizontal bridge
  }
  player = createPlayer(heroDef, spawnX, spawnY);

  if(mode==='multi'){
    const oppHeroDef=HERO_DEFS.find(h=>h.id===opponentHeroId)||HERO_DEFS[0];
    opponentMaxHp=oppHeroDef.hp;opponentHp=oppHeroDef.hp;opponentAlive=true;
    let oppSpawnX = isP1 ? 22*TILE : 2.5*TILE;
    let oppSpawnY = isP1 ? 17*TILE : 2.5*TILE;
    // Bridge levels: spawn opponent on different bridge section
    if(cfg.gimmick==='bridge'){
      oppSpawnX = isP1 ? 8*TILE : 16*TILE; // Different vertical bridge
      oppSpawnY = isP1 ? 10*TILE : 10*TILE; // Middle horizontal bridge
    }
    opponent=createOpponent(opponentHeroId,oppSpawnX,oppSpawnY);
    opponent.hp=opponentMaxHp;opponent.maxHp=opponentMaxHp;
  } else {
    opponent=null;
  }

  spawnEnemies(cfg);
  cam.x=0;cam.y=0;
  hideAllScreens();
  document.getElementById('hud').style.display='flex';
  document.getElementById('specialBar').style.display='flex';
  document.getElementById('ammoBar').style.display='flex';
  document.getElementById('minimap').style.display='block';
  document.getElementById('escHint').style.display='block';
  document.getElementById('controls').style.display='block';
  setMobileControlsVisible(true);
  if(mode==='multi'){
    document.getElementById('opponentHud').style.display='block';
    document.getElementById('chatBox').style.display='flex';
    document.getElementById('killFeed').style.display='flex';
    document.getElementById('modeBadge').style.display='block';
    document.getElementById('connectionDot').style.display='flex';
    document.getElementById('oppName').textContent=opponentName+' ('+HERO_DEFS.find(h=>h.id===opponentHeroId)?.icon+')';
    document.getElementById('oppHpFill').style.width='100%';
  }
  document.getElementById('levelBadge').textContent='LVL '+levelId;
  document.getElementById('heroNameHud').textContent=heroDef.icon+' '+heroDef.name;
  document.getElementById('scoreDisplay').textContent='0';
  document.getElementById('coinDisplay').textContent=coins+' 💰';
  updateAmmoUI();updateEnemyCount();updateSpecialUI();
  gameState='playing';
  requestAnimationFrame(ts=>{lastTime=ts;update(ts);});
}

function restartLevel(){startGame(currentLevel,gameMode==='multi'?'solo':'solo');}

function toggleHardMode(){
  hardMode = document.getElementById('hardModeToggle').checked;
  const indicator = document.getElementById('hardModeIndicator');
  if(hardMode){
    indicator.style.display = 'inline';
    spawnFloatText(window.innerWidth/2, window.innerHeight/2, '🔥 MODO DIFÍCIL ACTIVADO', '#ff6666', 24);
  } else {
    indicator.style.display = 'none';
    spawnFloatText(window.innerWidth/2, window.innerHeight/2, 'MODO NORMAL', '#00ff88', 20);
  }
  saveProgress();
}

function showCommandConsole(){
  hideAllScreens();
  document.getElementById('commandConsole').style.display = 'flex';
  resetPanelScroll('commandConsole');
  document.getElementById('commandInput').value = '';
  document.getElementById('commandInput').focus();
  addCommandOutput('Consola de comandos activada. Escribe "help" para ver trucos disponibles.', 'system');
}

function closeCommandConsole(){
  document.getElementById('commandConsole').style.display = 'none';
  showMenu();
}

function addCommandOutput(text, type = 'success'){
  const output = document.getElementById('commandOutput');
  const timestamp = new Date().toLocaleTimeString();
  const color = type === 'error' ? '#ff6666' : type === 'system' ? '#ffcc00' : '#00ff00';
  output.innerHTML += `<div style="color:#888; font-size:10px;">[${timestamp}]</div><div style="color:${color}; margin-bottom:8px;">${text}</div>`;
  output.scrollTop = output.scrollHeight;
}

function executeCommand(){
  const input = document.getElementById('commandInput');
  const command = input.value.trim().toLowerCase();
  
  if(!command){
    addCommandOutput('Por favor, escribe un comando.', 'error');
    return;
  }
  
  addCommandOutput(`> ${command}`, 'system');
  
  let cheatExecuted = false;
  
  // Cheat codes
  switch(command){
    case 'godmode':
      globalDamageMultiplier = 10.0;
      addCommandOutput('🔥 GODMODE ACTIVADO! Daño x10', 'success');
      spawnFloatText(canvas.width/2, canvas.height/2, '🔥 GODMODE x10', '#ff0000', 32);
      cheatExecuted = true;
      break;
      
    case 'infiniteammo':
      // Set infinite ammo by making reload instant and max ammo very high
      HERO_DEFS.forEach(hero => {
        hero.maxAmmo = 999;
        hero.reloadRate = 0.1;
      });
      addCommandOutput('🔫 MUNICIÓN INFINITA ACTIVADA!', 'success');
      spawnFloatText(canvas.width/2, canvas.height/2, '🔫 MUNICIÓN INFINITA', '#00ccff', 32);
      cheatExecuted = true;
      break;
      
    case 'speeddemon':
      // Make all heroes 2x faster
      HERO_DEFS.forEach(hero => {
        hero.speed = hero.speed * 2;
      });
      addCommandOutput('⚡ SPEED DEMON ACTIVADO! Velocidad x2', 'success');
      spawnFloatText(canvas.width/2, canvas.height/2, '⚡ VELOCIDAD x2', '#ffcc00', 32);
      cheatExecuted = true;
      break;
      
    case 'hacker':
      // Unlock secret achievement
      const secretAchievement = achievements.get('cheater');
      if(!secretAchievement.unlocked){
        secretAchievement.unlocked = true;
        secretAchievement.progress = 1;
        addCommandOutput('🏆 LOGRO SECRETO DESBLOQUEADO: ¡TRAMPOSO!', 'success');
        spawnFloatText(canvas.width/2, canvas.height/2, '🏆 ¡TRAMPOSO DESBLOQUEADO!', '#ff00ff', 32);
      } else {
        addCommandOutput('Este logro secreto ya está desbloqueado.', 'system');
      }
      cheatExecuted = true;
      break;
      
    case 'blockshop':
      // Block all shop heroes
      HERO_DEFS.forEach(hero => {
        if(hero.unlockAt === 'shop') {
          hero.unlockAt = 'blocked';
          hero.unlockDesc = 'BLOQUEADO POR TRAMPOSO';
        }
      });
      addCommandOutput('🔒 TODOS LOS HÉROES DE TIENDA BLOQUEADOS!', 'success');
      spawnFloatText(canvas.width/2, canvas.height/2, '🔒 TIENDA BLOQUEADA', '#ff0000', 32);
      cheatExecuted = true;
      break;
      
    case 'help':
      addCommandOutput('=== TRUCOS DISPONIBLES ===', 'system');
      addCommandOutput('godmode - Activa daño x10', 'success');
      addCommandOutput('infiniteammo - Munición infinita', 'success');
      addCommandOutput('speeddemon - Velocidad x2 para todos los héroes', 'success');
      addCommandOutput('hacker - Desbloquea logro secreto', 'success');
      addCommandOutput('blockshop - Bloquea todos los héroes de tienda', 'success');
      addCommandOutput('help - Muestra esta ayuda', 'system');
      break;
      
    default:
      addCommandOutput(`Comando desconocido: ${command}`, 'error');
      addCommandOutput('Escribe "help" para ver trucos disponibles.', 'system');
  }
  
  input.value = '';
  saveProgress();
  
  // Close console and show success message if cheat was executed
  if(cheatExecuted && command !== 'help'){
    setTimeout(() => {
      closeCommandConsole();
      spawnFloatText(canvas.width/2, canvas.height/2, 'CHEAT EXECUTED SUCCESSFULLY SUSSY BAKA LOL', '#ff00ff', 40);
    }, 500);
  }
}

function cleanAllCodes(){
  // Reset all cheat effects
  globalDamageMultiplier = 1.0;
  
  // Reset hero definitions to original values
  HERO_DEFS.forEach((hero, index) => {
    const originalHero = [
      { id:'ranger',      maxAmmo:6, reloadRate:2, speed:200 },
      { id:'ninja',       maxAmmo:4, reloadRate:1.5, speed:260 },
      { id:'tank',        maxAmmo:3, reloadRate:2.5, speed:145 },
      { id:'mage',        maxAmmo:5, reloadRate:2, speed:185 },
      { id:'medic',       maxAmmo:5, reloadRate:2, speed:175 },
      { id:'sniper_hero', maxAmmo:3, reloadRate:3, speed:170 },
      { id:'pyro',        maxAmmo:5, reloadRate:2, speed:190 },
      { id:'cyber',       maxAmmo:7, reloadRate:1.8, speed:210 },
      { id:'spectre',     maxAmmo:4, reloadRate:1.5, speed:240 },
      { id:'titan',       maxAmmo:5, reloadRate:2.2, speed:180 },
      { id:'vampire',     maxAmmo:5, reloadRate:2.1, speed:195 },
      { id:'storm',       maxAmmo:6, reloadRate:1.9, speed:220 },
      { id:'chronos',     maxAmmo:5, reloadRate:2.3, speed:175 },
      { id:'crystal',     maxAmmo:4, reloadRate:1.7, speed:200 },
      { id:'phoenix',     maxAmmo:6, reloadRate:1.8, speed:190 },
      { id:'void_walker', maxAmmo:5, reloadRate:2, speed:185 },
      { id:'demolition',  maxAmmo:4, reloadRate:2.4, speed:165 },
      { id:'illusionist', maxAmmo:6, reloadRate:1.6, speed:195 },
      { id:'shotgunner',  maxAmmo:2, reloadRate:2.8, speed:160 },
      { id:'hypnotist',   maxAmmo:8, reloadRate:1.4, speed:180 },
      { id:'gambler',     maxAmmo:6, reloadRate:2.2, speed:185 },
      { id:'bomber',      maxAmmo:3, reloadRate:2.6, speed:175 },
      { id:'legend',      maxAmmo:8, reloadRate:1.2, speed:250 }
    ].find(h => h.id === hero.id);
    
    if(originalHero){
      hero.maxAmmo = originalHero.maxAmmo;
      hero.reloadRate = originalHero.reloadRate;
      hero.speed = originalHero.speed;
    }
  });
  
  saveProgress();
  spawnFloatText(canvas.width/2, canvas.height/2, 'CLEANED CODES', '#00ff88', 32);
}

function showOverlay(win,isMulti=false){
  gameState=win?'win':'over';
  const ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle'),sub=document.getElementById('overlaySub');
  ov.style.display='flex';
  resetPanelScroll('overlay');
  if(win){title.className='overlay-title win-title';title.textContent=isMulti?'¡GANASTE! 🏆':'¡VICTORIA! 🏆';sub.textContent=isMulti?`¡Eliminaste a ${opponentName}! • ${score} pts`:`Nivel ${currentLevel} completado • ${score} pts`;}
  else{title.className='overlay-title lose-title';title.textContent=isMulti?'ELIMINADO 💀':'ELIMINADO 💀';sub.textContent=`Puntos: ${score}`;}
}

function showUnlockScreen(heroDef){
  gameState='win';
  const sc=document.getElementById('unlockScreen'),card=document.getElementById('unlockCard');
  sc.style.display='flex';
  resetPanelScroll('unlockScreen');
  const sb=(n,c,l)=>`<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="font-size:10px;color:#aabbff;width:65px">${l}</span>${Array.from({length:5},(_,i)=>`<div style="width:12px;height:12px;border-radius:50%;background:${i<n?c:'#333'}"></div>`).join('')}</div>`;
  card.innerHTML=`<div class="unlock-card"><div class="unlock-hero-icon">${heroDef.icon}</div><div class="unlock-hero-name">${heroDef.name}</div><div style="color:#aabbff;font-size:12px;margin-bottom:6px">${heroDef.class}</div><div class="unlock-hero-desc">${heroDef.desc}</div><div class="unlock-hero-abilities">${heroDef.abilities.map(a=>`<div class="ability-tag">${a.icon} ${a.name}</div>`).join('')}</div><div style="margin-top:8px">${sb(heroDef.stats.poder,'#ff6600','⚔ PODER')}${sb(heroDef.stats.vida,'#00ff88','❤ VIDA')}${sb(heroDef.stats.velocidad,'#00ccff','⚡ VELOCIDAD')}</div></div>`;
}

function closeUnlock(){document.getElementById('unlockScreen').style.display='none';showOverlay(true,false);}

// ── Shop ────────────────────────────────
function showShop(){
  hideAllScreens();
  document.getElementById('shop').style.display='flex';
  resetPanelScroll('shop');
  document.getElementById('shopCoinDisplay').textContent=coins+' 💰';
  buildShopGrid();
}

function buildShopGrid(){
  const grid=document.getElementById('shopGrid');
  grid.innerHTML='';
  const shopHeroes=HERO_DEFS.filter(h=>h.unlockAt==='shop');
  shopHeroes.forEach(h=>{
    const purchased=purchasedHeroes.has(h.id);
    const card=document.createElement('div');
    card.className='shop-card'+(purchased?' purchased':'');
    card.style.background=`linear-gradient(135deg,${h.color}22,${h.color}11)`;
    const dots=(n,c)=>Array.from({length:5},(_,i)=>`<div style="width:10px;height:10px;border-radius:50%;background:${i<n?c:'#333'}"></div>`).join('');
    card.innerHTML=`<div class="shop-icon">${h.icon}</div><div class="shop-name">${h.name}</div><div class="shop-desc">${h.desc}</div><div style="display:flex;gap:4px;margin:4px 0">${dots(h.stats.poder,'#ff6600')}${dots(h.stats.vida,'#00ff88')}${dots(h.stats.velocidad,'#00ccff')}</div>${purchased?`<div class="shop-purchased">✓ COMPRADO</div>`:`<div class="shop-price">${h.price} 💰</div>`}`;
    if(!purchased){
      card.onclick=()=>purchaseHero(h);
    }
    grid.appendChild(card);
  });
}

function purchaseHero(hero){
  if(coins>=hero.price){
    coins-=hero.price;
    purchasedHeroes.add(hero.id);
    unlockedHeroes.add(hero.id);
    saveProgress();
    document.getElementById('shopCoinDisplay').textContent=coins+' 💰';
    buildShopGrid();
    spawnFloatText(canvas.width/2,canvas.height/2-100,`🎉 ${hero.name} DESBLOQUEADO!`,'#FFD700',28);
    spawnFloatText(canvas.width/2,canvas.height/2-60,`-${hero.price} 💰`,'#FFD700',24);
  }else{
    spawnFloatText(canvas.width/2,canvas.height/2-100,`¡INSUFICIENTE!`,'#ff4444',28);
    spawnFloatText(canvas.width/2,canvas.height/2-60,`Necesitas ${hero.price} 💰`,'#ff4444',24);
  }
}

function showResetConfirm(){
  resetPanelScroll('resetConfirm');
  document.getElementById('resetConfirm').style.display='flex';
}

function hideResetConfirm(){
  document.getElementById('resetConfirm').style.display='none';
}

function resetProgress(){
  localStorage.removeItem('brawlBlastProgress');
  location.reload();
}

// ── Stars ────────────────────────────────
(function buildStars(){
  // No star container in this version — handled by CSS bg
})();

showMenu();
requestAnimationFrame(ts=>{lastTime=ts;update(ts);});
