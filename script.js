// Constants
const TOTAL_LAYERS = 7;
const TIME_LIMIT = 40; // seconds

// Game State
let currentLayer = 1;
let activationPoints = {}; // Stores the active dot index for each layer
let timer = null; // Initialize timer as null
let timeLeft = TIME_LIMIT;
let gameStarted = false;

// DOM Elements
const layersContainer = document.getElementById('layers-container');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const startButton = document.getElementById('start-button');
const howToPlayButton = document.getElementById('how-to-play-button');
const modal = document.getElementById('how-to-play-modal');
const closeModalButton = document.getElementById('close-modal');

// Initialize the game (on page load)
function initGame() {
    // Reset game state
    currentLayer = 1;
    activationPoints = {};
    timeLeft = TIME_LIMIT; // Reset timeLeft to TIME_LIMIT
    messageElement.textContent = '';
    layersContainer.innerHTML = '';
    timerElement.textContent = `Time Left: ${timeLeft}s`; // Update timer display
    gameStarted = false;
    startButton.textContent = 'Start Game'; // Ensure button says 'Start Game'
    startButton.classList.remove('restart-button'); // Remove 'restart-button' styles

    // Generate layers with unique dot counts for layers 4-5
    const uniqueDotCounts = getUniqueDotCounts(4, 5, 3, 5); // Corrected parameters

    for (let layer = 1; layer <= TOTAL_LAYERS; layer++) {
        const layerDiv = document.createElement('div');
        layerDiv.classList.add('layer');
        layerDiv.id = `layer-${layer}`;

        // Determine number of dots
        let numDots;
        if (layer === 1 || layer === 2 || layer === 6 || layer === 7) {
            numDots = 2;
        } else if (layer === 3) {
            numDots = 6; // Layer 3 always has 6 dots
        } else if (layer >= 4 && layer <= 5) {
            numDots = uniqueDotCounts[layer - 4]; // Assign unique counts for layers 4-5
        }

        // Create dots
        for (let dot = 1; dot <= numDots; dot++) {
            const dotDiv = document.createElement('div');
            dotDiv.classList.add('dot');
            dotDiv.dataset.layer = layer;
            dotDiv.dataset.dot = dot;
            dotDiv.setAttribute('tabindex', '0'); // Make dots focusable for accessibility
            dotDiv.setAttribute('role', 'button'); // ARIA role
            dotDiv.setAttribute('aria-label', `Dot ${dot} in Layer ${layer}`); // ARIA label
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

    // Add event listeners to all dots using 'click' only
    allDots.forEach(dot => {
        // Remove any existing listeners to prevent duplicates
        dot.removeEventListener('click', handleDotClick);
        dot.addEventListener('click', handleDotClick);
    });
}

// Function to generate unique dot counts for specified layers
function getUniqueDotCounts(startLayer, endLayer, minDots, maxDots) {
    const numberOfLayers = endLayer - startLayer + 1;

    // Available dots for Layers 4 and 5 (3-5)
    const availableDots = [3, 4, 5];

    // Shuffle the availableDots array
    for (let i = availableDots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableDots[i], availableDots[j]] = [availableDots[j], availableDots[i]];
    }

    // Assign dots to layers 4 and 5
    const uniqueDotCounts = [];
    for (let layer = startLayer; layer <= endLayer; layer++) { // Layers 4 and 5
        if (availableDots.length > 0) {
            uniqueDotCounts.push(availableDots.pop());
        } else {
            // If not enough unique counts, fallback to minDots
            uniqueDotCounts.push(minDots);
        }
    }

    return uniqueDotCounts;
}

// Activate a specific layer (make dots clickable and visually active)
function activateLayer(layer) {
    const layerDiv = document.getElementById(`layer-${layer}`);
    layerDiv.classList.remove('completed');
    const dots = layerDiv.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.classList.add('active');
        // Ensure the pseudo-element is also interactive
        dot.style.pointerEvents = 'auto';
    });
}

// Deactivate a specific layer (make dots unclickable and grayed out)
function deactivateLayer(layer) {
    const layerDiv = document.getElementById(`layer-${layer}`);
    const dots = layerDiv.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
        // Prevent interaction when inactive
        dot.style.pointerEvents = 'none';
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

// Handle dot clicks using Click Events
function handleDotClick(event) {
    console.log('Dot clicked:', event.target); // Debugging statement
    if (!gameStarted) return; // Ignore interactions before the game starts

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
        if (timeLeft < 0) timeLeft = 0; // Prevent negative time
        timerElement.textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame(false, true);
        }
    }, 1000);
}


// End the game
function endGame(won, timeout = false) {
    clearInterval(timer); // Clear the timer to prevent it from running in the background
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

    // Keep the Restart button as is (already styled with red background)
    // No additional changes needed here
}

// Handle Start button click
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        // Start the game
        gameStarted = true;
        messageElement.textContent = '';

        // Change button to 'Restart' with red background
        startButton.textContent = 'Restart';
        startButton.classList.add('restart-button'); // add a class for red background

        // Reset timer
        clearInterval(timer);
        timeLeft = TIME_LIMIT; // Reset timeLeft to TIME_LIMIT
        timerElement.textContent = `Time Left: ${timeLeft}s`; // Update the timer display

        // Activate the first layer
        activateLayer(currentLayer);

        // Start the timer
        startTimer();
    } else {
        // Restart the game
        // Reset game state
        clearInterval(timer);
        timeLeft = TIME_LIMIT; // Reset timeLeft to TIME_LIMIT
        timerElement.textContent = `Time Left: ${timeLeft}s`; // Update the timer display

        // Re-initialize the game
        initGame();

        // Ensure the button remains as 'Restart' with red background
        startButton.textContent = 'Restart';
        startButton.classList.add('restart-button'); // Ensure it's red

        // Set gameStarted to true
        gameStarted = true;

        // Activate the first layer
        activateLayer(currentLayer);

        // Start the timer
        startTimer();
    }
});

// Handle "How to Play" button click to open the modal
howToPlayButton.addEventListener('click', () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling when modal is open
});

// Handle modal close button click
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore background scrolling
});

// Handle clicks outside the modal content to close the modal
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore background scrolling
    }
});

// Close modal on pressing the Esc key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore background scrolling
    }
});

// Initialize the game on page load
window.onload = initGame;
