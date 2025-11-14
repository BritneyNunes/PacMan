// =============================
// GAME SETUP AND GLOBAL VARIABLES
// =============================
let board;
let rowCount = 21;
let columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

// Game assets
let blueGhostImg, orangeGhostImg, pinkGhostImg, redGhostImg;
let pacmanUpImg, pacmanDownImg, pacmanLeftImg, pacmanRightImg;
let wallImg, cherry;

const directions = ["U", "D", "L", "R"];
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false; // Used to track if gameplay has begun
let restarting = false;  // Used after game over for restart prompt

// =============================
// INITIALIZATION
// =============================
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages();
    loadMap();

    // Assign random starting directions to ghosts
    for (let ghost of ghosts.values()) {
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }

    // Start countdown animation
    startCountdownAnimation();

    // Keyboard listener for Pac-Man movement and restart logic
    document.addEventListener("keyup", movePacman);
};

// =============================
// MAP DATA (LEVEL 1)
// =============================
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "X       bpo       X",
    "XXXX X XXCXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

// =============================
// GAME OBJECT COLLECTIONS
// =============================
const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

// =============================
// IMAGE LOADING
// =============================
function loadImages() {
    wallImg = new Image();
    wallImg.src = "./Images/wall.png";

    blueGhostImg = new Image();
    blueGhostImg.src = "./Images/blueGhost.png";

    orangeGhostImg = new Image();
    orangeGhostImg.src = "./Images/orangeGhost.png";

    pinkGhostImg = new Image();
    pinkGhostImg.src = "./Images/pinkGhost.png";

    redGhostImg = new Image();
    redGhostImg.src = "./Images/redGhost.png";

    pacmanUpImg = new Image();
    pacmanUpImg.src = "./Images/pacmanUp.png";

    pacmanDownImg = new Image();
    pacmanDownImg.src = "./Images/pacmanDown.png";

    pacmanLeftImg = new Image();
    pacmanLeftImg.src = "./Images/pacmanLeft.png";

    pacmanRightImg = new Image();
    pacmanRightImg.src = "./Images/pacmanRight.png";
}

// =============================
// MAP CREATION FUNCTION
// =============================
function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            const tile = tileMap[r][c];
            const x = c * tileSize;
            const y = r * tileSize;

            if (tile == "X") {
                walls.add(new Block(wallImg, x, y, tileSize, tileSize));
            } else if (["b", "p", "o", "r"].includes(tile)) {
                let img = tile == "b" ? blueGhostImg :
                          tile == "p" ? pinkGhostImg :
                          tile == "o" ? orangeGhostImg : redGhostImg;
                ghosts.add(new Block(img, x, y, tileSize, tileSize));
            } else if (tile == "P") {
                pacman = new Block(pacmanRightImg, x, y, tileSize, tileSize);
            } else if (tile == " ") {
                foods.add(new Block(null, x + 14, y + 14, 4, 4));
            }
        }
    }
}

// =============================
// MAIN GAME LOOP
// =============================
function update() {
    if (gameOver) {
        return;
    }
    move();
    draw();
    setTimeout(update, 50);
}

// =============================
// RENDERING
// =============================
function draw() {
    context.clearRect(0, 0, board.width, board.height);

    // Draw Pac-Man
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);

    // Draw ghosts
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }

    // Draw walls
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }

    // Draw food
    context.fillStyle = "white";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    // Draw score and lives
    context.fillStyle = "yellow";
    context.font = "16px 'Press Start 2P', sans-serif";
    context.fillText("Lives: " + lives + "   Score: " + score, 10, 20);
}

// =============================
// MOVEMENT LOGIC
// =============================
function move() {
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    // Collision with ghosts
    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            lives -= 1;
            if (lives == 0) {
                gameOver = true;
                gameOverAnimation();
                return;
            }
            resetPositions();
        }
    }

    // Collision with walls
    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    // Ghost movement and wall collisions
    for (let ghost of ghosts.values()) {
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        for (let wall of walls.values()) {
            if (collision(ghost, wall)) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
            }
        }
    }

    // Eat food
    let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);
}

// =============================
// INPUT HANDLER
// =============================
function movePacman(e) {
    if (restarting && gameOver) {
        // Restart the game after pressing any key
        restarting = false;
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        gameStarted = true;
        update();
        return;
    }

    if (!gameStarted) return;

    // Control directions
    if (e.code == "ArrowUp" || e.code == "KeyW") pacman.updateDirection("U");
    else if (e.code == "ArrowDown" || e.code == "KeyS") pacman.updateDirection("D");
    else if (e.code == "ArrowLeft" || e.code == "KeyA") pacman.updateDirection("L");
    else if (e.code == "ArrowRight" || e.code == "KeyD") pacman.updateDirection("R");

    // Update Pac-Man sprite based on direction
    if (pacman.direction == "U") pacman.image = pacmanUpImg;
    else if (pacman.direction == "D") pacman.image = pacmanDownImg;
    else if (pacman.direction == "L") pacman.image = pacmanLeftImg;
    else if (pacman.direction == "R") pacman.image = pacmanRightImg;
}

// =============================
// COLLISION DETECTION
// =============================
function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// =============================
// RESET POSITIONS
// =============================
function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;

    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
}

// =============================
// BLOCK CLASS
// =============================
class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;
        this.direction = "R";
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();

        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
            }
        }
    }

    updateVelocity() {
        if (this.direction == "U") {
            this.velocityX = 0;
            this.velocityY = -tileSize / 4;
        } else if (this.direction == "D") {
            this.velocityX = 0;
            this.velocityY = tileSize / 4;
        } else if (this.direction == "L") {
            this.velocityX = -tileSize / 4;
            this.velocityY = 0;
        } else if (this.direction == "R") {
            this.velocityX = tileSize / 4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}

// =============================
// ANIMATIONS
// =============================

// Countdown animation before the game starts
function startCountdownAnimation() {
    let count = 3;
    const colors = ["#00FFFF", "#00FF00", "#FFD700", "#FF0000"];

    const countdown = setInterval(() => {
        context.clearRect(0, 0, boardWidth, boardHeight);

        // Game title
        const gradient = context.createLinearGradient(0, 0, boardWidth, 0);
        gradient.addColorStop(0, "#00FFFF");
        gradient.addColorStop(0.5, "#FFD700");
        gradient.addColorStop(1, "#FF4500");

        // context.fillStyle = gradient;
        context.font = "40px 'Press Start 2P', sans-serif";
        context.fillText("PAC-MAN", boardWidth / 2 - 90, boardHeight / 2 - 60);

        // Countdown number
        context.fillStyle = colors[count];
        context.font = "80px 'Press Start 2P', sans-serif";
        context.fillText(count, boardWidth / 2 - 20, boardHeight / 2 + 40);

        count--;
        if (count < 0) {
            clearInterval(countdown);
            context.clearRect(0, 0, boardWidth, boardHeight);
            context.fillStyle = "#00FF00";
            context.font = "50px 'Press Start 2P', sans-serif";
            context.fillText("GO!", boardWidth / 2 - 50, boardHeight / 2);
            setTimeout(() => {
                gameStarted = true;
                update();
            }, 800);
        }
    }, 1000);
}

// Game over animation with score and restart prompt
function gameOverAnimation() {
    let opacity = 0;
    const fade = setInterval(() => {
        context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        context.fillRect(0, 0, boardWidth, boardHeight);

        context.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        context.font = "40px 'Press Start 2P', sans-serif";
        context.fillText("GAME OVER", boardWidth / 2 - 150, boardHeight / 2 - 40);

        context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        context.font = "20px 'Press Start 2P', sans-serif, centre";
        context.fillText("SCORE: " + score, boardWidth / 2 - 80, boardHeight / 2 + 10);
        context.fillText("Press any key to restart", boardWidth / 2 - 120, boardHeight / 2 + 60);

        opacity += 0.05;
        if (opacity >= 1) {
            clearInterval(fade);
            restarting = true; // Wait for key press
        }
    }, 80);
}
