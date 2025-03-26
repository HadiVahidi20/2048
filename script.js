/**
 * NumberMerge2048 Website JavaScript
 * - Handles animations, navigation, and interactive elements
 */

// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');
const gameBoard = document.querySelector('.game-board');
const floatingTilesContainer = document.querySelector('.floating-tiles-container');
const steps = document.querySelectorAll('.step');

// Tile values for the game board demo
const tileValues = [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 4, 0, 0, 0, 2, 0];

// Tile colors mapping
const tileColors = {
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
    2048: '#EDC22E'
};

// Tile text colors
const tileTextColors = {
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
    2048: '#FFFFFF'
};

// Initialize the website when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    createGameBoard();
    createFloatingTiles();
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
        
        // Only show tiles with values
        if (value > 0) {
            tile.textContent = value;
            tile.style.backgroundColor = tileColors[value];
            tile.style.color = tileTextColors[value];
            tile.style.setProperty('--delay', index);
        } else {
            tile.style.backgroundColor = '#CDC1B4';
            tile.style.opacity = '0.35';
            tile.style.transform = 'scale(1)';
        }
        
        gameBoard.appendChild(tile);
    });
    
    // Add random tile to the board every few seconds
    setInterval(addRandomTile, 3000);
}

/**
 * Add a random tile to the game board demo
 */
function addRandomTile() {
    const emptyTiles = Array.from(gameBoard.children).filter(tile => 
        !tile.textContent || tile.textContent === '');
    
    if (emptyTiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyTiles.length);
        const randomTile = emptyTiles[randomIndex];
        const value = Math.random() < 0.9 ? 2 : 4;
        
        // Reset and animate the tile
        randomTile.textContent = value;
        randomTile.style.backgroundColor = tileColors[value];
        randomTile.style.color = tileTextColors[value];
        randomTile.style.opacity = '1';
        randomTile.style.transform = 'scale(0)';
        randomTile.style.setProperty('--delay', '0');
        
        // Force reflow
        void randomTile.offsetWidth;
        
        // Apply the animation
        randomTile.style.transform = 'scale(1)';
        randomTile.style.transition = 'transform 0.2s ease';
        
        // Also perform a merge animation after a few seconds
        setTimeout(() => {
            tryToMergeTiles();
        }, 2000);
    }
}

/**
 * Try to merge tiles on the game board demo
 */
function tryToMergeTiles() {
    const tiles = Array.from(gameBoard.children).filter(tile => tile.textContent);
    
    if (tiles.length >= 2) {
        // Pick two random tiles with the same value
        const sameValueTiles = findTilesWithSameValue(tiles);
        
        if (sameValueTiles.length >= 2) {
            const [tile1, tile2] = pickRandomTiles(sameValueTiles, 2);
            mergeTiles(tile1, tile2);
        }
    }
}

/**
 * Find tiles with the same value
 */
function findTilesWithSameValue(tiles) {
    const valueGroups = {};
    
    tiles.forEach(tile => {
        const value = tile.textContent;
        if (!valueGroups[value]) {
            valueGroups[value] = [];
        }
        valueGroups[value].push(tile);
    });
    
    // Return a group with at least 2 tiles
    for (const value in valueGroups) {
        if (valueGroups[value].length >= 2) {
            return valueGroups[value];
        }
    }
    
    return [];
}

/**
 * Pick random tiles from an array
 */
function pickRandomTiles(tiles, count) {
    const shuffled = [...tiles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Animate a tile merge for the demo
 */
function mergeTiles(tile1, tile2) {
    const value = parseInt(tile1.textContent);
    const newValue = value * 2;
    
    // Animate tile1 to grow and then shrink
    tile1.style.transform = 'scale(1.2)';
    setTimeout(() => {
        tile1.style.transform = 'scale(1)';
        tile1.textContent = newValue;
        tile1.style.backgroundColor = tileColors[newValue] || '#EDC22E';
        tile1.style.color = tileTextColors[newValue] || '#FFFFFF';
    }, 150);
    
    // Make tile2 empty
    tile2.textContent = '';
    tile2.style.backgroundColor = '#CDC1B4';
    tile2.style.opacity = '0.35';
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
    const fadeElements = document.querySelectorAll('.feature-card, .step');
    
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
setInterval(simulateRandomMove, 5000);
