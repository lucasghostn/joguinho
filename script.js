const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// CONTROLES
let keys = { left: false, right: false, up: false };
document.getElementById("leftBtn").addEventListener("touchstart", () => keys.left = true);
document.getElementById("leftBtn").addEventListener("touchend", () => keys.left = false);
document.getElementById("rightBtn").addEventListener("touchstart", () => keys.right = true);
document.getElementById("rightBtn").addEventListener("touchend", () => keys.right = false);
document.getElementById("jumpBtn").addEventListener("touchstart", () => keys.up = true);
document.getElementById("jumpBtn").addEventListener("touchend", () => keys.up = false);

// VARIÁVEIS GLOBAIS
let groundLevel = canvas.height - 80;
let cameraX = 0;

// CLASSES
class Player {
  constructor() {
    this.w = 50;
    this.h = 50;
    this.x = 200;
    this.y = groundLevel - this.h;
    this.velY = 0;
    this.speed = 6;
    this.lives = 3;
    this.score = 0;
    this.onGround = true;
  }

  update() {
    if (keys.left) this.x -= this.speed;
    if (keys.right) this.x += this.speed;

    // Gravidade e pulo
    this.velY += 0.8;
    this.y += this.velY;
    if (this.y + this.h >= groundLevel) {
      this.y = groundLevel - this.h;
      this.velY = 0;
      this.onGround = true;
    }

    if (keys.up && this.onGround) {
      this.velY = -16;
      this.onGround = false;
    }
  }

  draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(this.x - cameraX, this.y, this.w, this.h);
  }
}

class Enemy {
  constructor(x) {
    this.x = x;
    this.y = groundLevel - 30;
    this.size = 30;
    this.speed = 2;
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.alive = true;
  }

  update() {
    this.x += this.speed * this.direction;
    if (this.x < cameraX || this.x > cameraX + canvas.width) {
      this.direction *= -1;
    }
  }

  draw() {
    if (this.alive) {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x - cameraX, this.y, this.size, this.size);
    }
  }
}

class Cloud {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = 100;
  }

  update() {
    this.x -= this.speed;
    if (this.x + this.size < cameraX) this.x = cameraX + canvas.width + 200;
  }

  draw() {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// OBJETOS DO JOGO
let player = new Player();
let enemies = [new Enemy(800), new Enemy(1400)];
let clouds = [
  new Cloud(300, 100, 0.3),
  new Cloud(600, 150, 0.5),
  new Cloud(1200, 80, 0.2)
];

// FUNÇÕES
function checkCollision(p, e) {
  return (
    p.x < e.x + e.size &&
    p.x + p.w > e.x &&
    p.y < e.y + e.size &&
    p.y + p.h > e.y
  );
}

function handleCollisions() {
  enemies.forEach(enemy => {
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
}

function drawHUD() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Vidas: ${player.lives}`, 20, 30);
  ctx.fillText(`Pontos: ${player.score}`, 20, 60);
}

// LOOP PRINCIPAL
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fundo parallax
  ctx.fillStyle = "#6BB7FF";
  ctx.fillRect(0, 0, canvas.width, groundLevel);

  // Nuvens
  clouds.forEach(cloud => {
    cloud.update();
    cloud.draw();
  });

  // Chão
  ctx.fillStyle = "#228B22";
  ctx.fillRect(0, groundLevel, canvas.width, canvas.height - groundLevel);

  // Atualizações
  player.update();
  enemies.forEach(enemy => enemy.update());
  handleCollisions();

  // Desenhar
  player.draw();
  enemies.forEach(enemy => enemy.draw());
  drawHUD();

  // Câmera segue jogador
  cameraX = player.x - 200;

  requestAnimationFrame(gameLoop);
}

gameLoop();
