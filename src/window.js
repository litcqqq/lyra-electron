const { BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 560,
    height: 400,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  // hide instead of close
  win.on("close", (e) => {
    e.preventDefault();
    win.hide();
  });
}

function toggleWindow() {
  if (!win) return;

  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

function getWin() {
  return win;
}

function registerShortcut() {
  globalShortcut.register("Control+Space", toggleWindow);
  globalShortcut.register("Control+Shift+Space", () => {
    if (!win) return;
    if (!win.isVisible()) { win.show(); win.focus(); }
    win.webContents.send("toggle-stats");
  });
}

module.exports = { createWindow, toggleWindow, getWin, registerShortcut };
