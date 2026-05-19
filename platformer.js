// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');
let gameRunning = false;
let isPaused = false;
let isEditorMode = false;
let currentTool = 'platform';
let editorObjects = []; // Store objects placed in editor
let editorCamera = { x: 0, y: 0 };
let score = 0;
let lives = 3;
let level = 1;
let coinCount = 0; // Classic coin counter
let camera = { x: 0, y: 0 };
let levelWidth = 5000; // Increased level width
let completedLevels = []; // Track completed levels

// Player object
const player = {
    x: 100,
    y: 300,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    runSpeed: 8,
    jumpPower: 12,
    grounded: false,
    color: '#FF6B6B',
    facing: 'right', // Animation direction
    animationFrame: 0,
    animationTimer: 0,
    isWalking: false,
    isJumping: false,
    isRunning: false,
    hasFireFlower: false, // Fire flower power-up state
    originalWidth: 30, // Store original size
    originalHeight: 40,
    powerUpTimer: 0, // Timer for power-up effects
    onFallingPlatform: false // Track if player is on falling platform
};

// Game physics
const gravity = 0.5;
const friction = 0.8;

// Level definitions (extended)
const levels = {
    1: {
        platforms: [
            { x: 0, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 500, y: 550, width: 300, height: 50, color: '#8B4513' },
            { x: 900, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 1400, y: 550, width: 300, height: 50, color: '#8B4513' },
            { x: 1800, y: 550, width: 600, height: 50, color: '#8B4513' },
            { x: 2500, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 3000, y: 550, width: 500, height: 50, color: '#8B4513' },
            { x: 3600, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 4100, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 4600, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 200, y: 450, width: 100, height: 20, color: '#228B22' },
            { x: 600, y: 350, width: 150, height: 20, color: '#228B22' },
            { x: 1000, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 1500, y: 300, width: 120, height: 20, color: '#228B22' },
            { x: 1900, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 2600, y: 400, width: 150, height: 20, color: '#228B22' },
            { x: 3100, y: 350, width: 120, height: 20, color: '#228B22' },
            { x: 3700, y: 300, width: 100, height: 20, color: '#228B22' },
            { x: 4200, y: 400, width: 120, height: 20, color: '#228B22' },
            { x: 4700, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 1300, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 2300, y: 350, width: 100, height: 20, color: '#228B22' },
            { x: 3300, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 3900, y: 450, width: 120, height: 20, color: '#228B22' },
            { x: 4400, y: 150, width: 80, height: 20, color: '#228B22' }
        ],
        breakableBlocks: [
            { x: 250, y: 480, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 280, y: 480, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 310, y: 480, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 650, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 680, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1050, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1080, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1550, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1580, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1950, y: 220, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2650, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2680, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3150, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3180, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3750, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3780, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 4250, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 4280, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            { x: 400, y: 450, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 750, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 1200, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1650, y: 270, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 2100, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 2800, y: 370, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 3400, y: 200, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 4000, y: 300, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 4500, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        pipes: [
            // Vertical pipes coming from earth
            { x: 450, y: 470, width: 60, height: 130, color: '#008000', exitX: 1500, exitY: 400, type: 'vertical', solid: true },
            { x: 1500, y: 400, width: 60, height: 200, color: '#008000', exitX: 450, exitY: 470, type: 'vertical', solid: true },
            { x: 2200, y: 470, width: 60, height: 130, color: '#008000', exitX: 3500, exitY: 330, type: 'vertical', solid: true },
            { x: 3500, y: 330, width: 60, height: 270, color: '#008000', exitX: 2200, exitY: 470, type: 'vertical', solid: true },
            // Horizontal pipes
            { x: 800, y: 200, width: 200, height: 60, color: '#008000', exitX: 2800, exitY: 200, type: 'horizontal', solid: true },
            { x: 2800, y: 200, width: 200, height: 60, color: '#008000', exitX: 800, exitY: 200, type: 'horizontal', solid: true }
        ],
        mobilePlatforms: [
            { x: 800, y: 400, width: 100, height: 20, color: '#8B4513', velocityX: 2, minX: 750, maxX: 950, startY: 400 },
            { x: 1800, y: 300, width: 80, height: 20, color: '#8B4513', velocityX: -1.5, minX: 1700, maxX: 1900, startY: 300 },
            { x: 2900, y: 450, width: 120, height: 20, color: '#8B4513', velocityX: 1.8, minX: 2800, maxX: 3050, startY: 450 },
            { x: 4100, y: 350, width: 90, height: 20, color: '#8B4513', velocityX: -2, minX: 4000, maxX: 4200, startY: 350 }
        ],
        enemies: [
            { x: 300, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 0 },
            { x: 650, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 1 },
            { x: 1100, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 2 },
            { x: 1550, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 3 },
            { x: 2050, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 4 },
            { x: 2700, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 5 },
            { x: 3250, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 6 },
            { x: 3800, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 7 },
            { x: 4300, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 8 },
            { x: 4800, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 9 },
            { x: 650, y: 320, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 11 },
            { x: 1050, y: 370, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 12 },
            { x: 1550, y: 270, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 13 },
            { x: 1950, y: 220, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 14 },
            { x: 2650, y: 370, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 16 },
            { x: 3150, y: 320, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 17 },
            { x: 3750, y: 270, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 18 },
            { x: 4250, y: 370, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 19 },
            // Koopa enemies
            { x: 800, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 1, shellMode: false },
            { x: 1300, y: 520, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 2, shellMode: false },
            { x: 2000, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 4, shellMode: false },
            { x: 3000, y: 520, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 6, shellMode: false },
            { x: 4600, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 9, shellMode: false },
            // Spiny enemies
            { x: 900, y: 300, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 11 },
            { x: 1400, y: 250, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 13 },
            { x: 2400, y: 350, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 16 },
            { x: 3200, y: 280, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 17 },
            { x: 3900, y: 400, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 19 },
            // Piranha plants in pipes
            { x: 470, y: 430, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 0, animationTimer: 0, emerging: false },
            { x: 1520, y: 360, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 1, animationTimer: 0, emerging: false },
            { x: 2220, y: 430, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 2, animationTimer: 0, emerging: false },
            { x: 3520, y: 290, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 3, animationTimer: 0, emerging: false }
        ],
        coins: [
            { x: 230, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 650, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1050, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1550, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1950, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2650, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3150, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3750, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4250, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4750, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1330, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2330, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3330, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3950, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4430, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 4800, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    2: {
        platforms: [
            { x: 0, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 500, y: 550, width: 350, height: 50, color: '#8B4513' },
            { x: 950, y: 550, width: 450, height: 50, color: '#8B4513' },
            { x: 1500, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 2000, y: 550, width: 500, height: 50, color: '#8B4513' },
            { x: 2600, y: 550, width: 450, height: 50, color: '#8B4513' },
            { x: 3150, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 3650, y: 550, width: 500, height: 50, color: '#8B4513' },
            { x: 4250, y: 550, width: 450, height: 50, color: '#8B4513' },
            { x: 4800, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 250, y: 450, width: 120, height: 20, color: '#228B22' },
            { x: 700, y: 350, width: 150, height: 20, color: '#228B22' },
            { x: 1150, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 1650, y: 300, width: 120, height: 20, color: '#228B22' },
            { x: 2100, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 2750, y: 400, width: 150, height: 20, color: '#228B22' },
            { x: 3250, y: 350, width: 120, height: 20, color: '#228B22' },
            { x: 3850, y: 300, width: 100, height: 20, color: '#228B22' },
            { x: 4400, y: 400, width: 120, height: 20, color: '#228B22' },
            { x: 4900, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 1400, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 2400, y: 350, width: 100, height: 20, color: '#228B22' },
            { x: 3400, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 4000, y: 450, width: 120, height: 20, color: '#228B22' },
            { x: 4500, y: 150, width: 80, height: 20, color: '#228B22' }
        ],
        breakableBlocks: [
            { x: 280, y: 480, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 310, y: 480, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 340, y: 480, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 750, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 780, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1200, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1230, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1700, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1730, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2150, y: 220, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2800, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2830, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3300, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3330, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3900, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3930, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 4450, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 4480, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            { x: 450, y: 450, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 850, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 1300, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1800, y: 270, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 2250, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 2950, y: 370, width: 30, height: 30, color: '#FFA500', used: false, item: 'flower' },
            { x: 3550, y: 200, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 4150, y: 300, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 4700, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        pipes: [
            { x: 550, y: 470, width: 50, height: 80, color: '#008000', exitX: 1650, exitY: 400 },
            { x: 1650, y: 400, width: 50, height: 80, color: '#008000', exitX: 550, exitY: 470 },
            { x: 2400, y: 470, width: 50, height: 80, color: '#008000', exitX: 3700, exitY: 330 },
            { x: 3700, y: 330, width: 50, height: 80, color: '#008000', exitX: 2400, exitY: 470 }
        ],
        mobilePlatforms: [
            { x: 900, y: 400, width: 100, height: 20, color: '#8B4513', velocityX: 2, minX: 850, maxX: 1000, startY: 400 },
            { x: 1900, y: 300, width: 80, height: 20, color: '#8B4513', velocityX: -1.5, minX: 1800, maxX: 2000, startY: 300 },
            { x: 3050, y: 450, width: 120, height: 20, color: '#8B4513', velocityX: 1.8, minX: 2950, maxX: 3200, startY: 450 },
            { x: 4250, y: 350, width: 90, height: 20, color: '#8B4513', velocityX: -2, minX: 4150, maxX: 4350, startY: 350 }
        ],
        enemies: [
            { x: 200, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 0 },
            { x: 600, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 1 },
            { x: 1100, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 2 },
            { x: 1700, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 3 },
            { x: 2200, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 4 },
            { x: 2800, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 5 },
            { x: 3300, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 6 },
            { x: 3900, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 7 },
            { x: 4500, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 8 },
            { x: 5000, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 9 },
            // Koopa enemies
            { x: 900, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 1, shellMode: false },
            { x: 1400, y: 520, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 2, shellMode: false },
            { x: 2100, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 4, shellMode: false },
            { x: 3100, y: 520, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 6, shellMode: false },
            { x: 4700, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 8, shellMode: false },
            // Spiny enemies
            { x: 1000, y: 300, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 11 },
            { x: 1500, y: 250, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 13 },
            { x: 2500, y: 350, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 16 },
            { x: 3300, y: 280, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 17 },
            { x: 4000, y: 400, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 19 }
        ],
        coins: [
            { x: 280, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 750, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1200, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1700, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2150, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2800, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3300, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3900, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4450, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4950, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1430, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2430, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3430, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4050, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4530, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 5000, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    3: {
        platforms: [
            // Creative zigzag design with floating islands
            { x: 0, y: 550, width: 300, height: 50, color: '#8B4513' },
            { x: 400, y: 450, width: 120, height: 20, color: '#228B22' },
            { x: 600, y: 350, width: 100, height: 20, color: '#228B22' },
            { x: 800, y: 250, width: 80, height: 20, color: '#228B22' },
            { x: 1000, y: 150, width: 60, height: 20, color: '#228B22' },
            { x: 1200, y: 550, width: 250, height: 50, color: '#8B4513' },
            { x: 1550, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 1750, y: 300, width: 120, height: 20, color: '#228B22' },
            { x: 1950, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 2100, y: 550, width: 200, height: 50, color: '#8B4513' },
            { x: 2400, y: 450, width: 150, height: 20, color: '#228B22' },
            { x: 2650, y: 350, width: 100, height: 20, color: '#228B22' },
            { x: 2850, y: 250, width: 80, height: 20, color: '#228B22' },
            { x: 3000, y: 550, width: 300, height: 50, color: '#8B4513' },
            { x: 3400, y: 400, width: 120, height: 20, color: '#228B22' },
            { x: 3600, y: 300, width: 100, height: 20, color: '#228B22' },
            { x: 3800, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 3950, y: 100, width: 60, height: 20, color: '#228B22' },
            { x: 4100, y: 550, width: 400, height: 50, color: '#8B4513' },
            // Upper bonus platforms
            { x: 500, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 1300, y: 150, width: 100, height: 20, color: '#228B22' },
            { x: 2200, y: 100, width: 80, height: 20, color: '#228B22' },
            { x: 3200, y: 120, width: 120, height: 20, color: '#228B22' },
            { x: 4200, y: 180, width: 100, height: 20, color: '#228B22' }
        ],
        breakableBlocks: [
            { x: 420, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 620, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 820, y: 220, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1570, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1770, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2420, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2670, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3420, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3620, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 4220, y: 150, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            { x: 520, y: 170, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 1350, y: 120, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1970, y: 170, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 2250, y: 70, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 3250, y: 90, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 3980, y: 70, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 4250, y: 150, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' }
        ],
        pipes: [
            // Creative pipe placements
            { x: 350, y: 400, width: 60, height: 150, color: '#008000', exitX: 1550, exitY: 350, type: 'vertical', solid: true },
            { x: 1550, y: 350, width: 60, height: 200, color: '#008000', exitX: 350, exitY: 400, type: 'vertical', solid: true },
            { x: 2400, y: 420, width: 60, height: 130, color: '#008000', exitX: 3600, exitY: 270, type: 'vertical', solid: true },
            { x: 3600, y: 270, width: 60, height: 280, color: '#008000', exitX: 2400, exitY: 420, type: 'vertical', solid: true },
            // Horizontal pipes in sky
            { x: 1300, y: 100, width: 180, height: 60, color: '#008000', exitX: 2200, exitY: 50, type: 'horizontal', solid: true },
            { x: 2200, y: 50, width: 180, height: 60, color: '#008000', exitX: 1300, exitY: 100, type: 'horizontal', solid: true },
            { x: 3200, y: 90, width: 150, height: 60, color: '#008000', exitX: 4200, exitY: 140, type: 'horizontal', solid: true },
            { x: 4200, y: 140, width: 150, height: 60, color: '#008000', exitX: 3200, exitY: 90, type: 'horizontal', solid: true }
        ],
        mobilePlatforms: [
            // Moving platforms for creative challenges
            { x: 700, y: 300, width: 80, height: 20, color: '#8B4513', velocityX: 2, minX: 650, maxX: 850, startY: 300 },
            { x: 1100, y: 200, width: 60, height: 20, color: '#8B4513', velocityX: -1.5, minX: 1050, maxX: 1150, startY: 200 },
            { x: 1800, y: 250, width: 100, height: 20, color: '#8B4513', velocityX: 1.8, minX: 1750, maxX: 1900, startY: 250 },
            { x: 2700, y: 300, width: 80, height: 20, color: '#8B4513', velocityX: -2, minX: 2650, maxX: 2850, startY: 300 },
            { x: 3500, y: 350, width: 90, height: 20, color: '#8B4513', velocityX: 2.2, minX: 3450, maxX: 3650, startY: 350 },
            { x: 3900, y: 250, width: 70, height: 20, color: '#8B4513', velocityX: -1.8, minX: 3850, maxX: 3950, startY: 250 }
        ],
        enemies: [
            // Goombas on main platforms
            { x: 100, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 0 },
            { x: 250, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 0 },
            { x: 1300, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 5 },
            { x: 2200, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 9 },
            { x: 3200, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 13 },
            { x: 4300, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 18 },
            // Koopas on platforms
            { x: 1350, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 5, shellMode: false },
            { x: 2250, y: 520, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 9, shellMode: false },
            { x: 3250, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 13, shellMode: false },
            // Spiny enemies on floating platforms
            { x: 620, y: 320, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 2 },
            { x: 820, y: 220, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 3 },
            { x: 1770, y: 270, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 7 },
            { x: 1970, y: 170, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 8 },
            { x: 2670, y: 320, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 11 },
            { x: 3620, y: 270, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 15 },
            { x: 3820, y: 170, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 16 },
            // Piranha plants in pipes
            { x: 370, y: 360, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 0, animationTimer: 0, emerging: false },
            { x: 1570, y: 310, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 1, animationTimer: 30, emerging: false },
            { x: 2420, y: 380, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 2, animationTimer: 60, emerging: false },
            { x: 3620, y: 230, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 3, animationTimer: 90, emerging: false }
        ],
        coins: [
            { x: 150, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 450, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 650, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 850, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1020, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1350, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1600, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1800, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2000, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2250, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2500, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2700, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2900, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3250, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3450, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3650, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3850, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4000, y: 70, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4350, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            // Upper platform coins
            { x: 540, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1400, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2250, y: 70, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3280, y: 90, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4250, y: 150, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 4500, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    4: {
        platforms: [
            // Creative spiral design with moving challenges
            { x: 0, y: 550, width: 250, height: 50, color: '#8B4513' },
            { x: 350, y: 500, width: 100, height: 20, color: '#228B22' },
            { x: 550, y: 450, width: 80, height: 20, color: '#228B22' },
            { x: 700, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 900, y: 350, width: 80, height: 20, color: '#228B22' },
            { x: 1100, y: 300, width: 120, height: 20, color: '#228B22' },
            { x: 1350, y: 250, width: 80, height: 20, color: '#228B22' },
            { x: 1500, y: 200, width: 100, height: 20, color: '#228B22' },
            { x: 1700, y: 150, width: 80, height: 20, color: '#228B22' },
            { x: 1850, y: 550, width: 200, height: 50, color: '#8B4513' },
            { x: 2200, y: 500, width: 100, height: 20, color: '#228B22' },
            { x: 2400, y: 450, width: 80, height: 20, color: '#228B22' },
            { x: 2600, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 2800, y: 350, width: 80, height: 20, color: '#228B22' },
            { x: 3000, y: 300, width: 120, height: 20, color: '#228B22' },
            { x: 3250, y: 250, width: 80, height: 20, color: '#228B22' },
            { x: 3400, y: 200, width: 100, height: 20, color: '#228B22' },
            { x: 3600, y: 150, width: 80, height: 20, color: '#228B22' },
            { x: 3750, y: 100, width: 100, height: 20, color: '#228B22' },
            { x: 3950, y: 550, width: 300, height: 50, color: '#8B4513' },
            // Upper bonus platforms
            { x: 400, y: 350, width: 80, height: 20, color: '#228B22' },
            { x: 750, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 1200, y: 150, width: 80, height: 20, color: '#228B22' },
            { x: 1600, y: 100, width: 120, height: 20, color: '#228B22' },
            { x: 2300, y: 350, width: 80, height: 20, color: '#228B22' },
            { x: 2700, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 3200, y: 150, width: 80, height: 20, color: '#228B22' },
            { x: 3600, y: 50, width: 120, height: 20, color: '#228B22' }
        ],
        breakableBlocks: [
            { x: 370, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 570, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 720, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 920, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1120, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1370, y: 220, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1520, y: 170, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2220, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2420, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2620, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2820, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3020, y: 270, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3270, y: 220, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3420, y: 170, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3620, y: 120, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 3770, y: 70, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            { x: 430, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 780, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1230, y: 120, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1630, y: 70, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 2300, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 2730, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 3230, y: 120, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 3630, y: 20, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' }
        ],
        pipes: [
            // Creative pipe network
            { x: 300, y: 450, width: 60, height: 100, color: '#008000', exitX: 1900, exitY: 150, type: 'vertical', solid: true },
            { x: 1900, y: 150, width: 60, height: 100, color: '#008000', exitX: 300, exitY: 450, type: 'vertical', solid: true },
            { x: 2150, y: 450, width: 60, height: 100, color: '#008000', exitX: 3450, exitY: 100, type: 'vertical', solid: true },
            { x: 3450, y: 100, width: 60, height: 100, color: '#008000', exitX: 2150, exitY: 450, type: 'vertical', solid: true },
            // Horizontal pipes connecting spiral paths
            { x: 750, y: 230, width: 200, height: 60, color: '#008000', exitX: 1200, exitY: 130, type: 'horizontal', solid: true },
            { x: 1200, y: 130, width: 200, height: 60, color: '#008000', exitX: 750, exitY: 230, type: 'horizontal', solid: true },
            { x: 1600, y: 80, width: 180, height: 60, color: '#008000', exitX: 2300, exitY: 330, type: 'horizontal', solid: true },
            { x: 2300, y: 330, width: 180, height: 60, color: '#008000', exitX: 1600, exitY: 80, type: 'horizontal', solid: true },
            { x: 2700, y: 230, width: 160, height: 60, color: '#008000', exitX: 3200, exitY: 130, type: 'horizontal', solid: true },
            { x: 3200, y: 130, width: 160, height: 60, color: '#008000', exitX: 2700, exitY: 230, type: 'horizontal', solid: true }
        ],
        mobilePlatforms: [
            // Fast moving platforms for spiral challenges
            { x: 450, y: 450, width: 70, height: 20, color: '#8B4513', velocityX: 2.5, minX: 420, maxX: 520, startY: 450 },
            { x: 650, y: 400, width: 60, height: 20, color: '#8B4513', velocityX: -2, minX: 620, maxX: 680, startY: 400 },
            { x: 800, y: 350, width: 80, height: 20, color: '#8B4513', velocityX: 3, minX: 770, maxX: 850, startY: 350 },
            { x: 1000, y: 300, width: 70, height: 20, color: '#8B4513', velocityX: -2.5, minX: 970, maxX: 1040, startY: 300 },
            { x: 1200, y: 250, width: 90, height: 20, color: '#8B4513', velocityX: 2.8, minX: 1170, maxX: 1260, startY: 250 },
            { x: 1400, y: 200, width: 60, height: 20, color: '#8B4513', velocityX: -3, minX: 1370, maxX: 1430, startY: 200 },
            { x: 1600, y: 150, width: 80, height: 20, color: '#8B4513', velocityX: 2.2, minX: 1570, maxX: 1650, startY: 150 },
            { x: 2300, y: 400, width: 70, height: 20, color: '#8B4513', velocityX: -2.5, minX: 2270, maxX: 2340, startY: 400 },
            { x: 2500, y: 350, width: 60, height: 20, color: '#8B4513', velocityX: 3, minX: 2470, maxX: 2530, startY: 350 },
            { x: 2700, y: 300, width: 80, height: 20, color: '#8B4513', velocityX: -2.8, minX: 2670, maxX: 2750, startY: 300 },
            { x: 2900, y: 250, width: 90, height: 20, color: '#8B4513', velocityX: 2.5, minX: 2870, maxX: 2960, startY: 250 },
            { x: 3100, y: 200, width: 70, height: 20, color: '#8B4513', velocityX: -3, minX: 3070, maxX: 3140, startY: 200 },
            { x: 3300, y: 150, width: 80, height: 20, color: '#8B4513', velocityX: 2.2, minX: 3270, maxX: 3350, startY: 150 },
            { x: 3500, y: 100, width: 60, height: 20, color: '#8B4513', velocityX: -2.5, minX: 3470, maxX: 3530, startY: 100 },
            { x: 3700, y: 50, width: 80, height: 20, color: '#8B4513', velocityX: 3, minX: 3670, maxX: 3750, startY: 50 }
        ],
        enemies: [
            // Goombas on main platforms
            { x: 100, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 0 },
            { x: 200, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 0 },
            { x: 1950, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 9 },
            { x: 2100, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 9 },
            { x: 4050, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 18 },
            { x: 4200, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 18 },
            // Koopas on spiral platforms
            { x: 570, y: 420, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 2, shellMode: false },
            { x: 720, y: 370, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 3, shellMode: false },
            { x: 920, y: 320, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 4, shellMode: false },
            { x: 1120, y: 270, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 5, shellMode: false },
            { x: 1370, y: 220, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 6, shellMode: false },
            { x: 1520, y: 170, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 7, shellMode: false },
            { x: 2420, y: 420, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 11, shellMode: false },
            { x: 2620, y: 370, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 12, shellMode: false },
            { x: 2820, y: 320, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 13, shellMode: false },
            { x: 3020, y: 270, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 14, shellMode: false },
            { x: 3270, y: 220, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 15, shellMode: false },
            { x: 3420, y: 170, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 16, shellMode: false },
            // Spiny enemies on upper platforms
            { x: 430, y: 320, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 19 },
            { x: 780, y: 220, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 20 },
            { x: 1230, y: 120, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 21 },
            { x: 1630, y: 70, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 22 },
            { x: 2300, y: 320, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 23 },
            { x: 2730, y: 220, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 24 },
            { x: 3230, y: 120, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 25 },
            { x: 3630, y: 20, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 26 },
            // Piranha plants in pipes
            { x: 320, y: 410, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 0, animationTimer: 0, emerging: false },
            { x: 1920, y: 110, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 1, animationTimer: 45, emerging: false },
            { x: 2170, y: 410, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 2, animationTimer: 90, emerging: false },
            { x: 3470, y: 60, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 3, animationTimer: 135, emerging: false }
        ],
        coins: [
            { x: 120, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 220, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 400, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 570, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 720, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 920, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1120, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1370, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1520, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1700, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2000, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2220, y: 470, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2420, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2620, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2820, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3020, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3270, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3420, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3620, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3770, y: 70, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4100, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4250, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            // Upper platform coins
            { x: 450, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 800, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1250, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1650, y: 70, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2330, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2760, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3260, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3660, y: 20, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 4200, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    5: {
        platforms: [
            { x: 0, y: 550, width: 100, height: 50, color: '#8B4513' },
            { x: 200, y: 550, width: 80, height: 50, color: '#8B4513' },
            { x: 380, y: 550, width: 120, height: 50, color: '#8B4513' },
            { x: 600, y: 550, width: 80, height: 50, color: '#8B4513' },
            { x: 780, y: 550, width: 100, height: 50, color: '#8B4513' },
            { x: 980, y: 550, width: 120, height: 50, color: '#8B4513' },
            { x: 1200, y: 550, width: 80, height: 50, color: '#8B4513' },
            { x: 1380, y: 550, width: 150, height: 50, color: '#8B4513' },
            { x: 1630, y: 550, width: 100, height: 50, color: '#8B4513' },
            { x: 1830, y: 550, width: 120, height: 50, color: '#8B4513' },
            { x: 2050, y: 550, width: 100, height: 50, color: '#8B4513' },
            { x: 2250, y: 550, width: 150, height: 50, color: '#8B4513' },
            { x: 50, y: 400, width: 40, height: 20, color: '#228B22' },
            { x: 220, y: 300, width: 50, height: 20, color: '#228B22' },
            { x: 420, y: 350, width: 60, height: 20, color: '#228B22' },
            { x: 640, y: 250, width: 50, height: 20, color: '#228B22' },
            { x: 820, y: 400, width: 70, height: 20, color: '#228B22' },
            { x: 1040, y: 300, width: 60, height: 20, color: '#228B22' },
            { x: 1250, y: 200, width: 50, height: 20, color: '#228B22' },
            { x: 1450, y: 350, width: 80, height: 20, color: '#228B22' },
            { x: 1680, y: 250, width: 60, height: 20, color: '#228B22' },
            { x: 1880, y: 400, width: 70, height: 20, color: '#228B22' },
            { x: 2100, y: 300, width: 50, height: 20, color: '#228B22' }
        ],
        enemies: [
            { x: 50, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 0 },
            { x: 240, y: 270, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 12 },
            { x: 460, y: 320, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 14 },
            { x: 680, y: 220, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 15 },
            { x: 860, y: 370, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 16 },
            { x: 1080, y: 270, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 17 },
            { x: 1280, y: 170, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 18 },
            { x: 1500, y: 320, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 19 },
            { x: 1720, y: 220, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 20 },
            { x: 1920, y: 370, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 21 }
        ],
        coins: [
            { x: 60, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 240, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 460, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 680, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 860, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1080, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1280, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1500, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1720, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1920, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2120, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' }
        ]
        // No flagpole in level 5 (as requested)
    },
    6: {
        platforms: [
            // Starting platform
            { x: 0, y: 550, width: 200, height: 50, color: '#8B4513' },
            // First pit crossing - static platforms
            { x: 350, y: 450, width: 80, height: 20, color: '#228B22' },
            { x: 500, y: 350, width: 80, height: 20, color: '#228B22' },
            { x: 650, y: 400, width: 80, height: 20, color: '#228B22' },
            // Safe zone after first pit
            { x: 800, y: 550, width: 150, height: 50, color: '#8B4513' },
            // Second pit crossing - mobile platforms
            { x: 1100, y: 500, width: 100, height: 20, color: '#8B4513', velocityX: 2, minX: 1050, maxX: 1250, startY: 500 },
            { x: 1400, y: 400, width: 100, height: 20, color: '#8B4513', velocityX: -1.5, minX: 1350, maxX: 1500, startY: 400 },
            { x: 1700, y: 300, width: 100, height: 20, color: '#8B4513', velocityX: 1.8, minX: 1650, maxX: 1800, startY: 300 },
            // Safe zone after second pit
            { x: 1900, y: 550, width: 150, height: 50, color: '#8B4513' },
            // Third pit crossing - mixed platforms
            { x: 2200, y: 450, width: 60, height: 20, color: '#228B22' },
            { x: 2350, y: 350, width: 100, height: 20, color: '#8B4513', velocityX: -2, minX: 2300, maxX: 2450, startY: 350 },
            { x: 2550, y: 400, width: 60, height: 20, color: '#228B22' },
            { x: 2700, y: 300, width: 100, height: 20, color: '#8B4513', velocityX: 1.5, minX: 2650, maxX: 2800, startY: 300 },
            // Safe zone after third pit
            { x: 2900, y: 550, width: 200, height: 50, color: '#8B4513' },
            // Fourth pit crossing - challenging mobile platforms
            { x: 3250, y: 480, width: 80, height: 20, color: '#8B4513', velocityX: 2.5, minX: 3200, maxX: 3400, startY: 480 },
            { x: 3500, y: 380, width: 80, height: 20, color: '#8B4513', velocityX: -2.5, minX: 3450, maxX: 3650, startY: 380 },
            { x: 3750, y: 280, width: 80, height: 20, color: '#8B4513', velocityX: 3, minX: 3700, maxX: 3900, startY: 280 },
            { x: 4000, y: 330, width: 80, height: 20, color: '#8B4513', velocityX: -3, minX: 3950, maxX: 4150, startY: 330 },
            // Final safe zone
            { x: 4200, y: 550, width: 300, height: 50, color: '#8B4513' },
            // Upper platforms for bonus coins
            { x: 400, y: 250, width: 60, height: 20, color: '#228B22' },
            { x: 1200, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 2400, y: 180, width: 60, height: 20, color: '#228B22' },
            { x: 3600, y: 150, width: 80, height: 20, color: '#228B22' }
        ],
        breakableBlocks: [
            { x: 370, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 520, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 670, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2220, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2570, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 }
        ],
        interrogationBlocks: [
            { x: 420, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 1250, y: 170, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 2450, y: 150, width: 30, height: 30, color: '#FFA500', used: false, item: 'flower' },
            { x: 3650, y: 120, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        mobilePlatforms: [
            { x: 1100, y: 500, width: 100, height: 20, color: '#8B4513', velocityX: 2, minX: 1050, maxX: 1250, startY: 500 },
            { x: 1400, y: 400, width: 100, height: 20, color: '#8B4513', velocityX: -1.5, minX: 1350, maxX: 1500, startY: 400 },
            { x: 1700, y: 300, width: 100, height: 20, color: '#8B4513', velocityX: 1.8, minX: 1650, maxX: 1800, startY: 300 },
            { x: 2350, y: 350, width: 100, height: 20, color: '#8B4513', velocityX: -2, minX: 2300, maxX: 2450, startY: 350 },
            { x: 2700, y: 300, width: 100, height: 20, color: '#8B4513', velocityX: 1.5, minX: 2650, maxX: 2800, startY: 300 },
            { x: 3250, y: 480, width: 80, height: 20, color: '#8B4513', velocityX: 2.5, minX: 3200, maxX: 3400, startY: 480 },
            { x: 3500, y: 380, width: 80, height: 20, color: '#8B4513', velocityX: -2.5, minX: 3450, maxX: 3650, startY: 380 },
            { x: 3750, y: 280, width: 80, height: 20, color: '#8B4513', velocityX: 3, minX: 3700, maxX: 3900, startY: 280 },
            { x: 4000, y: 330, width: 80, height: 20, color: '#8B4513', velocityX: -3, minX: 3950, maxX: 4150, startY: 330 }
        ],
        enemies: [
            // Goomba enemies on safe zones
            { x: 100, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 0 },
            { x: 850, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 4 },
            { x: 1950, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 8 },
            { x: 2950, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000', platformIndex: 12 },
            { x: 4300, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000', platformIndex: 13 },
            // Koopa enemies on safe zones
            { x: 900, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 4, shellMode: false },
            { x: 2000, y: 520, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 8, shellMode: false },
            { x: 3000, y: 520, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 12, shellMode: false }
            // No spiny enemies in level 6 (as requested)
        ],
        coins: [
            { x: 100, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 380, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 530, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 680, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 870, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1150, y: 470, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1450, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1750, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1950, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2250, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2400, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2580, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2750, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2950, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3300, y: 450, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3550, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3800, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4050, y: 300, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4350, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            // Upper platform coins
            { x: 430, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1280, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2480, y: 150, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3680, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' }
        ]
        // No flagpole in level 6 (as requested)
    },
    7: {
        // Creative level 7 with all features - "The Ultimate Challenge"
        platforms: [
            // Starting area
            { x: 0, y: 550, width: 300, height: 50, color: '#8B4513' },
            
            // First challenge - rising platforms with gaps
            { x: 400, y: 500, width: 80, height: 20, color: '#228B22' },
            { x: 550, y: 450, width: 80, height: 20, color: '#228B22' },
            { x: 700, y: 400, width: 80, height: 20, color: '#228B22' },
            { x: 850, y: 350, width: 80, height: 20, color: '#228B22' },
            
            // Safe zone
            { x: 1000, y: 550, width: 200, height: 50, color: '#8B4513' },
            
            // Second challenge - zigzag with falling platforms
            { x: 1300, y: 450, width: 100, height: 20, color: '#228B22' },
            { x: 1450, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 1600, y: 350, width: 100, height: 20, color: '#228B22' },
            { x: 1750, y: 300, width: 100, height: 20, color: '#228B22' },
            
            // Third challenge - pipe maze
            { x: 1900, y: 550, width: 150, height: 50, color: '#8B4513' },
            { x: 2150, y: 500, width: 80, height: 20, color: '#228B22' },
            { x: 2300, y: 450, width: 80, height: 20, color: '#228B22' },
            { x: 2450, y: 400, width: 80, height: 20, color: '#228B22' },
            
            // Fourth challenge - mobile platform gauntlet
            { x: 2600, y: 550, width: 100, height: 50, color: '#8B4513' },
            { x: 2800, y: 350, width: 80, height: 20, color: '#228B22' },
            { x: 2950, y: 300, width: 80, height: 20, color: '#228B22' },
            { x: 3100, y: 250, width: 80, height: 20, color: '#228B22' },
            
            // Final stretch
            { x: 3250, y: 550, width: 200, height: 50, color: '#8B4513' },
            { x: 3500, y: 450, width: 100, height: 20, color: '#228B22' },
            { x: 3650, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 3800, y: 350, width: 100, height: 20, color: '#228B22' },
            { x: 3950, y: 300, width: 100, height: 20, color: '#228B22' },
            
            // Goal platform
            { x: 4100, y: 550, width: 400, height: 50, color: '#8B4513' },
            
            // Upper bonus platforms
            { x: 500, y: 280, width: 60, height: 20, color: '#228B22' },
            { x: 750, y: 200, width: 80, height: 20, color: '#228B22' },
            { x: 1400, y: 250, width: 70, height: 20, color: '#228B22' },
            { x: 2000, y: 350, width: 90, height: 20, color: '#228B22' },
            { x: 2900, y: 150, width: 60, height: 20, color: '#228B22' },
            { x: 3600, y: 280, width: 80, height: 20, color: '#228B22' }
        ],
        breakableBlocks: [
            // Blocks for coin collection and path clearing
            { x: 420, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 570, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 720, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1320, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1470, y: 370, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2170, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2320, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2820, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 3520, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 }
        ],
        interrogationBlocks: [
            // Power-ups strategically placed
            { x: 520, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 780, y: 170, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1420, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 2020, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 2920, y: 120, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 3620, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' }
        ],
        fallingPlatforms: [
            // Falling platforms in strategic locations
            { x: 1350, y: 420, width: 60, height: 20, color: '#CD853F' },
            { x: 1500, y: 370, width: 60, height: 20, color: '#CD853F' },
            { x: 1650, y: 320, width: 60, height: 20, color: '#CD853F' },
            { x: 2200, y: 420, width: 60, height: 20, color: '#CD853F' },
            { x: 2350, y: 370, width: 60, height: 20, color: '#CD853F' },
            { x: 2850, y: 320, width: 60, height: 20, color: '#CD853F' },
            { x: 3000, y: 270, width: 60, height: 20, color: '#CD853F' },
            { x: 3550, y: 420, width: 60, height: 20, color: '#CD853F' },
            { x: 3700, y: 370, width: 60, height: 20, color: '#CD853F' },
            { x: 3850, y: 320, width: 60, height: 20, color: '#CD853F' }
        ],
        pipes: [
            // Complex pipe network for transportation
            { x: 1950, y: 450, width: 60, height: 100, color: '#008000', exitX: 2600, exitY: 500, type: 'vertical', solid: true },
            { x: 2600, y: 500, width: 60, height: 100, color: '#008000', exitX: 1950, exitY: 450, type: 'vertical', solid: true },
            { x: 2400, y: 350, width: 60, height: 100, color: '#008000', exitX: 3250, exitY: 500, type: 'vertical', solid: true },
            { x: 3250, y: 500, width: 60, height: 100, color: '#008000', exitX: 2400, exitY: 350, type: 'vertical', solid: true },
            // Horizontal pipes for shortcuts
            { x: 1100, y: 200, width: 150, height: 60, color: '#008000', exitX: 1800, exitY: 300, type: 'horizontal', solid: true },
            { x: 1800, y: 300, width: 150, height: 60, color: '#008000', exitX: 1100, exitY: 200, type: 'horizontal', solid: true }
        ],
        mobilePlatforms: [
            // Fast-moving platforms for timing challenges
            { x: 2800, y: 320, width: 80, height: 20, color: '#8B4513', velocityX: 3.5, minX: 2750, maxX: 2900, startY: 320 },
            { x: 2950, y: 270, width: 70, height: 20, color: '#8B4513', velocityX: -3, minX: 2920, maxX: 3020, startY: 270 },
            { x: 3100, y: 220, width: 80, height: 20, color: '#8B4513', velocityX: 4, minX: 3070, maxX: 3170, startY: 220 },
            { x: 3500, y: 420, width: 90, height: 20, color: '#8B4513', velocityX: -2.5, minX: 3470, maxX: 3590, startY: 420 },
            { x: 3650, y: 370, width: 80, height: 20, color: '#8B4513', velocityX: 3.2, minX: 3620, maxX: 3720, startY: 370 },
            { x: 3800, y: 320, width: 70, height: 20, color: '#8B4513', velocityX: -3.8, minX: 3770, maxX: 3870, startY: 320 }
        ],
        enemies: [
            // Goombas on main platforms
            { x: 100, y: 520, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 250, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1050, y: 520, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 1200, y: 520, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 1950, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 2100, y: 520, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' },
            { x: 2650, y: 520, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 2800, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 3300, y: 520, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 3450, y: 520, width: 25, height: 25, velocityX: -1.5, color: '#8B0000' },
            { x: 4200, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 4350, y: 520, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            
            // Koopas on upper platforms
            { x: 420, y: 470, width: 25, height: 30, velocityX: -1.5, color: '#008000', type: 'koopa', platformIndex: 1, shellMode: false },
            { x: 720, y: 370, width: 25, height: 30, velocityX: 1.8, color: '#008000', type: 'koopa', platformIndex: 3, shellMode: false },
            { x: 1320, y: 420, width: 25, height: 30, velocityX: -1.2, color: '#008000', type: 'koopa', platformIndex: 11, shellMode: false },
            { x: 1620, y: 320, width: 25, height: 30, velocityX: 1.5, color: '#008000', type: 'koopa', platformIndex: 13, shellMode: false },
            { x: 2320, y: 420, width: 25, height: 30, velocityX: -1.8, color: '#008000', type: 'koopa', platformIndex: 15, shellMode: false },
            { x: 3520, y: 370, width: 25, height: 30, velocityX: 1.2, color: '#008000', type: 'koopa', platformIndex: 18, shellMode: false },
            
            // Spinies on challenging platforms
            { x: 570, y: 420, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 2 },
            { x: 820, y: 320, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 4 },
            { x: 1470, y: 370, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 12 },
            { x: 1720, y: 270, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 14 },
            { x: 2470, y: 370, width: 20, height: 20, velocityX: 1, color: '#8B008B', type: 'spiny', platformIndex: 16 },
            { x: 3700, y: 320, width: 20, height: 20, velocityX: -1, color: '#8B008B', type: 'spiny', platformIndex: 19 },
            
            // Piranha plants in pipes (staggered timing)
            { x: 1970, y: 410, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 0, animationTimer: 0, emerging: false },
            { x: 2620, y: 460, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 1, animationTimer: 80, emerging: false },
            { x: 2420, y: 310, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 2, animationTimer: 160, emerging: false },
            { x: 3270, y: 460, width: 20, height: 30, color: '#FF0000', type: 'piranha', pipeIndex: 3, animationTimer: 240, emerging: false }
        ],
        coins: [
            // Regular gold coins
            { x: 150, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 450, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 600, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 750, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 900, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1100, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1350, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1500, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1650, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2000, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2200, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2350, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2500, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2700, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3350, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3550, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3700, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3850, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4000, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 4300, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            
            // Blue coins (higher value, harder to reach)
            { x: 530, y: 220, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 780, y: 140, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1430, y: 190, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2030, y: 290, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2930, y: 90, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 3630, y: 220, width: 15, height: 15, collected: false, type: 'blue' },
            
            // Upper platform coins
            { x: 520, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 780, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1420, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2020, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2920, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3620, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 4400, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    8: {
        // Ingenious Level 8 - "The Infernal Gauntlet" - Lava themed level
        platforms: [
            // Starting safe area
            { x: 0, y: 550, width: 200, height: 50, color: '#8B4513' },
            
            // First challenge - narrow platforms over lava
            { x: 250, y: 500, width: 60, height: 20, color: '#8B4513' },
            { x: 350, y: 480, width: 50, height: 20, color: '#8B4513' },
            { x: 450, y: 460, width: 60, height: 20, color: '#8B4513' },
            { x: 570, y: 440, width: 50, height: 20, color: '#8B4513' },
            
            // Safe zone
            { x: 670, y: 550, width: 100, height: 50, color: '#8B4513' },
            
            // Second challenge - fire bar maze
            { x: 820, y: 500, width: 40, height: 20, color: '#8B4513' },
            { x: 900, y: 450, width: 40, height: 20, color: '#8B4513' },
            { x: 980, y: 400, width: 40, height: 20, color: '#8B4513' },
            { x: 1060, y: 350, width: 40, height: 20, color: '#8B4513' },
            { x: 1140, y: 300, width: 40, height: 20, color: '#8B4513' },
            
            // Third challenge - moving platforms over lava
            { x: 1250, y: 550, width: 80, height: 50, color: '#8B4513' },
            { x: 1380, y: 480, width: 50, height: 20, color: '#8B4513' },
            { x: 1480, y: 420, width: 50, height: 20, color: '#8B4513' },
            { x: 1580, y: 360, width: 50, height: 20, color: '#8B4513' },
            
            // Fourth challenge - lava jumping section
            { x: 1680, y: 550, width: 60, height: 50, color: '#8B4513' },
            { x: 1790, y: 500, width: 40, height: 20, color: '#8B4513' },
            { x: 1880, y: 450, width: 40, height: 20, color: '#8B4513' },
            { x: 1970, y: 400, width: 40, height: 20, color: '#8B4513' },
            { x: 2060, y: 350, width: 40, height: 20, color: '#8B4513' },
            
            // Fifth challenge - fire bar gauntlet
            { x: 2150, y: 550, width: 100, height: 50, color: '#8B4513' },
            { x: 2300, y: 480, width: 35, height: 20, color: '#8B4513' },
            { x: 2380, y: 430, width: 35, height: 20, color: '#8B4513' },
            { x: 2460, y: 380, width: 35, height: 20, color: '#8B4513' },
            { x: 2540, y: 330, width: 35, height: 20, color: '#8B4513' },
            
            // Final stretch
            { x: 2650, y: 550, width: 80, height: 50, color: '#8B4513' },
            { x: 2780, y: 500, width: 40, height: 20, color: '#8B4513' },
            { x: 2870, y: 450, width: 40, height: 20, color: '#8B4513' },
            { x: 2960, y: 400, width: 40, height: 20, color: '#8B4513' },
            { x: 3050, y: 350, width: 40, height: 20, color: '#8B4513' },
            { x: 3140, y: 300, width: 40, height: 20, color: '#8B4513' },
            
            // Goal platform
            { x: 3250, y: 550, width: 300, height: 50, color: '#8B4513' },
            
            // Upper bonus platforms (high risk, high reward)
            { x: 320, y: 380, width: 40, height: 20, color: '#8B4513' },
            { x: 520, y: 350, width: 40, height: 20, color: '#8B4513' },
            { x: 950, y: 320, width: 30, height: 20, color: '#8B4513' },
            { x: 1150, y: 250, width: 30, height: 20, color: '#8B4513' },
            { x: 1550, y: 320, width: 40, height: 20, color: '#8B4513' },
            { x: 2050, y: 280, width: 30, height: 20, color: '#8B4513' },
            { x: 2550, y: 250, width: 30, height: 20, color: '#8B4513' },
            { x: 3050, y: 220, width: 30, height: 20, color: '#8B4513' }
        ],
        breakableBlocks: [
            // Strategic blocks for power-ups and coins
            { x: 270, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 370, y: 450, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 470, y: 430, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 840, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 920, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1400, y: 450, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1500, y: 390, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1810, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1890, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2320, y: 450, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2400, y: 400, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2800, y: 470, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2880, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 }
        ],
        interrogationBlocks: [
            // Critical power-ups for survival
            { x: 330, y: 350, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 530, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 960, y: 290, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1160, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1560, y: 290, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 2060, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 2560, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 3060, y: 190, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' }
        ],
        lavaPools: [
            // Lava pools creating deadly gaps
            { x: 200, y: 570, width: 50, height: 30 },
            { x: 310, y: 570, width: 40, height: 30 },
            { x: 400, y: 570, width: 50, height: 30 },
            { x: 510, y: 570, width: 40, height: 30 },
            { x: 600, y: 570, width: 70, height: 30 },
            { x: 770, y: 570, width: 50, height: 30 },
            { x: 860, y: 570, width: 40, height: 30 },
            { x: 940, y: 570, width: 40, height: 30 },
            { x: 1020, y: 570, width: 40, height: 30 },
            { x: 1100, y: 570, width: 40, height: 30 },
            { x: 1180, y: 570, width: 70, height: 30 },
            { x: 1330, y: 570, width: 50, height: 30 },
            { x: 1430, y: 570, width: 50, height: 30 },
            { x: 1530, y: 570, width: 50, height: 30 },
            { x: 1630, y: 570, width: 50, height: 30 },
            { x: 1740, y: 570, width: 50, height: 30 },
            { x: 1830, y: 570, width: 50, height: 30 },
            { x: 1920, y: 570, width: 50, height: 30 },
            { x: 2010, y: 570, width: 50, height: 30 },
            { x: 2100, y: 570, width: 50, height: 30 },
            { x: 2250, y: 570, width: 50, height: 30 },
            { x: 2335, y: 570, width: 45, height: 30 },
            { x: 2415, y: 570, width: 45, height: 30 },
            { x: 2495, y: 570, width: 45, height: 30 },
            { x: 2575, y: 570, width: 75, height: 30 },
            { x: 2730, y: 570, width: 50, height: 30 },
            { x: 2820, y: 570, width: 50, height: 30 },
            { x: 2910, y: 570, width: 50, height: 30 },
            { x: 3000, y: 570, width: 50, height: 30 },
            { x: 3090, y: 570, width: 50, height: 30 },
            { x: 3180, y: 570, width: 70, height: 30 }
        ],
        fireBars: [
            // Fire bars creating timing challenges
            { x: 850, y: 480, width: 40, height: 40, ballCount: 4, radius: 25, rotationSpeed: 0.03, rotation: 0 },
            { x: 930, y: 430, width: 40, height: 40, ballCount: 3, radius: 20, rotationSpeed: -0.04, rotation: 0 },
            { x: 1010, y: 380, width: 40, height: 40, ballCount: 4, radius: 25, rotationSpeed: 0.035, rotation: 0 },
            { x: 1090, y: 330, width: 40, height: 40, ballCount: 5, radius: 30, rotationSpeed: -0.03, rotation: 0 },
            { x: 1170, y: 280, width: 40, height: 40, ballCount: 3, radius: 20, rotationSpeed: 0.05, rotation: 0 },
            { x: 2330, y: 460, width: 35, height: 35, ballCount: 4, radius: 22, rotationSpeed: -0.04, rotation: 0 },
            { x: 2410, y: 410, width: 35, height: 35, ballCount: 3, radius: 18, rotationSpeed: 0.045, rotation: 0 },
            { x: 2490, y: 360, width: 35, height: 35, ballCount: 4, radius: 22, rotationSpeed: -0.035, rotation: 0 },
            { x: 2570, y: 310, width: 35, height: 35, ballCount: 5, radius: 25, rotationSpeed: 0.04, rotation: 0 }
        ],
        pipes: [], // No pipes in this lava-themed level
        mobilePlatforms: [
            // Fast-moving platforms over lava
            { x: 1400, y: 460, width: 60, height: 20, color: '#8B4513', velocityX: 2.5, minX: 1380, maxX: 1480, startY: 460 },
            { x: 1500, y: 400, width: 60, height: 20, color: '#8B4513', velocityX: -3, minX: 1480, maxX: 1580, startY: 400 },
            { x: 1600, y: 340, width: 60, height: 20, color: '#8B4513', velocityX: 2.8, minX: 1580, maxX: 1680, startY: 340 },
            { x: 2800, y: 480, width: 50, height: 20, color: '#8B4513', velocityX: -2.2, minX: 2780, maxX: 2880, startY: 480 },
            { x: 2900, y: 430, width: 50, height: 20, color: '#8B4513', velocityX: 3.5, minX: 2880, maxX: 2980, startY: 430 },
            { x: 3000, y: 380, width: 50, height: 20, color: '#8B4513', velocityX: -2.8, minX: 2980, maxX: 3080, startY: 380 },
            { x: 3100, y: 330, width: 50, height: 20, color: '#8B4513', velocityX: 3.2, minX: 3080, maxX: 3180, startY: 330 }
        ],
        enemies: [
            // Podoboos (jumping lava enemies) - main threat
            { x: 225, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 0, velocityY: 0 },
            { x: 325, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 30, velocityY: 0 },
            { x: 425, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 60, velocityY: 0 },
            { x: 525, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 90, velocityY: 0 },
            { x: 795, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 15, velocityY: 0 },
            { x: 885, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 45, velocityY: 0 },
            { x: 965, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 75, velocityY: 0 },
            { x: 1045, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 105, velocityY: 0 },
            { x: 1125, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 20, velocityY: 0 },
            { x: 1355, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 50, velocityY: 0 },
            { x: 1455, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 80, velocityY: 0 },
            { x: 1555, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 110, velocityY: 0 },
            { x: 1655, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 25, velocityY: 0 },
            { x: 1765, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 55, velocityY: 0 },
            { x: 1855, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 85, velocityY: 0 },
            { x: 1945, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 115, velocityY: 0 },
            { x: 2035, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 35, velocityY: 0 },
            { x: 2275, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 65, velocityY: 0 },
            { x: 2355, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 95, velocityY: 0 },
            { x: 2435, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 10, velocityY: 0 },
            { x: 2515, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 40, velocityY: 0 },
            { x: 2605, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 70, velocityY: 0 },
            { x: 2755, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 100, velocityY: 0 },
            { x: 2845, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 20, velocityY: 0 },
            { x: 2935, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 50, velocityY: 0 },
            { x: 3025, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 80, velocityY: 0 },
            { x: 3115, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 110, velocityY: 0 },
            { x: 3205, y: 550, width: 20, height: 20, color: '#FF4500', type: 'podoboo', lavaY: 570, animationTimer: 30, velocityY: 0 },
            
            // Some goombas on safe platforms for variety
            { x: 50, y: 520, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 150, y: 520, width: 25, height: 25, velocityX: -0.8, color: '#8B0000' },
            { x: 700, y: 520, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 800, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1280, y: 520, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 1380, y: 520, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 2200, y: 520, width: 25, height: 25, velocityX: 1.3, color: '#8B0000' },
            { x: 2300, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 3300, y: 520, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 3400, y: 520, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' }
        ],
        coins: [
            // Coins on safe platforms
            { x: 80, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 380, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 480, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 590, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 720, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 860, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 940, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1020, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1100, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1180, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            
            // Blue coins on upper platforms (high risk)
            { x: 340, y: 280, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 540, y: 250, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 970, y: 220, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1170, y: 150, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1570, y: 220, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2070, y: 180, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2570, y: 150, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 3070, y: 120, width: 15, height: 15, collected: false, type: 'blue' },
            
            // More coins on later sections
            { x: 1310, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1410, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1510, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1610, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1720, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1820, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1920, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2020, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2120, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2320, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2400, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2480, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2560, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2790, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2870, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2950, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3030, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3110, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3190, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3400, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3500, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 3500, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    9: {
        // Desert Level 9 - "The Sandy Oasis" - First desert level with all gimmicks
        platforms: [
            // Starting desert area
            { x: 0, y: 500, width: 300, height: 100, color: '#DEB887' },
            
            // First challenge - quicksand gaps with springs
            { x: 350, y: 520, width: 60, height: 80, color: '#DEB887' },
            { x: 450, y: 540, width: 50, height: 60, color: '#DEB887' },
            { x: 550, y: 560, width: 40, height: 40, color: '#DEB887' },
            { x: 630, y: 540, width: 50, height: 60, color: '#DEB887' },
            
            // Safe zone
            { x: 730, y: 500, width: 120, height: 100, color: '#DEB887' },
            
            // Second challenge - hammer bros on platforms
            { x: 900, y: 480, width: 80, height: 120, color: '#DEB887' },
            { x: 1030, y: 450, width: 60, height: 150, color: '#DEB887' },
            { x: 1140, y: 420, width: 80, height: 180, color: '#DEB887' },
            
            // Third challenge - moving platforms over desert
            { x: 1270, y: 500, width: 100, height: 100, color: '#DEB887' },
            { x: 1420, y: 460, width: 50, height: 140, color: '#DEB887' },
            { x: 1520, y: 430, width: 50, height: 170, color: '#DEB887' },
            { x: 1620, y: 400, width: 50, height: 200, color: '#DEB887' },
            
            // Fourth challenge - spring jumps
            { x: 1720, y: 500, width: 80, height: 100, color: '#DEB887' },
            { x: 1850, y: 520, width: 40, height: 80, color: '#DEB887' },
            { x: 1940, y: 480, width: 40, height: 120, color: '#DEB887' },
            { x: 2030, y: 440, width: 40, height: 160, color: '#DEB887' },
            { x: 2120, y: 400, width: 40, height: 200, color: '#DEB887' },
            
            // Fifth challenge - complex platforming
            { x: 2220, y: 500, width: 100, height: 100, color: '#DEB887' },
            { x: 2370, y: 470, width: 40, height: 130, color: '#DEB887' },
            { x: 2460, y: 440, width: 40, height: 160, color: '#DEB887' },
            { x: 2550, y: 410, width: 40, height: 190, color: '#DEB887' },
            { x: 2640, y: 380, width: 40, height: 220, color: '#DEB887' },
            
            // Goal platform
            { x: 2730, y: 500, width: 400, height: 100, color: '#DEB887' }
        ],
        breakableBlocks: [
            // Desert-themed blocks
            { x: 370, y: 490, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 470, y: 510, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 570, y: 530, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 920, y: 450, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1050, y: 420, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1160, y: 390, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1440, y: 430, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1540, y: 400, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 1870, y: 490, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1960, y: 450, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2390, y: 440, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 2480, y: 410, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            // Power-ups in desert
            { x: 400, y: 390, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 600, y: 350, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 980, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1200, y: 290, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1500, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 2000, y: 220, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 2500, y: 190, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 2700, y: 160, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' }
        ],
        springs: [
            // Springs for high jumps
            { x: 380, y: 490, width: 20, height: 30, power: 15 },
            { x: 580, y: 530, width: 20, height: 30, power: 12 },
            { x: 950, y: 450, width: 20, height: 30, power: 15 },
            { x: 1170, y: 390, width: 20, height: 30, power: 18 },
            { x: 1470, y: 400, width: 20, height: 30, power: 12 },
            { x: 1970, y: 450, width: 20, height: 30, power: 15 },
            { x: 2470, y: 410, width: 20, height: 30, power: 18 },
            { x: 2670, y: 360, width: 20, height: 30, power: 20 }
        ],
        pipes: [
            // Desert pipes for transportation
            { x: 750, y: 450, width: 60, height: 50, color: '#8B4513', exitX: 1300, exitY: 450, type: 'vertical', solid: true },
            { x: 1300, y: 450, width: 60, height: 50, color: '#8B4513', exitX: 750, exitY: 450, type: 'vertical', solid: true },
            { x: 1750, y: 400, width: 60, height: 100, color: '#8B4513', exitX: 2250, exitY: 450, type: 'vertical', solid: true },
            { x: 2250, y: 450, width: 60, height: 50, color: '#8B4513', exitX: 1750, exitY: 400, type: 'vertical', solid: true }
        ],
        mobilePlatforms: [
            // Moving platforms in desert
            { x: 1420, y: 440, width: 60, height: 20, color: '#CD853F', velocityX: 2, minX: 1400, maxX: 1480, startY: 440 },
            { x: 1520, y: 400, width: 60, height: 20, color: '#CD853F', velocityX: -2.5, minX: 1500, maxX: 1580, startY: 400 },
            { x: 1620, y: 360, width: 60, height: 20, color: '#CD853F', velocityX: 2.2, minX: 1600, maxX: 1680, startY: 360 },
            { x: 2370, y: 420, width: 50, height: 20, color: '#CD853F', velocityX: -2, minX: 2350, maxX: 2420, startY: 420 },
            { x: 2460, y: 380, width: 50, height: 20, color: '#CD853F', velocityX: 2.8, minX: 2440, maxX: 2510, startY: 380 },
            { x: 2550, y: 340, width: 50, height: 20, color: '#CD853F', velocityX: -2.3, minX: 2530, maxX: 2600, startY: 340 }
        ],
        fallingPlatforms: [
            // Falling platforms in desert
            { x: 380, y: 450, width: 40, height: 20, color: '#CD853F' },
            { x: 580, y: 490, width: 40, height: 20, color: '#CD853F' },
            { x: 1170, y: 350, width: 40, height: 20, color: '#CD853F' },
            { x: 1970, y: 410, width: 40, height: 20, color: '#CD853F' },
            { x: 2470, y: 370, width: 40, height: 20, color: '#CD853F' },
            { x: 2670, y: 320, width: 40, height: 20, color: '#CD853F' }
        ],
        enemies: [
            // Hammer bros - reduced and on flat areas only
            { x: 920, y: 450, width: 20, height: 25, color: '#8B4513', type: 'hammerbro', groundY: 450, animationTimer: 0 },
            { x: 1320, y: 475, width: 20, height: 25, color: '#8B4513', type: 'hammerbro', groundY: 475, animationTimer: 60 },
            { x: 1770, y: 475, width: 20, height: 25, color: '#8B4513', type: 'hammerbro', groundY: 475, animationTimer: 120 },
            { x: 2320, y: 475, width: 20, height: 25, color: '#8B4513', type: 'hammerbro', groundY: 475, animationTimer: 180 },
            
            // More goombas on ground
            { x: 50, y: 475, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 150, y: 475, width: 25, height: 25, velocityX: -0.8, color: '#8B0000' },
            { x: 250, y: 475, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 350, y: 445, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 450, y: 415, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 550, y: 385, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 650, y: 355, width: 25, height: 25, velocityX: 1.3, color: '#8B0000' },
            { x: 780, y: 475, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 880, y: 445, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 980, y: 415, width: 25, height: 25, velocityX: -1.1, color: '#8B0000' },
            { x: 1080, y: 385, width: 25, height: 25, velocityX: 1.6, color: '#8B0000' },
            { x: 1180, y: 355, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' },
            { x: 1420, y: 435, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 1520, y: 405, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1620, y: 375, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 1870, y: 475, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 1970, y: 475, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 2070, y: 475, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 2170, y: 475, width: 25, height: 25, velocityX: 1.6, color: '#8B0000' },
            { x: 2420, y: 475, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' },
            { x: 2520, y: 475, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 2620, y: 475, width: 25, height: 25, velocityX: -1.1, color: '#8B0000' },
            { x: 2780, y: 475, width: 25, height: 25, velocityX: 1.7, color: '#8B0000' },
            { x: 2880, y: 475, width: 25, height: 25, velocityX: -1.4, color: '#8B0000' },
            { x: 2980, y: 475, width: 25, height: 25, velocityX: 1.8, color: '#8B0000' },
            
            // More koopas for variety
            { x: 100, y: 475, width: 20, height: 25, velocityX: 0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 200, y: 475, width: 20, height: 25, velocityX: -0.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 300, y: 445, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 400, y: 415, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 500, y: 385, width: 20, height: 25, velocityX: 1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 600, y: 355, width: 20, height: 25, velocityX: -0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 830, y: 475, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 930, y: 445, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1030, y: 415, width: 20, height: 25, velocityX: 1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1130, y: 385, width: 20, height: 25, velocityX: -0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1370, y: 475, width: 20, height: 25, velocityX: 1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1470, y: 435, width: 20, height: 25, velocityX: -1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1570, y: 405, width: 20, height: 25, velocityX: 1.3, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1670, y: 375, width: 20, height: 25, velocityX: -1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1820, y: 475, width: 20, height: 25, velocityX: 1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1920, y: 475, width: 20, height: 25, velocityX: -0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2020, y: 475, width: 20, height: 25, velocityX: 1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2120, y: 475, width: 20, height: 25, velocityX: -1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2370, y: 475, width: 20, height: 25, velocityX: 1.4, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2470, y: 475, width: 20, height: 25, velocityX: -1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2570, y: 475, width: 20, height: 25, velocityX: 1.5, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2670, y: 475, width: 20, height: 25, velocityX: -1.3, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2830, y: 475, width: 20, height: 25, velocityX: 1.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2930, y: 475, width: 20, height: 25, velocityX: -1.4, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 3030, y: 475, width: 20, height: 25, velocityX: 1.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 3130, y: 475, width: 20, height: 25, velocityX: -1.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 }
        ],
        coins: [
            // Coins on platforms
            { x: 80, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 380, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 480, y: 410, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 580, y: 450, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 680, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 780, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 920, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1050, y: 300, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1170, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            
            // Blue coins on upper platforms
            { x: 400, y: 320, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 600, y: 280, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 980, y: 250, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1200, y: 220, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1500, y: 180, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2000, y: 150, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2500, y: 120, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2700, y: 90, width: 15, height: 15, collected: false, type: 'blue' },
            
            // More coins throughout the level
            { x: 1320, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1420, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1520, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1620, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1770, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1870, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1970, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2070, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2320, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2420, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2520, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2620, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2780, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2880, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2980, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 3000, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    10: {
        // Desert Level 10 - "The Dunes of Doom" - Advanced desert level with all gimmicks
        platforms: [
            // Starting desert area
            { x: 0, y: 480, width: 250, height: 120, color: '#F4A460' },
            
            // First challenge - spring gauntlet
            { x: 300, y: 520, width: 40, height: 80, color: '#F4A460' },
            { x: 380, y: 500, width: 40, height: 100, color: '#F4A460' },
            { x: 460, y: 480, width: 40, height: 120, color: '#F4A460' },
            { x: 540, y: 460, width: 40, height: 140, color: '#F4A460' },
            { x: 620, y: 440, width: 40, height: 160, color: '#F4A460' },
            
            // Safe zone
            { x: 700, y: 480, width: 100, height: 120, color: '#F4A460' },
            
            // Second challenge - hammer bros fortress
            { x: 850, y: 450, width: 60, height: 150, color: '#F4A460' },
            { x: 950, y: 420, width: 60, height: 180, color: '#F4A460' },
            { x: 1050, y: 390, width: 60, height: 210, color: '#F4A460' },
            { x: 1150, y: 360, width: 60, height: 240, color: '#F4A460' },
            
            // Third challenge - moving platform maze
            { x: 1270, y: 480, width: 80, height: 120, color: '#F4A460' },
            { x: 1400, y: 440, width: 40, height: 160, color: '#F4A460' },
            { x: 1490, y: 400, width: 40, height: 200, color: '#F4A460' },
            { x: 1580, y: 360, width: 40, height: 240, color: '#F4A460' },
            { x: 1670, y: 320, width: 40, height: 280, color: '#F4A460' },
            
            // Fourth challenge - spring jumping sequence
            { x: 1770, y: 480, width: 60, height: 120, color: '#F4A460' },
            { x: 1880, y: 500, width: 30, height: 100, color: '#F4A460' },
            { x: 1960, y: 460, width: 30, height: 140, color: '#F4A460' },
            { x: 2040, y: 420, width: 30, height: 180, color: '#F4A460' },
            { x: 2120, y: 380, width: 30, height: 220, color: '#F4A460' },
            { x: 2200, y: 340, width: 30, height: 260, color: '#F4A460' },
            
            // Fifth challenge - complex platforming with all gimmicks
            { x: 2270, y: 480, width: 80, height: 120, color: '#F4A460' },
            { x: 2400, y: 450, width: 35, height: 150, color: '#F4A460' },
            { x: 2480, y: 420, width: 35, height: 180, color: '#F4A460' },
            { x: 2560, y: 390, width: 35, height: 210, color: '#F4A460' },
            { x: 2640, y: 360, width: 35, height: 240, color: '#F4A460' },
            { x: 2720, y: 330, width: 35, height: 270, color: '#F4A460' },
            
            // Goal platform
            { x: 2800, y: 480, width: 500, height: 120, color: '#F4A460' },
            
            // Upper bonus platforms (high risk)
            { x: 330, y: 380, width: 30, height: 20, color: '#F4A460' },
            { x: 510, y: 340, width: 30, height: 20, color: '#F4A460' },
            { x: 690, y: 300, width: 30, height: 20, color: '#F4A460' },
            { x: 980, y: 280, width: 30, height: 20, color: '#F4A460' },
            { x: 1180, y: 240, width: 30, height: 20, color: '#F4A460' },
            { x: 1510, y: 200, width: 30, height: 20, color: '#F4A460' },
            { x: 2060, y: 160, width: 30, height: 20, color: '#F4A460' },
            { x: 2740, y: 120, width: 30, height: 20, color: '#F4A460' }
        ],
        breakableBlocks: [
            // Advanced desert blocks
            { x: 320, y: 490, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 400, y: 470, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 480, y: 450, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 560, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 870, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 970, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1070, y: 360, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1170, y: 330, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1420, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1510, y: 370, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1600, y: 330, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1690, y: 290, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1890, y: 470, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1970, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 2050, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 2130, y: 350, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 2410, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 2490, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 2570, y: 360, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 2650, y: 330, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            // Critical power-ups for survival
            { x: 350, y: 350, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 530, y: 310, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 710, y: 270, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1000, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1200, y: 210, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1540, y: 170, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 2090, y: 130, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 2770, y: 90, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' }
        ],
        springs: [
            // Advanced spring placement
            { x: 320, y: 490, width: 20, height: 30, power: 18 },
            { x: 400, y: 470, width: 20, height: 30, power: 16 },
            { x: 480, y: 450, width: 20, height: 30, power: 20 },
            { x: 560, y: 430, width: 20, height: 30, power: 14 },
            { x: 640, y: 410, width: 20, height: 30, power: 22 },
            { x: 950, y: 390, width: 20, height: 30, power: 18 },
            { x: 1050, y: 360, width: 20, height: 30, power: 20 },
            { x: 1150, y: 330, width: 20, height: 30, power: 16 },
            { x: 1420, y: 410, width: 20, height: 30, power: 14 },
            { x: 1510, y: 370, width: 20, height: 30, power: 18 },
            { x: 1600, y: 330, width: 20, height: 30, power: 20 },
            { x: 1690, y: 290, width: 20, height: 30, power: 22 },
            { x: 1890, y: 470, width: 20, height: 30, power: 16 },
            { x: 1970, y: 430, width: 20, height: 30, power: 18 },
            { x: 2050, y: 390, width: 20, height: 30, power: 20 },
            { x: 2130, y: 350, width: 20, height: 30, power: 24 },
            { x: 2410, y: 420, width: 20, height: 30, power: 18 },
            { x: 2490, y: 390, width: 20, height: 30, power: 20 },
            { x: 2570, y: 360, width: 20, height: 30, power: 22 },
            { x: 2650, y: 330, width: 20, height: 30, power: 26 }
        ],
        pipes: [
            // Complex desert pipe network
            { x: 720, y: 430, width: 60, height: 50, color: '#8B4513', exitX: 1320, exitY: 430, type: 'vertical', solid: true },
            { x: 1320, y: 430, width: 60, height: 50, color: '#8B4513', exitX: 720, exitY: 430, type: 'vertical', solid: true },
            { x: 1770, y: 380, width: 60, height: 100, color: '#8B4513', exitX: 2370, exitY: 430, type: 'vertical', solid: true },
            { x: 2370, y: 430, width: 60, height: 50, color: '#8B4513', exitX: 1770, exitY: 380, type: 'vertical', solid: true },
            // Horizontal pipes for shortcuts
            { x: 850, y: 200, width: 120, height: 60, color: '#8B4513', exitX: 1250, exitY: 300, type: 'horizontal', solid: true },
            { x: 1250, y: 300, width: 120, height: 60, color: '#8B4513', exitX: 850, exitY: 200, type: 'horizontal', solid: true }
        ],
        mobilePlatforms: [
            // Fast-moving platforms in desert
            { x: 1400, y: 400, width: 50, height: 20, color: '#DEB887', velocityX: 3, minX: 1380, maxX: 1450, startY: 400 },
            { x: 1490, y: 360, width: 50, height: 20, color: '#DEB887', velocityX: -3.5, minX: 1470, maxX: 1540, startY: 360 },
            { x: 1580, y: 320, width: 50, height: 20, color: '#DEB887', velocityX: 4, minX: 1560, maxX: 1630, startY: 320 },
            { x: 1670, y: 280, width: 50, height: 20, color: '#DEB887', velocityX: -3.2, minX: 1650, maxX: 1720, startY: 280 },
            { x: 2410, y: 400, width: 45, height: 20, color: '#DEB887', velocityX: 2.8, minX: 2390, maxX: 2455, startY: 400 },
            { x: 2490, y: 360, width: 45, height: 20, color: '#DEB887', velocityX: -3.3, minX: 2470, maxX: 2535, startY: 360 },
            { x: 2570, y: 320, width: 45, height: 20, color: '#DEB887', velocityX: 3.6, minX: 2550, maxX: 2615, startY: 320 },
            { x: 2650, y: 280, width: 45, height: 20, color: '#DEB887', velocityX: -3.1, minX: 2630, maxX: 2695, startY: 280 }
        ],
        fallingPlatforms: [
            // Falling platforms in desert
            { x: 320, y: 450, width: 35, height: 20, color: '#DEB887' },
            { x: 400, y: 430, width: 35, height: 20, color: '#DEB887' },
            { x: 480, y: 410, width: 35, height: 20, color: '#DEB887' },
            { x: 560, y: 390, width: 35, height: 20, color: '#DEB887' },
            { x: 950, y: 350, width: 35, height: 20, color: '#DEB887' },
            { x: 1050, y: 310, width: 35, height: 20, color: '#DEB887' },
            { x: 1150, y: 270, width: 35, height: 20, color: '#DEB887' },
            { x: 1420, y: 370, width: 35, height: 20, color: '#DEB887' },
            { x: 1510, y: 330, width: 35, height: 20, color: '#DEB887' },
            { x: 1600, y: 290, width: 35, height: 20, color: '#DEB887' },
            { x: 1690, y: 250, width: 35, height: 20, color: '#DEB887' },
            { x: 1890, y: 430, width: 35, height: 20, color: '#DEB887' },
            { x: 1970, y: 390, width: 35, height: 20, color: '#DEB887' },
            { x: 2050, y: 350, width: 35, height: 20, color: '#DEB887' },
            { x: 2130, y: 310, width: 35, height: 20, color: '#DEB887' },
            { x: 2410, y: 370, width: 35, height: 20, color: '#DEB887' },
            { x: 2490, y: 330, width: 35, height: 20, color: '#DEB887' },
            { x: 2570, y: 290, width: 35, height: 20, color: '#DEB887' },
            { x: 2650, y: 250, width: 35, height: 20, color: '#DEB887' }
        ],
        enemies: [
            // Advanced hammer bros placement
            { x: 870, y: 420, width: 20, height: 25, color: '#8B4513', type: 'hammerbro', groundY: 420, animationTimer: 0 },
            { x: 970, y: 390, width: 20, height: 25, color: '#8B4513', type: 'hammerbro', groundY: 390, animationTimer: 20 },
            
            // More goombas on ground
            { x: 50, y: 475, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 150, y: 475, width: 25, height: 25, velocityX: -0.8, color: '#8B0000' },
            { x: 250, y: 475, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 350, y: 445, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 450, y: 415, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 550, y: 385, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 650, y: 355, width: 25, height: 25, velocityX: 1.3, color: '#8B0000' },
            { x: 780, y: 475, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 880, y: 445, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 980, y: 415, width: 25, height: 25, velocityX: -1.1, color: '#8B0000' },
            { x: 1080, y: 385, width: 25, height: 25, velocityX: 1.6, color: '#8B0000' },
            { x: 1180, y: 355, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' },
            { x: 1420, y: 435, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 1520, y: 405, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1620, y: 375, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 1870, y: 475, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 1970, y: 475, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 2070, y: 475, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 2170, y: 475, width: 25, height: 25, velocityX: 1.6, color: '#8B0000' },
            { x: 2420, y: 475, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' },
            { x: 2520, y: 475, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 2620, y: 475, width: 25, height: 25, velocityX: -1.1, color: '#8B0000' },
            { x: 2780, y: 475, width: 25, height: 25, velocityX: 1.7, color: '#8B0000' },
            { x: 2880, y: 475, width: 25, height: 25, velocityX: -1.4, color: '#8B0000' },
            { x: 2980, y: 475, width: 25, height: 25, velocityX: 1.8, color: '#8B0000' },
            
            // More koopas for variety
            { x: 100, y: 475, width: 20, height: 25, velocityX: 0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 200, y: 475, width: 20, height: 25, velocityX: -0.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 300, y: 445, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 400, y: 415, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 500, y: 385, width: 20, height: 25, velocityX: 1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 600, y: 355, width: 20, height: 25, velocityX: -0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 830, y: 475, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 930, y: 445, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1030, y: 415, width: 20, height: 25, velocityX: 1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1130, y: 385, width: 20, height: 25, velocityX: -0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1370, y: 475, width: 20, height: 25, velocityX: 1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1470, y: 435, width: 20, height: 25, velocityX: -1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1570, y: 405, width: 20, height: 25, velocityX: 1.3, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1670, y: 375, width: 20, height: 25, velocityX: -1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1820, y: 475, width: 20, height: 25, velocityX: 1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1920, y: 475, width: 20, height: 25, velocityX: -0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2020, y: 475, width: 20, height: 25, velocityX: 1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2120, y: 475, width: 20, height: 25, velocityX: -1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2370, y: 475, width: 20, height: 25, velocityX: 1.4, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2470, y: 475, width: 20, height: 25, velocityX: -1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2570, y: 475, width: 20, height: 25, velocityX: 1.5, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2670, y: 475, width: 20, height: 25, velocityX: -1.3, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2830, y: 475, width: 20, height: 25, velocityX: 1.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2930, y: 475, width: 20, height: 25, velocityX: -1.4, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 3030, y: 475, width: 20, height: 25, velocityX: 1.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 3130, y: 475, width: 20, height: 25, velocityX: -1.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 }
        ],
        coins: [
            // Coins on platforms
            { x: 80, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 330, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 410, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 490, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 570, y: 290, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 650, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 750, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 880, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 980, y: 280, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1080, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1180, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            
            // Blue coins on upper platforms (high risk)
            { x: 350, y: 300, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 530, y: 260, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 710, y: 220, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1000, y: 200, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1200, y: 160, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 1540, y: 120, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2090, y: 80, width: 15, height: 15, collected: false, type: 'blue' },
            { x: 2770, y: 40, width: 15, height: 15, collected: false, type: 'blue' },
            
            // More coins throughout the level
            { x: 1350, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1420, y: 300, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1490, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1560, y: 200, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1630, y: 150, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1820, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1890, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1960, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2030, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2100, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2320, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2420, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2520, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2620, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2720, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2850, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2950, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3050, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3150, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 3250, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 3200, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    11: {
        // Level 2-1 - "Paratroopa Plains" - First world 2 level with paratroopas
        platforms: [
            // Starting area
            { x: 0, y: 500, width: 200, height: 100, color: '#90EE90' },
            
            // First challenge - paratroopa introduction
            { x: 250, y: 480, width: 80, height: 120, color: '#90EE90' },
            { x: 380, y: 450, width: 60, height: 150, color: '#90EE90' },
            { x: 490, y: 420, width: 80, height: 180, color: '#90EE90' },
            
            // Second challenge - mixed enemies
            { x: 620, y: 500, width: 100, height: 100, color: '#90EE90' },
            { x: 770, y: 470, width: 50, height: 130, color: '#90EE90' },
            { x: 870, y: 440, width: 50, height: 160, color: '#90EE90' },
            { x: 970, y: 410, width: 50, height: 190, color: '#90EE90' },
            
            // Third challenge - vertical paratroopas
            { x: 1070, y: 500, width: 120, height: 100, color: '#90EE90' },
            { x: 1240, y: 460, width: 40, height: 140, color: '#90EE90' },
            { x: 1330, y: 420, width: 40, height: 180, color: '#90EE90' },
            { x: 1420, y: 380, width: 40, height: 220, color: '#90EE90' },
            
            // Fourth challenge - paratroopa gauntlet
            { x: 1510, y: 500, width: 80, height: 100, color: '#90EE90' },
            { x: 1640, y: 480, width: 60, height: 120, color: '#90EE90' },
            { x: 1750, y: 460, width: 60, height: 140, color: '#90EE90' },
            { x: 1860, y: 440, width: 60, height: 160, color: '#90EE90' },
            
            // Goal platform
            { x: 1970, y: 500, width: 300, height: 100, color: '#90EE90' },
            
            // Upper platforms
            { x: 280, y: 380, width: 40, height: 20, color: '#90EE90' },
            { x: 520, y: 340, width: 40, height: 20, color: '#90EE90' },
            { x: 800, y: 400, width: 40, height: 20, color: '#90EE90' },
            { x: 1000, y: 360, width: 40, height: 20, color: '#90EE90' },
            { x: 1340, y: 320, width: 40, height: 20, color: '#90EE90' },
            { x: 1670, y: 380, width: 40, height: 20, color: '#90EE90' }
        ],
        breakableBlocks: [
            // Brick blocks
            { x: 270, y: 450, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 400, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 510, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 790, y: 440, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 880, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 980, y: 380, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1260, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1350, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1530, y: 470, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1660, y: 450, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1770, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1880, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            // Power-ups
            { x: 300, y: 350, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 540, y: 310, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 820, y: 370, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1020, y: 330, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1360, y: 290, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1690, y: 350, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        pipes: [
            // Transportation pipes
            { x: 650, y: 450, width: 60, height: 50, color: '#8B4513', exitX: 1120, exitY: 450, type: 'vertical', solid: true },
            { x: 1120, y: 450, width: 60, height: 50, color: '#8B4513', exitX: 650, exitY: 450, type: 'vertical', solid: true }
        ],
        mobilePlatforms: [
            // Moving platforms
            { x: 770, y: 430, width: 50, height: 20, color: '#228B22', velocityX: 2, minX: 750, maxX: 820, startY: 430 },
            { x: 870, y: 400, width: 50, height: 20, color: '#228B22', velocityX: -2.5, minX: 850, maxX: 920, startY: 400 },
            { x: 970, y: 370, width: 50, height: 20, color: '#228B22', velocityX: 2.2, minX: 950, maxX: 1020, startY: 370 },
            { x: 1240, y: 410, width: 40, height: 20, color: '#228B22', velocityX: -2, minX: 1220, maxX: 1280, startY: 410 },
            { x: 1330, y: 370, width: 40, height: 20, color: '#228B22', velocityX: 2.8, minX: 1310, maxX: 1370, startY: 370 },
            { x: 1420, y: 330, width: 40, height: 20, color: '#228B22', velocityX: -2.3, minX: 1400, maxX: 1460, startY: 330 }
        ],
        enemies: [
            // Green paratroopas - jumping type
            { x: 280, y: 455, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1, groundY: 455, animationTimer: 0 },
            { x: 410, y: 425, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.2, groundY: 425, animationTimer: 20 },
            { x: 520, y: 395, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.4, groundY: 395, animationTimer: 40 },
            { x: 800, y: 445, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1, groundY: 445, animationTimer: 60 },
            { x: 890, y: 415, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.3, groundY: 415, animationTimer: 80 },
            { x: 990, y: 385, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.1, groundY: 385, animationTimer: 100 },
            { x: 1270, y: 435, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.5, groundY: 435, animationTimer: 120 },
            { x: 1360, y: 395, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.2, groundY: 395, animationTimer: 140 },
            
            // Red paratroopas - flying type
            { x: 350, y: 300, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 0.8, animationTimer: 0 },
            { x: 550, y: 250, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: -1, animationTimer: 30 },
            { x: 830, y: 320, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 1.2, animationTimer: 60 },
            { x: 1030, y: 280, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: -0.9, animationTimer: 90 },
            { x: 1380, y: 240, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 1.4, animationTimer: 120 },
            
            // Regular enemies for variety
            { x: 50, y: 475, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 150, y: 475, width: 25, height: 25, velocityX: -0.8, color: '#8B0000' },
            { x: 680, y: 475, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 1100, y: 475, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1550, y: 475, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 1650, y: 455, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' },
            { x: 1760, y: 435, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 1870, y: 415, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            
            // Koopas
            { x: 100, y: 475, width: 20, height: 25, velocityX: 0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 200, y: 475, width: 20, height: 25, velocityX: -0.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 730, y: 475, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1150, y: 475, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1600, y: 475, width: 20, height: 25, velocityX: 1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1700, y: 455, width: 20, height: 25, velocityX: -0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1810, y: 435, width: 20, height: 25, velocityX: 1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1910, y: 475, width: 20, height: 25, velocityX: -0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 }
        ],
        coins: [
            // Coins on platforms
            { x: 80, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 320, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 410, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 450, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 520, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 560, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 800, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 840, y: 390, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 890, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 930, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 990, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1030, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1100, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1140, y: 390, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1270, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1310, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1360, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1400, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1550, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1590, y: 390, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1660, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1700, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1770, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1810, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1880, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1920, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2000, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2040, y: 390, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2100, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2140, y: 390, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2200, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2240, y: 390, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 2200, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    12: {
        // Level 2-2 - "Paratroopa Fortress" - Advanced paratroopa level
        platforms: [
            // Starting area
            { x: 0, y: 480, width: 180, height: 120, color: '#98FB98' },
            
            // First challenge - paratroopa introduction
            { x: 230, y: 460, width: 70, height: 140, color: '#98FB98' },
            { x: 350, y: 430, width: 50, height: 170, color: '#98FB98' },
            { x: 450, y: 400, width: 70, height: 200, color: '#98FB98' },
            
            // Second challenge - mixed paratroopas
            { x: 570, y: 480, width: 80, height: 120, color: '#98FB98' },
            { x: 700, y: 450, width: 40, height: 150, color: '#98FB98' },
            { x: 790, y: 420, width: 40, height: 180, color: '#98FB98' },
            { x: 880, y: 390, width: 40, height: 210, color: '#98FB98' },
            { x: 970, y: 360, width: 40, height: 240, color: '#98FB98' },
            
            // Third challenge - paratroopa maze
            { x: 1060, y: 480, width: 100, height: 120, color: '#98FB98' },
            { x: 1210, y: 440, width: 35, height: 160, color: '#98FB98' },
            { x: 1290, y: 400, width: 35, height: 200, color: '#98FB98' },
            { x: 1370, y: 360, width: 35, height: 240, color: '#98FB98' },
            { x: 1450, y: 320, width: 35, height: 280, color: '#98FB98' },
            
            // Fourth challenge - paratroopa gauntlet
            { x: 1540, y: 480, width: 70, height: 120, color: '#98FB98' },
            { x: 1660, y: 450, width: 50, height: 150, color: '#98FB98' },
            { x: 1760, y: 420, width: 50, height: 180, color: '#98FB98' },
            { x: 1860, y: 390, width: 50, height: 210, color: '#98FB98' },
            { x: 1960, y: 360, width: 50, height: 240, color: '#98FB98' },
            
            // Fifth challenge - final paratroopa area
            { x: 2060, y: 480, width: 80, height: 120, color: '#98FB98' },
            { x: 2190, y: 450, width: 40, height: 150, color: '#98FB98' },
            { x: 2280, y: 420, width: 40, height: 180, color: '#98FB98' },
            { x: 2370, y: 390, width: 40, height: 210, color: '#98FB98' },
            
            // Goal platform
            { x: 2460, y: 480, width: 400, height: 120, color: '#98FB98' },
            
            // Upper platforms
            { x: 260, y: 360, width: 35, height: 20, color: '#98FB98' },
            { x: 480, y: 320, width: 35, height: 20, color: '#98FB98' },
            { x: 720, y: 380, width: 35, height: 20, color: '#98FB98' },
            { x: 900, y: 280, width: 35, height: 20, color: '#98FB98' },
            { x: 1100, y: 240, width: 35, height: 20, color: '#98FB98' },
            { x: 1420, y: 200, width: 35, height: 20, color: '#98FB98' },
            { x: 1680, y: 360, width: 35, height: 20, color: '#98FB98' },
            { x: 1980, y: 280, width: 35, height: 20, color: '#98FB98' },
            { x: 2220, y: 240, width: 35, height: 20, color: '#98FB98' }
        ],
        breakableBlocks: [
            // Brick blocks
            { x: 250, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 370, y: 400, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 460, y: 370, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 590, y: 450, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 710, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 800, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 890, y: 360, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 980, y: 330, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1080, y: 450, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1220, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1300, y: 370, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1380, y: 330, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1560, y: 450, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1680, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1780, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1880, y: 360, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1980, y: 330, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 2080, y: 450, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 2200, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 2290, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            // Power-ups
            { x: 280, y: 330, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 500, y: 290, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 740, y: 350, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 920, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1120, y: 210, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1440, y: 170, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1700, y: 330, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 2000, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 2240, y: 210, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        pipes: [
            // Transportation pipes
            { x: 600, y: 430, width: 60, height: 50, color: '#8B4513', exitX: 1140, exitY: 430, type: 'vertical', solid: true },
            { x: 1140, y: 430, width: 60, height: 50, color: '#8B4513', exitX: 600, exitY: 430, type: 'vertical', solid: true },
            { x: 1590, y: 400, width: 60, height: 80, color: '#8B4513', exitX: 2130, exitY: 430, type: 'vertical', solid: true },
            { x: 2130, y: 430, width: 60, height: 50, color: '#8B4513', exitX: 1590, exitY: 400, type: 'vertical', solid: true }
        ],
        mobilePlatforms: [
            // Moving platforms
            { x: 700, y: 400, width: 40, height: 20, color: '#32CD32', velocityX: 2.5, minX: 680, maxX: 740, startY: 400 },
            { x: 790, y: 370, width: 40, height: 20, color: '#32CD32', velocityX: -3, minX: 770, maxX: 830, startY: 370 },
            { x: 880, y: 340, width: 40, height: 20, color: '#32CD32', velocityX: 2.8, minX: 860, maxX: 920, startY: 340 },
            { x: 970, y: 310, width: 40, height: 20, color: '#32CD32', velocityX: -2.2, minX: 950, maxX: 1010, startY: 310 },
            { x: 1210, y: 380, width: 35, height: 20, color: '#32CD32', velocityX: 2, minX: 1190, maxX: 1245, startY: 380 },
            { x: 1290, y: 340, width: 35, height: 20, color: '#32CD32', velocityX: -2.5, minX: 1270, maxX: 1325, startY: 340 },
            { x: 1370, y: 300, width: 35, height: 20, color: '#32CD32', velocityX: 3.2, minX: 1350, maxX: 1405, startY: 300 },
            { x: 1450, y: 260, width: 35, height: 20, color: '#32CD32', velocityX: -2.8, minX: 1430, maxX: 1485, startY: 260 },
            { x: 1660, y: 400, width: 40, height: 20, color: '#32CD32', velocityX: 2.3, minX: 1640, maxX: 1700, startY: 400 },
            { x: 1760, y: 370, width: 40, height: 20, color: '#32CD32', velocityX: -2.7, minX: 1740, maxX: 1800, startY: 370 },
            { x: 1860, y: 340, width: 40, height: 20, color: '#32CD32', velocityX: 3.5, minX: 1840, maxX: 1900, startY: 340 },
            { x: 1960, y: 310, width: 40, height: 20, color: '#32CD32', velocityX: -3, minX: 1940, maxX: 2000, startY: 310 }
        ],
        enemies: [
            // Green paratroopas - jumping type
            { x: 260, y: 435, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.2, groundY: 435, animationTimer: 0 },
            { x: 380, y: 405, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.4, groundY: 405, animationTimer: 15 },
            { x: 480, y: 375, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.6, groundY: 375, animationTimer: 30 },
            { x: 600, y: 455, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1, groundY: 455, animationTimer: 45 },
            { x: 720, y: 425, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.3, groundY: 425, animationTimer: 60 },
            { x: 810, y: 395, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.5, groundY: 395, animationTimer: 75 },
            { x: 900, y: 365, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.8, groundY: 365, animationTimer: 90 },
            { x: 990, y: 335, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.2, groundY: 335, animationTimer: 105 },
            { x: 1080, y: 455, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.4, groundY: 455, animationTimer: 120 },
            { x: 1230, y: 385, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.6, groundY: 385, animationTimer: 135 },
            { x: 1310, y: 345, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.9, groundY: 345, animationTimer: 150 },
            { x: 1390, y: 305, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.3, groundY: 305, animationTimer: 165 },
            { x: 1470, y: 265, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.7, groundY: 265, animationTimer: 180 },
            { x: 1570, y: 455, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.1, groundY: 455, animationTimer: 195 },
            { x: 1680, y: 425, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 1.5, groundY: 425, animationTimer: 210 },
            { x: 1780, y: 395, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.8, groundY: 395, animationTimer: 225 },
            { x: 1880, y: 365, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: 2, groundY: 365, animationTimer: 240 },
            { x: 1980, y: 335, width: 20, height: 25, color: '#228B22', type: 'greenparatroopa', velocityX: -1.4, groundY: 335, animationTimer: 255 },
            
            // Red paratroopas - flying type
            { x: 330, y: 280, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 1, animationTimer: 0 },
            { x: 510, y: 240, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: -1.2, animationTimer: 25 },
            { x: 750, y: 300, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 1.4, animationTimer: 50 },
            { x: 930, y: 200, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: -1, animationTimer: 75 },
            { x: 1150, y: 160, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 1.6, animationTimer: 100 },
            { x: 1470, y: 120, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: -1.3, animationTimer: 125 },
            { x: 1720, y: 280, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 1.8, animationTimer: 150 },
            { x: 2020, y: 200, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: -1.5, animationTimer: 175 },
            { x: 2260, y: 160, width: 20, height: 25, color: '#DC143C', type: 'redparatroopa', velocityX: 2, animationTimer: 200 },
            
            // Regular enemies
            { x: 50, y: 455, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 150, y: 455, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 650, y: 455, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 1150, y: 455, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 1610, y: 455, width: 25, height: 25, velocityX: 1.6, color: '#8B0000' },
            { x: 2110, y: 455, width: 25, height: 25, velocityX: -1.4, color: '#8B0000' },
            { x: 2510, y: 455, width: 25, height: 25, velocityX: 1.8, color: '#8B0000' },
            { x: 2610, y: 455, width: 25, height: 25, velocityX: -1.6, color: '#8B0000' },
            { x: 2710, y: 455, width: 25, height: 25, velocityX: 2, color: '#8B0000' },
            { x: 2810, y: 455, width: 25, height: 25, velocityX: -1.8, color: '#8B0000' },
            
            // Koopas
            { x: 100, y: 455, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 200, y: 455, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 700, y: 455, width: 20, height: 25, velocityX: 1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1200, y: 455, width: 20, height: 25, velocityX: -0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1660, y: 455, width: 20, height: 25, velocityX: 1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2160, y: 455, width: 20, height: 25, velocityX: -0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2560, y: 455, width: 20, height: 25, velocityX: 1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2660, y: 455, width: 20, height: 25, velocityX: -1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2760, y: 455, width: 20, height: 25, velocityX: 1.3, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 2860, y: 455, width: 20, height: 25, velocityX: -1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 }
        ],
        coins: [
            // Coins on platforms
            { x: 80, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 320, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 390, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 430, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 480, y: 290, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 520, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 600, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 640, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 720, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 760, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 810, y: 300, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 850, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 900, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 940, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 990, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1030, y: 240, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1080, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1120, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1230, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1270, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1320, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1360, y: 290, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1410, y: 230, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1450, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1570, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1610, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1690, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1730, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1790, y: 300, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1830, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1890, y: 250, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1930, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1990, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2030, y: 240, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2090, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2130, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2210, y: 330, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2250, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2310, y: 300, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2350, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2480, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2520, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2580, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2620, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2680, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2720, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2780, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2820, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2880, y: 350, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 2800, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    13: {
        // Level 3-1 - "Bullet Bill Blitz" - Bullet Bill focused level
        platforms: [
            // Starting area
            { x: 0, y: 480, width: 200, height: 120, color: '#87CEEB' },
            
            // First challenge - bullet bill gauntlet
            { x: 250, y: 460, width: 60, height: 140, color: '#87CEEB' },
            { x: 350, y: 440, width: 60, height: 160, color: '#87CEEB' },
            { x: 450, y: 420, width: 60, height: 180, color: '#87CEEB' },
            { x: 550, y: 440, width: 60, height: 160, color: '#87CEEB' },
            
            // Safe zone
            { x: 670, y: 480, width: 100, height: 120, color: '#87CEEB' },
            
            // Second challenge - more bullet bills
            { x: 820, y: 460, width: 50, height: 140, color: '#87CEEB' },
            { x: 920, y: 440, width: 50, height: 160, color: '#87CEEB' },
            { x: 1020, y: 420, width: 50, height: 180, color: '#87CEEB' },
            { x: 1120, y: 440, width: 50, height: 160, color: '#87CEEB' },
            { x: 1220, y: 460, width: 50, height: 140, color: '#87CEEB' },
            
            // Third challenge - bullet bill maze
            { x: 1320, y: 480, width: 80, height: 120, color: '#87CEEB' },
            { x: 1450, y: 450, width: 40, height: 150, color: '#87CEEB' },
            { x: 1540, y: 420, width: 40, height: 180, color: '#87CEEB' },
            { x: 1630, y: 390, width: 40, height: 210, color: '#87CEEB' },
            { x: 1720, y: 420, width: 40, height: 180, color: '#87CEEB' },
            { x: 1810, y: 450, width: 40, height: 150, color: '#87CEEB' },
            
            // Goal platform
            { x: 1900, y: 480, width: 300, height: 120, color: '#87CEEB' }
        ],
        breakableBlocks: [
            { x: 270, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 370, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 470, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 840, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 940, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1040, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1140, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1460, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1550, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1640, y: 360, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1730, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1820, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            { x: 300, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 500, y: 380, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 870, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1070, y: 380, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1570, y: 360, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1850, y: 390, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        enemies: [
            // Bullet Bills fired from cannons
            { x: 200, y: 460, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1 },
            { x: 300, y: 440, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: -1 },
            { x: 400, y: 420, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1.2 },
            { x: 500, y: 440, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: -1 },
            { x: 700, y: 460, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1 },
            { x: 870, y: 440, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: -1.2 },
            { x: 970, y: 420, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1 },
            { x: 1070, y: 440, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: -1 },
            { x: 1170, y: 460, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1.2 },
            { x: 1350, y: 460, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: -1 },
            { x: 1470, y: 430, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1 },
            { x: 1560, y: 400, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: -1.2 },
            { x: 1650, y: 370, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1 },
            { x: 1740, y: 400, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: -1 },
            { x: 1830, y: 430, width: 25, height: 25, color: '#8B0000', type: 'goomba', velocityX: 1.2 },
            
            // Bullet Bills (spawned dynamically)
            { x: 100, y: 470, width: 20, height: 15, color: '#000000', type: 'bulletbill', velocityX: 4 },
            { x: 600, y: 470, width: 20, height: 15, color: '#000000', type: 'bulletbill', velocityX: 4 },
            { x: 1270, y: 470, width: 20, height: 15, color: '#000000', type: 'bulletbill', velocityX: 4 },
            { x: 1870, y: 470, width: 20, height: 15, color: '#000000', type: 'bulletbill', velocityX: 4 }
        ],
        coins: [
            { x: 80, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 400, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 380, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 480, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 580, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 700, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 800, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 870, y: 400, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 970, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1070, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1170, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1350, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1470, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1560, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1650, y: 280, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1740, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1830, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1950, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2050, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2150, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 2150, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    14: {
        // Level 3-2 - "Thwomp Tower" - Thwomp focused level
        platforms: [
            // Starting area
            { x: 0, y: 480, width: 200, height: 120, color: '#708090' },
            
            // First challenge - thwomp gauntlet
            { x: 250, y: 460, width: 80, height: 140, color: '#708090' },
            { x: 380, y: 440, width: 60, height: 160, color: '#708090' },
            { x: 490, y: 420, width: 80, height: 180, color: '#708090' },
            
            // Safe zone
            { x: 620, y: 480, width: 100, height: 120, color: '#708090' },
            
            // Second challenge - thwomp maze
            { x: 770, y: 460, width: 50, height: 140, color: '#708090' },
            { x: 870, y: 440, width: 50, height: 160, color: '#708090' },
            { x: 970, y: 420, width: 50, height: 180, color: '#708090' },
            { x: 1070, y: 440, width: 50, height: 160, color: '#708090' },
            { x: 1170, y: 460, width: 50, height: 140, color: '#708090' },
            
            // Third challenge - thwomp tower
            { x: 1270, y: 480, width: 120, height: 120, color: '#708090' },
            { x: 1440, y: 450, width: 40, height: 150, color: '#708090' },
            { x: 1530, y: 420, width: 40, height: 180, color: '#708090' },
            { x: 1620, y: 390, width: 40, height: 210, color: '#708090' },
            { x: 1710, y: 420, width: 40, height: 180, color: '#708090' },
            { x: 1800, y: 450, width: 40, height: 150, color: '#708090' },
            
            // Goal platform
            { x: 1890, y: 480, width: 300, height: 120, color: '#708090' }
        ],
        breakableBlocks: [
            { x: 270, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 400, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 510, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 790, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 890, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 990, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1090, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1450, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1540, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1630, y: 360, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1720, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1810, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 }
        ],
        interrogationBlocks: [
            { x: 300, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 540, y: 360, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 820, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1020, y: 380, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1560, y: 360, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1840, y: 390, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        enemies: [
            // Thwomps - drop from ceiling
            { x: 300, y: 100, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 420, originalY: 100, dropping: false, waitTimer: 0, animationTimer: 0 },
            { x: 420, y: 80, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 400, originalY: 80, dropping: false, waitTimer: 0, animationTimer: 20 },
            { x: 530, y: 60, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 380, originalY: 60, dropping: false, waitTimer: 0, animationTimer: 40 },
            { x: 820, y: 100, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 420, originalY: 100, dropping: false, waitTimer: 0, animationTimer: 60 },
            { x: 920, y: 80, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 400, originalY: 80, dropping: false, waitTimer: 0, animationTimer: 80 },
            { x: 1020, y: 60, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 380, originalY: 60, dropping: false, waitTimer: 0, animationTimer: 100 },
            { x: 1120, y: 80, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 400, originalY: 80, dropping: false, waitTimer: 0, animationTimer: 120 },
            { x: 1480, y: 100, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 410, originalY: 100, dropping: false, waitTimer: 0, animationTimer: 140 },
            { x: 1570, y: 70, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 380, originalY: 70, dropping: false, waitTimer: 0, animationTimer: 160 },
            { x: 1660, y: 40, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 350, originalY: 40, dropping: false, waitTimer: 0, animationTimer: 180 },
            { x: 1750, y: 70, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 380, originalY: 70, dropping: false, waitTimer: 0, animationTimer: 200 },
            { x: 1840, y: 100, width: 30, height: 40, color: '#808080', type: 'thwomp', groundY: 410, originalY: 100, dropping: false, waitTimer: 0, animationTimer: 220 },
            
            // Regular enemies for variety
            { x: 50, y: 455, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 150, y: 455, width: 25, height: 25, velocityX: -0.8, color: '#8B0000' },
            { x: 670, y: 455, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 1320, y: 455, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1940, y: 455, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 2040, y: 455, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' }
        ],
        coins: [
            { x: 80, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 400, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 410, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 520, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 670, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 800, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 890, y: 400, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 990, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1090, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1320, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1470, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1560, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1650, y: 280, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1740, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1830, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1940, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2040, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2140, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 2140, y: 350, width: 20, height: 200, color: '#FFD700' }
    },
    15: {
        // Level 3-3 - "Conveyor Chaos" - Conveyor belt focused level
        platforms: [
            // Starting area
            { x: 0, y: 480, width: 200, height: 120, color: '#FF6347' },
            
            // First challenge - conveyor belt introduction
            { x: 250, y: 460, width: 100, height: 140, color: '#FF6347' },
            { x: 400, y: 440, width: 80, height: 160, color: '#FF6347' },
            { x: 530, y: 420, width: 100, height: 180, color: '#FF6347' },
            
            // Safe zone
            { x: 680, y: 480, width: 80, height: 120, color: '#FF6347' },
            
            // Second challenge - conveyor belt maze
            { x: 810, y: 460, width: 60, height: 140, color: '#FF6347' },
            { x: 920, y: 440, width: 60, height: 160, color: '#FF6347' },
            { x: 1030, y: 420, width: 60, height: 180, color: '#FF6347' },
            { x: 1140, y: 440, width: 60, height: 160, color: '#FF6347' },
            { x: 1250, y: 460, width: 60, height: 140, color: '#FF6347' },
            
            // Third challenge - conveyor belt gauntlet
            { x: 1360, y: 480, width: 100, height: 120, color: '#FF6347' },
            { x: 1510, y: 450, width: 50, height: 150, color: '#FF6347' },
            { x: 1610, y: 420, width: 50, height: 180, color: '#FF6347' },
            { x: 1710, y: 390, width: 50, height: 210, color: '#FF6347' },
            { x: 1810, y: 420, width: 50, height: 180, color: '#FF6347' },
            { x: 1910, y: 450, width: 50, height: 150, color: '#FF6347' },
            
            // Goal platform
            { x: 2010, y: 480, width: 300, height: 120, color: '#FF6347' }
        ],
        conveyorBelts: [
            // First conveyor belt section (moves right)
            { x: 250, y: 470, width: 100, height: 20, speed: 2 },
            { x: 400, y: 450, width: 80, height: 20, speed: 2.5 },
            { x: 530, y: 430, width: 100, height: 20, speed: 3 },
            
            // Second conveyor belt section (moves left)
            { x: 810, y: 470, width: 60, height: 20, speed: -2 },
            { x: 920, y: 450, width: 60, height: 20, speed: -2.5 },
            { x: 1030, y: 430, width: 60, height: 20, speed: -3 },
            { x: 1140, y: 450, width: 60, height: 20, speed: -2 },
            { x: 1250, y: 470, width: 60, height: 20, speed: -2.5 },
            
            // Third conveyor belt section (mixed directions)
            { x: 1360, y: 490, width: 100, height: 20, speed: 2 },
            { x: 1510, y: 460, width: 50, height: 20, speed: -2.5 },
            { x: 1610, y: 430, width: 50, height: 20, speed: 3 },
            { x: 1710, y: 400, width: 50, height: 20, speed: -3.5 },
            { x: 1810, y: 430, width: 50, height: 20, speed: 3 },
            { x: 1910, y: 460, width: 50, height: 20, speed: -2.5 }
        ],
        breakableBlocks: [
            { x: 270, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 420, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 550, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 830, y: 430, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 940, y: 410, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1050, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1520, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1620, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1720, y: 360, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 },
            { x: 1820, y: 390, width: 30, height: 30, color: '#CD853F', broken: false, coins: 0 },
            { x: 1920, y: 420, width: 30, height: 30, color: '#CD853F', broken: false, coins: 1 }
        ],
        interrogationBlocks: [
            { x: 300, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 580, y: 360, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 860, y: 400, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' },
            { x: 1080, y: 380, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 1640, y: 360, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 1940, y: 390, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        enemies: [
            // Regular enemies on conveyor belts
            { x: 280, y: 455, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 430, y: 435, width: 25, height: 25, velocityX: -0.8, color: '#8B0000' },
            { x: 560, y: 415, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 700, y: 455, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 840, y: 455, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 950, y: 435, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 1060, y: 415, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 1170, y: 435, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 1280, y: 455, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 1390, y: 455, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1540, y: 435, width: 25, height: 25, velocityX: 1.2, color: '#8B0000' },
            { x: 1640, y: 405, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1740, y: 375, width: 25, height: 25, velocityX: 1.4, color: '#8B0000' },
            { x: 1840, y: 405, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' },
            { x: 1940, y: 435, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
            { x: 2040, y: 455, width: 25, height: 25, velocityX: -1.3, color: '#8B0000' },
            
            // Koopas for variety
            { x: 300, y: 455, width: 20, height: 25, velocityX: 0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 460, y: 435, width: 20, height: 25, velocityX: -0.6, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 590, y: 415, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 870, y: 455, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 980, y: 435, width: 20, height: 25, velocityX: 1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1090, y: 415, width: 20, height: 25, velocityX: -0.8, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1410, y: 455, width: 20, height: 25, velocityX: 0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1560, y: 435, width: 20, height: 25, velocityX: -0.7, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1660, y: 405, width: 20, height: 25, velocityX: 1.1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1760, y: 375, width: 20, height: 25, velocityX: -0.9, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1860, y: 405, width: 20, height: 25, velocityX: 1.2, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 },
            { x: 1960, y: 435, width: 20, height: 25, velocityX: -1, color: '#008000', type: 'koopa', shellMode: false, velocityY: 0 }
        ],
        coins: [
            { x: 80, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 180, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 280, y: 400, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 430, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 560, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 700, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 840, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 940, y: 400, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1040, y: 380, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1140, y: 360, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1280, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1400, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1540, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1640, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1740, y: 280, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1840, y: 310, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 1940, y: 340, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2060, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2160, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' },
            { x: 2260, y: 370, width: 15, height: 15, collected: false, color: '#FFD700' }
        ],
        flagpole: { x: 2260, y: 350, width: 20, height: 200, color: '#FFD700' }
    }
};

let currentLevel = null;
let platforms = [];
let enemies = [];
let coins = [];
let breakableBlocks = [];
let interrogationBlocks = [];
let pipes = [];
let mobilePlatforms = [];
let fallingPlatforms = [];
let lavaPools = [];
let fireBars = [];
let springs = [];
let conveyorBelts = [];
let flagpole = null;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') e.preventDefault();
    
    // R key restart - only on keydown, not continuous
    if ((e.key === 'r' || e.key === 'R') && gameRunning) {
        restartGame();
    }
    
    // ESC key to toggle pause
    if (e.key === 'Escape' && gameRunning) {
        togglePause();
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize game
function init(selectedLevel = 1) {
    // Load progress from localStorage
    loadProgress();
    
    // Make canvas responsive
    makeCanvasResponsive();
    
    gameRunning = true;
    score = 0;
    lives = 3;
    level = selectedLevel;
    loadLevel(level);
    resetPlayer();
    updateUI();
    gameLoop();
}

// Load level data
function loadLevel(levelNum) {
    currentLevel = levels[levelNum];
    platforms = [...currentLevel.platforms];
    enemies = currentLevel.enemies.map(e => ({...e, defeated: false}));
    coins = currentLevel.coins.map(c => ({...c}));
    breakableBlocks = currentLevel.breakableBlocks ? currentLevel.breakableBlocks.map(b => ({...b})) : [];
    interrogationBlocks = currentLevel.interrogationBlocks ? currentLevel.interrogationBlocks.map(i => ({...i})) : [];
    pipes = currentLevel.pipes ? currentLevel.pipes.map(p => ({...p})) : [];
    mobilePlatforms = currentLevel.mobilePlatforms ? currentLevel.mobilePlatforms.map(m => ({...m})) : [];
    fallingPlatforms = currentLevel.fallingPlatforms ? currentLevel.fallingPlatforms.map(f => ({...f, falling: false, fallTimer: 0})) : [];
    lavaPools = currentLevel.lavaPools ? currentLevel.lavaPools.map(l => ({...l, bubbleTimer: 0})) : [];
    fireBars = currentLevel.fireBars ? currentLevel.fireBars.map(f => ({...f, rotation: 0})) : [];
    springs = currentLevel.springs ? currentLevel.springs.map(s => ({...s, compressed: false, compressionTimer: 0})) : [];
    conveyorBelts = currentLevel.conveyorBelts ? currentLevel.conveyorBelts.map(c => ({...c})) : [];
    flagpole = {...currentLevel.flagpole};
}

// Reset player position
function resetPlayer() {
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
    player.hasFireFlower = false;
    player.width = player.originalWidth;
    player.height = player.originalHeight;
    player.jumpPower = 12;
    player.powerUpTimer = 0;
    camera.x = 0;
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('coinCount').textContent = coinCount;
}

// Handle player input
function handleInput() {
    player.isWalking = false;
    player.isRunning = false;
    
    // Check if running (Shift key)
    const running = keys['Shift'];
    const currentSpeed = running ? player.runSpeed : player.speed;
    
    if (keys['ArrowLeft']) {
        player.velocityX = -currentSpeed;
        player.facing = 'left';
        player.isWalking = true;
        if (running) player.isRunning = true;
    } else if (keys['ArrowRight']) {
        player.velocityX = currentSpeed;
        player.facing = 'right';
        player.isWalking = true;
        if (running) player.isRunning = true;
    } else {
        player.velocityX *= friction;
        // Snap to zero when very close to prevent sliding
        if (Math.abs(player.velocityX) < 0.1) {
            player.velocityX = 0;
        }
    }
    
    if ((keys[' '] || keys['ArrowUp']) && player.grounded) {
        player.velocityY = -player.jumpPower;
        player.grounded = false;
        player.isJumping = true;
    }
}

// Update player physics
function updatePlayer() {
    // Apply gravity
    const gravity = 0.5;
    const maxFallSpeed = 15;
    player.velocityY += gravity;
    
    // Cap fall speed
    if (player.velocityY > maxFallSpeed) {
        player.velocityY = maxFallSpeed;
    }
    
    // Update power-up timer
    if (player.powerUpTimer > 0) {
        player.powerUpTimer--;
        if (player.powerUpTimer === 0) {
            // Reset power-up effects
            player.hasFireFlower = false;
            player.jumpPower = 12;
            player.width = player.originalWidth;
            player.height = player.originalHeight;
        }
    }
    
    // Separate horizontal movement and collision
    player.x += player.velocityX;
    
    // Level boundaries (horizontal)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;
    
    // Horizontal collision with platforms
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            if (player.velocityX > 0) {
                // Moving right, hit left side of platform
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) {
                // Moving left, hit right side of platform
                player.x = platform.x + platform.width;
            }
            player.velocityX = 0;
        }
    }
    
    // Separate vertical movement and collision
    player.y += player.velocityY;
    
    // Vertical collision with platforms
    player.grounded = false;
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0) {
                // Falling down, land on top of platform
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
                player.isJumping = false;
            } else if (player.velocityY < 0) {
                // Moving up, hit bottom of platform
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }
    }
    
    // Check for bottomless pit (falling below all platforms)
    let onPlatform = false;
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            onPlatform = true;
            break;
        }
    }
    
    if (player.y > canvas.height && !onPlatform) {
        lives--;
        resetPlayer();
        if (lives <= 0) {
            gameOver();
        }
        return;
    }
    
    // Breakable block collision
    for (let block of breakableBlocks) {
        if (!block.broken && checkCollision(player, block)) {
            // Hit block from below
            if (player.velocityY < 0 && player.y > block.y) {
                block.broken = true;
                score += 50;
                
                // Release coins if block has them
                if (block.coins > 0) {
                    score += block.coins * 50;
                }
                
                // Bounce player back
                player.velocityY = 2;
            }
        }
    }
    
    // Interrogation block collision
    for (let block of interrogationBlocks) {
        if (!block.used && checkCollision(player, block)) {
            // Hit block from below
            if (player.velocityY < 0 && player.y > block.y) {
                block.used = true;
                
                // Give item based on type
                switch(block.item) {
                    case 'coin':
                        score += 100;
                        break;
                    case 'mushroom':
                        score += 200;
                        if (!player.hasFireFlower) {
                            player.width = 35; // Make player bigger
                            player.height = 45;
                        }
                        break;
                    case 'flower':
                        score += 300;
                        player.jumpPower = 15; // Higher jump
                        break;
                    case 'fireflower':
                        score += 400;
                        player.jumpPower = 15; // Higher jump
                        player.hasFireFlower = true; // Give fire flower power
                        player.powerUpTimer = 600; // 10 seconds at 60 FPS
                        player.width = player.originalWidth;
                        player.height = player.originalHeight;
                        break;
                    case 'star':
                        score += 500;
                        // Temporary invincibility could be added here
                        break;
                }
                
                // Bounce player back
                player.velocityY = 2;
            }
        }
    }
    
    // Pipe collision (solid collision and enter pipe)
    for (let pipe of pipes) {
        if (checkCollision(player, pipe)) {
            // Solid pipe collision
            if (pipe.solid) {
                // Handle collision based on pipe type
                if (pipe.type === 'vertical') {
                    // Vertical pipe collision
                    if (player.velocityY > 0 && player.y < pipe.y) {
                        // Landing on top of pipe
                        player.y = pipe.y - player.height;
                        player.velocityY = 0;
                        player.grounded = true;
                        player.isJumping = false;
                    } else if (player.velocityY < 0 && player.y > pipe.y + pipe.height - 20) {
                        // Hitting pipe from below
                        player.velocityY = 2;
                    } else {
                        // Side collision
                        if (player.x < pipe.x) {
                            player.x = pipe.x - player.width;
                        } else {
                            player.x = pipe.x + pipe.width;
                        }
                        player.velocityX = 0;
                    }
                } else if (pipe.type === 'horizontal') {
                    // Horizontal pipe collision
                    if (player.velocityY > 0 && player.y < pipe.y) {
                        // Landing on top of horizontal pipe
                        player.y = pipe.y - player.height;
                        player.velocityY = 0;
                        player.grounded = true;
                        player.isJumping = false;
                    } else if (player.velocityY < 0 && player.y > pipe.y + pipe.height - 20) {
                        // Hitting pipe from below
                        player.velocityY = 2;
                    } else {
                        // Side collision
                        if (player.x < pipe.x) {
                            player.x = pipe.x - player.width;
                        } else {
                            player.x = pipe.x + pipe.width;
                        }
                        player.velocityX = 0;
                    }
                }
            }
            
            // Check if player is above pipe and pressing down (for transportation)
            if (keys['ArrowDown'] && player.y < pipe.y) {
                // Transport to exit pipe
                player.x = pipe.exitX;
                player.y = pipe.exitY - player.height;
                break;
            }
        }
    }
    
    // Mobile platform collision
    for (let platform of mobilePlatforms) {
        if (checkCollision(player, platform)) {
            // Landing on top of platform
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
                player.isJumping = false;
                
                // Move player with platform, but respect boundaries
                const newX = player.x + platform.velocityX;
                
                // Only move player if platform isn't at boundary
                if (!(platform.x <= platform.minX || platform.x + platform.width >= platform.maxX)) {
                    player.x = newX;
                } else if (platform.x <= platform.minX && platform.velocityX < 0) {
                    // Platform at left boundary moving left - don't move player left
                    player.x = player.x;
                } else if (platform.x + platform.width >= platform.maxX && platform.velocityX > 0) {
                    // Platform at right boundary moving right - don't move player right
                    player.x = player.x;
                }
            }
        }
    }
    
    // Check flagpole collision
    if (flagpole && checkCollision(player, flagpole)) {
        levelComplete();
    }
    
    // Update animation
    player.animationTimer++;
    const animationSpeed = player.isRunning ? 4 : 8; // Faster animation when running
    if (player.animationTimer > animationSpeed) {
        player.animationTimer = 0;
        player.animationFrame = (player.animationFrame + 1) % 2;
    }
}

// Update camera
function updateCamera() {
    // Follow player horizontally with smoothing
    const targetX = player.x - canvas.width / 2;
    const clampedTargetX = Math.max(0, Math.min(targetX, levelWidth - canvas.width));
    // Smooth camera movement with lerp
    camera.x += (clampedTargetX - camera.x) * 0.1;
}

// Update enemies with gravity
function updateEnemies() {
    for (let enemy of enemies) {
        if (enemy.defeated) continue; // Skip defeated enemies
        
        // Handle different enemy types
        if (enemy.type === 'koopa') {
            // Koopa enemies
            if (!enemy.shellMode) {
                // Normal koopa - walk on platforms
                enemy.velocityY = (enemy.velocityY || 0) + gravity;
                enemy.x += enemy.velocityX;
                enemy.y += enemy.velocityY;
                
                // Handle platform collision
                if (enemy.platformIndex >= 0) {
                    // Original level behavior - assigned to specific platform
                    const platform = platforms[enemy.platformIndex];
                    if (platform) {
                        // Check if enemy is on its platform
                        if (enemy.x + enemy.width > platform.x && enemy.x < platform.x + platform.width) {
                            // Land on platform
                            if (enemy.velocityY > 0 && enemy.y < platform.y) {
                                enemy.y = platform.y - enemy.height;
                                enemy.velocityY = 0;
                            }
                        } else {
                            // Enemy is at edge of platform, turn around
                            if (enemy.x <= platform.x || enemy.x + enemy.width >= platform.x + platform.width) {
                                enemy.velocityX *= -1;
                                enemy.x = enemy.velocityX > 0 ? platform.x : platform.x + platform.width - enemy.width;
                            }
                        }
                    }
                } else {
                    // Custom level behavior - walk on any platform
                    let onPlatform = false;
                    for (let platform of platforms) {
                        if (checkCollision(enemy, platform)) {
                            if (enemy.velocityY > 0 && enemy.y < platform.y) {
                                enemy.y = platform.y - enemy.height;
                                enemy.velocityY = 0;
                                onPlatform = true;
                            }
                        }
                    }
                    
                    // Turn around at edges of platforms
                    if (onPlatform) {
                        let currentPlatform = null;
                        for (let platform of platforms) {
                            if (checkCollision(enemy, platform)) {
                                currentPlatform = platform;
                                break;
                            }
                        }
                        if (currentPlatform) {
                            if (enemy.x <= currentPlatform.x || enemy.x + enemy.width >= currentPlatform.x + currentPlatform.width) {
                                enemy.velocityX *= -1;
                                enemy.x = enemy.velocityX > 0 ? currentPlatform.x : currentPlatform.x + currentPlatform.width - enemy.width;
                            }
                        }
                    }
                }
                
                // Check collision with player
                if (checkCollision(player, enemy)) {
                    // Player jumps on koopa
                    if (player.velocityY > 0 && player.y < enemy.y) {
                        enemy.shellMode = true; // Turn into shell
                        enemy.velocityX = 0;
                        player.velocityY = -8; // Bounce
                        score += 100;
                    } else {
                        // Player takes damage
                        lives--;
                        resetPlayer();
                        if (lives <= 0) {
                            gameOver();
                        }
                    }
                }
            } else {
                // Shell mode - slide when kicked
                // Apply gravity to shell
                enemy.velocityY = (enemy.velocityY || 0) + gravity;
                enemy.y += enemy.velocityY;
                
                // Check platform collision for shell
                for (let platform of platforms) {
                    if (checkCollision(enemy, platform)) {
                        if (enemy.velocityY > 0 && enemy.y < platform.y) {
                            enemy.y = platform.y - enemy.height;
                            enemy.velocityY = 0;
                        }
                    }
                }
                
                if (enemy.velocityX !== 0) {
                    // Moving shell
                    enemy.x += enemy.velocityX;
                    
                    // Check collision with other enemies
                    for (let otherEnemy of enemies) {
                        if (otherEnemy !== enemy && !otherEnemy.defeated && checkCollision(enemy, otherEnemy)) {
                            otherEnemy.defeated = true;
                            score += 200;
                        }
                    }
                    
                    // Stop at level boundaries
                    if (enemy.x <= 0 || enemy.x + enemy.width >= levelWidth) {
                        enemy.velocityX = 0;
                    }
                }
                
                // Check collision with player
                if (checkCollision(player, enemy)) {
                    if (enemy.velocityX === 0) {
                        // Kick shell - only kick if player is on the same level or slightly above
                        if (player.y <= enemy.y + enemy.height) {
                            enemy.velocityX = player.facing === 'right' ? 8 : -8;
                            enemy.velocityY = -2; // Small hop when kicked
                            score += 50;
                        }
                    } else {
                        // Moving shell damages player - but not if player is jumping on it from above
                        if (!(player.velocityY > 0 && player.y < enemy.y)) {
                            lives--;
                            resetPlayer();
                            if (lives <= 0) {
                                gameOver();
                            }
                        }
                    }
                }
            }
        } else if (enemy.type === 'spiny') {
            // Spiny enemies - now move like goombas on platforms
            enemy.velocityY = (enemy.velocityY || 0) + gravity;
            enemy.x += enemy.velocityX;
            enemy.y += enemy.velocityY;
            
            // Get the platform this enemy should be on
            const platform = platforms[enemy.platformIndex];
            if (platform) {
                // Check if enemy is on its platform
                if (enemy.x + enemy.width > platform.x && enemy.x < platform.x + platform.width) {
                    // Land on platform
                    if (enemy.velocityY > 0 && enemy.y < platform.y) {
                        enemy.y = platform.y - enemy.height;
                        enemy.velocityY = 0;
                    }
                } else {
                    // Enemy is at edge of platform, turn around
                    if (enemy.x <= platform.x || enemy.x + enemy.width >= platform.x + platform.width) {
                        enemy.velocityX *= -1;
                        enemy.x = enemy.velocityX > 0 ? platform.x : platform.x + platform.width - enemy.width;
                    }
                }
            }
            
            // Check collision with player - spiny damages on any contact
            if (checkCollision(player, enemy)) {
                lives--;
                resetPlayer();
                if (lives <= 0) {
                    gameOver();
                }
            }
        } else if (enemy.type === 'piranha') {
            // Piranha plant AI - more realistic emergence from pipe
            enemy.animationTimer++;
            const pipe = pipes[enemy.pipeIndex];
            if (pipe) {
                // Piranha plant emerges and retracts from pipe more naturally
                const cycleLength = 240; // 4 seconds total cycle
                const emergeTime = 60;   // 1 second to emerge
                const waitTime = 120;    // 2 seconds fully emerged
                const retractTime = 60;  // 1 second to retract
                
                const cyclePosition = enemy.animationTimer % cycleLength;
                
                if (cyclePosition < emergeTime) {
                    // Emerging from pipe - smooth movement
                    enemy.emerging = true;
                    const emergeProgress = cyclePosition / emergeTime;
                    enemy.y = pipe.y - 30 - (emergeProgress * 50);
                } else if (cyclePosition < emergeTime + waitTime) {
                    // Fully emerged, waiting
                    enemy.emerging = true;
                    enemy.y = pipe.y - 80;
                } else if (cyclePosition < emergeTime + waitTime + retractTime) {
                    // Retracting into pipe - smooth movement
                    enemy.emerging = true;
                    const retractProgress = (cyclePosition - emergeTime - waitTime) / retractTime;
                    enemy.y = pipe.y - 80 + (retractProgress * 50);
                } else {
                    // Fully retracted, waiting before next emergence
                    enemy.emerging = false;
                    enemy.y = pipe.y - 30;
                }
                
                // Check collision with player only when emerged
                if (enemy.emerging && checkCollision(player, enemy)) {
                    lives--;
                    resetPlayer();
                    if (lives <= 0) {
                        gameOver();
                    }
                }
            }
        } else if (enemy.type === 'podoboo') {
            // Podoboo - jumping lava enemy
            enemy.animationTimer++;
            
            // Jumping cycle
            const jumpCycle = 120; // 2 seconds per jump
            const cyclePosition = enemy.animationTimer % jumpCycle;
            
            if (cyclePosition < 30) {
                // Rising from lava
                const riseProgress = cyclePosition / 30;
                enemy.y = enemy.lavaY - 20 - (riseProgress * 100);
                enemy.velocityY = -8;
            } else if (cyclePosition < 60) {
                // Peak and start falling
                enemy.velocityY += 0.5;
                enemy.y += enemy.velocityY;
            } else if (cyclePosition < 90) {
                // Falling back to lava
                enemy.velocityY += 0.8;
                enemy.y += enemy.velocityY;
            } else {
                // In lava, waiting for next jump
                enemy.y = enemy.lavaY - 20;
                enemy.velocityY = 0;
            }
            
            // Check collision with player
            if (checkCollision(player, enemy)) {
                lives--;
                resetPlayer();
                if (lives <= 0) {
                    gameOver();
                }
            }
        } else if (enemy.type === 'hammerbro') {
            // Hammer Bro - throws hammers at player
            enemy.animationTimer++;
            
            // Movement pattern - small jumps
            if (enemy.animationTimer % 120 === 0) {
                enemy.velocityY = -6;
            }
            
            // Apply gravity
            enemy.velocityY = (enemy.velocityY || 0) + gravity;
            enemy.y += enemy.velocityY;
            
            // Ground collision
            if (enemy.y > enemy.groundY) {
                enemy.y = enemy.groundY;
                enemy.velocityY = 0;
            }
            
            // Throw hammers less frequently
            if (enemy.animationTimer % 180 === 0) {
                // Only throw if player is in range
                const distance = Math.abs(player.x - enemy.x);
                if (distance < 250) { // Reduced range for better avoidance
                    // Create hammer projectile with avoidable arc
                    const hammerX = enemy.x + enemy.width / 2;
                    const hammerY = enemy.y;
                    
                    // Simpler, more predictable arc
                    const dx = player.x - hammerX;
                    const dy = player.y - hammerY;
                    
                    // Fixed arc pattern - higher arc, slower speed
                    const velocityX = (dx / distance) * 2.5; // Slower horizontal speed
                    const velocityY = -4; // Fixed upward velocity for predictable arc
                    
                    enemies.push({
                        x: hammerX,
                        y: hammerY,
                        width: 15,
                        height: 15,
                        velocityX: velocityX,
                        velocityY: velocityY,
                        type: 'hammer',
                        defeated: false,
                        color: '#8B4513',
                        animationTimer: 0,
                        ignorePlatformCollision: true
                    });
                }
            }
            
            // Check collision with player
            if (checkCollision(player, enemy)) {
                lives--;
                resetPlayer();
                if (lives <= 0) {
                    gameOver();
                }
            }
        } else if (enemy.type === 'hammer') {
            // Hammer projectile - ignores platform collision, only collides with player
            enemy.velocityY += 0.3; // Custom gravity for arc
            enemy.x += enemy.velocityX;
            enemy.y += enemy.velocityY;
            
            // Remove if off screen or hit ground
            if (enemy.y > 600 || enemy.x < -50 || enemy.x > 850) {
                enemy.defeated = true;
            }
            
            // Check collision with player only
            if (checkCollision(player, enemy)) {
                lives--;
                resetPlayer();
                if (lives <= 0) {
                    gameOver();
                }
                enemy.defeated = true;
            }
        } else if (enemy.type === 'greenparatroopa') {
            // Green Paratroopa - hops continuously like SMB1
            enemy.animationTimer++;
            
            // Continuous hopping pattern (every 30 frames like SMB1)
            if (enemy.animationTimer % 30 === 0) {
                enemy.velocityY = -5; // Consistent hop height
            }
            
            // Apply gravity
            enemy.velocityY = (enemy.velocityY || 0) + gravity;
            enemy.y += enemy.velocityY;
            
            // Horizontal movement (always moving)
            enemy.x += enemy.velocityX;
            
            // Bounce off edges
            if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                enemy.velocityX = -enemy.velocityX;
            }
            
            // Ground collision
            if (enemy.y > enemy.groundY) {
                enemy.y = enemy.groundY;
                enemy.velocityY = 0;
            }
            
            // Check collision with player
            if (checkCollision(player, enemy)) {
                if (player.velocityY > 0 && player.y < enemy.y) {
                    // Player jumped on enemy
                    enemy.defeated = true;
                    player.velocityY = -8;
                    score += 100;
                } else {
                    // Player hit by enemy
                    lives--;
                    resetPlayer();
                    if (lives <= 0) {
                        gameOver();
                    }
                }
            }
        } else if (enemy.type === 'redparatroopa') {
            // Red Paratroopa - flies horizontally like SMB1
            enemy.animationTimer++;
            
            // Horizontal flying pattern (no vertical movement)
            enemy.x += enemy.velocityX;
            
            // Bounce off edges
            if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                enemy.velocityX = -enemy.velocityX;
            }
            
            // Check collision with player
            if (checkCollision(player, enemy)) {
                if (player.velocityY > 0 && player.y < enemy.y) {
                    // Player jumped on enemy
                    enemy.defeated = true;
                    player.velocityY = -8;
                    score += 150;
                } else {
                    // Player hit by enemy
                    lives--;
                    resetPlayer();
                    if (lives <= 0) {
                        gameOver();
                    }
                }
            }
        } else if (enemy.type === 'bulletbill') {
            // Bullet Bill - flies straight horizontally
            enemy.x += enemy.velocityX;
            
            // Remove if off screen
            if (enemy.x < -50 || enemy.x > canvas.width + 50) {
                enemy.defeated = true;
            }
            
            // Check collision with player
            if (checkCollision(player, enemy)) {
                if (player.velocityY > 0 && player.y < enemy.y) {
                    // Player jumped on bullet bill
                    enemy.defeated = true;
                    player.velocityY = -8;
                    score += 200;
                } else {
                    // Player hit by bullet bill
                    lives--;
                    resetPlayer();
                    if (lives <= 0) {
                        gameOver();
                    }
                }
            }
        } else if (enemy.type === 'thwomp') {
            // Thwomp - drops from ceiling when player approaches
            enemy.animationTimer++;
            
            // Check if player is in range
            const distance = Math.abs(player.x - enemy.x);
            
            if (distance < 150 && !enemy.dropping) {
                // Start dropping
                enemy.dropping = true;
                enemy.velocityY = 8;
            }
            
            if (enemy.dropping) {
                enemy.y += enemy.velocityY;
                
                // Check if hit ground
                if (enemy.y >= enemy.groundY) {
                    enemy.y = enemy.groundY;
                    enemy.velocityY = 0;
                    enemy.dropping = false;
                    enemy.waitTimer = 60; // Wait 1 second before rising
                }
            }
            
            // Wait timer for rising back up
            if (enemy.waitTimer > 0) {
                enemy.waitTimer--;
                if (enemy.waitTimer === 0) {
                    enemy.velocityY = -3; // Rise back up
                }
            }
            
            // Rising back up
            if (enemy.velocityY < 0) {
                enemy.y += enemy.velocityY;
                if (enemy.y <= enemy.originalY) {
                    enemy.y = enemy.originalY;
                    enemy.velocityY = 0;
                }
            }
            
            // Check collision with player
            if (checkCollision(player, enemy)) {
                lives--;
                resetPlayer();
                if (lives <= 0) {
                    gameOver();
                }
            }
        } else {
            // Regular goomba enemies
            // Apply gravity to enemy
            enemy.velocityY = (enemy.velocityY || 0) + gravity;
            
            // Update horizontal position
            enemy.x += enemy.velocityX;
            
            // Update vertical position
            enemy.y += enemy.velocityY;
            
            // Handle platform collision
            if (enemy.platformIndex >= 0) {
                // Original level behavior - assigned to specific platform
                const platform = platforms[enemy.platformIndex];
                if (platform) {
                    // Check if enemy is on its platform
                    if (enemy.x + enemy.width > platform.x && enemy.x < platform.x + platform.width) {
                        // Land on platform
                        if (enemy.velocityY > 0 && enemy.y < platform.y) {
                            enemy.y = platform.y - enemy.height;
                            enemy.velocityY = 0;
                        }
                    } else {
                        // Enemy is at edge of platform, turn around
                        if (enemy.x <= platform.x || enemy.x + enemy.width >= platform.x + platform.width) {
                            enemy.velocityX *= -1;
                            enemy.x = enemy.velocityX > 0 ? platform.x : platform.x + platform.width - enemy.width;
                        }
                    }
                }
            } else {
                // Custom level behavior - walk on any platform
                let onPlatform = false;
                for (let platform of platforms) {
                    if (checkCollision(enemy, platform)) {
                        if (enemy.velocityY > 0 && enemy.y < platform.y) {
                            enemy.y = platform.y - enemy.height;
                            enemy.velocityY = 0;
                            onPlatform = true;
                        }
                    }
                }
                
                // Turn around at edges of platforms
                if (onPlatform) {
                    let currentPlatform = null;
                    for (let platform of platforms) {
                        if (checkCollision(enemy, platform)) {
                            currentPlatform = platform;
                            break;
                        }
                    }
                    if (currentPlatform) {
                        if (enemy.x <= currentPlatform.x || enemy.x + enemy.width >= currentPlatform.x + currentPlatform.width) {
                            enemy.velocityX *= -1;
                            enemy.x = enemy.velocityX > 0 ? currentPlatform.x : currentPlatform.x + currentPlatform.width - enemy.width;
                        }
                    }
                }
            }
            
            // Check collision with player
            if (checkCollision(player, enemy)) {
                // Player jumps on enemy
                if (player.velocityY > 0 && player.y < enemy.y) {
                    score += 100;
                    enemy.defeated = true; // Mark as defeated instead of moving off screen
                    player.velocityY = -8; // Bounce
                } else {
                    // Player takes damage
                    lives--;
                    resetPlayer();
                    if (lives <= 0) {
                        gameOver();
                    }
                }
            }
        }
    }
}

// Update coins
function updateCoins() {
    for (let coin of coins) {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            
            // Different coin values based on type
            if (coin.type === 'blue') {
                score += 100; // Blue coins worth more
            } else {
                score += 50; // Regular gold coins
            }
            
            coinCount++; // Increment coin counter
        }
    }
}

// Update springs
function updateSprings() {
    for (let spring of springs) {
        // Check if player is on the spring
        if (checkCollision(player, spring)) {
            if (player.velocityY > 0 && player.y < spring.y) {
                // Player landed on spring
                spring.compressed = true;
                spring.compressionTimer = 10;
                player.velocityY = -spring.power; // Launch player upward
                player.grounded = false;
            }
        }
        
        // Update compression animation
        if (spring.compressed) {
            spring.compressionTimer--;
            if (spring.compressionTimer <= 0) {
                spring.compressed = false;
            }
        }
    }
}

// Update conveyor belts
function updateConveyorBelts() {
    for (let belt of conveyorBelts) {
        // Check if player is on the conveyor belt
        if (checkCollision(player, belt) && player.grounded) {
            // Push player in conveyor direction
            player.x += belt.speed;
        }
    }
}

// Update lava pools
function updateLavaPools() {
    for (let lava of lavaPools) {
        // Update bubble animation
        lava.bubbleTimer++;
        
        // Check collision with player - instant death
        if (checkCollision(player, lava)) {
            lives--;
            resetPlayer();
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

// Update fire bars
function updateFireBars() {
    for (let fireBar of fireBars) {
        // Rotate fire bar
        fireBar.rotation += fireBar.rotationSpeed;
        
        // Calculate fire ball positions based on rotation
        const centerX = fireBar.x + fireBar.width / 2;
        const centerY = fireBar.y + fireBar.height / 2;
        
        // Update fire ball positions
        fireBar.fireBalls = [];
        for (let i = 0; i < fireBar.ballCount; i++) {
            const angle = fireBar.rotation + (i * (Math.PI * 2 / fireBar.ballCount));
            const ballX = centerX + Math.cos(angle) * fireBar.radius;
            const ballY = centerY + Math.sin(angle) * fireBar.radius;
            fireBar.fireBalls.push({ x: ballX, y: ballY, radius: 8 });
        }
        
        // Check collision with player
        for (let ball of fireBar.fireBalls) {
            const ballRect = { x: ball.x - ball.radius, y: ball.y - ball.radius, width: ball.radius * 2, height: ball.radius * 2 };
            if (checkCollision(player, ballRect)) {
                lives--;
                resetPlayer();
                if (lives <= 0) {
                    gameOver();
                }
                break;
            }
        }
    }
}

// Update falling platforms
function updateFallingPlatforms() {
    for (let platform of fallingPlatforms) {
        if (platform.falling) {
            platform.fallTimer++;
            if (platform.fallTimer >= platform.fallDelay) {
                platform.y += platform.fallSpeed;
                
                // Check if player is still on it
                if (player.onFallingPlatform && checkCollision(player, platform)) {
                    player.y = platform.y - player.height;
                    player.grounded = true;
                } else {
                    player.onFallingPlatform = false;
                }
                
                // Remove platform if it falls off screen
                if (platform.y > canvas.height) {
                    const index = fallingPlatforms.indexOf(platform);
                    if (index > -1) {
                        fallingPlatforms.splice(index, 1);
                    }
                    player.onFallingPlatform = false;
                }
            }
        }
        
        // Check if player is on the platform
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0 && player.y < platform.y) {
                // Player landed on platform
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
                player.isJumping = false;
                
                if (!platform.falling) {
                    platform.falling = true;
                    platform.fallTimer = 0; // Start falling timer
                    player.onFallingPlatform = true;
                }
            }
        }
        
        // Reset player state if they jump off
        if (player.onFallingPlatform && !checkCollision(player, platform)) {
            player.onFallingPlatform = false;
        }
    }
}

// Update mobile platforms
function updateMobilePlatforms() {
    for (let platform of mobilePlatforms) {
        // Move platform
        platform.x += platform.velocityX;
        platform.y += platform.velocityY;
        
        // Reverse direction at boundaries
        if (platform.x <= platform.minX || platform.x + platform.width >= platform.maxX) {
            platform.velocityX *= -1;
        }
    }
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Apply camera transform
    ctx.translate(-camera.x, 0);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(camera.x, 0, canvas.width, canvas.height);
    
    // Draw clouds
    drawCloud(100 + camera.x * 0.3, 50, 40);
    drawCloud(300 + camera.x * 0.3, 80, 30);
    drawCloud(500 + camera.x * 0.3, 40, 50);
    drawCloud(700 + camera.x * 0.3, 70, 35);
    drawCloud(900 + camera.x * 0.3, 60, 45);
    drawCloud(1100 + camera.x * 0.3, 90, 35);
    drawCloud(1300 + camera.x * 0.3, 40, 40);
    drawCloud(1500 + camera.x * 0.3, 70, 30);
    drawCloud(1700 + camera.x * 0.3, 50, 45);
    drawCloud(1900 + camera.x * 0.3, 80, 35);
    drawCloud(2100 + camera.x * 0.3, 60, 40);
    
    // Draw platforms
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add some texture to platforms
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // Draw breakable blocks
    for (let block of breakableBlocks) {
        if (!block.broken) {
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Add brick pattern
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            ctx.strokeRect(block.x, block.y, block.width, block.height);
            
            // Draw bricks pattern
            ctx.beginPath();
            ctx.moveTo(block.x + 15, block.y);
            ctx.lineTo(block.x + 15, block.y + block.height);
            ctx.moveTo(block.x, block.y + 15);
            ctx.lineTo(block.x + block.width, block.y + 15);
            ctx.stroke();
            
            // Show coin indicator if block has coins
            if (block.coins > 0) {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(block.x + block.width/2, block.y + block.height/2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Draw interrogation blocks
    for (let block of interrogationBlocks) {
        if (!block.used) {
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Add question mark pattern
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Draw question mark
            ctx.arc(block.x + 15, block.y + 10, 3, 0, Math.PI * 2);
            ctx.moveTo(block.x + 15, block.y + 13);
            ctx.lineTo(block.x + 15, block.y + 18);
            ctx.moveTo(block.x + 12, block.y + 18);
            ctx.lineTo(block.x + 18, block.y + 18);
            ctx.stroke();
        }
    }
    
    // Draw pipes
    for (let pipe of pipes) {
        // Pipe body
        ctx.fillStyle = pipe.color;
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        
        if (pipe.type === 'vertical') {
            // Vertical pipes coming from earth
            // Pipe top rim (wider)
            ctx.fillStyle = '#006400';
            ctx.fillRect(pipe.x - 5, pipe.y, pipe.width + 10, 15);
            
            // Pipe bottom connection to earth (extends below ground)
            ctx.fillStyle = '#8B4513'; // Earth color
            ctx.fillRect(pipe.x + 10, pipe.y + pipe.height, pipe.width - 20, 100);
            
            // Pipe highlight
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(pipe.x + 8, pipe.y + 15, 6, pipe.height - 15);
            
            // Pipe shadow/depth
            ctx.fillStyle = '#004000';
            ctx.fillRect(pipe.x + pipe.width - 8, pipe.y + 15, 6, pipe.height - 15);
        } else if (pipe.type === 'horizontal') {
            // Horizontal pipes
            // Pipe ends (rounded effect)
            ctx.fillStyle = '#006400';
            ctx.fillRect(pipe.x - 10, pipe.y + 10, 15, pipe.height - 20);
            ctx.fillRect(pipe.x + pipe.width - 5, pipe.y + 10, 15, pipe.height - 20);
            
            // Pipe highlight
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(pipe.x + 10, pipe.y + 8, pipe.width - 20, 8);
            
            // Pipe shadow/depth
            ctx.fillStyle = '#004000';
            ctx.fillRect(pipe.x + 10, pipe.y + pipe.height - 16, pipe.width - 20, 8);
        }
    }
    
    // Draw mobile platforms
    for (let platform of mobilePlatforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add platform texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add arrows to show movement direction
        ctx.fillStyle = '#FFFFFF';
        if (platform.velocityX > 0) {
            // Right arrow
            ctx.beginPath();
            ctx.moveTo(platform.x + platform.width - 10, platform.y + platform.height/2);
            ctx.lineTo(platform.x + platform.width - 5, platform.y + platform.height/2 - 3);
            ctx.lineTo(platform.x + platform.width - 5, platform.y + platform.height/2 + 3);
            ctx.closePath();
            ctx.fill();
        } else {
            // Left arrow
            ctx.beginPath();
            ctx.moveTo(platform.x + 10, platform.y + platform.height/2);
            ctx.lineTo(platform.x + 5, platform.y + platform.height/2 - 3);
            ctx.lineTo(platform.x + 5, platform.y + platform.height/2 + 3);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // Draw coins
    for (let coin of coins) {
        if (!coin.collected) {
            // Set color based on coin type
            if (coin.type === 'blue') {
                ctx.fillStyle = '#1E88E5'; // Blue color
            } else {
                ctx.fillStyle = coin.color || '#FFD700'; // Default gold
            }
            
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add shine effect
            if (coin.type === 'blue') {
                ctx.fillStyle = '#64B5F6'; // Light blue shine
            } else {
                ctx.fillStyle = '#FFF700'; // Gold shine
            }
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2 - 2, coin.y + coin.height/2 - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Add coin symbol for blue coins
            if (coin.type === 'blue') {
                ctx.fillStyle = '#0D47A1';
                ctx.font = '8px Arial';
                ctx.fillText('B', coin.x + coin.width/2 - 3, coin.y + coin.height/2 + 2);
            }
        }
    }
    
    // Draw falling platforms
    for (let platform of fallingPlatforms) {
        // Platform color changes when about to fall
        if (platform.falling && platform.fallTimer > 0 && platform.fallTimer <= 30) {
            ctx.fillStyle = '#FF6B6B'; // Red warning color
        } else if (platform.falling && platform.fallTimer <= 0) {
            ctx.fillStyle = '#8B4513'; // Brown when falling
        } else {
            ctx.fillStyle = platform.color;
        }
        
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add warning cracks when about to fall
        if (platform.falling && platform.fallTimer > 0 && platform.fallTimer <= 30) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(platform.x + 10, platform.y + 5);
            ctx.lineTo(platform.x + 15, platform.y + 10);
            ctx.lineTo(platform.x + 8, platform.y + 15);
            ctx.stroke();
        }
    }
    
    // Draw lava pools
    for (let lava of lavaPools) {
        // Main lava pool
        const gradient = ctx.createLinearGradient(lava.x, lava.y, lava.x, lava.y + lava.height);
        gradient.addColorStop(0, '#FF4500');
        gradient.addColorStop(0.5, '#FF6347');
        gradient.addColorStop(1, '#8B0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(lava.x, lava.y, lava.width, lava.height);
        
        // Animated bubbles
        if (lava.bubbleTimer % 20 < 10) {
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(lava.x + 20 + (lava.bubbleTimer % 60), lava.y + 10, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        if (lava.bubbleTimer % 30 < 15) {
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.arc(lava.x + 40 + (lava.bubbleTimer % 45), lava.y + 15, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        if (lava.bubbleTimer % 40 < 20) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(lava.x + 60 + (lava.bubbleTimer % 50), lava.y + 8, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Lava glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF4500';
        ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
        ctx.fillRect(lava.x - 5, lava.y - 5, lava.width + 10, lava.height + 10);
        ctx.shadowBlur = 0;
    }
    
    // Draw fire bars
    for (let fireBar of fireBars) {
        // Draw center post
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(fireBar.x + fireBar.width/2 - 3, fireBar.y + fireBar.height/2 - 20, 6, 40);
        
        // Draw rotating fire balls
        if (fireBar.fireBalls) {
            for (let ball of fireBar.fireBalls) {
                // Fire ball gradient
                const ballGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
                ballGradient.addColorStop(0, '#FFFF00');
                ballGradient.addColorStop(0.3, '#FFA500');
                ballGradient.addColorStop(0.7, '#FF4500');
                ballGradient.addColorStop(1, '#8B0000');
                
                ctx.fillStyle = ballGradient;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Fire glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#FF4500';
                ctx.fillStyle = 'rgba(255, 69, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
    
    // Draw springs
    for (let spring of springs) {
        // Spring base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(spring.x, spring.y + spring.height - 5, spring.width, 5);
        
        // Spring coils
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        const coilCount = 4;
        const coilHeight = (spring.height - 5) / coilCount;
        
        for (let i = 0; i < coilCount; i++) {
            const y = spring.y + (i * coilHeight);
            const compression = spring.compressed ? 2 : 0;
            
            ctx.beginPath();
            ctx.moveTo(spring.x + 2, y + compression);
            ctx.lineTo(spring.x + spring.width - 2, y + compression);
            ctx.stroke();
        }
        
        // Spring top plate
        ctx.fillStyle = '#A0522D';
        const topY = spring.compressed ? spring.y + 5 : spring.y;
        ctx.fillRect(spring.x, topY, spring.width, 3);
        
        // Power indicator glow
        if (spring.compressed) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00FF00';
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(spring.x - 2, spring.y - 2, spring.width + 4, spring.height + 4);
            ctx.shadowBlur = 0;
        }
    }
    
    // Draw conveyor belts
    for (let belt of conveyorBelts) {
        // Main belt surface
        ctx.fillStyle = '#404040';
        ctx.fillRect(belt.x, belt.y, belt.width, belt.height);
        
        // Belt texture (moving lines)
        ctx.strokeStyle = '#606060';
        ctx.lineWidth = 2;
        const animationOffset = (Date.now() / 50 * belt.speed) % 20;
        
        for (let i = -20; i < belt.width + 20; i += 20) {
            const x = belt.x + i + animationOffset;
            ctx.beginPath();
            ctx.moveTo(x, belt.y);
            ctx.lineTo(x, belt.y + belt.height);
            ctx.stroke();
        }
        
        // Direction indicator arrows
        ctx.fillStyle = '#FF0000';
        const arrowSize = 8;
        const arrowSpacing = 40;
        const arrowOffset = (Date.now() / 30 * belt.speed) % arrowSpacing;
        
        for (let i = 0; i < belt.width; i += arrowSpacing) {
            const x = belt.x + i + arrowOffset;
            const y = belt.y + belt.height / 2;
            
            if (belt.speed > 0) {
                // Right arrow
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - arrowSize, y - arrowSize / 2);
                ctx.lineTo(x - arrowSize, y + arrowSize / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                // Left arrow
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + arrowSize, y - arrowSize / 2);
                ctx.lineTo(x + arrowSize, y + arrowSize / 2);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    
    // Draw flagpole
    if (flagpole) {
        // Pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(flagpole.x, flagpole.y, flagpole.width, flagpole.height);
        
        // Flag
        ctx.fillStyle = flagpole.color;
        ctx.beginPath();
        ctx.moveTo(flagpole.x + flagpole.width, flagpole.y);
        ctx.lineTo(flagpole.x + flagpole.width + 40, flagpole.y + 20);
        ctx.lineTo(flagpole.x + flagpole.width, flagpole.y + 40);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw enemies
    for (let enemy of enemies) {
        if (!enemy.defeated) { // Only draw if not defeated
            if (enemy.type === 'koopa') {
                if (!enemy.shellMode) {
                    // Draw normal koopa
                    ctx.fillStyle = enemy.color;
                    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    
                    // Draw shell pattern
                    ctx.strokeStyle = '#006400';
                    ctx.lineWidth = 1;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.arc(enemy.x + 8 + i * 5, enemy.y + 15, 2, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    
                    // Draw head
                    ctx.fillStyle = '#006400';
                    ctx.fillRect(enemy.x + 2, enemy.y - 5, enemy.width - 4, 8);
                    
                    // Draw eyes
                    ctx.fillStyle = 'white';
                    ctx.fillRect(enemy.x + 6, enemy.y - 2, 3, 3);
                    ctx.fillRect(enemy.x + 16, enemy.y - 2, 3, 3);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(enemy.x + 7, enemy.y - 1, 1, 1);
                    ctx.fillRect(enemy.x + 17, enemy.y - 1, 1, 1);
                } else {
                    // Draw shell mode
                    ctx.fillStyle = enemy.color;
                    ctx.fillRect(enemy.x, enemy.y + 5, enemy.width, enemy.height - 5);
                    
                    // Draw shell pattern
                    ctx.strokeStyle = '#006400';
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.arc(enemy.x + 8 + i * 5, enemy.y + 15, 3, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    
                    // Draw shell rim
                    ctx.strokeStyle = '#004000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(enemy.x, enemy.y + 5, enemy.width, enemy.height - 5);
                }
            } else if (enemy.type === 'spiny') {
                // Draw spiny enemy (spiky ball)
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw spikes
                ctx.fillStyle = '#FF0000';
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2) / 8;
                    const spikeX = enemy.x + enemy.width/2 + Math.cos(angle) * (enemy.width/2 + 3);
                    const spikeY = enemy.y + enemy.height/2 + Math.sin(angle) * (enemy.height/2 + 3);
                    ctx.beginPath();
                    ctx.arc(spikeX, spikeY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw angry eyes
                ctx.fillStyle = 'white';
                ctx.fillRect(enemy.x + 5, enemy.y + 5, 4, 4);
                ctx.fillRect(enemy.x + 11, enemy.y + 5, 4, 4);
                ctx.fillStyle = 'red';
                ctx.fillRect(enemy.x + 6, enemy.y + 6, 2, 2);
                ctx.fillRect(enemy.x + 12, enemy.y + 6, 2, 2);
            } else {
                // Draw regular goomba enemy
                ctx.fillStyle = enemy.color;
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Draw eyes
                ctx.fillStyle = 'white';
                ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
                ctx.fillRect(enemy.x + 15, enemy.y + 5, 5, 5);
                ctx.fillStyle = 'black';
                ctx.fillRect(enemy.x + 6, enemy.y + 6, 3, 3);
                ctx.fillRect(enemy.x + 16, enemy.y + 6, 3, 3);
                
                // Draw angry eyebrows
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(enemy.x + 5, enemy.y + 4);
                ctx.lineTo(enemy.x + 10, enemy.y + 2);
                ctx.moveTo(enemy.x + 15, enemy.y + 2);
                ctx.lineTo(enemy.x + 20, enemy.y + 4);
                ctx.stroke();
            }
        } else if (enemy.type === 'piranha') {
            // Draw piranha plant - ultra realistic plant appearance
            if (enemy.emerging) {
                // Main stem (thicker, more natural)
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(enemy.x + 7, enemy.y + 25, 6, enemy.height - 25);
                
                // Stem gradient effect
                ctx.fillStyle = '#1B5E20';
                ctx.fillRect(enemy.x + 8, enemy.y + 25, 2, enemy.height - 25);
                
                // Multiple leaves on stem at different heights
                ctx.fillStyle = '#4CAF50';
                // Lower leaves
                ctx.fillRect(enemy.x + 2, enemy.y + 35, 8, 4);
                ctx.fillRect(enemy.x + 10, enemy.y + 38, 8, 4);
                // Middle leaves
                ctx.fillRect(enemy.x + 1, enemy.y + 28, 6, 3);
                ctx.fillRect(enemy.x + 13, enemy.y + 31, 6, 3);
                // Upper leaves
                ctx.fillRect(enemy.x + 3, enemy.y + 20, 5, 3);
                ctx.fillRect(enemy.x + 12, enemy.y + 23, 5, 3);
                
                // Plant head (more natural red with gradient)
                const gradient = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + 30);
                gradient.addColorStop(0, '#FF5252');
                gradient.addColorStop(1, '#D32F2F');
                ctx.fillStyle = gradient;
                
                // Rounded head shape
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width/2, enemy.y + 15, enemy.width/2 - 2, 18, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // White spots (natural pattern)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(enemy.x + 6, enemy.y + 12, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(enemy.x + 14, enemy.y + 15, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(enemy.x + 8, enemy.y + 20, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(enemy.x + 12, enemy.y + 22, 1.8, 0, Math.PI * 2);
                ctx.fill();
                
                // Mouth (more natural opening)
                ctx.fillStyle = '#B71C1C';
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width/2, enemy.y + 18, enemy.width/2 - 4, 4, 0, 0, Math.PI);
                ctx.fill();
                
                // Teeth (more realistic)
                ctx.fillStyle = 'white';
                // Top teeth row
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(enemy.x + 3 + i * 3.5, enemy.y + 16, 2, 2.5);
                }
                // Bottom teeth row
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(enemy.x + 4.5 + i * 3.5, enemy.y + 20, 2, 2);
                }
                
                // Eyes (more plant-like with pupils)
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(enemy.x + 7, enemy.y + 8, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(enemy.x + 13, enemy.y + 8, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Pupils (follow player direction)
                ctx.fillStyle = '#D32F2F';
                const pupilOffsetX = player.x > enemy.x ? 1 : -1;
                ctx.beginPath();
                ctx.arc(enemy.x + 7 + pupilOffsetX, enemy.y + 8, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(enemy.x + 13 + pupilOffsetX, enemy.y + 8, 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Additional decorative leaves around head
                ctx.fillStyle = '#66BB6A';
                // Left side leaves
                ctx.beginPath();
                ctx.ellipse(enemy.x - 1, enemy.y + 10, 3, 6, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(enemy.x - 2, enemy.y + 18, 2, 4, -0.2, 0, Math.PI * 2);
                ctx.fill();
                // Right side leaves
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width - 1, enemy.y + 12, 3, 6, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width, enemy.y + 20, 2, 4, 0.2, 0, Math.PI * 2);
                ctx.fill();
                
                // Top crown leaves
                ctx.fillStyle = '#81C784';
                ctx.beginPath();
                ctx.ellipse(enemy.x + 5, enemy.y + 3, 2, 4, -0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(enemy.x + 10, enemy.y + 2, 2, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(enemy.x + 15, enemy.y + 3, 2, 4, 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (enemy.type === 'podoboo') {
            // Draw podoboo - jumping lava enemy
            // Main body (lava rock)
            const bodyGradient = ctx.createRadialGradient(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 0, enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2);
            bodyGradient.addColorStop(0, '#FF6347');
            bodyGradient.addColorStop(0.5, '#FF4500');
            bodyGradient.addColorStop(1, '#8B0000');
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, enemy.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes (angry glowing eyes)
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(enemy.x + 6, enemy.y + 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + 14, enemy.y + 8, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(enemy.x + 6, enemy.y + 8, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + 14, enemy.y + 8, 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Sharp teeth
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(enemy.x + 5, enemy.y + 12);
            ctx.lineTo(enemy.x + 7, enemy.y + 15);
            ctx.lineTo(enemy.x + 9, enemy.y + 12);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(enemy.x + 11, enemy.y + 12);
            ctx.lineTo(enemy.x + 13, enemy.y + 15);
            ctx.lineTo(enemy.x + 15, enemy.y + 12);
            ctx.fill();
            
            // Fire trail when jumping
            if (enemy.velocityY < 0) {
                ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height + 5, enemy.width/3, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Lava glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FF4500';
            ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2 + 2, enemy.height/2 + 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (enemy.type === 'hammerbro') {
            // Draw hammer bros
            // Shell
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(enemy.x, enemy.y + 10, enemy.width, enemy.height - 10);
            
            // Shell pattern
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(enemy.x + 5 + i * 5, enemy.y + 15, 2, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Head
            ctx.fillStyle = '#FDBCB4';
            ctx.fillRect(enemy.x + 2, enemy.y, enemy.width - 4, 12);
            
            // Helmet
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(enemy.x, enemy.y - 2, enemy.width, 8);
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(enemy.x + 5, enemy.y + 5, 2, 0, Math.PI * 2);
            ctx.arc(enemy.x + 15, enemy.y + 5, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(enemy.x + 5, enemy.y + 5, 1, 0, Math.PI * 2);
            ctx.arc(enemy.x + 15, enemy.y + 5, 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Hammer in hand
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(enemy.x + enemy.width, enemy.y + 8, 8, 3);
            ctx.fillStyle = '#696969';
            ctx.fillRect(enemy.x + enemy.width + 6, enemy.y + 6, 4, 6);
        } else if (enemy.type === 'hammer') {
            // Draw hammer projectile
            // Handle
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(enemy.x, enemy.y + 6, 8, 3);
            
            // Head
            ctx.fillStyle = '#696969';
            ctx.fillRect(enemy.x + 6, enemy.y + 4, 6, 7);
            
            // Rotation effect
            ctx.save();
            ctx.translate(enemy.x + 9, enemy.y + 7.5);
            ctx.rotate((enemy.animationTimer || 0) * 0.3);
            ctx.fillStyle = '#696969';
            ctx.fillRect(-3, -3.5, 6, 7);
            ctx.restore();
        } else if (enemy.type === 'greenparatroopa') {
            // Draw green paratroopa - SMB1 style
            // Koopa shell (green)
            ctx.fillStyle = '#00AA00';
            ctx.fillRect(enemy.x, enemy.y + 8, enemy.width, enemy.height - 8);
            
            // Shell details
            ctx.strokeStyle = '#008800';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(enemy.x + 2, enemy.y + 12);
            ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 12);
            ctx.moveTo(enemy.x + 2, enemy.y + 16);
            ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 16);
            ctx.moveTo(enemy.x + 2, enemy.y + 20);
            ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 20);
            ctx.stroke();
            
            // Head
            ctx.fillStyle = '#00CC00';
            ctx.fillRect(enemy.x + 2, enemy.y + 2, enemy.width - 4, 6);
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 4, enemy.y + 3, 3, 3);
            ctx.fillRect(enemy.x + 13, enemy.y + 3, 3, 3);
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 5, enemy.y + 4, 1, 1);
            ctx.fillRect(enemy.x + 14, enemy.y + 4, 1, 1);
            
            // Wings (simple SMB1 style)
            const wingFlap = Math.sin(enemy.animationTimer * 0.3) * 1;
            ctx.fillStyle = '#FFFFFF';
            // Left wing
            ctx.fillRect(enemy.x - 4, enemy.y + 6 + wingFlap, 4, 6);
            // Right wing
            ctx.fillRect(enemy.x + enemy.width, enemy.y + 6 - wingFlap, 4, 6);
            
            // Wing details
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 1;
            ctx.strokeRect(enemy.x - 4, enemy.y + 6 + wingFlap, 4, 6);
            ctx.strokeRect(enemy.x + enemy.width, enemy.y + 6 - wingFlap, 4, 6);
        } else if (enemy.type === 'redparatroopa') {
            // Draw red paratroopa - SMB1 style
            // Koopa shell (red)
            ctx.fillStyle = '#CC0000';
            ctx.fillRect(enemy.x, enemy.y + 8, enemy.width, enemy.height - 8);
            
            // Shell details
            ctx.strokeStyle = '#AA0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(enemy.x + 2, enemy.y + 12);
            ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 12);
            ctx.moveTo(enemy.x + 2, enemy.y + 16);
            ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 16);
            ctx.moveTo(enemy.x + 2, enemy.y + 20);
            ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 20);
            ctx.stroke();
            
            // Head
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(enemy.x + 2, enemy.y + 2, enemy.width - 4, 6);
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 4, enemy.y + 3, 3, 3);
            ctx.fillRect(enemy.x + 13, enemy.y + 3, 3, 3);
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 5, enemy.y + 4, 1, 1);
            ctx.fillRect(enemy.x + 14, enemy.y + 4, 1, 1);
            
            // Wings (simple SMB1 style)
            const wingFlap = Math.sin(enemy.animationTimer * 0.3) * 1;
            ctx.fillStyle = '#FFFFFF';
            // Left wing
            ctx.fillRect(enemy.x - 4, enemy.y + 6 + wingFlap, 4, 6);
            // Right wing
            ctx.fillRect(enemy.x + enemy.width, enemy.y + 6 - wingFlap, 4, 6);
            
            // Wing details
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 1;
            ctx.strokeRect(enemy.x - 4, enemy.y + 6 + wingFlap, 4, 6);
            ctx.strokeRect(enemy.x + enemy.width, enemy.y + 6 - wingFlap, 4, 6);
        } else if (enemy.type === 'bulletbill') {
            // Draw Bullet Bill - SMB1 style
            // Main body (black)
            ctx.fillStyle = '#000000';
            ctx.fillRect(enemy.x, enemy.y + 5, enemy.width, enemy.height - 5);
            
            // Head (larger black circle)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2, enemy.y + 5, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes (white)
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2 - 3, enemy.y + 3, 2, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.width / 2 + 3, enemy.y + 3, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils (black)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2 - 3, enemy.y + 3, 1, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.width / 2 + 3, enemy.y + 3, 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Teeth (white)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(enemy.x + enemy.width / 2 - 2, enemy.y + 8, 1, 2);
            ctx.fillRect(enemy.x + enemy.width / 2, enemy.y + 8, 1, 2);
            ctx.fillRect(enemy.x + enemy.width / 2 + 2, enemy.y + 8, 1, 2);
        } else if (enemy.type === 'thwomp') {
            // Draw Thwomp - SMB1 style
            // Main body (gray)
            ctx.fillStyle = '#808080';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Face area (lighter gray)
            ctx.fillStyle = '#A0A0A0';
            ctx.fillRect(enemy.x + 3, enemy.y + 8, enemy.width - 6, enemy.height - 12);
            
            // Angry eyebrows
            ctx.fillStyle = '#606060';
            ctx.fillRect(enemy.x + 2, enemy.y + 10, 6, 3);
            ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + 10, 6, 3);
            
            // Eyes (red when dropping, white otherwise)
            if (enemy.dropping) {
                ctx.fillStyle = '#FF0000';
            } else {
                ctx.fillStyle = '#FFFFFF';
            }
            ctx.fillRect(enemy.x + 5, enemy.y + 14, 3, 3);
            ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + 14, 3, 3);
            
            // Pupils
            ctx.fillStyle = '#000000';
            ctx.fillRect(enemy.x + 6, enemy.y + 15, 1, 1);
            ctx.fillRect(enemy.x + enemy.width - 7, enemy.y + 15, 1, 1);
            
            // Angry mouth
            ctx.fillStyle = '#404040';
            ctx.fillRect(enemy.x + 5, enemy.y + 20, enemy.width - 10, 2);
            
            // Teeth
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(enemy.x + 6, enemy.y + 22, 2, 2);
            ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + 22, 2, 2);
        }
    }
    
    // Draw player (animated human-like character)
    // Body - change color based on power-up state
    if (player.hasFireFlower) {
        ctx.fillStyle = '#FF4500'; // Orange-red for fire flower power
    } else {
        ctx.fillStyle = '#4169E1'; // Blue shirt
    }
    ctx.fillRect(player.x + 5, player.y + 15, 20, 15);
    
    // Head
    ctx.fillStyle = '#FDBCB4'; // Skin color
    ctx.fillRect(player.x + 8, player.y + 5, 14, 12);
    
    // Add power-up indicator
    if (player.hasFireFlower) {
        // Draw fire flower indicator
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(player.x + 12, player.y - 5, 6, 4);
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(player.x + 13, player.y - 3, 4, 2);
    }
    
    // Legs (animated when walking/running)
    ctx.fillStyle = '#2F4F4F'; // Dark pants
    if (player.isWalking && player.grounded) {
        // Walking/running animation for legs
        if (player.isRunning) {
            // Running animation - more exaggerated movement
            if (player.animationFrame === 0) {
                ctx.fillRect(player.x + 6, player.y + 30, 6, 12);
                ctx.fillRect(player.x + 18, player.y + 28, 6, 8);
            } else {
                ctx.fillRect(player.x + 6, player.y + 28, 6, 8);
                ctx.fillRect(player.x + 18, player.y + 30, 6, 12);
            }
        } else {
            // Walking animation
            if (player.animationFrame === 0) {
                ctx.fillRect(player.x + 8, player.y + 30, 6, 10);
                ctx.fillRect(player.x + 16, player.y + 32, 6, 8);
            } else {
                ctx.fillRect(player.x + 8, player.y + 32, 6, 8);
                ctx.fillRect(player.x + 16, player.y + 30, 6, 10);
            }
        }
    } else {
        // Standing legs
        ctx.fillRect(player.x + 8, player.y + 30, 6, 10);
        ctx.fillRect(player.x + 16, player.y + 30, 6, 10);
    }
    
    // Arms (animated when walking/running)
    ctx.fillStyle = '#FDBCB4'; // Skin color
    if (player.isWalking && player.grounded) {
        // Walking/running animation for arms
        if (player.isRunning) {
            // Running animation - more exaggerated movement
            if (player.animationFrame === 0) {
                ctx.fillRect(player.x + 2, player.y + 16, 4, 7);
                ctx.fillRect(player.x + 24, player.y + 14, 4, 9);
            } else {
                ctx.fillRect(player.x + 2, player.y + 14, 4, 9);
                ctx.fillRect(player.x + 24, player.y + 16, 4, 7);
            }
        } else {
            // Walking animation
            if (player.animationFrame === 0) {
                ctx.fillRect(player.x + 3, player.y + 17, 4, 6);
                ctx.fillRect(player.x + 23, player.y + 15, 4, 8);
            } else {
                ctx.fillRect(player.x + 3, player.y + 15, 4, 8);
                ctx.fillRect(player.x + 23, player.y + 17, 4, 6);
            }
        }
    } else {
        // Standing arms
        ctx.fillRect(player.x + 3, player.y + 15, 4, 8);
        ctx.fillRect(player.x + 23, player.y + 15, 4, 8);
    }
    
    // Eyes (change when jumping)
    ctx.fillStyle = 'black';
    if (player.isJumping) {
        // Excited eyes when jumping
        ctx.fillRect(player.x + 9, player.y + 7, 4, 4);
        ctx.fillRect(player.x + 17, player.y + 7, 4, 4);
    } else {
        // Normal eyes
        ctx.fillRect(player.x + 10, player.y + 8, 2, 2);
        ctx.fillRect(player.x + 18, player.y + 8, 2, 2);
    }
    
    // Hair
    ctx.fillStyle = '#8B4513'; // Brown hair
    ctx.fillRect(player.x + 8, player.y + 3, 14, 3);
    
    // Smile (changes when jumping)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (player.isJumping) {
        // Bigger smile when jumping
        ctx.arc(player.x + 15, player.y + 12, 5, 0, Math.PI);
    } else {
        // Normal smile
        ctx.arc(player.x + 15, player.y + 12, 3, 0, Math.PI);
    }
    ctx.stroke();
    
    // Restore context state
    ctx.restore();
}

// Draw cloud
function drawCloud(x, y, size) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size, y, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x - size * 0.7, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Don't run game loop if in editor mode
    if (isEditorMode) return;
    
    // Skip updates if paused
    if (!isPaused) {
        handleInput();
        updatePlayer();
        updateEnemies();
        updateCoins();
        updateLavaPools();
        updateFireBars();
        updateFallingPlatforms();
        updateMobilePlatforms();
        updateSprings();
        updateConveyorBelts();
        updateCamera();
    }
    
    draw();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('gameOverText').textContent = 'Game Over! Score: ' + score;
}

// Level complete
function levelComplete() {
    gameRunning = false;
    score += 500;
    
    // Mark level as completed
    if (!completedLevels.includes(level)) {
        completedLevels.push(level);
        saveProgress(); // Save progress to localStorage
    }
    
    showPopup('Level Complete!', 'Level ' + level + ' Complete! Score: ' + score);
    showWorldMap();
}

// UI Functions
function showLevelSelector() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelSelector').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('worldMap').style.display = 'none';
    updateWorldMapUI();
    gameRunning = false;
}

function showStartScreen() {
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('worldMap').style.display = 'none';
    gameRunning = false;
}

function showWorldMap() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('worldMap').style.display = 'block';
    updateWorldMapUI();
    gameRunning = false;
}

function updateWorldMapUI() {
    for (let i = 1; i <= 15; i++) {
        const levelButton = document.getElementById('worldLevel' + i);
        if (completedLevels.includes(i)) {
            levelButton.classList.add('completed');
            levelButton.classList.remove('locked');
        } else if (i === 1 || completedLevels.includes(i - 1)) {
            levelButton.classList.remove('completed', 'locked');
        } else {
            levelButton.classList.add('locked');
            levelButton.classList.remove('completed');
        }
    }
}

function unlockAllLevels() {
    // Unlock all levels
    for (let i = 1; i <= 15; i++) {
        if (!completedLevels.includes(i)) {
            completedLevels.push(i);
        }
    }
    saveProgress(); // Save progress to localStorage
    updateWorldMapUI();
    showPopup('All Levels Unlocked!', 'All levels have been unlocked. Enjoy!');
}

// Custom popup functions
function showPopup(title, message) {
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupMessage').textContent = message;
    document.getElementById('customPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById('customPopup').style.display = 'none';
}

// Progress saving functions
function saveProgress() {
    localStorage.setItem('brawl2d_completedLevels', JSON.stringify(completedLevels));
}

function loadProgress() {
    const saved = localStorage.getItem('brawl2d_completedLevels');
    if (saved) {
        completedLevels = JSON.parse(saved);
    }
}

// Pause system
function togglePause() {
    isPaused = !isPaused;
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) {
        pauseOverlay.style.display = isPaused ? 'block' : 'none';
    }
}

// Responsive canvas
function makeCanvasResponsive() {
    const container = canvas.parentElement;
    const maxWidth = 800;
    const maxHeight = 600;
    const aspectRatio = maxWidth / maxHeight;
    
    function resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate scale to fit window while maintaining aspect ratio
        let scale = Math.min(windowWidth / maxWidth, windowHeight / maxHeight);
        scale = Math.min(scale, 1); // Don't scale up beyond original size
        
        canvas.style.width = (maxWidth * scale) + 'px';
        canvas.style.height = (maxHeight * scale) + 'px';
    }
    
    resize();
    window.addEventListener('resize', resize);
}

// Level Editor Functions
function openLevelEditor() {
    isEditorMode = true;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('worldMap').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('levelEditor').style.display = 'block';
    
    // Initialize editor canvas
    editorObjects = [];
    editorCamera = { x: 0, y: 0 };
    currentTool = 'platform';
    document.getElementById('currentTool').textContent = currentTool;
    
    // Start editor loop
    editorLoop();
}

function selectTool(tool) {
    currentTool = tool;
    document.getElementById('currentTool').textContent = tool;
}

function exitEditor() {
    isEditorMode = false;
    document.getElementById('levelEditor').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function saveLevel() {
    const levelData = {
        objects: editorObjects,
        levelWidth: levelWidth
    };
    localStorage.setItem('brawl2d_customLevel', JSON.stringify(levelData));
    showPopup('Level Saved!', 'Your custom level has been saved.');
}

function loadLevel() {
    const saved = localStorage.getItem('brawl2d_customLevel');
    if (saved) {
        const levelData = JSON.parse(saved);
        editorObjects = levelData.objects || [];
        levelWidth = levelData.levelWidth || 5000;
        showPopup('Level Loaded!', 'Your custom level has been loaded.');
    } else {
        showPopup('No Level Found!', 'No custom level found to load.');
    }
}

function playTestLevel() {
    if (editorObjects.length === 0) {
        showPopup('Empty Level!', 'Please add some objects to the level first.');
        return;
    }
    
    // Convert editor objects to game level format
    const customLevel = convertEditorToLevel(editorObjects);
    
    // Exit editor and start game with custom level
    isEditorMode = false;
    document.getElementById('levelEditor').style.display = 'none';
    
    // Load custom level
    loadCustomLevel(customLevel);
    init(1);
}

function convertEditorToLevel(objects) {
    const level = {
        platforms: [],
        breakableBlocks: [],
        interrogationBlocks: [],
        enemies: [],
        coins: [],
        pipes: [],
        flagpole: { x: 4500, y: 300, width: 10, height: 300 },
        playerStart: { x: 100, y: 400 }
    };
    
    for (let obj of objects) {
        switch(obj.type) {
            case 'platform':
                level.platforms.push({ x: obj.x, y: obj.y, width: obj.width, height: obj.height });
                break;
            case 'breakable':
                level.breakableBlocks.push({ x: obj.x, y: obj.y, width: obj.width, height: obj.height, broken: false, coins: 0 });
                break;
            case 'interrogation':
                level.interrogationBlocks.push({ x: obj.x, y: obj.y, width: obj.width, height: obj.height, used: false, item: 'coin' });
                break;
            case 'goomba':
                level.enemies.push({ 
                    x: obj.x, 
                    y: obj.y, 
                    width: 30, 
                    height: 30, 
                    type: 'goomba', 
                    velocityX: -2, 
                    velocityY: 0,
                    platformIndex: -1, // No platform assignment for custom levels
                    defeated: false, 
                    animationTimer: 0 
                });
                break;
            case 'koopa':
                level.enemies.push({ 
                    x: obj.x, 
                    y: obj.y, 
                    width: 30, 
                    height: 40, 
                    type: 'koopa', 
                    velocityX: -2,
                    velocityY: 0,
                    platformIndex: -1, // No platform assignment for custom levels
                    defeated: false, 
                    shellMode: false, 
                    animationTimer: 0 
                });
                break;
            case 'coin':
                level.coins.push({ x: obj.x, y: obj.y, width: 20, height: 20, collected: false, type: 'gold' });
                break;
            case 'pipe':
                level.pipes.push({ x: obj.x, y: obj.y, width: 60, height: obj.height });
                break;
            case 'flagpole':
                level.flagpole = { x: obj.x, y: obj.y, width: 10, height: obj.height };
                break;
            case 'playerstart':
                level.playerStart = { x: obj.x, y: obj.y };
                break;
        }
    }
    
    return level;
}

function loadCustomLevel(levelData) {
    platforms = levelData.platforms || [];
    breakableBlocks = levelData.breakableBlocks || [];
    interrogationBlocks = levelData.interrogationBlocks || [];
    enemies = levelData.enemies || [];
    coins = levelData.coins || [];
    pipes = levelData.pipes || [];
    flagpole = levelData.flagpole || { x: 4500, y: 300, width: 10, height: 300 };
    lavaPools = [];
    fireBars = [];
    fallingPlatforms = [];
    mobilePlatforms = [];
    springs = [];
    conveyorBelts = [];
    
    // Set player start position
    if (levelData.playerStart) {
        player.x = levelData.playerStart.x;
        player.y = levelData.playerStart.y;
    }
    
    // Place enemies on nearest platform below them
    for (let enemy of enemies) {
        if (enemy.platformIndex === -1) {
            // Find nearest platform below enemy
            let nearestPlatform = null;
            let minDistance = Infinity;
            
            for (let platform of platforms) {
                if (platform.x <= enemy.x + enemy.width && platform.x + platform.width >= enemy.x) {
                    const distance = platform.y - (enemy.y + enemy.height);
                    if (distance > 0 && distance < minDistance) {
                        minDistance = distance;
                        nearestPlatform = platform;
                    }
                }
            }
            
            // Place enemy on top of nearest platform
            if (nearestPlatform && minDistance < 200) {
                enemy.y = nearestPlatform.y - enemy.height;
                enemy.velocityY = 0;
            }
        }
    }
}

// Editor canvas click handler
editorCanvas.addEventListener('click', (e) => {
    const rect = editorCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left + editorCamera.x;
    const y = e.clientY - rect.top;
    
    // Snap to grid (32x32)
    const gridX = Math.floor(x / 32) * 32;
    const gridY = Math.floor(y / 32) * 32;
    
    if (currentTool === 'erase') {
        // Remove object at this position
        editorObjects = editorObjects.filter(obj => 
            !(obj.x === gridX && obj.y === gridY)
        );
    } else if (currentTool === 'playerstart') {
        // Remove existing player start if any
        editorObjects = editorObjects.filter(obj => obj.type !== 'playerstart');
        // Add new player start
        editorObjects.push({
            type: 'playerstart',
            x: gridX,
            y: gridY,
            width: 32,
            height: 32
        });
    } else {
        // Add new object
        const obj = {
            type: currentTool,
            x: gridX,
            y: gridY,
            width: 32,
            height: 32
        };
        
        // Special sizes for certain objects
        if (currentTool === 'pipe') {
            obj.height = 96;
            obj.width = 64;
        } else if (currentTool === 'flagpole') {
            obj.height = 300;
            obj.width = 10;
        }
        
        editorObjects.push(obj);
    }
});

// Editor loop
function editorLoop() {
    if (!isEditorMode) return;
    
    // Clear editor canvas
    editorCtx.fillStyle = '#87CEEB';
    editorCtx.fillRect(0, 0, editorCanvas.width, editorCanvas.height);
    
    // Draw grid
    editorCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    editorCtx.lineWidth = 1;
    for (let x = 0; x < editorCanvas.width; x += 32) {
        editorCtx.beginPath();
        editorCtx.moveTo(x - editorCamera.x, 0);
        editorCtx.lineTo(x - editorCamera.x, editorCanvas.height);
        editorCtx.stroke();
    }
    for (let y = 0; y < editorCanvas.height; y += 32) {
        editorCtx.beginPath();
        editorCtx.moveTo(0, y);
        editorCtx.lineTo(editorCanvas.width, y);
        editorCtx.stroke();
    }
    
    // Draw all editor objects
    for (let obj of editorObjects) {
        const screenX = obj.x - editorCamera.x;
        const screenY = obj.y;
        
        // Only draw if on screen
        if (screenX > -100 && screenX < editorCanvas.width + 100) {
            switch(obj.type) {
                case 'platform':
                    editorCtx.fillStyle = '#8B4513';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.strokeStyle = '#654321';
                    editorCtx.strokeRect(screenX, screenY, obj.width, obj.height);
                    break;
                case 'breakable':
                    editorCtx.fillStyle = '#CD853F';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.strokeStyle = '#8B4513';
                    editorCtx.strokeRect(screenX, screenY, obj.width, obj.height);
                    // Brick pattern
                    editorCtx.strokeStyle = '#654321';
                    editorCtx.beginPath();
                    editorCtx.moveTo(screenX + 16, screenY);
                    editorCtx.lineTo(screenX + 16, screenY + 32);
                    editorCtx.moveTo(screenX, screenY + 16);
                    editorCtx.lineTo(screenX + 32, screenY + 16);
                    editorCtx.stroke();
                    break;
                case 'interrogation':
                    editorCtx.fillStyle = '#FFD700';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.strokeStyle = '#B8860B';
                    editorCtx.strokeRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.fillStyle = '#000';
                    editorCtx.font = 'bold 20px Arial';
                    editorCtx.fillText('?', screenX + 10, screenY + 24);
                    break;
                case 'goomba':
                    editorCtx.fillStyle = '#8B4513';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.fillStyle = '#000';
                    editorCtx.fillRect(screenX + 5, screenY + 5, 5, 5);
                    editorCtx.fillRect(screenX + 20, screenY + 5, 5, 5);
                    break;
                case 'koopa':
                    editorCtx.fillStyle = '#228B22';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.fillStyle = '#000';
                    editorCtx.fillRect(screenX + 5, screenY + 5, 5, 5);
                    editorCtx.fillRect(screenX + 20, screenY + 5, 5, 5);
                    break;
                case 'coin':
                    editorCtx.fillStyle = '#FFD700';
                    editorCtx.beginPath();
                    editorCtx.arc(screenX + 16, screenY + 16, 12, 0, Math.PI * 2);
                    editorCtx.fill();
                    editorCtx.strokeStyle = '#B8860B';
                    editorCtx.stroke();
                    break;
                case 'pipe':
                    editorCtx.fillStyle = '#2ECC71';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.strokeStyle = '#27AE60';
                    editorCtx.strokeRect(screenX, screenY, obj.width, obj.height);
                    // Pipe top
                    editorCtx.fillStyle = '#27AE60';
                    editorCtx.fillRect(screenX - 5, screenY, obj.width + 10, 20);
                    break;
                case 'flagpole':
                    editorCtx.fillStyle = '#9B59B6';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    // Flag
                    editorCtx.fillStyle = '#E74C3C';
                    editorCtx.fillRect(screenX + 10, screenY, 30, 20);
                    break;
                case 'playerstart':
                    editorCtx.fillStyle = '#FF69B4';
                    editorCtx.fillRect(screenX, screenY, obj.width, obj.height);
                    editorCtx.strokeStyle = '#FF1493';
                    editorCtx.strokeRect(screenX, screenY, obj.width, obj.height);
                    // Draw "P" for player start
                    editorCtx.fillStyle = '#000';
                    editorCtx.font = 'bold 20px Arial';
                    editorCtx.fillText('P', screenX + 10, screenY + 24);
                    break;
            }
        }
    }
    
    requestAnimationFrame(editorLoop);
}

function startLevel(levelNum) {
    // Check if level is unlocked
    if (levelNum > 1 && !completedLevels.includes(levelNum - 1)) {
        showPopup('Level Locked!', 'Level ' + levelNum + ' is locked! Complete level ' + (levelNum - 1) + ' first.');
        return;
    }
    
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('worldMap').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    init(levelNum);
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    init(level);
}

// Initial setup
window.onload = function() {
    draw(); // Draw initial screen
};
