// Constants
const TOTAL_LAYERS = 7;
const TIME_LIMIT = 40; // seconds

// Game State
let currentLayer = 1;
let activationPoints = {}; // Stores the active dot index for each layer
let timer;
let timeLeft = TIME_LIMIT;
let gameStarted = false;

// DOM Elements
const layersContainer = document.getElementById('layers-container');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const startButton = document.getElementById('start-button');

// Initialize the game
function initGame() {
    // Reset game state
    currentLayer = 1;
    activationPoints = {};
    timeLeft = TIME_LIMIT;
    messageElement.textContent = '';
    layersContainer.innerHTML = '';
    gameStarted = false;
    timerElement.textContent = `Time Left: ${TIME_LIMIT}s`;
    startButton.style.display = 'inline-block'; // Show the Start button

    // Generate layers with unique dot counts for layers 3-5
    const uniqueDotCounts = getUniqueDotCounts(3, 5, 6, 6); // Layer 3: 6-7 dots; Layers 4-5: 3-7 dots, unique, excluding layer 3

    for (let layer = 1; layer <= TOTAL_LAYERS; layer++) {
        const layerDiv = document.createElement('div');
        layerDiv.classList.add('layer');
        layerDiv.id = `layer-${layer}`;

        // Determine number of dots
        let numDots;
        if (layer === 1 || layer === 2 || layer === 6 || layer === 7) {
            numDots = 2;
        } else if (layer >= 3 && layer <= 5) {
            numDots = uniqueDotCounts[layer - 3]; // Assign unique counts for layers 3-5
        }

        // Create dots
        for (let dot = 1; dot <= numDots; dot++) {
            const dotDiv = document.createElement('div');
            dotDiv.classList.add('dot');
            dotDiv.dataset.layer = layer;
            dotDiv.dataset.dot = dot;
            layerDiv.appendChild(dotDiv);
        }

        layersContainer.appendChild(layerDiv);

        // Assign activation point
        const activationDot = Math.floor(Math.random() * numDots) + 1;
        activationPoints[layer] = activationDot;
    }

    // Deactivate all layers initially
    deactivateAllLayers();

    // Remove any existing classes from dots
    const allDots = document.querySelectorAll('.dot');
    allDots.forEach(dot => {
        dot.classList.remove('correct', 'wrong');
    });

    // Add event listeners to all dots
    allDots.forEach(dot => {
        dot.addEventListener('click', handleDotClick);
    });
}

// Function to generate unique dot counts for specified layers
function getUniqueDotCounts(startLayer, endLayer, minDots, maxDots) {
    const numberOfLayers = endLayer - startLayer + 1;

    // Define Layer 3 to always have more than 5 dots (6 or 7)
    const layer3Dots = Math.floor(Math.random() * 2) + 6; // 6 or 7

    const availableDots = [];
    for (let i = 3; i <= 7; i++) {
        if (i !== layer3Dots) {
            availableDots.push(i);
        }
    }

    // Shuffle the availableDots array
    for (let i = availableDots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableDots[i], availableDots[j]] = [availableDots[j], availableDots[i]];
    }

    // Assign dots to layers 4 and 5
    const uniqueDotCounts = [layer3Dots]; // Layer 3's dot count
    for (let layer = 4; layer <= endLayer; layer++) {
        if (availableDots.length > 0) {
            uniqueDotCounts.push(availableDots.pop());
        } else {
            // If not enough unique counts, fallback to minDots
            uniqueDotCounts.push(3);
        }
    }

    return uniqueDotCounts.slice(0, numberOfLayers);
}

// Activate a specific layer (make dots clickable and visually active)
function activateLayer(layer) {
    const layerDiv = document.getElementById(`layer-${layer}`);
    layerDiv.classList.remove('completed');
    const dots = layerDiv.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.classList.add('active');
    });
}

// Deactivate a specific layer (make dots unclickable and grayed out)
function deactivateLayer(layer) {
    const layerDiv = document.getElementById(`layer-${layer}`);
    const dots = layerDiv.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
}

// Deactivate all layers (used during initialization and resetting)
function deactivateAllLayers() {
    for (let layer = 1; layer <= TOTAL_LAYERS; layer++) {
        deactivateLayer(layer);
    }
}

// Reset the game to layer 1 after a wrong selection
function resetToLayer1() {
    // Remove 'completed' class from all layers
    for (let layer = 1; layer <= TOTAL_LAYERS; layer++) {
        const layerDiv = document.getElementById(`layer-${layer}`);
        layerDiv.classList.remove('completed');
    }

    // Remove 'correct' and 'wrong' classes from all dots
    const allDots = document.querySelectorAll('.dot');
    allDots.forEach(dot => {
        dot.classList.remove('correct', 'wrong');
    });

    // Deactivate all layers
    deactivateAllLayers();

    // Reset to layer 1
    currentLayer = 1;
    activateLayer(currentLayer);

    // Display a message indicating the reset
    messageElement.style.color = '#e74c3c'; // Red color
    messageElement.textContent = 'Wrong selection! Restarting from Layer 1.';

    // Clear the message after a short delay
    setTimeout(() => {
        messageElement.textContent = '';
    }, 2000);
}

// Handle dot clicks
function handleDotClick(event) {
    if (!gameStarted) return; // Ignore clicks before the game starts

    const layer = parseInt(event.target.dataset.layer);
    const dot = parseInt(event.target.dataset.dot);

    // Only allow clicking on the current layer
    if (layer !== currentLayer) return;

    // Check if clicked dot is the activation point
    if (dot === activationPoints[layer]) {
        event.target.classList.add('correct'); // Change only the selected dot to Dark Blue
        deactivateLayer(layer);
        // Proceed to next layer after a short delay
        setTimeout(() => {
            currentLayer++;
            if (currentLayer > TOTAL_LAYERS) {
                endGame(true);
            } else {
                activateLayer(currentLayer);
            }
        }, 500); // 0.5 second delay for user to see the correct selection
    } else {
        event.target.classList.add('wrong'); // Change only the selected dot to Red
        // Reset to layer 1 after a short delay
        setTimeout(() => {
            resetToLayer1();
        }, 500); // 0.5 second delay to show the wrong selection
    }
}

// Start the countdown timer
function startTimer() {
    timerElement.textContent = `Time Left: ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame(false, true);
        }
    }, 1000);
}

// End the game
function endGame(won, timeout = false) {
    clearInterval(timer);
    gameStarted = false;

    // Remove event listeners
    const allDots = document.querySelectorAll('.dot');
    allDots.forEach(dot => {
        dot.removeEventListener('click', handleDotClick);
    });

    // Reveal all activation points
    allDots.forEach(dot => {
        const layer = parseInt(dot.dataset.layer);
        const dotNumber = parseInt(dot.dataset.dot);
        if (dotNumber === activationPoints[layer]) {
            dot.classList.add('active'); // Indicate activation point without changing color
        }
    });

    if (won) {
        messageElement.style.color = '#2ecc71'; // Green
        messageElement.textContent = 'Congratulations! You won the game.';
    } else if (timeout) {
        messageElement.style.color = '#e74c3c'; // Red
        messageElement.textContent = 'Time\'s up! You failed to complete the game.';
    }

    // Show the Start button again after the game ends
    setTimeout(() => {
        initGame();
    }, 3000);
}

// Handle Start button click
startButton.addEventListener('click', () => {
    if (gameStarted) return; // Prevent multiple starts
    gameStarted = true;
    messageElement.textContent = '';
    startButton.style.display = 'none'; // Hide the Start button during the game
    activateLayer(currentLayer); // Activate the first layer
    startTimer();
});

// Initialize the game on page load
window.onload = initGame;