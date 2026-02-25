const { ipcMain } = require("electron");
const { askGrok }  = require("./grok");
const { getWin }   = require("./window");

const history    = [];
const MAX_HISTORY = 10;

function registerIpc() {
  ipcMain.handle("ask-grok", async (_, prompt) => {
    return await askGrok(prompt);
  });

  ipcMain.handle("get-history", () => {
    return history;
  });

  ipcMain.on("push-history", (_, item) => {
    history.push(item);
    if (history.length > MAX_HISTORY) history.shift();
  });

  ipcMain.on("hide-window", () => {
    const win = getWin();
    if (win) win.hide();
  });
}

module.exports = { registerIpc };
