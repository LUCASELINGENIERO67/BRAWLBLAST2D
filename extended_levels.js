const levels = {
    1: {
        platforms: [
            { x: 0, y: 550, width: 600, height: 50, color: '#8B4513' },
            { x: 800, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 1400, y: 550, width: 500, height: 50, color: '#8B4513' },
            { x: 2100, y: 550, width: 400, height: 50, color: '#8B4513' },
            { x: 2700, y: 550, width: 600, height: 50, color: '#8B4513' },
            { x: 3500, y: 550, width: 500, height: 50, color: '#8B4513' },
            { x: 4200, y: 550, width: 800, height: 50, color: '#8B4513' },
            
            // Plataformas flotantes más fáciles de saltar
            { x: 300, y: 420, width: 150, height: 20, color: '#228B22' },
            { x: 950, y: 380, width: 120, height: 20, color: '#228B22' },
            { x: 1250, y: 280, width: 100, height: 20, color: '#228B22' },
            { x: 1700, y: 350, width: 150, height: 20, color: '#228B22' },
            { x: 2300, y: 250, width: 120, height: 20, color: '#228B22' },
            { x: 2800, y: 400, width: 130, height: 20, color: '#228B22' },
            { x: 3200, y: 300, width: 100, height: 20, color: '#228B22' },
            { x: 3800, y: 220, width: 150, height: 20, color: '#228B22' },
            { x: 4500, y: 380, width: 120, height: 20, color: '#228B22' }
        ],
        breakableBlocks: [
            { x: 350, y: 350, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1000, y: 320, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 },
            { x: 1750, y: 300, width: 30, height: 30, color: '#D2691E', broken: false, coins: 0 },
            { x: 2350, y: 200, width: 30, height: 30, color: '#D2691E', broken: false, coins: 1 }
        ],
        interrogationBlocks: [
            { x: 500, y: 350, width: 30, height: 30, color: '#FFA500', used: false, item: 'coin' },
            { x: 1500, y: 250, width: 30, height: 30, color: '#FFA500', used: false, item: 'mushroom' },
            { x: 2600, y: 320, width: 30, height: 30, color: '#FFA500', used: false, item: 'fireflower' },
            { x: 4000, y: 300, width: 30, height: 30, color: '#FFA500', used: false, item: 'star' }
        ],
        pipes: [
            { x: 650, y: 470, width: 70, height: 130, color: '#008000', exitX: 2000, exitY: 400, type: 'vertical', solid: true },
            { x: 2000, y: 400, width: 70, height: 180, color: '#008000', exitX: 650, exitY: 470, type: 'vertical', solid: true }
        ],
        mobilePlatforms: [
            { x: 1200, y: 420, width: 120, height: 20, color: '#8B4513', velocityX: 2, minX: 1100, maxX: 1450, startY: 420 }
        ],
        enemies: [
            { x: 400, y: 520, width: 25, height: 25, velocityX: 1.2, color: '#8B0000', platformIndex: 0 },
            { x: 900, y: 520, width: 25, height: 25, velocityX: -1, color: '#8B0000' },
            { x: 1600, y: 520, width: 25, height: 25, velocityX: 1.5, color: '#8B0000' },
            { x: 2400, y: 520, width: 25, height: 25, velocityX: -1.2, color: '#8B0000' }
        ],
        coins: [
            { x: 350, y: 300, width: 15, height: 15, collected: false },
            { x: 1050, y: 250, width: 15, height: 15, collected: false },
            { x: 1800, y: 300, width: 15, height: 15, collected: false },
            { x: 2700, y: 180, width: 15, height: 15, collected: false }
        ],
        flagpole: { x: 4900, y: 350, width: 20, height: 200, color: '#FFD700' }
    },

};
