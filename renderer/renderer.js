const input       = document.getElementById("prompt");
const btnClose    = document.getElementById("btn-close");
const btnSend     = document.getElementById("btn-send");
const idle        = document.getElementById("idle");
const contextQ    = document.getElementById("context-query");
const answerCard  = document.getElementById("answer-card");
const answerText  = document.getElementById("answer-text");

function showTyping() {
  answerText.innerHTML =
    `<div class="typing-dots"><span></span><span></span><span></span></div>`;
}

async function submit() {
  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = "";
  input.disabled = true;
  btnSend.disabled = true;

  // hide idle, show card
  idle.style.display = "none";
  contextQ.textContent = prompt;
  contextQ.classList.add("visible");
  answerCard.classList.add("visible");
  showTyping();

  const res = await window.lyra.ask(prompt);

  // re-animate card on new answer
  answerCard.style.animation = "none";
  answerCard.offsetHeight; // reflow
  answerCard.style.animation = "";

  answerText.textContent = res;
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