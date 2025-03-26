/**
 * NumberMerge2048 Website JavaScript
 * - Handles animations, navigation, and interactive elements
 * - Enhanced to match the app's behavior and styling
 */

// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');
const gameBoard = document.querySelector('.game-board');
const floatingTilesContainer = document.querySelector('.floating-tiles-container');
const steps = document.querySelectorAll('.step');
const powerUpButtons = document.querySelectorAll('.power-up-button');
const powerUpInstruction = document.getElementById('powerUpInstruction');
const scoreValue = document.querySelector('.score-value');
const gameEffectsContainer = document.getElementById('gameEffectsContainer');

// Game state
let score = 0;
let activePowerUp = null;
let tileValues = [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 4, 0, 0, 0, 2, 0];
let selectedTiles = [];

// Tile colors mapping - Using the exact colors from the app's Color.kt
const tileColors = {
    0: '#CDC1B4',
    2: '#EEE4DA',
    4: '#EDE0C8',
    8: '#F2B179',
    16: '#F59563',
    32: '#F67C5F',
    64: '#F65E3B',
    128: '#EDCF72',
    256: '#EDCC61',
    512: '#EDC850',
    1024: '#EDC53F',
    2048: '#EDC22E',
    4096: '#3C92CA',
    8192: '#2A6FEF',
    16384: '#633AD6',
    32768: '#954FE3',
    65536: '#D362F2'
};

// Tile text colors - Dark for small values, light for larger values
const tileTextColors = {
    0: 'transparent',
    2: '#776E65',
    4: '#776E65',
    8: '#FFFFFF',
    16: '#FFFFFF',
    32: '#FFFFFF',
    64: '#FFFFFF',
    128: '#FFFFFF',
    256: '#FFFFFF',
    512: '#FFFFFF',
    1024: '#FFFFFF',
    2048: '#FFFFFF',
    4096: '#FFFFFF',
    8192: '#FFFFFF',
    16384: '#FFFFFF',
    32768: '#FFFFFF',
    65536: '#FFFFFF'
};

// Power-up instruction messages
const powerUpInstructions = {
    'swap': 'Select two tiles to swap their positions',
    'bomb': 'Select a tile to remove it',
    'freeze': 'Select a tile to freeze it (prevents merging)',
    'undo': '' // No instruction for undo since it's immediate
};

// Initialize the website when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    createGameBoard();
    createFloatingTiles();
    initializePowerUps();
    animateSteps();
    handleScrollEffects();
});

/**
 * Initialize mobile navigation
 */
function initializeNavigation() {
    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Change navbar style on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }
    });
}

/**
 * Create the game board demo in the hero section
 */
function createGameBoard() {
    gameBoard.innerHTML = '';
    
    tileValues.forEach((value, index) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.row = Math.floor(index / 4);
        tile.dataset.col = index % 4;
        tile.dataset.index = index;
        
        // Only show tiles with values
        if (value > 0) {
            tile.textContent = value;
            tile.style.backgroundColor = tileColors[value];
            tile.style.color = tileTextColors[value];
            tile.style.setProperty('--delay', index);
        } else {
            tile.style.backgroundColor = tileColors[0];
            tile.style.opacity = '0.35';
            tile.style.transform = 'scale(1)';
        }
        
        // Add click event for power-up interactions
        tile.addEventListener('click', () => handleTileClick(tile));
        
        gameBoard.appendChild(tile);
    });
    
    // Add random tile to the board every few seconds
    setInterval(addRandomTile, 5000);
}

/**
 * Handle tile click for power-up interactions
 */
function handleTileClick(tile) {
    const index = parseInt(tile.dataset.index);
    const value = tileValues[index];
    
    // Only react to clicks when a power-up is active or the tile has a value
    if (!activePowerUp && value === 0) return;
    
    // Handle different power-ups
    if (activePowerUp === 'swap') {
        handleSwapPowerUp(tile, index);
    } else if (activePowerUp === 'bomb') {
        handleBombPowerUp(tile, index);
    } else if (activePowerUp === 'freeze') {
        handleFreezePowerUp(tile, index);
    }
}

/**
 * Handle swap power-up
 */
function handleSwapPowerUp(tile, index) {
    // If no value, don't select
    if (tileValues[index] === 0) return;
    
    // Toggle selection of the tile
    if (selectedTiles.includes(index)) {
        // Deselect
        selectedTiles = selectedTiles.filter(i => i !== index);
        tile.style.border = 'none';
    } else {
        // Select
        selectedTiles.push(index);
        tile.style.border = '2px solid #5C6BC0';
    }
    
    // If we have 2 tiles selected, perform swap
    if (selectedTiles.length === 2) {
        const [index1, index2] = selectedTiles;
        const tempValue = tileValues[index1];
        tileValues[index1] = tileValues[index2];
        tileValues[index2] = tempValue;
        
        // Update visuals with animation
        updateTilesAfterSwap(index1, index2);
        
        // Reset selections
        selectedTiles = [];
        document.querySelectorAll('.tile').forEach(t => t.style.border = 'none');
        
        // Decrease power-up count
        decreasePowerUpCount('swap');
        
        // Reset active power-up
        setActivePowerUp(null);
    }
}

/**
 * Handle bomb power-up
 */
function handleBombPowerUp(tile, index) {
    // If no value, don't bomb
    if (tileValues[index] === 0) return;
    
    // Remove the tile (set to 0)
    tileValues[index] = 0;
    
    // Update visual
    tile.textContent = '';
    tile.style.backgroundColor = tileColors[0];
    tile.style.opacity = '0.35';
    
    // Add explosion effect
    addExplosionEffect(tile);
    
    // Decrease power-up count
    decreasePowerUpCount('bomb');
    
    // Reset active power-up
    setActivePowerUp(null);
}

/**
 * Handle freeze power-up
 */
function handleFreezePowerUp(tile, index) {
    // If no value, don't freeze
    if (tileValues[index] === 0) return;
    
    // Toggle frozen state
    if (tile.dataset.frozen === 'true') {
        tile.dataset.frozen = 'false';
        tile.style.boxShadow = 'none';
    } else {
        tile.dataset.frozen = 'true';
        tile.style.boxShadow = '0 0 10px 2px #42A5F5';
    }
    
    // Add freeze effect
    addFreezeEffect(tile);
    
    // Decrease power-up count
    decreasePowerUpCount('freeze');
    
    // Reset active power-up
    setActivePowerUp(null);
}

/**
 * Initialize power-up buttons
 */
function initializePowerUps() {
    powerUpButtons.forEach(button => {
        const type = button.dataset.type;
        
        button.addEventListener('click', () => {
            // If this is already the active power-up, deactivate it
            if (activePowerUp === type) {
                setActivePowerUp(null);
                return;
            }
            
            // For undo, apply immediately
            if (type === 'undo') {
                decreasePowerUpCount('undo');
                // Just add a random tile for the demo
                addRandomTile();
                return;
            }
            
            // Otherwise set as active power-up
            setActivePowerUp(type);
        });
    });
}

/**
 * Set the active power-up
 */
function setActivePowerUp(type) {
    // Reset all power-up buttons
    powerUpButtons.forEach(btn => {
        btn.dataset.active = 'false';
    });
    
    // Reset selected tiles
    selectedTiles = [];
    document.querySelectorAll('.tile').forEach(t => t.style.border = 'none');
    
    // Set new active power-up
    activePowerUp = type;
    
    // Update instruction
    if (type) {
        const button = document.querySelector(`.power-up-button[data-type="${type}"]`);
        button.dataset.active = 'true';
        powerUpInstruction.textContent = powerUpInstructions[type];
        powerUpInstruction.style.display = 'flex';
    } else {
        powerUpInstruction.style.display = 'none';
    }
}

/**
 * Decrease power-up count
 */
function decreasePowerUpCount(type) {
    const countElement = document.querySelector(`.power-up-button[data-type="${type}"] .power-up-count`);
    let count = parseInt(countElement.textContent);
    if (count > 0) {
        count--;
        countElement.textContent = count;
    }
}

/**
 * Add a random tile to the game board demo
 */
function addRandomTile() {
    const emptyIndices = [];
    
    // Find all empty cells
    tileValues.forEach((value, index) => {
        if (value === 0) {
            emptyIndices.push(index);
        }
    });
    
    if (emptyIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        const tileIndex = emptyIndices[randomIndex];
        const value = Math.random() < 0.9 ? 2 : 4;
        
        // Update game state
        tileValues[tileIndex] = value;
        
        // Update visual
        const tile = document.querySelector(`.tile[data-index="${tileIndex}"]`);
        tile.textContent = value;
        tile.style.backgroundColor = tileColors[value];
        tile.style.color = tileTextColors[value];
        tile.style.opacity = '1';
        tile.style.transform = 'scale(0)';
        
        // Force reflow
        void tile.offsetWidth;
        
        // Apply the animation
        tile.style.transform = 'scale(1)';
        tile.style.transition = 'transform 0.2s ease';
        
        // Perform a merge after a delay
        setTimeout(() => {
            tryToMergeTiles();
        }, 2000);
    }
}

/**
 * Try to merge tiles on the game board demo
 */
function tryToMergeTiles() {
    // Find pairs of the same value
    const pairs = findMergablePairs();
    
    if (pairs.length > 0) {
        // Randomly select one pair to merge
        const randomPairIndex = Math.floor(Math.random() * pairs.length);
        const [index1, index2] = pairs[randomPairIndex];
        
        const value = tileValues[index1];
        const newValue = value * 2;
        
        // Update game state
        tileValues[index1] = newValue;
        tileValues[index2] = 0;
        
        // Update score
        updateScore(newValue);
        
        // Update visuals
        const tile1 = document.querySelector(`.tile[data-index="${index1}"]`);
        const tile2 = document.querySelector(`.tile[data-index="${index2}"]`);
        
        // Animate tile merge
        animateMerge(tile1, tile2, newValue);
    }
}

/**
 * Find pairs of tiles that can be merged
 */
function findMergablePairs() {
    const pairs = [];
    
    // Check horizontal pairs
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const index1 = row * 4 + col;
            const index2 = row * 4 + col + 1;
            
            if (tileValues[index1] > 0 && tileValues[index1] === tileValues[index2]) {
                pairs.push([index1, index2]);
            }
        }
    }
    
    // Check vertical pairs
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 3; row++) {
            const index1 = row * 4 + col;
            const index2 = (row + 1) * 4 + col;
            
            if (tileValues[index1] > 0 && tileValues[index1] === tileValues[index2]) {
                pairs.push([index1, index2]);
            }
        }
    }
    
    return pairs;
}

/**
 * Animate the merging of tiles
 */
function animateMerge(tile1, tile2, newValue) {
    // First animate tile2 moving to tile1
    const tile1Rect = tile1.getBoundingClientRect();
    const tile2Rect = tile2.getBoundingClientRect();
    
    const deltaX = tile1Rect.left - tile2Rect.left;
    const deltaY = tile1Rect.top - tile2Rect.top;
    
    // Move tile2 to tile1
    tile2.style.transition = 'transform 0.2s ease';
    tile2.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    tile2.style.opacity = '0';
    
    // After movement, update tile1 and reset tile2
    setTimeout(() => {
        // Show score increase
        showScoreIncrease(newValue, tile1Rect);
        
        // Update tile1
        tile1.style.transition = 'all 0.2s ease';
        tile1.textContent = newValue;
        tile1.style.backgroundColor = tileColors[newValue];
        tile1.style.color = tileTextColors[newValue];
        
        // Pulse animation for tile1
        tile1.style.transform = 'scale(1.1)';
        setTimeout(() => {
            tile1.style.transform = 'scale(1)';
        }, 100);
        
        // Reset tile2
        tile2.style.transition = 'none';
        tile2.style.transform = 'scale(1)';
        tile2.textContent = '';
        tile2.style.backgroundColor = tileColors[0];
        tile2.style.opacity = '0.35';
    }, 200);
}

/**
 * Update tiles after a swap
 */
function updateTilesAfterSwap(index1, index2) {
    const tile1 = document.querySelector(`.tile[data-index="${index1}"]`);
    const tile2 = document.querySelector(`.tile[data-index="${index2}"]`);
    
    // Get the new values
    const value1 = tileValues[index1];
    const value2 = tileValues[index2];
    
    // Update tile1
    tile1.textContent = value1 > 0 ? value1 : '';
    tile1.style.backgroundColor = tileColors[value1];
    tile1.style.color = tileTextColors[value1];
    tile1.style.opacity = value1 > 0 ? '1' : '0.35';
    
    // Update tile2
    tile2.textContent = value2 > 0 ? value2 : '';
    tile2.style.backgroundColor = tileColors[value2];
    tile2.style.color = tileTextColors[value2];
    tile2.style.opacity = value2 > 0 ? '1' : '0.35';
    
    // Add swap animation effect
    animateSwap(tile1, tile2);
}

/**
 * Animate swap between two tiles
 */
function animateSwap(tile1, tile2) {
    const tile1Rect = tile1.getBoundingClientRect();
    const tile2Rect = tile2.getBoundingClientRect();
    
    const deltaX1 = tile2Rect.left - tile1Rect.left;
    const deltaY1 = tile2Rect.top - tile1Rect.top;
    
    const deltaX2 = tile1Rect.left - tile2Rect.left;
    const deltaY2 = tile1Rect.top - tile2Rect.top;
    
    // Animate tile1 to tile2 position
    tile1.style.transition = 'transform 0.3s ease';
    tile1.style.transform = `translate(${deltaX1}px, ${deltaY1}px)`;
    
    // Animate tile2 to tile1 position
    tile2.style.transition = 'transform 0.3s ease';
    tile2.style.transform = `translate(${deltaX2}px, ${deltaY2}px)`;
    
    // Reset positions after animation
    setTimeout(() => {
        tile1.style.transition = 'none';
        tile2.style.transition = 'none';
        tile1.style.transform = 'scale(1)';
        tile2.style.transform = 'scale(1)';
    }, 300);
}

/**
 * Show score increase animation
 */
function showScoreIncrease(points, tileRect) {
    // Update total score
    score += points;
    scoreValue.textContent = score;
    
    // Create score animation element
    const scoreEl = document.createElement('div');
    scoreEl.classList.add('score-increase');
    scoreEl.textContent = `+${points}`;
    
    // Position relative to the merged tile
    const x = tileRect.left + (tileRect.width / 2) - 20;
    const y = tileRect.top - 20;
    
    scoreEl.style.left = `${x}px`;
    scoreEl.style.top = `${y}px`;
    
    // Add to effects container
    gameEffectsContainer.appendChild(scoreEl);
    
    // Remove after animation completes
    setTimeout(() => {
        scoreEl.remove();
    }, 1500);
}

/**
 * Add explosion effect for bomb power-up
 */
function addExplosionEffect(tile) {
    const tileRect = tile.getBoundingClientRect();
    
    // Create explosion container
    const explosion = document.createElement('div');
    explosion.style.position = 'fixed';
    explosion.style.left = `${tileRect.left + tileRect.width / 2}px`;
    explosion.style.top = `${tileRect.top + tileRect.height / 2}px`;
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.width = '0';
    explosion.style.height = '0';
    explosion.style.borderRadius = '50%';
    explosion.style.backgroundColor = 'rgba(239, 83, 80, 0.7)';
    explosion.style.zIndex = '1000';
    explosion.style.pointerEvents = 'none';
    
    // Add to document
    document.body.appendChild(explosion);
    
    // Animate explosion
    explosion.animate([
        { width: '0', height: '0', opacity: 1 },
        { width: '100px', height: '100px', opacity: 0 }
    ], {
        duration: 300,
        easing: 'ease-out'
    }).onfinish = () => explosion.remove();
    
    // Also add some particle effects
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = `${tileRect.left + tileRect.width / 2}px`;
        particle.style.top = `${tileRect.top + tileRect.height / 2}px`;
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = '#EF5350';
        particle.style.zIndex = '1000';
        particle.style.pointerEvents = 'none';
        
        // Calculate random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 30;
        const duration = 300 + Math.random() * 200;
        
        document.body.appendChild(particle);
        
        particle.animate([
            { 
                transform: 'translate(-50%, -50%)',
                opacity: 1
            },
            { 
                transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
}

/**
 * Add freeze effect for freeze power-up
 */
function addFreezeEffect(tile) {
    const tileRect = tile.getBoundingClientRect();
    
    // Create frost particles
    for (let i = 0; i < 8; i++) {
        const frost = document.createElement('div');
        frost.textContent = '❄';
        frost.style.position = 'fixed';
        frost.style.left = `${tileRect.left + tileRect.width / 2}px`;
        frost.style.top = `${tileRect.top + tileRect.height / 2}px`;
        frost.style.fontSize = '16px';
        frost.style.color = '#42A5F5';
        frost.style.zIndex = '1000';
        frost.style.pointerEvents = 'none';
        
        // Calculate position on a circle
        const angle = (i / 8) * Math.PI * 2;
        const distance = 20;
        
        document.body.appendChild(frost);
        
        frost.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 0 
            },
            { 
                transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(1)`,
                opacity: 1,
                offset: 0.5
            },
            { 
                transform: `translate(calc(-50% + ${Math.cos(angle) * distance * 1.5}px), calc(-50% + ${Math.sin(angle) * distance * 1.5}px)) scale(0.5)`,
                opacity: 0 
            }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => frost.remove();
    }
    
    // Create frost overlay
    const frostOverlay = document.createElement('div');
    frostOverlay.style.position = 'fixed';
    frostOverlay.style.left = `${tileRect.left}px`;
    frostOverlay.style.top = `${tileRect.top}px`;
    frostOverlay.style.width = `${tileRect.width}px`;
    frostOverlay.style.height = `${tileRect.height}px`;
    frostOverlay.style.borderRadius = `${getComputedStyle(tile).borderRadius}`;
    frostOverlay.style.background = 'radial-gradient(circle, rgba(66, 165, 245, 0.3) 0%, rgba(66, 165, 245, 0) 70%)';
    frostOverlay.style.zIndex = '1000';
    frostOverlay.style.pointerEvents = 'none';
    
    document.body.appendChild(frostOverlay);
    
    frostOverlay.animate([
        { opacity: 0 },
        { opacity: 1, offset: 0.3 },
        { opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    }).onfinish = () => frostOverlay.remove();
}

/**
 * Update the score display
 */
function updateScore(points) {
    score += points;
    scoreValue.textContent = score;
}

/**
 * Create floating tiles in the background
 */
function createFloatingTiles() {
    const tileValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
    const tileCount = 15;
    
    for (let i = 0; i < tileCount; i++) {
        createFloatingTile(
            tileValues[Math.floor(Math.random() * tileValues.length)],
            Math.random() * 100, // x position
            Math.random() * 100, // y position
            30 + Math.random() * 40, // size
            10 + Math.random() * 20, // animation duration
            Math.random() * 10 // delay
        );
    }
}

/**
 * Create a single floating tile
 */
function createFloatingTile(value, xPos, yPos, size, duration, delay) {
    const tile = document.createElement('div');
    tile.classList.add('floating-tile');
    tile.textContent = value;
    tile.style.backgroundColor = tileColors[value];
    tile.style.color = tileTextColors[value];
    tile.style.width = `${size}px`;
    tile.style.height = `${size}px`;
    tile.style.left = `${xPos}%`;
    tile.style.top = `${yPos}%`;
    tile.style.fontSize = `${size / 3}px`;
    
    // Custom animation
    tile.style.animationDuration = `${duration}s`;
    tile.style.animationDelay = `${delay}s`;
    
    // Add some randomness to the animation path
    const randomPath = Math.random() * 100;
    tile.style.setProperty('--random-path', randomPath);
    
    floatingTilesContainer.appendChild(tile);
}

/**
 * Animate the How to Play steps
 */
function animateSteps() {
    steps.forEach((step, index) => {
        step.style.setProperty('--step-index', index);
    });
}

/**
 * Handle scroll effects
 */
function handleScrollEffects() {
    // Fade in elements as they scroll into view
    const fadeElements = document.querySelectorAll('.feature-card, .step, .challenge-card');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        fadeObserver.observe(element);
    });
}

/**
 * Simulates a random move in the game
 */
function simulateRandomMove() {
    const directions = ['up', 'right', 'down', 'left'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
    // Log the simulated move
    console.log(`Simulated move: ${randomDirection}`);
    
    // Here we would animate the board, but for simplicity, we just add a random tile
    setTimeout(addRandomTile, 300);
}

// Periodically simulate game moves
setInterval(simulateRandomMove, 8000);
