// Plants vs Zombies Game Engine
class PVZGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridWidth = 9;
        this.gridHeight = 5;
        this.cellWidth = 80;
        this.cellHeight = 100;
        this.gridOffsetX = 100;
        this.gridOffsetY = 100;
        
        this.gameState = 'menu';
        this.sunCount = 50;
        this.zombiesKilled = 0;
        this.currentLevel = 1;
        this.selectedPlant = null;
        this.isPaused = false;
        
        // Level configurations
        this.levels = {
            1: { name: 'Day 1 - Front Lawn', zombieSpawnRate: 2900, zombiesRequired: 11, zombieTypes: ['normal'], unlocked: true, maxPlants: 4 },
            2: { name: 'Day 2 - More Zombies', zombieSpawnRate: 2860, zombiesRequired: 14, zombieTypes: ['normal'], unlocked: false, maxPlants: 5 },
            3: { name: 'Day 3 - Cone Attack', zombieSpawnRate: 2820, zombiesRequired: 18, zombieTypes: ['normal', 'cone'], unlocked: false, maxPlants: 6 },
            4: { name: 'Day 4 - Bucket Brigade', zombieSpawnRate: 2780, zombiesRequired: 21, zombieTypes: ['normal', 'cone'], unlocked: false, maxPlants: 8 },
            5: { name: 'Day 5 - Final Assault', zombieSpawnRate: 2740, zombiesRequired: 24, zombieTypes: ['normal', 'cone', 'flag'], unlocked: false, maxPlants: 8 },
            6: { name: 'Day 6 - Explosive Mayhem', zombieSpawnRate: 2700, zombiesRequired: 27, zombieTypes: ['normal', 'cone'], unlocked: false, maxPlants: 8 },
            7: { name: 'Day 7 - Devouring Defense', zombieSpawnRate: 2660, zombiesRequired: 30, zombieTypes: ['normal', 'cone', 'pole'], unlocked: false, maxPlants: 8 },
            8: { name: 'Day 8 - Ultimate Battle', zombieSpawnRate: 2620, zombiesRequired: 34, zombieTypes: ['normal', 'cone', 'newspaper'], unlocked: false, maxPlants: 8 },
            9: { name: 'Night 1 - Shroom Awakening', zombieSpawnRate: 2580, zombiesRequired: 37, zombieTypes: ['normal', 'cone', 'bucket'], unlocked: false, maxPlants: 8 },
            10: { name: 'Night 2 - Fume Cloud', zombieSpawnRate: 2540, zombiesRequired: 40, zombieTypes: ['normal', 'cone', 'balloon'], unlocked: false, maxPlants: 8 },
            11: { name: 'Night 3 - Icy Terror', zombieSpawnRate: 2500, zombiesRequired: 43, zombieTypes: ['normal', 'cone', 'screenDoor'], unlocked: false, maxPlants: 8 },
            12: { name: 'Night 4 - Doom Arrival', zombieSpawnRate: 2460, zombiesRequired: 46, zombieTypes: ['normal', 'cone', 'newspaper'], unlocked: false, maxPlants: 8 },
            13: { name: 'Night 5 - Shroom Storm', zombieSpawnRate: 2420, zombiesRequired: 50, zombieTypes: ['normal', 'cone', 'bucket', 'pole'], unlocked: false, maxPlants: 8 },
            14: { name: 'Night 6 - Fume Apocalypse', zombieSpawnRate: 2380, zombiesRequired: 53, zombieTypes: ['normal', 'cone', 'screenDoor'], unlocked: false, maxPlants: 8 },
            15: { name: 'Night 7 - Ice Age', zombieSpawnRate: 2340, zombiesRequired: 56, zombieTypes: ['normal', 'cone', 'football'], unlocked: false, maxPlants: 8 },
            16: { name: 'Night 8 - Final Stand', zombieSpawnRate: 2300, zombiesRequired: 59, zombieTypes: ['normal', 'cone', 'newspaper', 'balloon'], unlocked: false, maxPlants: 8 },
            17: { name: 'Day 9 - Nut Defense', zombieSpawnRate: 2260, zombiesRequired: 62, zombieTypes: ['normal', 'cone', 'bucket', 'screenDoor'], unlocked: false, maxPlants: 8 },
            18: { name: 'Day 10 - Fire Storm', zombieSpawnRate: 2220, zombiesRequired: 66, zombieTypes: ['normal', 'flag', 'cone', 'pole'], unlocked: false, maxPlants: 8 },
            19: { name: 'Pool 1 - Water Front', zombieSpawnRate: 2180, zombiesRequired: 69, zombieTypes: ['normal', 'cone', 'balloon'], unlocked: false, maxPlants: 8, hasPool: true },
            20: { name: 'Pool 2 - Deep Waters', zombieSpawnRate: 2140, zombiesRequired: 72, zombieTypes: ['normal', 'cone', 'newspaper', 'screenDoor'], unlocked: false, maxPlants: 8, hasPool: true },
            21: { name: 'Pool 3 - Lily Defense', zombieSpawnRate: 2100, zombiesRequired: 75, zombieTypes: ['normal', 'cone', 'pole', 'balloon'], unlocked: false, maxPlants: 8, hasPool: true },
            22: { name: 'Pool 4 - Triple Threat', zombieSpawnRate: 2060, zombiesRequired: 78, zombieTypes: ['normal', 'flag', 'cone', 'football'], unlocked: false, maxPlants: 8, hasPool: true },
            23: { name: 'Pool 5 - Squash Attack', zombieSpawnRate: 2020, zombiesRequired: 82, zombieTypes: ['normal', 'cone', 'screenDoor', 'balloon'], unlocked: false, maxPlants: 8, hasPool: true },
            24: { name: 'Pool 6 - Hot Waters', zombieSpawnRate: 1980, zombiesRequired: 85, zombieTypes: ['normal', 'cone', 'newspaper', 'pole'], unlocked: false, maxPlants: 8, hasPool: true },
            25: { name: 'Pool 7 - Ultimate Pool', zombieSpawnRate: 1940, zombiesRequired: 88, zombieTypes: ['normal', 'flag', 'cone', 'dancing'], unlocked: false, maxPlants: 8, hasPool: true },
            26: { name: 'Pool 8 - Final Waters', zombieSpawnRate: 1900, zombiesRequired: 91, zombieTypes: ['normal', 'cone', 'bucket', 'balloon'], unlocked: false, maxPlants: 8, hasPool: true },
            27: { name: 'Ultimate 1 - Fire Power', zombieSpawnRate: 1860, zombiesRequired: 94, zombieTypes: ['normal', 'flag', 'cone', 'screenDoor'], unlocked: false, maxPlants: 8, hasPool: true },
            28: { name: 'Ultimate 2 - Martial Arts', zombieSpawnRate: 1820, zombiesRequired: 98, zombieTypes: ['normal', 'cone', 'newspaper', 'dancing'], unlocked: false, maxPlants: 8, hasPool: true },
            29: { name: 'Ultimate 3 - Boomerang Fury', zombieSpawnRate: 1780, zombiesRequired: 101, zombieTypes: ['normal', 'cone', 'football', 'balloon'], unlocked: false, maxPlants: 8, hasPool: true },
            30: { name: 'Ultimate 4 - Combined Forces', zombieSpawnRate: 1740, zombiesRequired: 104, zombieTypes: ['normal', 'cone', 'pole', 'screenDoor'], unlocked: false, maxPlants: 8, hasPool: true },
            31: { name: 'Ultimate 5 - Final Challenge', zombieSpawnRate: 1700, zombiesRequired: 107, zombieTypes: ['normal', 'flag', 'cone', 'newspaper', 'dancing'], unlocked: false, maxPlants: 8, hasPool: true },
            32: { name: 'Ultimate 6 - Master Level', zombieSpawnRate: 1660, zombiesRequired: 110, zombieTypes: ['normal', 'cone', 'bucket', 'balloon', 'football'], unlocked: false, maxPlants: 8, hasPool: true },
            33: { name: 'Ultimate 7 - Shield Wall', zombieSpawnRate: 1640, zombiesRequired: 113, zombieTypes: ['normal', 'cone', 'screenDoor', 'balloon', 'pole'], unlocked: false, maxPlants: 8, hasPool: true },
            34: { name: 'Ultimate 8 - Newspaper Riot', zombieSpawnRate: 1625, zombiesRequired: 116, zombieTypes: ['normal', 'cone', 'newspaper', 'dancing', 'balloon'], unlocked: false, maxPlants: 8, hasPool: true },
            35: { name: 'Ultimate 9 - Dance Floor', zombieSpawnRate: 1610, zombiesRequired: 120, zombieTypes: ['normal', 'cone', 'newspaper', 'dancing', 'zombistein'], unlocked: false, maxPlants: 8, hasPool: true },
            36: { name: 'Ultimate 10 - Classic Horde', zombieSpawnRate: 1590, zombiesRequired: 123, zombieTypes: ['normal', 'flag', 'cone', 'bucket', 'balloon', 'dancing', 'zombistein'], unlocked: false, maxPlants: 8, hasPool: true },
            37: { name: 'Graveyard 1 - Restless Soil', zombieSpawnRate: 1700, zombiesRequired: 105, zombieTypes: ['normal', 'cone', 'newspaper', 'screenDoor'], unlocked: false, maxPlants: 8, hasGraves: true },
            38: { name: 'Graveyard 2 - Tomb Trouble', zombieSpawnRate: 1600, zombiesRequired: 115, zombieTypes: ['normal', 'flag', 'cone', 'bucket', 'balloon', 'dancing'], unlocked: false, maxPlants: 8, hasGraves: true },
            39: { name: 'Final - Peanut Stand', zombieSpawnRate: 1550, zombiesRequired: 125, zombieTypes: ['normal', 'cone', 'bucket', 'football', 'balloon', 'zombistein'], unlocked: false, maxPlants: 8, hasGraves: true }
        };
        
        // Default plants for each level
        // Default plants for each level
        this.defaultPlants = {
            1: ['sunflower', 'peashooter', 'wallnut'],
            2: ['sunflower', 'peashooter', 'wallnut', 'freezer'],
            3: ['sunflower', 'peashooter', 'wallnut', 'freezer'],
            4: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato'],
            5: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato'],
            6: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry'],
            7: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper'],
            8: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater'],
            9: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom'],
            10: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom'],
            11: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom'],
            12: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'gravebuster'],
            13: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'gravebuster'],
            14: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'gravebuster'],
            15: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'gravebuster', 'iceberg'],
            16: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'gravebuster', 'iceberg'],
            17: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'gravebuster', 'iceberg'],
            18: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'gravebuster', 'iceberg'],
            19: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'gravebuster', 'iceberg'],
            20: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'gravebuster', 'iceberg', 'peapod'],
            21: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'gravebuster', 'iceberg', 'peapod'],
            22: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod'],
            23: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod'],
            24: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod'],
            25: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            26: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            27: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            28: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            29: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            30: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            31: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            32: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            33: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            34: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            35: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            36: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            37: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            38: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            39: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut', 'peanut']
        };
        
        // Plant configurations
        // Plant configurations
        this.plantTypes = {
            sunflower: { name: 'Sunflower', cost: 50, icon: '🌻', description: 'Produces sun' },
            peashooter: { name: 'Peashooter', cost: 100, icon: '🌱', description: 'Shoots peas' },
            wallnut: { name: 'Wall-nut', cost: 50, icon: '🥜', description: 'Defensive barrier' },
            freezer: { name: 'Snow Pea', cost: 175, icon: '❄️', description: 'Slows zombies' },
            potato: { name: 'Potato Mine', cost: 25, icon: '🥔', description: 'Explodes on contact' },
            cherry: { name: 'Cherry Bomb', cost: 150, icon: '🍒', description: 'Large explosion' },
            chomper: { name: 'Chomper', cost: 150, icon: '🦷', description: 'Eats zombies whole' },
            bipeater: { name: 'Repeater', cost: 200, icon: '🌿', description: 'Double peas' },
            sunshroom: { name: 'Sun-shroom', cost: 25, icon: '🍄', description: 'Night sun producer' },
            puffshroom: { name: 'Puff-shroom', cost: 0, icon: '🟤', description: 'Free short range' },
            fumeshroom: { name: 'Fume-shroom', cost: 75, icon: '🟣', description: 'Piercing fumes' },
            doomshroom: { name: 'Doom-shroom', cost: 125, icon: '⚫', description: 'Massive explosion' },
            iceshroom: { name: 'Ice-shroom', cost: 75, icon: '🔵', description: 'Freeze all zombies' },
            hypnoshroom: { name: 'Hypno-shroom', cost: 75, icon: '🌀', description: 'Turns zombies' },
            tallnut: { name: 'Tall-nut', cost: 125, icon: '🥜', description: 'Tall barrier' },
            imitater: { name: 'Imitater', cost: 175, icon: '👥', description: 'Copy plant' },
            threepeater: { name: 'Threepeater', cost: 325, icon: '🌿', description: 'Three lanes' },
            squash: { name: 'Squash', cost: 50, icon: '🎃', description: 'Smash zombies' },
            lily: { name: 'Lily Pad', cost: 25, icon: '🍃', description: 'Float platform' },
            jalapeno: { name: 'Jalapeno', cost: 125, icon: '🌶️', description: 'Lane fire' },
            torchwood: { name: 'Torchwood', cost: 175, icon: '🔥', description: 'Fire boost' },
            firepeashooter: { name: 'Fire Pea', cost: 200, icon: '🔥', description: 'Fire peas' },
            bonkchoy: { name: 'Bonk Choy', cost: 150, icon: '🥊', description: 'Punch zombies' },
            bloomerang: { name: 'Bloomerang', cost: 225, icon: '🪐', description: 'Boomerang' },
            cactus: { name: 'Cactus', cost: 125, icon: '🌵', description: 'Piercing spines' },
            spikeweed: { name: 'Spikeweed', cost: 100, icon: '🪤', description: 'Ground spikes' },
            spikerock: { name: 'Spikerock', cost: 200, icon: '🪨', description: 'Heavy spikes' },
            acidlemon: { name: 'Acid Lemon', cost: 150, icon: '🍋', description: 'Corrosive lemonade' },
            peapod: { name: 'Pea Pod', cost: 125, icon: '🫛', description: 'Stacks pea heads' },
            iceberg: { name: 'Iceberg Lettuce', cost: 0, icon: '🥬', description: 'Freezes one zombie' },
            gravebuster: { name: 'Grave Buster', cost: 75, icon: '🪦', description: 'Eats graves' },
            coconut: { name: 'Coconut Cannon', cost: 400, icon: '🥥', description: 'Heavy splash shot' },
            peanut: { name: 'Peanut', cost: 150, icon: '🥜', description: 'Shoots and blocks' }
        
        };
        
        // Selected plants for current level
        this.selectedLevelPlants = [];
        
        // Load saved progress
        this.loadProgress();
        
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.nextZombieId = 1;
        this.sunDrops = [];
        
        this.lastTime = 0;
        this.zombieSpawnTimer = 0;
        this.sunSpawnTimer = 0;
        
        this.plantCooldowns = {
            sunflower: 0,
            peashooter: 0,
            wallnut: 0,
            freezer: 0,
            potato: 0,
            cherry: 0,
            chomper: 0,
            bipeater: 0,
            sunshroom: 0,
            puffshroom: 0,
            fumeshroom: 0,
            doomshroom: 0,
            iceshroom: 0,
            hypnoshroom: 0,
            tallnut: 0,
            imitater: 0,
            threepeater: 0,
            squash: 0,
            lily: 0,
            jalapeno: 0,
            torchwood: 0,
            firepeashooter: 0,
            bonkchoy: 0,
            bloomerang: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    loadProgress() {
        const saved = localStorage.getItem('pvz_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            // Load unlocked levels
            Object.keys(this.levels).forEach(level => {
                if (progress.unlockedLevels && progress.unlockedLevels.includes(parseInt(level))) {
                    this.levels[level].unlocked = true;
                }
            });
            // Load unlocked plants
            this.unlockedPlants = progress.unlockedPlants || ['sunflower', 'peashooter', 'wallnut'];
        } else {
            // Default unlocked content
            this.unlockedPlants = ['sunflower', 'peashooter', 'wallnut'];
        }
        
        // Plant unlock progression
        // Plant unlock progression
        this.plantUnlockProgression = {
            1: ['sunflower', 'peashooter', 'wallnut'],
            2: ['sunflower', 'peashooter', 'wallnut', 'freezer'],
            3: ['sunflower', 'peashooter', 'wallnut', 'freezer'],
            4: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato'],
            5: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato'],
            6: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry'],
            7: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper'],
            8: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater'],
            9: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom'],
            10: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom'],
            11: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom'],
            12: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'gravebuster'],
            13: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'gravebuster'],
            14: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'gravebuster'],
            15: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'gravebuster', 'iceberg'],
            16: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'gravebuster', 'iceberg'],
            17: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'gravebuster', 'iceberg'],
            18: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'gravebuster', 'iceberg'],
            19: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'gravebuster', 'iceberg'],
            20: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'gravebuster', 'iceberg', 'peapod'],
            21: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'gravebuster', 'iceberg', 'peapod'],
            22: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod'],
            23: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod'],
            24: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod'],
            25: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            26: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            27: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            28: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            29: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            30: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            31: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            32: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            33: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            34: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            35: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            36: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            37: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            38: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut'],
            39: ['sunflower', 'peashooter', 'wallnut', 'freezer', 'potato', 'cherry', 'chomper', 'bipeater', 'sunshroom', 'puffshroom', 'fumeshroom', 'doomshroom', 'iceshroom', 'hypnoshroom', 'tallnut', 'imitater', 'lily', 'threepeater', 'squash', 'jalapeno', 'torchwood', 'firepeashooter', 'bonkchoy', 'bloomerang', 'cactus', 'spikeweed', 'spikerock', 'acidlemon', 'gravebuster', 'iceberg', 'peapod', 'coconut', 'peanut']
        };
    }
    
    saveProgress() {
        const unlockedLevels = Object.keys(this.levels)
            .filter(level => this.levels[level].unlocked)
            .map(level => parseInt(level));
        
        const progress = {
            unlockedLevels: unlockedLevels,
            unlockedPlants: this.unlockedPlants
        };
        
        localStorage.setItem('pvz_progress', JSON.stringify(progress));
    }
    
    setupEventListeners() {
        // Plant selector cards
        document.querySelectorAll('.plant-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const plantType = card.dataset.plant;
                const cost = parseInt(card.dataset.cost);
                
                if (this.sunCount >= cost && this.plantCooldowns[plantType] <= 0) {
                    // Deselect all cards
                    document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
                    // Select this card
                    card.classList.add('selected');
                    const copiedType = plantType === 'imitater' ? this.getImitaterCopyType() : plantType;
                    if (plantType === 'imitater' && !copiedType) return;
                    const realCost = this.getPlantCostForSeed ? this.getPlantCostForSeed(plantType) : cost;
                    this.selectedPlant = { type: plantType, cost: realCost, copiedType: copiedType };
                }
            });
        });
        
        // Canvas click for plant placement and fire gourd activation
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Plant placement
            if (this.gameState !== 'playing' || !this.selectedPlant) return;
            
            const gridX = Math.floor((x - this.gridOffsetX) / this.cellWidth);
            const gridY = Math.floor((y - this.gridOffsetY) / this.cellHeight);
            
            if (this.isValidPlacement(gridX, gridY)) {
                this.placePlant(gridX, gridY, this.selectedPlant.type);
                this.sunCount -= this.selectedPlant.cost;
                this.updateUI();
                
                // Set cooldown based on plant type
                const cooldowns = {
                    sunflower: 300,    // 5 seconds
                    peashooter: 300,   // 5 seconds
                    wallnut: 1200,     // 20 seconds
                    freezer: 600,      // 10 seconds
                    potato: 900,       // 15 seconds
                    cherry: 1800,      // 30 seconds
                    chomper: 1200,     // 20 seconds
                    bipeater: 300,     // 5 seconds
                    sunshroom: 480,    // 8 seconds (PVZ2: 7.5-8s)
                    puffshroom: 240,    // 4 seconds (PVZ2: 4s)
                    fumeshroom: 300,    // 5 seconds (PVZ2: 5s)
                    doomshroom: 1800,   // 30 seconds (PVZ2: 30s)
                    iceshroom: 1800,   // 30 seconds (PVZ2: 30s)
                    hypnoshroom: 1200,   // 20 seconds
                    tallnut: 2400,      // 40 seconds
                    imitater: 300,       // 5 seconds cooldown
                    threepeater: 300,    // 5 seconds cooldown
                    squash: 600,         // 10 seconds cooldown
                    lily: 0,            // No cooldown (platform)
                    jalapeno: 1200,       // 20 seconds cooldown
                    torchwood: 0,        // No cooldown (passive)
                    firepeashooter: 300,  // 5 seconds cooldown
                    bonkchoy: 300,       // 5 seconds cooldown
                    bloomerang: 450,      // 7.5 seconds cooldown
                    cactus: 300,          // 5 seconds cooldown
                    spikeweed: 300,       // 5 seconds cooldown
                    spikerock: 900,       // 15 seconds cooldown
                    acidlemon: 300,       // 5 seconds cooldown
                    peapod: 300,          // 5 seconds cooldown
                    iceberg: 300,         // 5 seconds cooldown
                    gravebuster: 300,     // 5 seconds cooldown
                    coconut: 900,         // 15 seconds cooldown
                    peanut: 300           // 5 seconds cooldown
                };
                this.plantCooldowns[this.selectedPlant.type] = cooldowns[this.selectedPlant.type] ?? 0;

                
                // Deselect plant
                document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
                this.selectedPlant = null;
            }
        });
        
        // Mouse move for hover effects and automatic sun collection
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Store mouse position for hover effects
            this.lastMouseX = x;
            this.lastMouseY = y;
            
            // Automatically collect sun when hovering
            this.collectSunAt(x, y);
            
            // Check if hovering over sun for cursor change
            const hoveringSun = this.isHoveringOverSun(x, y);
            this.canvas.style.cursor = hoveringSun ? 'pointer' : 'default';
        });
        
    }
    
    getImitaterCopyType() {
        const imitaterIndex = this.selectedLevelPlants.indexOf('imitater');
        if (imitaterIndex <= 0) return null;
        const leftPlant = this.selectedLevelPlants[imitaterIndex - 1];
        return leftPlant && leftPlant !== 'imitater' ? leftPlant : null;
    }

    getEffectiveSelectedPlantType() {
        if (!this.selectedPlant) return null;
        return this.selectedPlant.type === 'imitater'
            ? (this.selectedPlant.copiedType || this.getImitaterCopyType())
            : this.selectedPlant.type;
    }

    getPlantCostForSeed(plantType) {
        const effectiveType = plantType === 'imitater' ? this.getImitaterCopyType() : plantType;
        return this.plantTypes[effectiveType || plantType]?.cost || 0;
    }
    isValidPlacement(gridX, gridY) {
        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
            return false;
        }

        if (this.isTileUnplantable && this.isTileUnplantable(gridX, gridY)) {
            return false;
        }

        const placementType = this.getEffectiveSelectedPlantType();
        const hasGrave = this.hasGraveAt ? this.hasGraveAt(gridX, gridY) : false;
        if (placementType === 'gravebuster') {
            return hasGrave;
        }
        if (hasGrave) {
            return false;
        }

        const plantsHere = this.plants.filter(plant => plant.gridX === gridX && plant.gridY === gridY);

        if (placementType === 'peapod') {
            const pod = plantsHere.find(plant => (plant.copiedType || plant.type) === 'peapod');
            if (pod) {
                return (pod.heads || 1) < 5;
            }
        }

        const hasPool = this.levels[this.currentLevel]?.hasPool || false;
        const isPoolLane = hasPool && (gridY === 2 || gridY === 3);

        if (isPoolLane) {
            const hasLily = plantsHere.some(plant => (plant.copiedType || plant.type) === 'lily');
            const hasPlantOnLily = plantsHere.some(plant => (plant.copiedType || plant.type) !== 'lily');

            if (placementType === 'lily') {
                return plantsHere.length === 0;
            }

            return hasLily && !hasPlantOnLily;
        }

        if (placementType === 'lily') {
            return false;
        }

        return plantsHere.length === 0;
    }
        
    placePlant(gridX, gridY, type) {
        const copiedType = type === 'imitater' ? this.getImitaterCopyType() : type;
        if (!copiedType) return;

        if (copiedType === 'peapod') {
            const existingPod = this.plants.find(plant => plant.gridX === gridX && plant.gridY === gridY && (plant.copiedType || plant.type) === 'peapod');
            if (existingPod) {
                existingPod.heads = Math.min(5, (existingPod.heads || 1) + 1);
                existingPod.maxHealth += 120;
                existingPod.health = Math.min(existingPod.maxHealth, existingPod.health + 120);
                return;
            }
        }

        const health = this.getPlantHealth(copiedType);
        const plant = {
            x: this.gridOffsetX + gridX * this.cellWidth + this.cellWidth / 2,
            y: this.gridOffsetY + gridY * this.cellHeight + this.cellHeight / 2,
            gridX: gridX,
            gridY: gridY,
            type: type,
            copiedType: copiedType,
            health: health,
            maxHealth: health,
            shootTimer: 0,
            sunTimer: 0,
            heads: copiedType === 'peapod' ? 1 : undefined,
            bustTimer: copiedType === 'gravebuster' ? 0 : undefined
        };
        this.plants.push(plant);
    }
        

    getPlantHealth(type) {
        switch(type) {
            case 'sunflower': return 300;
            case 'peashooter': return 300;
            case 'freezer': return 300;
            case 'wallnut': return 4000;
            case 'cherry': return 300;
            case 'chomper': return 300;
            case 'bipeater': return 300;
            case 'sunshroom': return 300;
            case 'puffshroom': return 300;
            case 'fumeshroom': return 300;
            case 'doomshroom': return 300;
            case 'iceshroom': return 300;
            case 'hypnoshroom': return 300;
            case 'tallnut': return 3000;
            case 'imitater': return 300;
            case 'threepeater': return 300;
            case 'squash': return 300;
            case 'lily': return 300;
            case 'jalapeno': return 300;
            case 'torchwood': return 300;
            case 'firepeashooter': return 300;
            case 'bonkchoy': return 300;
            case 'bloomerang': return 300;
            case 'cactus': return 300;
            case 'spikeweed': return 300;
            case 'spikerock': return 300;
            case 'acidlemon': return 300;
            case 'peapod': return 300;
            case 'iceberg': return 100;
            case 'gravebuster': return 300;
            case 'coconut': return 500;
            case 'peanut': return 3000;
            default: return 300;
        }
    }
    spawnZombie() {
        const lane = Math.floor(Math.random() * this.gridHeight);
        const levelConfig = this.levels[this.currentLevel];
        const type = levelConfig.zombieTypes[Math.floor(Math.random() * levelConfig.zombieTypes.length)];

        const zombie = {
            id: this.nextZombieId++,
            x: this.canvas.width,
            y: this.gridOffsetY + lane * this.cellHeight + this.cellHeight / 2,
            lane: lane,
            type: type,
            health: this.getZombieHealth(type),
            maxHealth: this.getZombieHealth(type),
            speed: this.getZombieSpeed(type),
            frozen: false,
            freezeTimer: 0,
            hypnotized: false,
            team: 'zombie',
            attackTimer: 0
        };

        this.zombies.push(zombie);
    }
    getZombieHealth(type) {
        switch(type) {
            case 'normal': return 200;
            case 'flag': return 220;
            case 'cone': return 400;
            case 'bucket': return 800;
            case 'pole': return 350;
            case 'newspaper': return 450;
            case 'screenDoor': return 900;
            case 'football': return 900;
            case 'dancing': return 420;
            case 'balloon': return 260;
            case 'zombistein': return 1800;
            default: return 200;
        }
    }

    getZombieSpeed(type) {
        switch(type) {
            case 'normal': return 0.5;
            case 'flag': return 0.6;
            case 'cone': return 0.4;
            case 'bucket': return 0.3;
            case 'pole': return 0.75;
            case 'newspaper': return 0.45;
            case 'screenDoor': return 0.32;
            case 'football': return 0.55;
            case 'dancing': return 0.45;
            case 'balloon': return 0.55;
            case 'zombistein': return 0.22;
            default: return 0.5;
        }
    }

    getZombieDamage(type) {
        switch(type) {
            case 'zombistein': return 120;
            case 'football': return 65;
            case 'screenDoor': return 55;
            case 'bucket': return 55;
            default: return 45;
        }
    }

    spawnSun() {
        const fromSky = Math.random() < 0.5;
        
        if (fromSky) {
            this.sunDrops.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: -30,
                targetY: Math.random() * (this.canvas.height - 200) + 100,
                speed: 2,
                value: 25,
                fromSky: true
            });
        }
    }
    shootProjectile(plant, yOffset = 0, speed = 8) {
        const effectiveType = plant.copiedType || plant.type;
        let damage = 40;
        if (effectiveType === 'freezer') {
            damage = 60;
        } else if (effectiveType === 'peashooter') {
            damage = 60;
        } else if (effectiveType === 'bipeater') {
            damage = 70;
        }

        const projectile = {
            x: plant.x + 20,
            y: plant.y + yOffset,
            lane: plant.gridY,
            speed: speed,
            damage: damage,
            frozen: effectiveType === 'freezer',
            maxRange: effectiveType === 'puffshroom' ? plant.x + 180 : null
        };

        this.projectiles.push(projectile);
    }

    shootFire(plant) {
        // Create fire projectile with huge damage
        const projectile = {
            x: plant.x + 20,
            y: plant.y,
            lane: plant.gridY,
            speed: 12, // Faster than regular peas
            damage: 500, // Huge damage
            frozen: false,
            maxRange: null,
            fire: true // Mark as fire projectile
        };
        
        this.projectiles.push(projectile);
        
        // Create visual fire effect
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.arc(plant.x + 20, plant.y, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    shootFireProjectile(plant) {
        // Create fire projectile for fire peashooter (double damage, no freezing)
        const projectile = {
            x: plant.x + 20,
            y: plant.y,
            lane: plant.gridY,
            speed: 8,
            damage: 120, // Double damage of regular peashooter
            frozen: false,
            maxRange: null,
            fire: true // Mark as fire projectile
        };
        
        this.projectiles.push(projectile);
    }
    
    shootBoomerang(plant) {
        // Create boomerang projectile that hits zombies going and coming back
        const projectile = {
            x: plant.x + 20,
            y: plant.y,
            lane: plant.gridY,
            speed: 6, // Slower speed
            damage: 80, // Good damage
            frozen: false,
            maxRange: plant.x + 400, // Goes out and comes back
            boomerang: true, // Mark as boomerang
            returning: false // Track if it's returning
        };
        
        this.projectiles.push(projectile);
    }
    
    shootFume(plant) {
        const fume = {
            x: plant.x + 20,
            y: plant.y,
            lane: plant.gridY,
            speed: 4,
            damage: 20,
            piercing: true,
            frozen: false,
            maxRange: plant.x + 250
        };

        this.projectiles.push(fume);
    }

    shootSpine(plant) {
        this.projectiles.push({
            x: plant.x + 20,
            y: plant.y,
            lane: plant.gridY,
            speed: 7,
            damage: 35,
            piercing: true,
            spine: true,
            frozen: false,
            maxRange: null
        });
    }

    shootAcidLemon(plant) {
        this.projectiles.push({
            x: plant.x + 20,
            y: plant.y,
            lane: plant.gridY,
            speed: 6,
            damage: 50,
            acid: true,
            frozen: false,
            maxRange: null
        });
    }

    shootCoconut(plant) {
        this.projectiles.push({
            x: plant.x + 25,
            y: plant.y,
            lane: plant.gridY,
            speed: 5,
            damage: 300,
            splash: 90,
            coconut: true,
            frozen: false,
            maxRange: null
        });
    }
    update(deltaTime) {
        if (this.gameState !== 'playing' || this.isPaused) return;

        Object.keys(this.plantCooldowns).forEach(plant => {
            if (this.plantCooldowns[plant] > 0) this.plantCooldowns[plant]--;
        });

        this.updatePlantCooldownUI();
        if (this.updateUnplantableTiles) this.updateUnplantableTiles();

        this.zombieSpawnTimer += deltaTime;
        if (this.zombieSpawnTimer > this.getZombieSpawnRate()) {
            this.spawnZombie();
            this.zombieSpawnTimer = 0;
        }

        this.sunSpawnTimer += deltaTime;
        if (this.sunSpawnTimer > 600) {
            this.spawnSun();
            this.sunSpawnTimer = 0;
        }

        this.sunDrops = this.sunDrops.filter(sun => {
            if (sun.fromSky && sun.y < sun.targetY) {
                sun.y += sun.speed;
                return true;
            }
            if (sun.lifetime !== undefined) {
                sun.lifetime--;
                if (sun.lifetime <= 0) {
                    this.sunCount += sun.value;
                    this.updateUI();
                    return false;
                }
                return true;
            }
            this.sunCount += sun.value;
            this.updateUI();
            return false;
        });

        this.plants.forEach(plant => {
            plant.shootTimer++;
            const effectiveType = plant.copiedType || plant.type;

            if (effectiveType === 'sunflower') {
                plant.sunTimer++;
                if (plant.sunTimer > 600) {
                    this.sunDrops.push({ x: plant.x, y: plant.y, targetY: plant.y, speed: 0, value: 50, fromSky: false, lifetime: 300 });
                    plant.sunTimer = 0;
                }
            } else if (effectiveType === 'peashooter' || effectiveType === 'freezer' || effectiveType === 'bipeater') {
                const zombiesInLane = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x);
                if (zombiesInLane.length > 0 && plant.shootTimer > 120) {
                    if (effectiveType === 'bipeater') {
                        this.shootProjectile(plant, -5);
                        this.shootProjectile(plant, 5);
                    } else {
                        this.shootProjectile(plant);
                    }
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'sunshroom') {
                plant.sunTimer++;
                if (plant.sunTimer > 480) {
                    this.sunDrops.push({ x: plant.x, y: plant.y, targetY: plant.y, speed: 0, value: 25, fromSky: false, lifetime: 300 });
                    plant.sunTimer = 0;
                }
            } else if (effectiveType === 'puffshroom') {
                const zombiesInRange = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x && z.x < plant.x + 180);
                if (zombiesInRange.length > 0 && plant.shootTimer > 240) {
                    this.shootProjectile(plant, 0, 3);
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'fumeshroom') {
                const zombiesInRange = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x && z.x < plant.x + 250);
                if (zombiesInRange.length > 0 && plant.shootTimer > 300) {
                    this.shootFume(plant);
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'doomshroom') {
                if (!plant.hasExploded) {
                    if (this.explodeDoomShroom) this.explodeDoomShroom(plant);
                    plant.hasExploded = true;
                    plant.health = 0;
                }
            } else if (effectiveType === 'iceshroom') {
                if (!plant.hasFrozen) {
                    if (this.freezeAllZombies) this.freezeAllZombies(plant);
                    plant.hasFrozen = true;
                    plant.health = 0;
                }
            } else if (effectiveType === 'hypnoshroom') {
                const nearbyZombies = this.zombies.filter(z => !z.hypnotized && z.lane === plant.gridY && Math.abs(z.x - plant.x) < 60);
                if (nearbyZombies.length > 0 && !plant.hasHypnotized) {
                    const zombie = nearbyZombies[0];
                    zombie.hypnotized = true;
                    zombie.team = 'player';
                    plant.hasHypnotized = true;
                    plant.health = 0;
                }
            } else if (effectiveType === 'threepeater') {
                const mid = this.zombies.some(z => z.lane === plant.gridY && z.x > plant.x);
                const up = plant.gridY > 0 && this.zombies.some(z => z.lane === plant.gridY - 1 && z.x > plant.x);
                const down = plant.gridY < this.gridHeight - 1 && this.zombies.some(z => z.lane === plant.gridY + 1 && z.x > plant.x);
                if ((mid || up || down) && plant.shootTimer > 150) {
                    this.shootProjectile({ ...plant, gridY: plant.gridY, y: plant.y }, 0);
                    if (plant.gridY > 0) this.shootProjectile({ ...plant, gridY: plant.gridY - 1, y: plant.y - this.cellHeight }, 0);
                    if (plant.gridY < this.gridHeight - 1) this.shootProjectile({ ...plant, gridY: plant.gridY + 1, y: plant.y + this.cellHeight }, 0);
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'bloomerang') {
                const zombiesInLane = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x);
                if (zombiesInLane.length > 0 && plant.shootTimer > 270) {
                    this.shootBoomerang(plant);
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'cactus') {
                const closeZombies = this.zombies.filter(z => z.lane === plant.gridY && Math.abs(z.x - plant.x) < 70);
                if (closeZombies.length > 0) {
                    plant.hidden = true;
                    plant.spikeTimer = (plant.spikeTimer || 0) + 1;
                    if (plant.spikeTimer > 45) {
                        closeZombies.forEach(z => z.health -= 25);
                        plant.spikeTimer = 0;
                    }
                } else {
                    plant.hidden = false;
                    const zombiesInLane = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x);
                    if (zombiesInLane.length > 0 && plant.shootTimer > 130) {
                        this.shootSpine(plant);
                        plant.shootTimer = 0;
                    }
                }
            } else if (effectiveType === 'spikeweed' || effectiveType === 'spikerock') {
                const zombiesOnSpikes = this.zombies.filter(z => z.lane === plant.gridY && Math.abs(z.x - plant.x) < 45);
                plant.spikeTimer = (plant.spikeTimer || 0) + 1;
                if (zombiesOnSpikes.length > 0 && plant.spikeTimer > 40) {
                    const damage = effectiveType === 'spikerock' ? 55 : 30;
                    zombiesOnSpikes.forEach(z => z.health -= damage);
                    plant.spikeTimer = 0;
                }
            } else if (effectiveType === 'acidlemon') {
                const zombiesInLane = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x);
                if (zombiesInLane.length > 0 && plant.shootTimer > 120) {
                    this.shootAcidLemon(plant);
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'peapod') {
                const zombiesInLane = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x);
                if (zombiesInLane.length > 0 && plant.shootTimer > 120) {
                    const heads = plant.heads || 1;
                    for (let i = 0; i < heads; i++) {
                        this.shootProjectile(plant, (i - (heads - 1) / 2) * 5);
                    }
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'iceberg') {
                const target = this.zombies.find(z => z.lane === plant.gridY && Math.abs(z.x - plant.x) < 70);
                if (target && !plant.hasFrozen) {
                    target.frozen = true;
                    target.freezeTimer = 360;
                    plant.hasFrozen = true;
                    plant.health = 0;
                }
            } else if (effectiveType === 'gravebuster') {
                plant.bustTimer = (plant.bustTimer || 0) + 1;
                if (plant.bustTimer > 180) {
                    if (this.removeGraveAt) this.removeGraveAt(plant.gridX, plant.gridY);
                    plant.health = 0;
                }
            } else if (effectiveType === 'coconut') {
                const zombiesInLane = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x);
                if (zombiesInLane.length > 0 && plant.shootTimer > 480) {
                    this.shootCoconut(plant);
                    plant.shootTimer = 0;
                }
            } else if (effectiveType === 'peanut') {
                const zombiesInLane = this.zombies.filter(z => z.lane === plant.gridY && z.x > plant.x);
                if (zombiesInLane.length > 0 && plant.shootTimer > 120) {
                    this.shootProjectile(plant);
                    plant.shootTimer = 0;
                }
            }
        });

        this.plants = this.plants.filter(p => p.health > 0);

        this.zombies = this.zombies.filter(zombie => {
            if (zombie.frozen) {
                zombie.freezeTimer--;
                if (zombie.freezeTimer <= 0) zombie.frozen = false;
            }

            const speed = zombie.frozen ? zombie.speed * 0.3 : zombie.speed;
            const damage = zombie.frozen ? Math.ceil(this.getZombieDamage(zombie.type) * 0.5) : this.getZombieDamage(zombie.type);
            const attackSpeed = zombie.frozen ? 120 : 60;

            if (zombie.hypnotized && zombie.team === 'player') {
                let targetZombie = null;
                let nearestDistance = Infinity;
                this.zombies.forEach(other => {
                    if (other !== zombie && !other.hypnotized && other.lane === zombie.lane) {
                        const d = Math.abs(other.x - zombie.x);
                        if (d < nearestDistance) { nearestDistance = d; targetZombie = other; }
                    }
                });
                if (targetZombie && nearestDistance <= 45) {
                    zombie.attackTimer++;
                    if (zombie.attackTimer >= attackSpeed) {
                        targetZombie.health -= damage;
                        zombie.attackTimer = 0;
                    }
                } else {
                    zombie.x += speed;
                    zombie.attackTimer = 0;
                }
            } else {
                // Normal zombies can also attack hypnotized zombies
                let hypnoTarget = null;
                let hypnoDist = Infinity;
                this.zombies.forEach(other => {
                    if (other !== zombie && other.hypnotized && other.team === 'player' && other.lane === zombie.lane) {
                        const d = Math.abs(other.x - zombie.x);
                        if (d < hypnoDist) { hypnoDist = d; hypnoTarget = other; }
                    }
                });
                if (hypnoTarget && hypnoDist <= 45) {
                    zombie.attackTimer++;
                    if (zombie.attackTimer >= attackSpeed) {
                        hypnoTarget.health -= damage;
                        zombie.attackTimer = 0;
                    }
                } else {
                    let plantAhead = null;
                    for (let plant of this.plants) {
                        if (plant.gridY === zombie.lane && plant.x < zombie.x) {
                            const plantType = plant.copiedType || plant.type;
                            if (plantType === 'spikeweed' || plantType === 'spikerock' || (plantType === 'cactus' && plant.hidden)) continue;
                            const aheadType = plantAhead ? (plantAhead.copiedType || plantAhead.type) : null;
                            if (!plantAhead || plant.x > plantAhead.x || (plant.x === plantAhead.x && aheadType === 'lily' && plantType !== 'lily')) {
                                plantAhead = plant;
                            }
                        }
                    }
                    if (plantAhead && zombie.x - plantAhead.x <= 40) {
                        zombie.x = plantAhead.x + 40;
                        zombie.attackTimer++;
                        if (zombie.attackTimer >= attackSpeed) {
                            plantAhead.health -= damage;
                            zombie.attackTimer = 0;
                        }
                    } else {
                        zombie.x -= speed;
                        zombie.attackTimer = 0;
                    }
                }
            }

            if (!zombie.hypnotized && zombie.x < this.gridOffsetX) {
                const mower = this.lawnMowers && this.lawnMowers[zombie.lane];
                if (mower && !mower.used) {
                    mower.active = true;
                    mower.used = true;
                    mower.x = this.gridOffsetX - 35;
                    zombie.health = 0;
                } else {
                    this.gameOver(false);
                    return false;
                }
            }

            if (zombie.health <= 0) {
                if (!zombie.hypnotized) {
                    this.zombiesKilled++;
                    this.updateUI();
                    if (this.zombiesKilled >= this.levels[this.currentLevel].zombiesRequired) {
                        this.levelComplete();
                    }
                }
                return false;
            }

            return true;
        });

        if (this.lawnMowers) {
            this.lawnMowers.forEach(mower => {
                if (!mower.active) return;
                mower.x += 10;
                this.zombies.forEach(z => {
                    if (!z.hypnotized && z.lane === mower.lane && Math.abs(z.x - mower.x) < 45) {
                        z.health = 0;
                    }
                });
                if (mower.x > this.canvas.width + 60) mower.active = false;
            });
        }

        this.projectiles = this.projectiles.filter(projectile => {
            projectile.x += projectile.speed;
            projectile.hitZombieIds = projectile.hitZombieIds || [];

            if (projectile.boomerang && !projectile.returning && projectile.maxRange && projectile.x >= projectile.maxRange) {
                projectile.returning = true;
                projectile.speed = -Math.abs(projectile.speed);
            }

            if (projectile.maxRange && !projectile.boomerang && projectile.x > projectile.maxRange) {
                return false;
            }

            let hit = false;
            this.zombies.forEach(z => {
                if (z.hypnotized && z.team === 'player') return;
                if (z.lane === projectile.lane && Math.abs(z.x - projectile.x) < 20 && Math.abs(z.y - projectile.y) < 20) {
                    const hitKey = String(z.id || z.x) + (projectile.boomerang ? (projectile.returning ? ':return' : ':out') : '');
                    if (!projectile.hitZombieIds.includes(hitKey)) {
                        let dmg = projectile.damage;
                        if (projectile.acid && ['bucket','screenDoor','football'].includes(z.type)) {
                            dmg += 100;
                            z.corroded = true;
                        }
                        z.health -= dmg;
                        projectile.hitZombieIds.push(hitKey);
                        if (projectile.splash && z.health <= 0) {
                            this.zombies.forEach(o => {
                                if (o !== z && !o.hypnotized && Math.abs(o.x - z.x) < projectile.splash && Math.abs(o.y - z.y) < projectile.splash) {
                                    o.health -= Math.floor(projectile.damage * 0.6);
                                }
                            });
                        }
                        if (projectile.frozen) {
                            z.frozen = true;
                            z.freezeTimer = 180;
                        }
                        if (!projectile.piercing) hit = true;
                    }
                }
            });

            return (!hit || projectile.piercing || projectile.boomerang) && projectile.x < this.canvas.width && (!projectile.boomerang || projectile.x > this.gridOffsetX - 80);
        });
    }

    getZombieSpawnRate() {
        const levelConfig = this.levels[this.currentLevel];
        return Math.max(300, levelConfig.zombieSpawnRate); // Slower spawning
    }
    
    levelComplete() {
        this.gameState = 'levelcomplete';
        this.isPaused = true;
        
        // Unlock next level
        if (this.currentLevel < 16) {
            this.levels[this.currentLevel + 1].unlocked = true;
        }
        
        // Unlock plants based on level completed
        const newPlants = this.plantUnlockProgression[this.currentLevel];
        newPlants.forEach(plant => {
            if (!this.unlockedPlants.includes(plant)) {
                this.unlockedPlants.push(plant);
            }
        });
        
        // Save progress
        this.saveProgress();
        
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const subtitle = document.getElementById('overlaySub');
        
        if (this.currentLevel >= 16) {
            title.textContent = '🎉 ALL LEVELS COMPLETE! 🎉';
            title.className = 'overlay-title win-title';
            subtitle.textContent = 'You\'ve mastered all sixteen levels!';
            document.getElementById('nextLevelBtn').style.display = 'none';
        } else {
            title.textContent = `✅ LEVEL ${this.currentLevel} COMPLETE! ✅`;
            title.className = 'overlay-title win-title';
            subtitle.textContent = 'Great job! Ready for the next level?';
            document.getElementById('nextLevelBtn').style.display = 'inline-block';
        }
        
        overlay.style.display = 'flex';
    }
    
    updatePlantCooldownUI() {
        document.querySelectorAll('.plant-card').forEach(card => {
            const plantType = card.dataset.plant;
            const cooldownDiv = card.querySelector('.plant-cooldown');
            
            if (this.plantCooldowns[plantType] > 0) {
                cooldownDiv.style.display = 'flex';
                cooldownDiv.textContent = Math.ceil(this.plantCooldowns[plantType] / 60);
                card.style.opacity = '0.5';
            } else {
                cooldownDiv.style.display = 'none';
                card.style.opacity = '1';
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing') {
            // Draw grid
            this.drawGrid();

            // Draw craters / unplantable tiles
            if (this.drawUnplantableTiles) this.drawUnplantableTiles();

            // Draw graves (if any)
            if (this.drawGraves) this.drawGraves();

            // Draw lawn mowers
            if (this.drawLawnMowers) this.drawLawnMowers();
            
            // Draw plants
            this.plants.forEach(plant => {
                this.drawPlant(plant);
            });
            
            // Draw zombies
            this.zombies.forEach(zombie => {
                this.drawZombie(zombie);
            });
            
            // Draw projectiles
            this.projectiles.forEach(projectile => {
                this.drawProjectile(projectile);
            });
            
            // Draw sun drops
            this.sunDrops.forEach(sun => {
                this.drawSun(sun);
            });
        }
    }
    
    setupLevelHazards() {
        this.graves = [];
        if (!this.levels[this.currentLevel]?.hasGraves) return;
        const positions = [
            { gridX: 4, gridY: 0 }, { gridX: 5, gridY: 1 }, { gridX: 4, gridY: 2 },
            { gridX: 6, gridY: 3 }, { gridX: 5, gridY: 4 }
        ];
        positions.slice(0, this.currentLevel >= 38 ? 5 : 3).forEach(pos => this.graves.push({ ...pos }));
    }

    setupLawnMowers() {
        this.lawnMowers = Array.from({ length: this.gridHeight }, (_, lane) => ({
            lane,
            x: this.gridOffsetX - 35,
            y: this.gridOffsetY + lane * this.cellHeight + this.cellHeight / 2,
            active: false,
            used: false
        }));
    }

    hasGraveAt(gridX, gridY) {
        return (this.graves || []).some(g => g.gridX === gridX && g.gridY === gridY);
    }

    removeGraveAt(gridX, gridY) {
        this.graves = (this.graves || []).filter(g => !(g.gridX === gridX && g.gridY === gridY));
    }

    drawGraves() {
        (this.graves || []).forEach(grave => {
            const x = this.gridOffsetX + grave.gridX * this.cellWidth + this.cellWidth / 2;
            const y = this.gridOffsetY + grave.gridY * this.cellHeight + this.cellHeight / 2;
            this.ctx.fillStyle = '#696969';
            this.ctx.fillRect(x - 18, y - 28, 36, 48);
            this.ctx.fillStyle = '#4A4A4A';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 28, 18, Math.PI, 0);
            this.ctx.fill();
            this.ctx.fillStyle = '#DCDCDC';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('RIP', x, y - 4);
        });
    }

    drawLawnMowers() {
        (this.lawnMowers || []).forEach(mower => {
            if (mower.used && !mower.active) return;
            this.ctx.fillStyle = '#B22222';
            this.ctx.fillRect(mower.x - 20, mower.y + 20, 34, 16);
            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.arc(mower.x - 12, mower.y + 38, 5, 0, Math.PI * 2);
            this.ctx.arc(mower.x + 8, mower.y + 38, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawGrid() {
        // Check if current level has pool
        const hasPool = this.levels[this.currentLevel]?.hasPool || false;
        
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.gridOffsetX + i * this.cellWidth, this.gridOffsetY);
            this.ctx.lineTo(this.gridOffsetX + i * this.cellWidth, this.gridOffsetY + this.gridHeight * this.cellHeight);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= this.gridHeight; i++) {
            // Draw pool lanes (rows 2 and 3) if pool is enabled
            if (hasPool && (i === 2 || i === 3)) {
                // Draw water background for pool lanes
                this.ctx.fillStyle = 'rgba(64, 164, 223, 0.3)';
                this.ctx.fillRect(
                    this.gridOffsetX, 
                    this.gridOffsetY + i * this.cellHeight,
                    this.gridWidth * this.cellWidth,
                    this.cellHeight
                );
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.gridOffsetX, this.gridOffsetY + i * this.cellHeight);
            this.ctx.lineTo(this.gridOffsetX + this.gridWidth * this.cellWidth, this.gridOffsetY + i * this.cellHeight);
            this.ctx.stroke();
        }
        
        // Draw pool lane labels
        if (hasPool) {
            this.ctx.fillStyle = 'rgba(64, 164, 223, 0.8)';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('POOL', this.gridOffsetX + 5, this.gridOffsetY + 2.5 * this.cellHeight);
            this.ctx.fillText('POOL', this.gridOffsetX + 5, this.gridOffsetY + 3.5 * this.cellHeight);
        }
    }
    
    drawPlant(plant) {
        // Draw plant based on type with custom graphics
        switch(plant.type) {
            case 'sunflower':
                this.drawSunflower(plant.x, plant.y);
                break;
            case 'peashooter':
                this.drawPeashooter(plant.x, plant.y);
                break;
            case 'wallnut':
                this.drawWallnut(plant);
                break;
            case 'freezer':
                this.drawFreezer(plant.x, plant.y);
                break;
            case 'potato':
                this.drawPotatoMine(plant.x, plant.y, plant.armTimer || 0);
                break;
            case 'cherry':
                this.drawCherryBomb(plant.x, plant.y);
                break;
            case 'chomper':
                this.drawChomper(plant.x, plant.y, plant.eating);
                break;
            case 'bipeater':
                this.drawBipeater(plant.x, plant.y);
                break;
            case 'sunshroom':
                this.drawSunshroom(plant.x, plant.y);
                break;
            case 'puffshroom':
                this.drawPuffshroom(plant.x, plant.y);
                break;
            case 'fumeshroom':
                this.drawFumeshroom(plant.x, plant.y);
                break;
            case 'doomshroom':
                this.drawDoomshroom(plant.x, plant.y);
                break;
            case 'iceshroom':
                this.drawIceshroom(plant.x, plant.y);
                break;
            case 'hypnoshroom':
                this.drawHypnoshroom(plant.x, plant.y);
                break;
            case 'tallnut':
                this.drawTallnut(plant);
                break;
            case 'imitater':
                this.drawImitater(plant.x, plant.y, plant.copiedType || 'peashooter');
                break;
            case 'threepeater':
                this.drawThreepeater(plant.x, plant.y);
                break;
            case 'squash':
                this.drawSquash(plant.x, plant.y);
                break;
            case 'lily':
                this.drawLily(plant.x, plant.y);
                break;
            case 'jalapeno':
                this.drawJalapeno(plant.x, plant.y);
                break;
            case 'torchwood':
                this.drawTorchwood(plant.x, plant.y);
                break;
            case 'firepeashooter':
                this.drawFirepeashooter(plant.x, plant.y);
                break;
            case 'bonkchoy':
                this.drawBonkchoy(plant.x, plant.y);
                break;
            case 'bloomerang':
                this.drawBloomerang(plant.x, plant.y);
                break;
        }
        
        // Draw health bar always visible (except for exploded plants and instant-explode plants)
        if ((plant.type !== 'potato' || !plant.exploded) && 
            (plant.type !== 'cherry') && // Cherry bomb has no health
            (plant.type !== 'doomshroom' || plant.health > 0) &&
            (plant.type !== 'iceshroom' || plant.health > 0)) {
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(plant.x - 25, plant.y - 40, 50, 6);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(plant.x - 25, plant.y - 40, 50 * (plant.health / plant.maxHealth), 6);
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(plant.x - 25, plant.y - 40, 50, 6);
        }
    }
    
    explodePotatoMine(plant) {
        // Create small explosion effect (1x1 area)
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.beginPath();
        this.ctx.arc(plant.x, plant.y, 40, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Create single explosion ring
        this.ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(plant.x, plant.y, 30, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Damage zombies in small explosion radius (1x1 area)
        this.zombies = this.zombies.filter(zombie => {
            const distance = Math.sqrt((zombie.x - plant.x) ** 2 + (zombie.y - plant.y) ** 2);
            if (distance < 50) {
                zombie.health -= 3000; // Still high damage but small area
                if (zombie.health <= 0) {
                    this.zombiesKilled++;
                    this.updateUI();
                    
                    // Check win condition
                    if (this.zombiesKilled >= this.levels[this.currentLevel].zombiesRequired) {
                        this.levelComplete();
                    }
                    return false;
                }
            }
            return true;
        });
    }
    
    drawPotatoMine(x, y, armTimer) {
        // Draw potato mine (partially buried)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 10, 15, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw spikes
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const spikeX = x + Math.cos(angle) * 12;
            const spikeY = y + 10 + Math.sin(angle) * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + 10);
            this.ctx.lineTo(spikeX, spikeY);
            this.ctx.stroke();
        }
        
        // Draw warning light - changes color when armed
        if (armTimer > 180) {
            // Armed - green light
            this.ctx.fillStyle = '#00FF00';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 5, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw armed indicator
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y - 5, 8, 0, Math.PI * 2);
            this.ctx.stroke();
        } else {
            // Not armed - red light
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 5, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw arming progress
            const progress = armTimer / 180;
            this.ctx.strokeStyle = `rgba(255, 0, 0, ${progress})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y - 5, 8, -Math.PI / 2, Math.PI / 2);
            this.ctx.stroke();
        }
    }
    
    explodeCherryBomb(plant) {
        // Create massive 3x3 explosion effect
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(plant.x, plant.y, 120, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Create secondary explosion rings for 3x3 area
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 3;
        for (let i = 1; i <= 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(plant.x, plant.y, 40 + i * 40, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Damage all zombies in 3x3 area (approximately 3 grid squares)
        this.zombies = this.zombies.filter(zombie => {
            const distance = Math.sqrt((zombie.x - plant.x) ** 2 + (zombie.y - plant.y) ** 2);
            if (distance < 180) { // 3x3 area radius
                zombie.health -= 5000; // Massive damage
                if (zombie.health <= 0) {
                    this.zombiesKilled++;
                    this.updateUI();
                    
                    // Check win condition
                    if (this.zombiesKilled >= this.levels[this.currentLevel].zombiesRequired) {
                        this.levelComplete();
                    }
                    return false;
                }
            }
            return true;
        });
    }
    
    drawCherryBomb(x, y) {
        // Draw two cherries connected
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(x - 10, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 12);
        this.ctx.lineTo(x, y - 25);
        this.ctx.stroke();
        
        // Draw fuse
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 25);
        this.ctx.lineTo(x + 5, y - 30);
        this.ctx.stroke();
        
        // Draw spark
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.arc(x + 5, y - 30, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawChomper(x, y, eating) {
        // Draw head
        this.ctx.fillStyle = eating ? '#FF0000' : '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw teeth
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = -1; i <= 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i * 8, y + 10);
            this.ctx.lineTo(x + i * 8 - 3, y + 20);
            this.ctx.lineTo(x + i * 8 + 3, y + 20);
            this.ctx.fill();
        }
        
        // Draw eyes
        this.ctx.fillStyle = eating ? '#FFFF00' : '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x - 8, y - 5, 4, 0, Math.PI * 2);
        this.ctx.arc(x + 8, y - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 3, y - 30, 6, 15);
    }
    
    drawBipeater(x, y) {
        // Draw double head
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.arc(x - 8, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + 8, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw double snouts
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.ellipse(x - 8 + 15, y - 3, 8, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(x + 8 + 15, y - 3, 8, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x - 8 - 3, y - 3, 2, 0, Math.PI * 2);
        this.ctx.arc(x + 8 - 3, y - 3, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 3, y + 15, 6, 20);
    }
    
    drawSunshroom(x, y) {
        // Draw mushroom cap
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 5, 18, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw spots
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 5; i++) {
            const spotX = x + (Math.random() - 0.5) * 20;
            const spotY = y - 5 + (Math.random() - 0.5) * 8;
            this.ctx.beginPath();
            this.ctx.arc(spotX, spotY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw stem
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(x - 4, y + 5, 8, 15);
    }
    
    drawPuffshroom(x, y) {
        // Draw small mushroom cap
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 3, 12, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(x - 3, y + 3, 6, 10);
        
        // Draw puffs
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(x + 15 + i * 10, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawFumeshroom(x, y) {
        // Draw mushroom cap
        this.ctx.fillStyle = '#8B008B';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 5, 15, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(x - 3, y + 5, 6, 12);
        
        // Draw fumes
        this.ctx.fillStyle = 'rgba(139, 0, 139, 0.4)';
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.arc(x + 20 + i * 8, y + i * 2, 6, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawDoomshroom(x, y) {
        // Draw dark mushroom cap
        this.ctx.fillStyle = '#2F4F2F';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 8, 20, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw skull pattern
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y - 8, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 5, y - 8, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(x - 4, y + 7, 8, 15);
        
        // Draw warning aura
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawIceshroom(x, y) {
        // Draw ice mushroom cap
        this.ctx.fillStyle = '#00CED1';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 5, 16, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw ice crystals
        this.ctx.fillStyle = '#E0FFFF';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const crystalX = x + Math.cos(angle) * 12;
            const crystalY = y - 5 + Math.sin(angle) * 8;
            this.ctx.beginPath();
            this.ctx.moveTo(crystalX, crystalY);
            this.ctx.lineTo(crystalX - 3, crystalY - 5);
            this.ctx.lineTo(crystalX + 3, crystalY - 5);
            this.ctx.fill();
        }
        
        // Draw stem
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(x - 3, y + 7, 6, 12);
    }
    explodeDoomShroom(plant) {
        this.ctx.fillStyle = '#8B0000';
        this.ctx.beginPath();
        this.ctx.arc(plant.x, plant.y, 220, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = 'rgba(40, 0, 0, 0.65)';
        this.ctx.lineWidth = 4;
        for (let i = 1; i <= 4; i++) {
            this.ctx.beginPath();
            this.ctx.arc(plant.x, plant.y, 55 * i, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.createUnplantableTile(plant.gridX, plant.gridY);

        this.zombies = this.zombies.filter(zombie => {
            const distance = Math.sqrt((zombie.x - plant.x) ** 2 + (zombie.y - plant.y) ** 2);
            if (distance < 260) {
                zombie.health -= 5000;
                return zombie.health > 0;
            }
            return true;
        });
    }

    freezeAllZombies(plant) {
        this.ctx.fillStyle = 'rgba(0, 206, 209, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(plant.x, plant.y, 240, 0, Math.PI * 2);
        this.ctx.fill();

        this.zombies.forEach(zombie => {
            zombie.frozen = true;
            zombie.freezeTimer = 360; // 6 seconds
        });
    }

    drawHypnoshroom(x, y) {
        // Draw mushroom cap with spiral pattern
        this.ctx.fillStyle = '#9400D3';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 5, 16, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw hypnotic spiral
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const spiralX = x + Math.cos(angle) * 8;
            const spiralY = y - 5 + Math.sin(angle) * 6;
            this.ctx.moveTo(spiralX, spiralY);
            this.ctx.arc(spiralX, spiralY, 3, 0, Math.PI * 2);
        }
        this.ctx.stroke();
        
        // Draw stem
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(x - 3, y + 7, 6, 12);
        
        // Draw hypnotic waves
        this.ctx.strokeStyle = 'rgba(148, 0, 211, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(x, y - 35, 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawTallnut(plant) {
        // Draw tall nut body (taller than wallnut)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(plant.x - 15, plant.y - 30, 30, 60);
        
        // Draw tall nut pattern
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(plant.x - 15, plant.y - 30, 30, 60);
        
        // Draw vertical lines
        this.ctx.beginPath();
        this.ctx.moveTo(plant.x - 10, plant.y - 25);
        this.ctx.lineTo(plant.x - 10, plant.y + 25);
        this.ctx.moveTo(plant.x + 10, plant.y - 25);
        this.ctx.lineTo(plant.x + 10, plant.y + 25);
        this.ctx.stroke();
        
        // Draw health bar
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(plant.x - 25, plant.y - 50, 50, 6);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(plant.x - 25, plant.y - 50, 50 * (plant.health / plant.maxHealth), 6);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(plant.x - 25, plant.y - 50, 50, 6);
    }
    
    drawFiregourd(x, y, restTimer) {
        // Draw gourd body
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 18, 22, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw fire pattern
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw fire flames
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            const flameX = x + (i - 1) * 8;
            const flameY = y - 15;
            this.ctx.beginPath();
            this.ctx.moveTo(flameX, flameY);
            this.ctx.lineTo(flameX - 3, flameY - 8);
            this.ctx.lineTo(flameX + 3, flameY - 8);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Draw ready indicator when ready to fire
        if (restTimer > 480) {
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 25, 0, Math.PI * 2);
            this.ctx.stroke();
        } else {
            // Draw cooldown progress
            const progress = restTimer / 480;
            this.ctx.strokeStyle = `rgba(255, 69, 0, ${progress})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 25, -Math.PI / 2, Math.PI / 2);
            this.ctx.stroke();
        }
    }
    
    drawImitater(x, y, copiedType) {
        // Draw imitater base (purple/magenta color to distinguish)
        this.ctx.fillStyle = '#9370DB';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 20, 18, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw imitater pattern (duplicate symbol)
        this.ctx.strokeStyle = '#4B0082';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw copy icon
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('👥', x, y - 5);
        
        // Draw copied plant icon below
        this.ctx.font = '12px Arial';
        const copiedIcon = this.plantTypes[copiedType]?.icon || '🌱';
        this.ctx.fillText(copiedIcon, x, y + 10);
        
        // Draw shimmer effect to show it's copying
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 22, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawThreepeater(x, y) {
        // Draw three-headed plant
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 18, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw three heads
        for (let i = -1; i <= 1; i++) {
            const headY = y + i * 12;
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(x, headY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 3, y + 15, 6, 15);
    }
    
    drawSquash(x, y) {
        // Draw squash body (pumpkin-like)
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 20, 18, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw squash ridges
        this.ctx.strokeStyle = '#FF6347';
        this.ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i * 8, y - 15);
            this.ctx.lineTo(x + i * 8, y + 15);
            this.ctx.stroke();
        }
        
        // Draw stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 2, y - 20, 4, 8);
    }
    
    drawLily(x, y) {
        // Draw lily pad (floating platform)
        this.ctx.fillStyle = '#90EE90';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 25, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw lily pad details
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 20, y);
        this.ctx.lineTo(x + 20, y);
        this.ctx.stroke();
        
        // Draw lily flower
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * 8;
            const petalY = y + Math.sin(angle) * 8;
            this.ctx.beginPath();
            this.ctx.arc(petalX, petalY, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Flower center
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawJalapeno(x, y) {
        // Draw jalapeno body (pepper shape)
        this.ctx.fillStyle = '#006400';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 12, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw jalapeno tip
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 20);
        this.ctx.lineTo(x - 5, y - 25);
        this.ctx.lineTo(x + 5, y - 25);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw heat lines
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const lineX = x + (i - 1) * 8;
            this.ctx.beginPath();
            this.ctx.moveTo(lineX, y - 25);
            this.ctx.lineTo(lineX, y - 30);
            this.ctx.stroke();
        }
    }
    
    drawTorchwood(x, y) {
        // Draw torchwood trunk (burning log)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x - 8, y - 10, 16, 30);
        
        // Draw fire on top
        this.ctx.fillStyle = '#FF4500';
        for (let i = 0; i < 5; i++) {
            const flameX = x + (Math.random() - 0.5) * 20;
            const flameY = y - 15 - Math.random() * 10;
            this.ctx.beginPath();
            this.ctx.arc(flameX, flameY, 3 + Math.random() * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw orange flames
        this.ctx.fillStyle = '#FFA500';
        for (let i = 0; i < 3; i++) {
            const flameX = x + (Math.random() - 0.5) * 15;
            const flameY = y - 12 - Math.random() * 8;
            this.ctx.beginPath();
            this.ctx.arc(flameX, flameY, 2 + Math.random() * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw embers
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 2; i++) {
            const emberX = x + (Math.random() - 0.5) * 10;
            const emberY = y - 8 - Math.random() * 5;
            this.ctx.beginPath();
            this.ctx.arc(emberX, emberY, 1 + Math.random(), 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawFirepeashooter(x, y) {
        // Draw fire peashooter base (dark green with fire accents)
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 15, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw fire accents
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 12, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 3, y + 12, 6, 18);
        
        // Draw fire on mouth
        this.ctx.fillStyle = '#FF6347';
        for (let i = 0; i < 3; i++) {
            const flameX = x + 15 + i * 3;
            const flameY = y + (i - 1) * 4;
            this.ctx.beginPath();
            this.ctx.arc(flameX, flameY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawBonkchoy(x, y) {
        // Draw bonk choy body (cabbage-like)
        this.ctx.fillStyle = '#90EE90';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 18, 16, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw cabbage layers
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y + i * 6, 15 - Math.abs(i) * 2, 12 - Math.abs(i), 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw punching fist (closed)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(x + 20, y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw fist details
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 20, y - 8);
        this.ctx.lineTo(x + 20, y + 8);
        this.ctx.stroke();
    }
    
    drawBloomerang(x, y) {
        // Draw bloomerang base (flower-like)
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 16, 14, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw petals in boomerang shape
        this.ctx.fillStyle = '#FFB6C1';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * 12;
            const petalY = y + Math.sin(angle) * 10;
            this.ctx.beginPath();
            this.ctx.ellipse(petalX, petalY, 6, 4, angle, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw center
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw boomerang curve indicator
        this.ctx.strokeStyle = '#FF1493';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, -Math.PI / 4, Math.PI / 4);
        this.ctx.stroke();
    }
    
    drawSunflower(x, y) {
        // Stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 3, y + 10, 6, 25);
        
        // Petals
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * 18;
            const petalY = y + Math.sin(angle) * 18;
            this.ctx.beginPath();
            this.ctx.arc(petalX, petalY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Center
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPeashooter(x, y) {
        // Stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 3, y + 15, 6, 20);
        
        // Head
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Snout
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 20, y - 5, 12, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawWallnut(plant) {
        const x = plant.x;
        const y = plant.y;
        
        // Body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 18, 22, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cracks based on health
        this.ctx.strokeStyle = '#5D3A1A';
        this.ctx.lineWidth = 2;
        if (plant.health < plant.maxHealth * 0.7) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - 10, y - 15);
            this.ctx.lineTo(x + 5, y);
            this.ctx.stroke();
        }
        if (plant.health < plant.maxHealth * 0.4) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + 8, y - 10);
            this.ctx.lineTo(x - 5, y + 15);
            this.ctx.stroke();
        }
    }
    
    drawFreezer(x, y) {
        // Stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x - 3, y + 15, 6, 20);
        
        // Head
        this.ctx.fillStyle = '#00CED1';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ice crystals
        this.ctx.fillStyle = '#E0FFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 18, y - 5);
        this.ctx.lineTo(x - 12, y - 10);
        this.ctx.lineTo(x - 8, y - 5);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 18, y + 5);
        this.ctx.lineTo(x + 12, y + 10);
        this.ctx.lineTo(x + 8, y + 5);
        this.ctx.fill();
        
        // Eye
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawZombie(zombie) {
        // Apply freeze effect
        if (zombie.frozen) {
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.beginPath();
            this.ctx.arc(zombie.x, zombie.y, 25, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw zombie body with different color if hypnotized
        if (zombie.hypnotized && zombie.team === 'player') {
            this.ctx.fillStyle = '#9400D3'; // Purple for hypnotized zombies
        } else {
            this.ctx.fillStyle = '#6B8E23'; // Normal green
        }
        this.ctx.fillRect(zombie.x - 12, zombie.y - 15, 24, 35);
        
        // Head
        if (zombie.hypnotized && zombie.team === 'player') {
            this.ctx.fillStyle = '#DDA0DD'; // Light purple for hypnotized
        } else {
            this.ctx.fillStyle = '#8FBC8F'; // Normal green
        }
        this.ctx.beginPath();
        this.ctx.arc(zombie.x, zombie.y - 20, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes - different color for hypnotized zombies
        if (zombie.hypnotized && zombie.team === 'player') {
            this.ctx.fillStyle = '#FFD700'; // Gold eyes for hypnotized
        } else {
            this.ctx.fillStyle = 'red'; // Normal red eyes
        }
        this.ctx.beginPath();
        this.ctx.arc(zombie.x - 4, zombie.y - 22, 3, 0, Math.PI * 2);
        this.ctx.arc(zombie.x + 4, zombie.y - 22, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw hypnotic swirl above hypnotized zombies
        if (zombie.hypnotized && zombie.team === 'player') {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(zombie.x, zombie.y - 35, 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Arms
        this.ctx.fillStyle = '#6B8E23';
        this.ctx.fillRect(zombie.x - 20, zombie.y - 5, 8, 20);
        this.ctx.fillRect(zombie.x + 12, zombie.y - 5, 8, 20);
        
        // Legs
        this.ctx.fillRect(zombie.x - 10, zombie.y + 20, 7, 15);
        this.ctx.fillRect(zombie.x + 3, zombie.y + 20, 7, 15);
        
        // Draw based on type
        switch(zombie.type) {
            case 'cone':
                // Cone hat
                this.ctx.fillStyle = '#FF6347';
                this.ctx.beginPath();
                this.ctx.moveTo(zombie.x - 10, zombie.y - 35);
                this.ctx.lineTo(zombie.x + 10, zombie.y - 35);
                this.ctx.lineTo(zombie.x, zombie.y - 50);
                this.ctx.fill();
                break;
            case 'bucket':
                // Bucket hat
                this.ctx.fillStyle = '#708090';
                this.ctx.fillRect(zombie.x - 12, zombie.y - 42, 24, 20);
                this.ctx.fillRect(zombie.x - 15, zombie.y - 42, 30, 6);
                break;
        }
        
        // Draw health bar always visible
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(zombie.x - 25, zombie.y - 55, 50, 6);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(zombie.x - 25, zombie.y - 55, 50 * (zombie.health / zombie.maxHealth), 6);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(zombie.x - 25, zombie.y - 55, 50, 6);
    }
    
    drawProjectile(projectile) {
        this.ctx.fillStyle = projectile.type === 'freeze' ? '#00BFFF' : '#90EE90';
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    collectSunAt(x, y) {
        // Check if click is on any sun
        for (let i = this.sunDrops.length - 1; i >= 0; i--) {
            const sun = this.sunDrops[i];
            const distance = Math.sqrt((x - sun.x) ** 2 + (y - sun.y) ** 2);
            
            if (distance < 20) { // Click radius for sun
                this.sunCount += sun.value;
                this.sunDrops.splice(i, 1);
                this.updateUI();
                return true;
            }
        }
        return false;
    }
    
    isHoveringOverSun(x, y) {
        // Check if hovering over any sun
        for (const sun of this.sunDrops) {
            const distance = Math.sqrt((x - sun.x) ** 2 + (y - sun.y) ** 2);
            if (distance < 20) {
                return true;
            }
        }
        return false;
    }
    
    drawSun(sun) {
        // Draw sun with hover effect
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = this.lastMouseX || 0;
        const mouseY = this.lastMouseY || 0;
        
        // Check if mouse is hovering over this sun
        const distance = Math.sqrt((mouseX - sun.x) ** 2 + (mouseY - sun.y) ** 2);
        const isHovering = distance < 20;
        
        // Draw glow effect when hovering
        if (isHovering) {
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
        }
        
        this.ctx.font = isHovering ? '28px Arial' : '25px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('☀️', sun.x, sun.y);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    updateUI() {
        document.getElementById('sunCount').textContent = this.sunCount;
        document.getElementById('levelName').textContent = this.levels[this.currentLevel].name;
        const required = this.levels[this.currentLevel].zombiesRequired;
        document.getElementById('waveCount').textContent = `${this.zombiesKilled}/${required}`;
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    startGame(level = 1) {
        if (!this.levels[level].unlocked) {
            return; // Can't start locked level
        }
        
        this.currentLevel = level;
        this.showPlantSelection(level);
    }
    
    showPlantSelection(level) {
        this.currentLevel = level;
        this.selectedLevelPlants = [...this.defaultPlants[level]];
        
        // Hide other UI elements
        document.getElementById('gameMenu').style.display = 'none';
        document.getElementById('levelSelect').style.display = 'none';
        document.getElementById('gameHUD').style.display = 'none';
        document.getElementById('plantSelector').style.display = 'none';
        
        // Show plant selection screen
        this.createPlantSelectionScreen();
    }
    
    createPlantSelectionScreen() {
        const existingScreen = document.getElementById('plantSelectionScreen');
        if (existingScreen) {
            existingScreen.remove();
        }
        
        const screen = document.createElement('div');
        screen.id = 'plantSelectionScreen';
        screen.className = 'plant-selection-screen';
        
        const maxPlants = this.levels[this.currentLevel].maxPlants;
        
        screen.innerHTML = `
            <div class="plant-selection-title">Select Your Plants (Max ${maxPlants})</div>
            <div class="plant-selection-grid" id="plantSelectionGrid"></div>
            <div class="plant-selection-info">
                <div class="selected-count">Selected: <span id="selectedCount">${this.selectedLevelPlants.length}</span>/${maxPlants}</div>
                <div class="selection-buttons">
                    <button class="btn-back" onclick="game.backToLevelSelect()">← BACK</button>
                    <button class="btn-start" id="confirmPlantsBtn" onclick="game.confirmPlantSelection()">START LEVEL</button>
                </div>
            </div>
        `;
        
        document.getElementById('ui').appendChild(screen);
        
        // Populate plant grid
        this.populatePlantSelectionGrid();
    }
    
    getPlantBadgeHTML(plantType) {
        const labels = {
            sunflower: 'SF', peashooter: 'PE', wallnut: 'WN', freezer: 'SN', potato: 'PM', cherry: 'CB',
            chomper: 'CH', bipeater: 'RP', sunshroom: 'SS', puffshroom: 'PS', fumeshroom: 'FS',
            doomshroom: 'DS', iceshroom: 'IS', hypnoshroom: 'HY', tallnut: 'TN', imitater: 'IM',
            threepeater: 'TP', squash: 'SQ', lily: 'LP', jalapeno: 'JA', torchwood: 'TW',
            firepeashooter: 'FP', bonkchoy: 'BC', bloomerang: 'BR', cactus: 'CA', spikeweed: 'SW',
            spikerock: 'SR', acidlemon: 'AL', peapod: 'PP', iceberg: 'IL', gravebuster: 'GB',
            coconut: 'CC', peanut: 'PN'
        };
        const renderType = plantType === 'imitater' ? (this.getImitaterCopyType() || 'imitater') : plantType;
        const label = labels[plantType] || plantType.slice(0, 2).toUpperCase();
        return `<span class="plant-badge plant-badge-${renderType}" data-label="${label}"></span>`;
    }

    populatePlantSelectionGrid() {
        const grid = document.getElementById('plantSelectionGrid');
        grid.innerHTML = '';
        
        Object.keys(this.plantTypes).forEach(plantType => {
            const plant = this.plantTypes[plantType];
            const isUnlocked = this.unlockedPlants.includes(plantType);
            const isSelected = this.selectedLevelPlants.includes(plantType);
            
            const plantCard = document.createElement('div');
            plantCard.className = 'plant-selection-card';
            if (!isUnlocked) plantCard.classList.add('locked');
            if (isSelected) plantCard.classList.add('selected');
            
            plantCard.innerHTML = `
                <div class="plant-icon">${isUnlocked ? this.getPlantBadgeHTML(plantType) : '<span class="plant-lock">LOCK</span>'}</div>
                <div class="plant-name">${plant.name}</div>
                <div class="plant-cost">${isUnlocked ? plantCard.dataset.cost + ' ☀️' : 'LOCKED'}</div>
                <div class="plant-desc">${plant.description}</div>
                ${!isUnlocked ? '<div class="lock-requirement">Complete Day ' + this.getPlantUnlockLevel(plantType) + '</div>' : ''}
            `;
            
            if (isUnlocked) {
                plantCard.addEventListener('click', () => this.togglePlantSelection(plantType));
            }
            
            grid.appendChild(plantCard);
        });
        
        this.updatePlantSelectionUI();
    }
    
    getPlantUnlockLevel(plantType) {
        for (let level = 1; level <= 16; level++) {
            if (this.plantUnlockProgression[level].includes(plantType)) {
                return level;
            }
        }
        return 1;
    }
    
    togglePlantSelection(plantType) {
        const maxPlants = this.levels[this.currentLevel].maxPlants;
        const index = this.selectedLevelPlants.indexOf(plantType);
        
        if (index > -1) {
            // Remove plant if selected
            this.selectedLevelPlants.splice(index, 1);
        } else if (this.selectedLevelPlants.length < maxPlants) {
            // Add plant if under limit
            this.selectedLevelPlants.push(plantType);
        }
        
        this.populatePlantSelectionGrid();
    }
    
    updatePlantSelectionUI() {
        const maxPlants = this.levels[this.currentLevel].maxPlants;
        const selectedCount = this.selectedLevelPlants.length;
        
        document.getElementById('selectedCount').textContent = selectedCount;
        
        const confirmBtn = document.getElementById('confirmPlantsBtn');
        confirmBtn.disabled = selectedCount === 0;
        confirmBtn.style.opacity = selectedCount === 0 ? '0.5' : '1';
        confirmBtn.style.cursor = selectedCount === 0 ? 'not-allowed' : 'pointer';
    }
    
    confirmPlantSelection() {
        if (this.selectedLevelPlants.length === 0) return;
        
        // Remove plant selection screen
        document.getElementById('plantSelectionScreen').remove();
        
        // Start the actual game
        this.startActualGame();
    }
    
    startActualGame() {
        this.gameState = 'playing';
        this.sunCount = 50;
        this.zombiesKilled = 0;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.sunDrops = [];
        this.unplantableTiles = [];
        this.setupLevelHazards();
        this.setupLawnMowers();
        this.zombieSpawnTimer = 0;
        this.sunSpawnTimer = 0;
        
        // Reset cooldowns
        Object.keys(this.plantCooldowns).forEach(plant => {
            this.plantCooldowns[plant] = 0;
        });
        
        // Update plant selector for this level
        this.updatePlantSelector();
        
        // Update UI
        document.getElementById('gameHUD').style.display = 'flex';
        document.getElementById('plantSelector').style.display = 'flex';
        this.updateUI();
    }
    
    backToLevelSelect() {
        document.getElementById('plantSelectionScreen').remove();
        document.getElementById('levelSelect').style.display = 'flex';
    }
    
    updatePlantSelector() {
        const plantSelector = document.getElementById('plantSelector');
        plantSelector.innerHTML = '';
        
        // Use selected plants for this level
        const levelPlants = this.selectedLevelPlants;
        
        levelPlants.forEach(plantType => {
            const plant = this.plantTypes[plantType];
            const isUnlocked = this.unlockedPlants.includes(plantType);
            
            const plantCard = document.createElement('div');
            plantCard.className = 'plant-card';
            plantCard.dataset.plant = plantType;
            plantCard.dataset.cost = this.getPlantCostForSeed ? this.getPlantCostForSeed(plantType) : plant.cost;
            
            if (!isUnlocked) {
                plantCard.classList.add('locked');
            }
            
            plantCard.innerHTML = `
                <div class="plant-icon">${isUnlocked ? this.getPlantBadgeHTML(plantType) : '<span class="plant-lock">LOCK</span>'}</div>
                <div class="plant-cost">${isUnlocked ? plant.cost + ' ☀️' : 'LOCKED'}</div>
                <div class="plant-cooldown" style="display: none;"></div>
                ${!isUnlocked ? '<div class="lock-text">Complete Level 2</div>' : ''}
            `;
            
            if (isUnlocked) {
                plantCard.addEventListener('click', (e) => {
                    const cost = parseInt(plantCard.dataset.cost);
                    
                    if (this.sunCount >= cost && this.plantCooldowns[plantType] <= 0) {
                        // Deselect all cards
                        document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
                        // Select this card
                        plantCard.classList.add('selected');
                        const copiedType = plantType === 'imitater' ? this.getImitaterCopyType() : plantType;
                    if (plantType === 'imitater' && !copiedType) return;
                    const realCost = this.getPlantCostForSeed ? this.getPlantCostForSeed(plantType) : cost;
                    this.selectedPlant = { type: plantType, cost: realCost, copiedType: copiedType };
                    }
                });
            }
            
            plantSelector.appendChild(plantCard);
        });
    }
    
    skipLevel() {
        // Skip current level and unlock the next level
        const currentLevel = this.currentLevel;
        const nextLevel = currentLevel + 1;
        
        if (nextLevel <= 39) {
            // Unlock the next level
            this.levels[nextLevel].unlocked = true;
            
            // Unlock all plants that should be available at the skipped level
            const plantsToUnlock = this.plantUnlockProgression[nextLevel] || [];
            
            // Update the saved progress to include the new unlocked plants
            const progress = {
                unlockedLevels: Object.keys(this.levels)
                    .filter(level => this.levels[level].unlocked)
                    .map(level => parseInt(level)),
                unlockedPlants: plantsToUnlock
            };
            
            localStorage.setItem('pvz_progress', JSON.stringify(progress));
            
            // Update UI to show unlocked level
            const levelCard = document.getElementById(`level${nextLevel}`);
            if (levelCard) {
                levelCard.classList.remove('locked');
                const lockIcon = levelCard.querySelector('.lock-icon');
                if (lockIcon) {
                    lockIcon.style.display = 'none';
                }
            }
            
            // Update plant selector if it's visible
            this.updatePlantSelector();
            
            // Show confirmation message
            if (typeof showSkipConfirmation === 'function') {
                showSkipConfirmation(currentLevel, nextLevel);
            }
        } else {
            // All levels already unlocked
            if (typeof showSkipMessage === 'function') {
                showSkipMessage("You've already unlocked all levels!");
            }
        }
    }
    
    updateLevelCards() {
        const levelCards = document.querySelectorAll('.level-card');
        levelCards.forEach((card, index) => {
            const levelNum = index + 1;
            const level = this.levels[levelNum];
            
            if (level.unlocked) {
                card.classList.remove('locked');
                card.onclick = () => startGame(levelNum);
            } else {
                card.classList.add('locked');
                card.onclick = null;
            }
        });
    }
    
    gameOver(won) {
        this.gameState = 'gameover';
        this.isPaused = true;
        
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const subtitle = document.getElementById('overlaySub');
        
        if (won) {
            title.textContent = '🎉 VICTORY! 🎉';
            title.className = 'overlay-title win-title';
            subtitle.textContent = 'You defended your garden successfully!';
        } else {
            title.textContent = '💀 GAME OVER 💀';
            title.className = 'overlay-title lose-title';
            subtitle.textContent = 'The zombies ate your brains!';
        }
        
        overlay.style.display = 'flex';
    }
    
    backToMenu() {
        this.gameState = 'menu';
        this.isPaused = false;
        
        document.getElementById('gameMenu').style.display = 'flex';
        document.getElementById('gameHUD').style.display = 'none';
        document.getElementById('plantSelector').style.display = 'none';
        document.getElementById('gameOverlay').style.display = 'none';
    }
}

// Global game instance
let game;

// Start the game when page loads
window.addEventListener('load', () => {
    game = new PVZGame();
});

// Global functions for button clicks
function startGame(level = 1) {
    game.startGame(level);
}

function showLevelSelect() {
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('levelSelect').style.display = 'flex';
    
    // Update level cards to show locked/unlocked status
    game.updateLevelCards();
}

function nextLevel() {
    if (game.currentLevel < 16) {
        game.startGame(game.currentLevel + 1);
    } else {
        game.backToMenu();
    }
}

function showPlantSelection(level) {
    game.showPlantSelection(level);
}

function backToMenu() {
    game.backToMenu();
}
