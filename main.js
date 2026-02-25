require("dotenv").config();

const { app, BrowserWindow, globalShortcut, ipcMain, Tray } = require("electron");
const path = require("path");

// ---------- globals ----------
let win = null;
// let tray = null;

// ---------- window ----------
function createWindow() {
  win = new BrowserWindow({
    width: 520,
    height: 240,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer/index.html"));

  // safety: hide instead of close
  win.on("close", (e) => {
    e.preventDefault();
    win.hide();
  });
}

// ---------- grok api ----------
async function askGrok(prompt) {
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-4-1-fast-non-reasoning",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 256
      })
    });

    const raw = await res.text();
    console.log("STATUS:", res.status);
    console.log("RAW:", raw);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = JSON.parse(raw);
    return json.choices?.[0]?.message?.content ?? "[empty]";
  } catch (e) {
    console.error("GROK ERROR:", e);
    return "[grok error]";
  }
}

// ---------- ipc ----------
ipcMain.handle("ask-grok", async (_, prompt) => {
  return await askGrok(prompt);
});

ipcMain.on("hide-window", () => {
  if (win) win.hide();
});

// ---------- toggle ----------
function toggleWindow() {
  if (!win) return;

  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

// ---------- app lifecycle ----------
app.whenReady().then(() => {
  createWindow();

//   // tray (optional but useful)
//   tray = new Tray(path.join(__dirname, "icon.png"));
//   tray.on("click", toggleWindow);

  // global shortcut
  globalShortcut.register("Control+Space", toggleWindow);
});

// ---------- cleanup ----------
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// ---------- hard safety ----------
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED PROMISE:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});