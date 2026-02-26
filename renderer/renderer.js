const input       = document.getElementById("prompt");
const btnClose    = document.getElementById("btn-close");
const btnSend     = document.getElementById("btn-send");
const idle        = document.getElementById("idle");
const contextQ    = document.getElementById("context-query");
const answerCard  = document.getElementById("answer-card");
const answerText  = document.getElementById("answer-text");
const toastArea   = document.getElementById("toast-area");

// ── helpers ─────────────────────────────────────────────────────────────────
function showTyping() {
  answerText.innerHTML =
    `<div class="typing-dots"><span></span><span></span><span></span></div>`;
}

function showActionToast(label) {
  const t = document.createElement("div");
  t.className   = "action-toast";
  t.textContent = "✓ " + label;
  toastArea.appendChild(t);
  requestAnimationFrame(() => t.classList.add("visible"));
  setTimeout(() => {
    t.classList.remove("visible");
    t.addEventListener("transitionend", () => t.remove(), { once: true });
  }, 3000);
}

// ── submit ─────────────────────────────────────────────────────────────────
async function submit() {
  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = "";
  input.disabled = true;
  btnSend.disabled = true;

  idle.style.display = "none";
  contextQ.textContent = prompt;
  contextQ.classList.add("visible");
  answerCard.classList.add("visible");
  showTyping();

  const res = await window.lyra.ask(prompt);

  const text    = typeof res === "object" ? res.text    : res;
  const actions = typeof res === "object" ? res.actions : [];

  for (const a of (actions || [])) showActionToast(a);

  answerCard.style.animation = "none";
  answerCard.offsetHeight;
  answerCard.style.animation = "";

  answerText.textContent = text;
  input.disabled = false;
  btnSend.disabled = false;
  input.focus();
}

btnClose.addEventListener("click", () => window.lyra.hide());
btnSend.addEventListener("click", submit);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter")  submit();
  if (e.key === "Escape") window.lyra.hide();
});

// ── toast ───────────────────────────────────────────────────────────────────
function showTyping() {
  answerText.innerHTML =
    `<div class="typing-dots"><span></span><span></span><span></span></div>`;
}

function showActionToast(label) {
  const t = document.createElement("div");
  t.className   = "action-toast";
  t.textContent = "✓ " + label;
  toastArea.appendChild(t);
  requestAnimationFrame(() => t.classList.add("visible"));
  setTimeout(() => {
    t.classList.remove("visible");
    t.addEventListener("transitionend", () => t.remove(), { once: true });
  }, 3000);
}

// ── stats chart ──────────────────────────────────────────────────────────────
function drawChart(data) {
  // match canvas pixel buffer to its CSS display size
  chartCanvas.width  = chartCanvas.clientWidth  || 480;
  chartCanvas.height = chartCanvas.clientHeight || 160;
  const ctx    = chartCanvas.getContext("2d");
  const W      = chartCanvas.width;
  const H      = chartCanvas.height;
  const PAD_L  = 42;
  const PAD_R  = 12;
  const PAD_T  = 12;
  const PAD_B  = 28;
  const cW     = W - PAD_L - PAD_R;
  const cH     = H - PAD_T - PAD_B;
  const N      = Math.min(data.length, 20);
  const slice  = data.slice(-N);

  ctx.clearRect(0, 0, W, H);

  if (N === 0) return;

  const maxVal = Math.max(...slice.map(d => d.total), 1);
  const barW   = Math.floor(cW / N) - 4;
  const barGap = Math.floor(cW / N);

  // grid lines + y labels
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.fillStyle   = "#4b5675";
  ctx.font        = "10px Inter, system-ui, sans-serif";
  ctx.textAlign   = "right";
  ctx.lineWidth   = 1;
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = PAD_T + cH - (i / gridLines) * cH;
    ctx.beginPath();
    ctx.moveTo(PAD_L, y);
    ctx.lineTo(W - PAD_R, y);
    ctx.stroke();
    ctx.fillText(Math.round((i / gridLines) * maxVal), PAD_L - 4, y + 3.5);
  }

  // bars
  slice.forEach((d, i) => {
    const x      = PAD_L + i * barGap + Math.floor((barGap - barW) / 2);
    const hTotal = Math.round((d.total      / maxVal) * cH);
    const hComp  = Math.round((d.completion / maxVal) * cH);
    const hPrmt  = hTotal - hComp;

    // full bar in prompt colour (bottom layer)
    ctx.fillStyle = "#2d3a5e";
    ctx.beginPath();
    ctx.roundRect(x, PAD_T + cH - hTotal, barW, hTotal || 0, [3, 3, 3, 3]);
    ctx.fill();

    // completion layer on top (accent)
    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.roundRect(x, PAD_T + cH - hTotal, barW, hComp || 0, [3, 3, 0, 0]);
    ctx.fill();

    // x label: request number
    ctx.fillStyle   = "#4b5675";
    ctx.textAlign   = "center";
    ctx.fillText(`#${data.length - N + i + 1}`, x + barW / 2, H - 6);
  });
}

async function openStats() {
  statsPanel.classList.add("visible");
  const data = await window.lyra.getTokenHistory();

  const total    = data.reduce((s, d) => s + d.total, 0);
  const avg      = data.length ? Math.round(total / data.length) : 0;

  document.getElementById("val-total").textContent    = total.toLocaleString();
  document.getElementById("val-requests").textContent = data.length;
  document.getElementById("val-avg").textContent      = avg.toLocaleString();

  chartEmpty.style.display = data.length ? "none" : "block";
  drawChart(data);
}

btnStatsClose.addEventListener("click", () => statsPanel.classList.remove("visible"));

// Ctrl+Shift+Space → toggle stats (via globalShortcut → IPC)
window.lyra.onToggleStats(() => {
  statsPanel.classList.contains("visible") ? statsPanel.classList.remove("visible") : openStats();
});

// ── submit ─────────────────────────────────────────────────────────────────
async function submit() {
  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = "";
  input.disabled = true;
  btnSend.disabled = true;

  idle.style.display = "none";
  contextQ.textContent = prompt;
  contextQ.classList.add("visible");
  answerCard.classList.add("visible");
  showTyping();

  const res = await window.lyra.ask(prompt);

  const text    = typeof res === "object" ? res.text    : res;
  const actions = typeof res === "object" ? res.actions : [];

  for (const a of (actions || [])) showActionToast(a);

  answerCard.style.animation = "none";
  answerCard.offsetHeight;
  answerCard.style.animation = "";

  answerText.textContent = text;
  input.disabled = false;
  btnSend.disabled = false;
  input.focus();
}

btnClose.addEventListener("click", () => window.lyra.hide());
btnSend.addEventListener("click", submit);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter")  submit();
  if (e.key === "Escape") window.lyra.hide();
});