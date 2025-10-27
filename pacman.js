//Structure of the board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

// images
let blueGhostImg;
let orangeGhostImg;
let pinkGhostImg;
let redGhostImg;
let pacmanUpImg;
let pacmanDownImg;
let pacmanLeftImg;
let pacmanRightImg;
let wallImg;
let cherry;

const directions = ["U", "D", "L", "R"]
let score = 0;
let lives = 3;
let gameOver = false;


window.onload = function(){
    board = document.getElementById("board")
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d") //for drawing on board
    board.getContext("2d") // this is used for drawing on the board

    loadImages();
    loadMap();
    // console.log(walls.size);
    // console.log(foods.size);
    // console.log(ghosts.size);
    for(let ghost of ghosts.values()){
        const newDirection = directions[(Math.floor(Math.random()*4))];
        ghost.updateDirection(newDirection);
    }
    update()
    document.addEventListener("keyup", movePacman)
}

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

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

function loadImages(){
    wallImg = new Image(); //X
    wallImg.src = "./Images/wall.png"

    //ghost images
    blueGhostImg = new Image(); //b
    blueGhostImg.src = "./Images/blueGhost.png"

    orangeGhostImg = new Image(); //o
    orangeGhostImg.src = "./Images/orangeGhost.png"

    pinkGhostImg = new Image(); //p
    pinkGhostImg.src = "./Images/pinkGhost.png"

    redGhostImg = new Image(); //r
    redGhostImg.src = "./Images/redGhost.png"


    //pacman images
    pacmanUpImg = new Image(); //p
    pacmanUpImg.src = "./Images/pacmanUp.png"

    pacmanDownImg = new Image();
    pacmanDownImg.src = "./Images/pacmanDown.png"

    pacmanLeftImg = new Image ();
    pacmanLeftImg.src = "./Images/pacmanLeft.png"

    pacmanRightImg = new Image();
    pacmanRightImg.src = "./Images/pacmanRight.png"

    //O empty space and the blocks with nothing are where the food will be stored
    
    //cherry image
    // cherryImage = new Image();
    // cherryImage.src = "./cherry2.png"
}

function loadMap(){
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount; r++){
        for(let c = 0; c < columnCount; c++){
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c*tileSize;
            const y = r*tileSize;

            if(tileMapChar == "X"){ //wall
               const wall = new Block(wallImg, x, y, tileSize, tileSize);
               walls.add(wall);
            } else if(tileMapChar == "b"){
                const ghost = new Block(blueGhostImg, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            } else if(tileMapChar == "p"){
                const ghost = new Block(pinkGhostImg, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            } else if(tileMapChar == "o"){
                const ghost = new Block(orangeGhostImg, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            } else if(tileMapChar == "r"){
                const ghost = new Block(redGhostImg, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            } else if (tileMapChar == "P"){
                pacman = new Block(pacmanRightImg, x, y, tileSize, tileSize);
            } else if(tileMapChar == " "){
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            }
            //  else if(tileMapChar == "C"){
            //     const cherry = new Block(cherryImage, x, y, tileSize, tileSize);
            //     foods.add(cherry);
            // }
        }
    }
}

function update(){
    if(gameOver){
        return;
    }
    move()
    draw();
    setTimeout(update, 50);
}

function draw(){
    context.clearRect(0, 0, board.width, board.height)
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    for(let ghost of ghosts.values()){
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    for(let wall of walls.values()){
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    context.fillStyle = "white";
    for(let food of foods.values()){
        context.fillRect(food.x, food.y, food.width, food.height)
    }

    //score 
    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if(gameOver){
        context.fillText("Game Over: " + String(score), tileSize/2, tileSize/2);
    } else{
        context.fillText("x" + String(lives) + " " + String(score), tileSize/2, tileSize/2);
    }
}

function move(){
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    //collision for ghosts
    for(let ghost of ghosts.values()){
        if(collision(ghost, pacman)){
            lives -= 1;
            if(lives == 0){
                gameOver = true;
                return;
            }
            resetPositions();
        }
    }

    //check for collision
    for(let wall of walls.values()){
        if(collision(pacman, wall)){
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    for(let ghost of ghosts.values()){

        if(ghost.y == tileSize*9 && ghost.direction != "U" && ghost.direction != "D"){
            ghost.updateDirection("U")
        }
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        //check for collision
        for(let wall of walls.values()){
            if(collision(ghost, wall)){
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[(Math.floor(Math.random()*4))];
                ghost.updateDirection(newDirection);
            }
        }
    }

    //check food collision 
    let foodEaten = null;
    for(let food of foods.values()){
        if(collision(pacman, food)){
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);
}

function movePacman(e){
   if(gameOver){
    loadMap();
    resetPositions();
    lives = 3;
    score = 0;
    gameOver = false;
    update();
    return;
   }
   if(e.code == "ArrowUp" || e.code == "KeyW"){
       pacman.updateDirection("U");
   } else if(e.code == "ArrowDown" || e.code == "KeyS"){
       pacman.updateDirection("D");
   } else if(e.code == "ArrowLeft" || e.code == "KeyA"){
       pacman.updateDirection("L");
   } else if(e.code == "ArrowRight" || e.code == "KeyD"){
       pacman.updateDirection("R");
   }

   if(pacman.direction == "U"){
    pacman.image = pacmanUpImg;
   } else if (pacman.direction == "D"){
    pacman.image = pacmanDownImg
   } else if (pacman.direction == "L"){
    pacman.image = pacmanLeftImg
   } else if (pacman.direction == "R"){
    pacman.image = pacmanRightImg
   }
}

function collision(a, b){
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;

}

function resetPositions(){
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()){
        ghost.reset();
        const newDirection = directions[(Math.floor(Math.random()*4))];
        ghost.updateDirection(newDirection);
    }
}


class Block {
    constructor(image, x, y, width, height){
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

     updateDirection(direction){
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();  
        this.x += this.velocityX;
        this.y += this.velocityY;     

        for(let wall of walls.values()){
            if(collision(this, wall)){
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();

            }
        }
    }

     updateVelocity(){
        if(this.direction == "U"){
            this.velocityX = 0;
            this.velocityY = -tileSize /4;
        } else if(this.direction == "D"){
            this.velocityX = 0;
            this.velocityY = tileSize /4;
        } else if(this.direction == "L"){
            this.velocityX = -tileSize /4;
            this.velocityY = 0;
        } else if(this.direction == "R"){
            this.velocityX = tileSize /4;
            this.velocityY = 0;
        }
     }

       reset(){
        this.x = this.startX;
        this.y = this.startY;
       }
}