const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { x: 400, y: 250, size: 20, hp: 100 };
let enemies = [];

function spawnEnemy() {
  enemies.push({
    x: Math.random() * 800,
    y: Math.random() * 500,
    size: 15,
    type: Math.random() > 0.5 ? "zombie" : "official"
  });
}

setInterval(spawnEnemy, 1200);

document.addEventListener("keydown", e => {
  if (e.key === "w") player.y -= 5;
  if (e.key === "s") player.y += 5;
  if (e.key === "a") player.x -= 5;
  if (e.key === "d") player.x += 5;
});

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.type === "zombie" ? "green" : "red";
    ctx.fillRect(e.x, e.y, e.size, e.size);

    // Move toward player
    e.x += (player.x - e.x) * 0.01;
    e.y += (player.y - e.y) * 0.01;
  });

  requestAnimationFrame(update);
}

update();