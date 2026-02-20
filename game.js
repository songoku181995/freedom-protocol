// =======================
// CANVAS SETUP
// =======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =======================
// PLAYER: MR. FREEMAN
// =======================
let player = {
  name: "Mr. Freeman",
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 22,
  speed: 5,
  hp: 100
};

// =======================
// GAME STATE
// =======================
let enemies = [];
let bullets = [];
let keys = {};
let score = 0;
let wave = 1;
let gameOver = false;

// =======================
// CONTROLS
// =======================
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// =======================
// SHOOTING
// =======================
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

// =======================
// ENEMY SPAWNER
// =======================
function spawnWave() {
  for (let i = 0; i < wave; i++) {
    const rand = Math.random();

    let enemy;

    if (rand < 0.5) {
      // ZOMBIE
      enemy = {
        name: "Zombie",
        type: "zombie",
        color: "green",
        size: 18,
        hp: 40 + wave * 5,
        speed: 0.8
      };
    } else if (rand < 0.8) {
      // CORRUPT OFFICIAL
      enemy = {
        name: "Corrupt Official",
        type: "official",
        color: "red",
        size: 16,
        hp: 30 + wave * 4,
        speed: 1.4
      };
    } else {
      // MONSTER
      enemy = {
        name: "Monster",
        type: "monster",
        color: "purple",
        size: 26,
        hp: 80 + wave * 10,
        speed: 0.6
      };
    }

    enemy.x = Math.random() * canvas.width;
    enemy.y = Math.random() * canvas.height;

    enemies.push(enemy);
  }

  wave++;
}

setInterval(() => {
  if (!gameOver) spawnWave();
}, 3000);

// =======================
// GAME LOOP
// =======================
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
    ctx.fillText("Mr. Freeman has fallen", canvas.width / 2 - 110, canvas.height / 2 + 70);
    return;
  }

  // PLAYER MOVEMENT
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // DRAW PLAYER
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(player.name, player.x - 5, player.y - 5);

  // BULLETS
  bullets.forEach((b, bi) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillStyle = "yellow";
    ctx.fillRect(b.x, b.y, 4, 4);

    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(bi, 1);
    }
  });

  // ENEMIES
  enemies.forEach((e, ei) => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.size, e.size);

    // Label
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText(e.name, e.x - 5, e.y - 3);

    // Move toward Mr. Freeman
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
      player.hp -= e.type === "monster" ? 0.5 : 0.25;
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
          score += e.type === "monster" ? 30 : 10;
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
