// =======================
// CANVAS SETUP
// =======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =======================
// LOAD SPRITES
// =======================
const freemanImg = new Image();
freemanImg.src = "freeman.png";

const zombieImg = new Image();
zombieImg.src = "zombie.png";

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
// INPUT
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
// ENEMY WAVES
// =======================
function spawnWave() {
  for (let i = 0; i < wave; i++) {
    const r = Math.random();
    let enemy;

    if (r < 0.55) {
      // ZOMBIE
      enemy = {
        type: "zombie",
        size: 26,
        hp: 40 + wave * 5,
        speed: 0.8,
        damage: 0.25
      };
    } else if (r < 0.8) {
      // CORRUPT OFFICIAL
      enemy = {
        type: "official",
        size: 18,
        hp: 30 + wave * 4,
        speed: 1.4,
        damage: 0.35
      };
    } else {
      // MONSTER
      enemy = {
        type: "monster",
        size: 32,
        hp: 80 + wave * 10,
        speed: 0.6,
        damage: 0.6
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

  // ---------- GAME OVER ----------
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

  // ---------- PLAYER MOVEMENT ----------
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // ---------- PLAYER HITBOX ----------
  const playerHitbox = {
    x: player.x + 10,
    y: player.y + 10,
    w: player.size,
    h: player.size
  };

  // ---------- DRAW MR. FREEMAN ----------
  ctx.drawImage(
    freemanImg,
    player.x,
    player.y,
    player.size * 1.5,
    player.size * 1.8
  );

  // ---------- BULLETS ----------
  bullets.forEach((b, bi) => {
    b.x += b.dx;
    b.y += b.dy;

    ctx.fillStyle = "yellow";
    ctx.fillRect(b.x, b.y, 4, 4);

    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(bi, 1);
    }
  });

  // ---------- ENEMIES ----------
  enemies.forEach((e, ei) => {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    // DRAW ENEMY
    if (e.type === "zombie") {
      ctx.drawImage(zombieImg, e.x, e.y, e.size * 1.6, e.size * 1.6);
    } else if (e.type === "official") {
      ctx.fillStyle = "red";
      ctx.fillRect(e.x, e.y, e.size, e.size);
    } else {
      ctx.fillStyle = "purple";
      ctx.fillRect(e.x, e.y, e.size, e.size);
    }

    // DAMAGE PLAYER
    if (
      playerHitbox.x < e.x + e.size &&
      playerHitbox.x + playerHitbox.w > e.x &&
      playerHitbox.y < e.y + e.size &&
      playerHitbox.y + playerHitbox.h > e.y
    ) {
      player.hp -= e.damage;
    }

    // BULLET COLLISION
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

  // ---------- HUD ----------
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("HP: " + Math.max(0, Math.floor(player.hp)), 10, 20);
  ctx.fillText("Score: " + score, 10, 40);
  ctx.fillText("Wave: " + wave, 10, 60);

  requestAnimationFrame(update);
}

update();
