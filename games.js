// Variables del canvas
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

// Botones
const btnUp = document.querySelector("#up");
const btnLeft = document.querySelector("#left");
const btnRight = document.querySelector("#right");
const btnDown = document.querySelector("#down");

// HUD
const spanLives = document.querySelector("#lives");
const spanTime = document.querySelector("#time");
const spanRecord = document.querySelector("#record");
const pResult = document.querySelector("#result");

// Estado del juego
let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;

let timeStart;
let timeInterval;

const playerPosition = { x: undefined, y: undefined };
const giftPosition = { x: undefined, y: undefined };
let enemyPositions = [];

// Ajustar tamaño del canvas
window.addEventListener("load", setCanvasSize);
window.addEventListener("resize", setCanvasSize);

function setCanvasSize() {
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.8;
  } else {
    canvasSize = window.innerHeight * 0.8;
  }

  canvasSize = Math.floor(canvasSize);

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  elementsSize = Math.floor(canvasSize / 10);

  playerPosition.x = undefined;
  playerPosition.y = undefined;

  startGame();
}

function startGame() {
  ctx.font = `${elementsSize * 0.9}px Verdana`;
  ctx.textAlign = "start";
  ctx.textBaseline = "top";

  const map = maps[level];
  if (!map) {
    gameWin();
    return;
  }

  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    showRecord();
  }

  const mapRows = map.trim().split("\n");
  const mapMatrix = mapRows.map((row) => row.trim().split(""));

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  enemyPositions = [];

  mapMatrix.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = elementsSize * colI;
      const posY = elementsSize * rowI;

      ctx.fillText(emoji, posX, posY);

      if (col === "O" && playerPosition.x === undefined) {
        playerPosition.x = posX;
        playerPosition.y = posY;
      } else if (col === "I") {
        giftPosition.x = posX;
        giftPosition.y = posY;
      } else if (col === "X") {
        enemyPositions.push({ x: posX, y: posY });
      }
    });
  });

  drawPlayer();
  showLives();
  checkCollisions();
}

function drawPlayer() {
  ctx.fillText(emojis.PLAYER, playerPosition.x, playerPosition.y);
}

function checkCollisions() {
  const giftCollision =
    playerPosition.x === giftPosition.x && playerPosition.y === giftPosition.y;

  if (giftCollision) {
    levelWin();
  }

  const enemyCollision = enemyPositions.find(
    (enemy) => enemy.x === playerPosition.x && enemy.y === playerPosition.y
  );

  if (enemyCollision) {
    levelFail();
  }
}

function levelWin() {
  level++;
  startGame();
}

function levelFail() {
  lives--;
  if (lives <= 0) {
    level = 0;
    lives = 3;
    timeStart = undefined;
  }
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function gameWin() {
  clearInterval(timeInterval);

  const playerTime = Date.now() - timeStart;
  const recordTime = localStorage.getItem("record_time");

  if (!recordTime || playerTime < recordTime) {
    localStorage.setItem("record_time", playerTime);
    pResult.innerHTML = "🎉 Nuevo récord!";
  } else {
    pResult.innerHTML = "Lo lograste!";
  }
  showRecord();
}

// HUD
function showLives() {
  spanLives.innerHTML = emojis.HEART.repeat(lives);
}

function showTime() {
  spanTime.innerHTML = Date.now() - timeStart;
}

function showRecord() {
  spanRecord.innerHTML = localStorage.getItem("record_time") || "N/A";
}

// Controles
window.addEventListener("keydown", moveByKeys);
btnUp.addEventListener("click", moveUp);
btnLeft.addEventListener("click", moveLeft);
btnRight.addEventListener("click", moveRight);
btnDown.addEventListener("click", moveDown);

function moveByKeys(e) {
  if (e.key === "ArrowUp") moveUp();
  if (e.key === "ArrowDown") moveDown();
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
}

function moveUp() {
  if (playerPosition.y - elementsSize >= 0) {
    playerPosition.y -= elementsSize;
    startGame();
  }
}

function moveDown() {
  if (playerPosition.y + elementsSize < canvasSize) {
    playerPosition.y += elementsSize;
    startGame();
  }
}

function moveLeft() {
  if (playerPosition.x - elementsSize >= 0) {
    playerPosition.x -= elementsSize;
    startGame();
  }
}

function moveRight() {
  if (playerPosition.x + elementsSize < canvasSize) {
    playerPosition.x += elementsSize;
    startGame();
  }
}
