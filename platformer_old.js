// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameRunning = false;
let score = 0;
let lives = 3;
let level = 1;

// Player object
const player = {
    x: 100,
    y: 400,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    grounded: false,
    color: '#FF6B6B'
};

// Game physics
const gravity = 0.5;
const friction = 0.8;

// Platforms array
const platforms = [
    { x: 0, y: 550, width: 800, height: 50, color: '#8B4513' },
    { x: 200, y: 450, width: 100, height: 20, color: '#228B22' },
    { x: 400, y: 350, width: 150, height: 20, color: '#228B22' },
    { x: 600, y: 250, width: 100, height: 20, color: '#228B22' },
    { x: 50, y: 300, width: 80, height: 20, color: '#228B22' },
    { x: 300, y: 200, width: 120, height: 20, color: '#228B22' },
    { x: 500, y: 150, width: 100, height: 20, color: '#228B22' }
];

// Enemies array
const enemies = [
    { x: 250, y: 420, width: 25, height: 25, velocityX: 1, color: '#8B0000' },
    { x: 450, y: 320, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
    { x: 650, y: 220, width: 25, height: 25, velocityX: 1, color: '#8B0000' }
];

// Coins array
const coins = [
    { x: 230, y: 420, width: 15, height: 15, collected: false, color: '#FFD700' },
    { x: 470, y: 320, width: 15, height: 15, collected: false, color: '#FFD700' },
    { x: 650, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
    { x: 80, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
    { x: 350, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' },
    { x: 550, y: 120, width: 15, height: 15, collected: false, color: '#FFD700' }
];

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') e.preventDefault();
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize game
function init() {
    gameRunning = true;
    score = 0;
    lives = 3;
    level = 1;
    resetPlayer();
    updateUI();
    gameLoop();
}

// Reset player position
function resetPlayer() {
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// Handle player input
function handleInput() {
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }
    
    if ((keys[' '] || keys['ArrowUp']) && player.grounded) {
        player.velocityY = -player.jumpPower;
        player.grounded = false;
    }
    
    if (keys['r'] || keys['R']) {
        restartGame();
    }
}

// Update player physics
function updatePlayer() {
    // Apply gravity
    player.velocityY += gravity;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Ground collision (bottom of screen)
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.grounded = true;
    }
    
    // Platform collision
    player.grounded = false;
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            // Landing on top of platform
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let enemy of enemies) {
        enemy.x += enemy.velocityX;
        
        // Reverse direction at screen boundaries
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.velocityX *= -1;
        }
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
            // Player jumps on enemy
            if (player.velocityY > 0 && player.y < enemy.y) {
                score += 100;
                enemy.x = -100; // Move enemy off screen
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

// Update coins
function updateCoins() {
    for (let coin of coins) {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 50;
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
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds
    drawCloud(100, 50, 40);
    drawCloud(300, 80, 30);
    drawCloud(500, 40, 50);
    drawCloud(700, 70, 35);
    
    // Draw platforms
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add some texture to platforms
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // Draw coins
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = coin.color;
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add shine effect
            ctx.fillStyle = '#FFF700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2 - 2, coin.y + coin.height/2 - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw enemies
    for (let enemy of enemies) {
        if (enemy.x > -50) { // Only draw if not defeated
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Draw eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
            ctx.fillRect(enemy.x + 15, enemy.y + 5, 5, 5);
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 6, enemy.y + 6, 3, 3);
            ctx.fillRect(enemy.x + 16, enemy.y + 6, 3, 3);
        }
    }
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player face
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 19, player.y + 8, 6, 6);
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 7, player.y + 10, 2, 2);
    ctx.fillRect(player.x + 21, player.y + 10, 2, 2);
    
    // Draw smile
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + 20, 8, 0, Math.PI);
    ctx.stroke();
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
    
    handleInput();
    updatePlayer();
    updateEnemies();
    updateCoins();
    draw();
    updateUI();
    
    // Check win condition
    const allCoinsCollected = coins.every(coin => coin.collected);
    const allEnemiesDefeated = enemies.every(enemy => enemy.x < -50);
    
    if (allCoinsCollected && allEnemiesDefeated) {
        levelComplete();
    }
    
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
    level++;
    score += 500;
    resetLevel();
}

// Reset level
function resetLevel() {
    resetPlayer();
    
    // Reset enemies
    enemies[0].x = 250;
    enemies[1].x = 450;
    enemies[2].x = 650;
    
    // Reset coins
    for (let coin of coins) {
        coin.collected = false;
    }
    
    // Make game harder
    if (level > 1) {
        enemies.forEach(enemy => {
            enemy.velocityX *= 1.2;
        });
    }
}

// Start game
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    init();
}

// Restart game
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    init();
}

// Initial setup
window.onload = function() {
    draw(); // Draw initial screen
};
