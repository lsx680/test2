const root = document.documentElement;
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

const hueInput = document.getElementById("hue");
const bloomInput = document.getElementById("bloom");
const speedInput = document.getElementById("speed");
const gridInput = document.getElementById("grid");

const hueVal = document.getElementById("hueVal");
const bloomVal = document.getElementById("bloomVal");
const speedVal = document.getElementById("speedVal");
const readout = document.getElementById("readout");
const preview = document.getElementById("preview");

const state = { hue: 312, bloom: 0.62, speed: 1, grid: true };

let width = 0;
let height = 0;
let dpr = 1;
let particles = [];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seed(Math.round(Math.min(width * height / 9000, 180)));
}

function seed(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.8 + 0.2,
      v: Math.random() * 0.9 + 0.35
    });
  }
}

function syncFromState() {
  root.style.setProperty("--hue", state.hue);
  root.style.setProperty("--bloom", state.bloom);
  root.style.setProperty("--speed", state.speed);

  hueVal.textContent = state.hue + "°";
  bloomVal.textContent = state.bloom.toFixed(2);
  speedVal.textContent = state.speed.toFixed(2) + "×";
  readout.textContent = `hue ${state.hue}° · bloom ${state.bloom.toFixed(2)} · ${state.speed.toFixed(2)}×`;
  preview.classList.toggle("no-grid", !state.grid);
}

function bind(input, key, transform) {
  input.addEventListener("input", () => {
    state[key] = transform(Number(input.value));
    syncFromState();
  });
}

bind(hueInput, "hue", (v) => Math.round(v));
bind(bloomInput, "bloom", (v) => v);
bind(speedInput, "speed", (v) => v);

gridInput.addEventListener("change", () => {
  state.grid = gridInput.checked;
  syncFromState();
});

function drawGrid(t) {
  if (!state.grid) return;
  const step = 56;
  const shift = (t * 18 * state.speed) % step;
  ctx.lineWidth = 1;

  for (let x = -step; x <= width + step; x += step) {
    ctx.strokeStyle = `hsla(${state.hue}, 100%, 62%, 0.10)`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = -step; y <= height + step; y += step) {
    ctx.strokeStyle = `hsla(${state.hue + 62}, 100%, 60%, 0.08)`;
    ctx.beginPath();
    ctx.moveTo(0, y + shift);
    ctx.lineTo(width, y + shift);
    ctx.stroke();
  }
}

function drawParticles() {
  const glow = 0.25 + state.bloom * 0.9;
  for (const p of particles) {
    p.y -= p.v * state.speed * p.z;
    p.x += Math.sin((p.y + p.x) * 0.004) * 0.35;

    if (p.y < -12) {
      p.y = height + 12;
      p.x = Math.random() * width;
    }

    const radius = p.z * (1.1 + state.bloom * 2.4);
    ctx.beginPath();
    ctx.fillStyle = `hsla(${state.hue + p.z * 62}, 100%, ${64 + p.z * 12}%, ${glow * p.z})`;
    ctx.shadowColor = `hsla(${state.hue + p.z * 62}, 100%, 65%, 0.9)`;
    ctx.shadowBlur = 8 + state.bloom * 18;
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function frame(t) {
  ctx.clearRect(0, 0, width, height);
  drawGrid(t);
  drawParticles();
  requestAnimationFrame(frame);
}


window.addEventListener("resize", resize);

resize();
syncFromState();
requestAnimationFrame(frame);