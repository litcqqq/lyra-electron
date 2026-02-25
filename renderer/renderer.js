const input = document.getElementById("prompt");
const output = document.getElementById("output");

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    output.textContent = "";
    const res = await window.lyra.ask(input.value);
    output.textContent = res;
    input.value = "";
  }

  if (e.key === "Escape") {
    window.close();
  }
});