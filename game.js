// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 20,
  speed: 5,
  hp: 100
};

// Game state
let enemies = [];
let bullets = [];
let keys = {};
let score = 0;
let wave = 1;
let gameOver = false;

// Controls
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Shooting
canvas.addEventListener("click", e => {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const angle = Math.atan2(my - player.y, mx - player.x);

  bullets.push({
    x: player.x + player.size / 2,
    y: player.y + player.size / 2,
    dx: Math.cos(angle) * 7,
    dy: Math.sin(angle) * 7
  });
});

// Enemy spawner
function spawnWave() {
  for (let i = 0; i < wave; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 15,
      hp: 30 + wave * 5,
      speed: 0.5 + wave * 0.1,
      type: Math.random() > 0.6 ? "monster" : "zombie"
    });
  }
  wave++;
}

setInterval(() => {
  if (!gameOver) spawnWave();
}, 3000);

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GAME OVER
  if (player.hp <= 0) {
    gameOver = true;
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Final Score: " + score, canvas.width / 2 - 80, canvas.height / 2 + 40);
    ctx.fillText("Refresh to Restart", canvas.width / 2 - 90, canvas.height / 2 + 70);
    return;
  }

  // Player movement
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // Clamp player
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // Draw player
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Bullets
  bullets.forEach((b, bi) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillStyle = "yellow";
    ctx.fillRect(b.x, b.y, 4, 4);

    // Remove offscreen bullets
    if (
      b.x < 0 || b.x > canvas.width ||
      b.y < 0 || b.y > canvas.height
    ) {
      bullets.splice(bi, 1);
    }
  });

  // Enemies
  enemies.forEach((e, ei) => {
    ctx.fillStyle = e.type === "monster" ? "purple" : "green";
    ctx.fillRect(e.x, e.y, e.size, e.size);

    // Move toward player
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    // Damage player
    if (
      player.x < e.x + e.size &&
      player.x + player.size > e.x &&
      player.y < e.y + e.size &&
      player.y + player.size > e.y
    ) {
      player.hp -= 0.2;
    }

    // Bullet collision
    bullets.forEach((b, bi) => {
      if (
        b.x < e.x + e.size &&
        b.x > e.x &&
        b.y < e.y + e.size &&
        b.y > e.y
      ) {
        e.hp -= 20;
        bullets.splice(bi, 1);

        if (e.hp <= 0) {
          enemies.splice(ei, 1);
          score += 10;
        }
      }
    });
  });

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("HP: " + Math.max(0, Math.floor(player.hp)), 10, 20);
  ctx.fillText("Score: " + score, 10, 40);
  ctx.fillText("Wave: " + wave, 10, 60);

  requestAnimationFrame(update);
}

update();
