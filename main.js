const path = require("path");
const { app, globalShortcut } = require("electron");

// resolve .env: next to exe when packaged, project root in dev
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, ".env")
  : path.join(__dirname, ".env");
require("dotenv").config({ path: envPath });

const { createWindow, registerShortcut, toggleWindow } = require("./src/window");
const { registerIpc } = require("./src/ipc");
const { createTray }  = require("./src/tray");

// ---------- app lifecycle ----------
app.whenReady().then(() => {
  registerIpc();
  createWindow();
  registerShortcut();
  createTray(toggleWindow);
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