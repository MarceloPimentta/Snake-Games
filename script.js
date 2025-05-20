// Responsive canvas sizing and touch controls for mobile

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerNameContainer = document.getElementById('playerNameContainer');
const playerNameInput = document.getElementById('playerNameInput');
const confirmNameButton = document.getElementById('confirmNameButton');

const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreContainer = document.getElementById('scoreContainer');
const scoreDisplay = document.getElementById('score');

const leaderboardContainer = document.getElementById('leaderboardContainer');
const leaderboardList = document.getElementById('leaderboardList');

const touchControls = document.getElementById('touchControls');
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

let gridSize = 20;
let tileCount;
let snake = [];
let velocity = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let tailLength = 0;
let gameOver = false;
let score = 0;
let gameInterval = null;

let playerName = '';

function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const size = Math.floor(maxWidth / gridSize) * gridSize;
    canvas.width = size;
    canvas.height = size;
    tileCount = size / gridSize;
}

function initGame() {
    resizeCanvas();
    snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
    velocity = { x: 1, y: 0 };
    tailLength = 1;
    gameOver = false;
    score = 0;
    placeFood();
    scoreDisplay.textContent = score;
}

function gameLoop() {
    if (gameOver) {
        clearInterval(gameInterval);
        gameInterval = null;
        restartButton.style.display = 'inline-block';
        scoreContainer.style.display = 'block';
        ctx.fillStyle = 'red';
        ctx.font = `${canvas.width / 12}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`Game Over! Pontuação: ${score}`, canvas.width / 2, canvas.height / 2);
        saveScore();
        displayLeaderboard();
        return;
    }

    update();
    draw();
}

function update() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        if (segment.x === head.x && segment.y === head.y) {
            gameOver = true;
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        tailLength++;
        score++;
        scoreDisplay.textContent = score;
        placeFood();
    }

    while (snake.length > tailLength) {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4caf50'; // softer green for snake
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }

    ctx.fillStyle = '#ff5722'; // softer orange-red for food
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            break;
        }
    }
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            if (velocity.y === 1) break;
            velocity = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (velocity.y === -1) break;
            velocity = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (velocity.x === 1) break;
            velocity = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (velocity.x === -1) break;
            velocity = { x: 1, y: 0 };
            break;
    }
});

confirmNameButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name.length === 0) {
        alert('Por favor, digite seu nome.');
        return;
    }
    playerName = name;
    playerNameContainer.style.display = 'none';
    canvas.style.display = 'block';
    document.getElementById('controls').style.display = 'flex';
    leaderboardContainer.style.display = 'block';

    // Show touch controls on mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        touchControls.style.display = 'flex';
    }

    displayLeaderboard();
});

startButton.addEventListener('click', () => {
    initGame();
    startButton.style.display = 'none';
    restartButton.style.display = 'none';
    scoreContainer.style.display = 'block';
    gameInterval = setInterval(gameLoop, 100);
});

restartButton.addEventListener('click', () => {
    initGame();
    restartButton.style.display = 'none';
    scoreContainer.style.display = 'block';
    gameInterval = setInterval(gameLoop, 100);
});

// Touch control event listeners
upButton.addEventListener('touchstart', e => {
    e.preventDefault();
    if (velocity.y === 1) return;
    velocity = { x: 0, y: -1 };
});
downButton.addEventListener('touchstart', e => {
    e.preventDefault();
    if (velocity.y === -1) return;
    velocity = { x: 0, y: 1 };
});
leftButton.addEventListener('touchstart', e => {
    e.preventDefault();
    if (velocity.x === 1) return;
    velocity = { x: -1, y: 0 };
});
rightButton.addEventListener('touchstart', e => {
    e.preventDefault();
    if (velocity.x === -1) return;
    velocity = { x: 1, y: 0 };
});

function saveScore() {
    if (!playerName) return;
    let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    leaderboard.push({ name: playerName, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // keep top 10
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

window.addEventListener('resize', () => {
    if (!gameOver) {
        resizeCanvas();
        draw();
    }
});
