const game = document.getElementById('game');
const player = document.getElementById('player');
const restartBtn = document.getElementById('restartBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const starsText = document.getElementById('stars');
const timerText = document.getElementById('timer');
const bestTimeText = document.getElementById('bestTime');
const hintPopup = document.getElementById("controlHintPopup");
const hintOkBtn = document.getElementById("hintOkBtn");

let posX = 50, posY = 90;
let collected = 0, timer = 0, gameOver = false;
let currentLevel = 1;
let timerInterval;
let mines = [], stars = [];
let totalMines = 15, totalStars = 5;
let lastTap = 0;
let velocity = { x: 0, y: 0 };
let moveSpeed = 0.6;
let moveUp = false, moveDown = false, moveLeft = false, moveRight = false;
function updatePlayerPosition() {
  if (!gameOver) {
    posX += velocity.x;
    posY += velocity.y;

    posX = Math.max(0, Math.min(98, posX));
    posY = Math.max(0, Math.min(98, posY));

    player.style.left = `${posX}%`;
    player.style.top = `${posY}%`;

    checkCollision();
  }

  requestAnimationFrame(updatePlayerPosition);
}

function setVelocity(x, y) {
  velocity.x = x * moveSpeed;
  velocity.y = y * moveSpeed;
}

function checkCollision() {
  for (let { x, y } of mines) {
    const dx = posX - x;
    const dy = posY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 3) return endGame(); // Mine radius slightly reduced
  }

  stars.forEach((star) => {
    const dx = posX - star.x;
    const dy = posY - star.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!star.collected && distance < 3.5) { // Star collection radius reduced slightly
      star.collected = true;
      star.element.classList.add('collected');
      star.element.remove();
      collected++;
      starsText.innerText = `Stars: ${collected}`;
      if (collected === totalStars) winGame();
    }
  });
}

function createMine(x, y) {
  const mine = document.createElement('div');
  mine.className = 'mine';
  mine.textContent = '💣';
  mine.style.left = `${x}%`;
  mine.style.top = `${y}%`;
  game.appendChild(mine);
  mines.push({ element: mine, x, y });
}

function createStar(x, y) {
  const star = document.createElement('div');
  star.className = 'star';
  star.textContent = '⭐';
  star.style.left = `${x}%`;
  star.style.top = `${y}%`;
  game.appendChild(star);
  stars.push({ element: star, x, y, collected: false });
}

function generateObjects() {
  document.querySelectorAll('.mine, .star').forEach(e => e.remove());
  mines = [];
  stars = [];
  for (let i = 0; i < totalMines; i++) createMine(Math.random() * 95, Math.random() * 85);
  for (let i = 0; i < totalStars; i++) createStar(Math.random() * 95, Math.random() * 85);
}

function endGame() {
  gameOver = true;
  clearInterval(timerInterval);
  restartBtn.style.display = 'block';
  nextLevelBtn.style.display = 'none';
  mines.forEach(({ element }) => element.style.display = 'block');
}

function winGame() {
  gameOver = true;
  clearInterval(timerInterval);
  nextLevelBtn.style.display = 'block';
  restartBtn.style.display = 'none';
  const best = localStorage.getItem('bestTime');
  if (!best || timer < best) {
    localStorage.setItem('bestTime', timer);
    bestTimeText.innerText = `Best: ${timer}`;
  }
}

function resetGame() {
  posX = 50;
  posY = 90;
  collected = 0;
  gameOver = false;
  starsText.innerText = `Stars: 0`;
  restartBtn.style.display = 'none';
  nextLevelBtn.style.display = 'none';
  player.style.left = `${posX}%`;
  player.style.top = `${posY}%`;
  generateObjects();
  startTimer();
}

function nextLevel() {
  currentLevel++;
  totalMines += 5;
  totalStars += 2;
  document.getElementById('levelDisplay').textContent = `Level: ${currentLevel}`;
  resetGame();
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 0;
  timerText.innerText = `Time: 0`;
  timerInterval = setInterval(() => {
    timer++;
    timerText.innerText = `Time: ${timer}`;
  }, 1000);
}

function revealMines() {
  mines.forEach(({ element }) => element.style.display = 'block');
  setTimeout(() => {
    if (!gameOver) mines.forEach(({ element }) => element.style.display = 'none');
  }, 1000);
}

document.getElementById("playBtn").addEventListener("click", () => {
  document.getElementById("welcome-screen").style.display = "none";
  hintPopup.style.display = "flex";
});

hintOkBtn.addEventListener("click", () => {
  hintPopup.style.display = "none";
  game.style.display = "block";
  resetGame();
});
document.getElementById('upBtn').addEventListener('touchstart', () => moveUp = true);
document.getElementById('downBtn').addEventListener('touchstart', () => moveDown = true);
document.getElementById('leftBtn').addEventListener('touchstart', () => moveLeft = true);
document.getElementById('rightBtn').addEventListener('touchstart', () => moveRight = true);

['upBtn', 'downBtn', 'leftBtn', 'rightBtn'].forEach(id => {
  document.getElementById(id).addEventListener('touchend', () => {
    if (id === 'upBtn') moveUp = false;
    if (id === 'downBtn') moveDown = false;
    if (id === 'leftBtn') moveLeft = false;
    if (id === 'rightBtn') moveRight = false;
  });
});

const keyState = {};
window.addEventListener('keydown', (e) => {
  if (gameOver) return;
  keyState[e.key] = true;
  updateKeyboardVelocity();
  if (e.key === ' ') revealMines();
});
window.addEventListener('keyup', (e) => {
  keyState[e.key] = false;
  updateKeyboardVelocity();
});

function updateKeyboardVelocity() {
  let dx = 0, dy = 0;
  if (keyState['ArrowLeft'] || keyState['a']) dx -= 1;
  if (keyState['ArrowRight'] || keyState['d']) dx += 1;
  if (keyState['ArrowUp'] || keyState['w']) dy -= 1;
  if (keyState['ArrowDown'] || keyState['s']) dy += 1;
  setVelocity(dx, dy);
}

document.addEventListener('touchstart', (e) => {
  const now = Date.now();
  const delta = now - lastTap;
  if (delta > 0 && delta < 300) {
    revealMines();
    e.preventDefault();
  }
  lastTap = now;
}, { passive: false });



restartBtn.addEventListener('click', resetGame);
nextLevelBtn.addEventListener('click', nextLevel);

const best = localStorage.getItem('bestTime');
if (best) bestTimeText.innerText = `Best: ${best}`;

updatePlayerPosition();
