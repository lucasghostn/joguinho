const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Controles
let keys = { left: false, right: false, up: false };
document.getElementById("leftBtn").addEventListener("touchstart", () => keys.left = true);
document.getElementById("leftBtn").addEventListener("touchend", () => keys.left = false);
document.getElementById("rightBtn").addEventListener("touchstart", () => keys.right = true);
document.getElementById("rightBtn").addEventListener("touchend", () => keys.right = false);
document.getElementById("jumpBtn").addEventListener("touchstart", () => keys.up = true);
document.getElementById("jumpBtn").addEventListener("touchend", () => keys.up = false);

// Jogador
class Player {
  constructor() {
    this.w = 50;
    this.h = 50;
    this.x = 200;
    this.y = 0;
    this.velY = 0;
    this.onGround = false;
    this.color = "#222";
    this.lives = 3;
    this.score = 0;
  }

  update() {
    if (keys.left) this.x -= 5;
    if (keys.right) this.x += 5;

    this.velY += 0.8; // Gravidade
    this.y += this.velY;

    if (this.y + this.h > groundLevel) {
      this.y = groundLevel - this.h;
      this.velY = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    if (keys.up && this.onGround) {
      this.velY = -15;
      this.onGround = false;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - cameraX, this.y, this.w, this.h);
  }
}

// Inimigos
class Enemy {
  constructor(x) {
    this.x = x;
    this.y = groundLevel - 30;
    this.size = 30;
    this.alive = true;
  }

  update() {}
  
  draw() {
    if (this.alive) {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x - cameraX, this.y, this.size, this.size);
    }
  }
}

// Nuvens
class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 80;
  }

  update() {
    this.x -= 0.5;
    if (this.x + this.size < cameraX) this.x = cameraX + canvas.width + 100;
  }

  draw() {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Configurações do mundo
let groundLevel = canvas.height - 50;
let player = new Player();
let enemies = [new Enemy(600)];
let clouds = [new Cloud(300, 100), new Cloud(800, 150)];
let cameraX = 0;

// Colisões
function checkCollision(p, e) {
  return (
    p.x < e.x + e.size &&
    p.x + p.w > e.x &&
    p.y < e.y + e.size &&
    p.y + p.h > e.y
  );
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Céu e chão
  ctx.fillStyle = "#228B22";
  ctx.fillRect(0, groundLevel, canvas.width, canvas.height - groundLevel);

  // Nuvens
  clouds.forEach(c => {
    c.update();
    c.draw();
  });

  // Jogador
  player.update();
  player.draw();

  // Inimigos
  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();

    if (enemy.alive && checkCollision(player, enemy)) {
      if (player.velY > 0 && player.y + player.h - player.velY < enemy.y) {
        enemy.alive = false;
        player.velY = -12;
        player.score++;
      } else {
        player.lives--;
        enemy.alive = false;
      }
    }
  });

  // Câmera segue o jogador
  cameraX = player.x - 200;

  // HUD
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Vidas: " + player.lives, 20, 30);
  ctx.fillText("Pontos: " + player.score, 20, 60);

  requestAnimationFrame(gameLoop);
}

gameLoop();
