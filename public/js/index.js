// console.log(gsap);
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const bigScoreEl = document.querySelector("#bigScoreEl");

const friction = 0.99;

const x = canvas.width / 2;
const y = canvas.height / 2;

let projectiles = [];
let player = new Player(x, y, 10, "white");
let enemies = [];
let particles = [];

function init() {
  projectiles = [];
  player = new Player(x, y, 10, "white");
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  bigScoreEl.innerHTML = score;
}

//spawn enemies every 1 second
function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 20) + 20;
    let x;
    let y;

    //50% chance of spawning on left or right side of screen
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
      //50% chance of spawning on top or bottom of screen
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    //spawn enemies
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

let animationId;
let score = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.1)";

  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  //animate particles
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  //update projectiles
  projectiles.forEach((projectile, index) => {
    projectile.update();

    //remove projectiles from edges of screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  //update enemies
  enemies.forEach((enemy, index) => {
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    //When enemy touches player (end game)
    if (dist - enemy.radius - player.radius <= -1) {
      cancelAnimationFrame(animationId);
      modalEl.style.display = "flex";
      bigScoreEl.innerHTML = score;
    }

    projectiles.forEach((projectile, pIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      //When projectiles touch enemy
      if (dist - enemy.radius - projectile.radius <= 1) {
        //create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        // if radius is big enough
        if (enemy.radius - 10 > 5) {
          //increase score
          score += 100;
          scoreEl.innerHTML = score;

          //shrink enemy
          gsap.to(enemy, { radius: enemy.radius - 10 });
          //remove projectile
          setTimeout(() => {
            projectiles.splice(pIndex, 1);
          }, 0);

          // else remove enemy and projectile
        } else {
          //increase score
          score += 250;
          scoreEl.innerHTML = score;

          //remove enemy and projectile
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(pIndex, 1);
          }, 0);
        }
      }
    });
  });
}

startGameBtn.addEventListener("click", function () {
  init();
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
});
