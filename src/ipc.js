const { ipcMain } = require("electron");
const { askGrok }  = require("./grok");
const { getWin }   = require("./window");

const history      = [];
const tokenHistory = [];
const MAX_HISTORY  = 10;
const MAX_TOKENS_HISTORY = 50;

function registerIpc() {
  ipcMain.handle("ask-grok", async (_, prompt) => {
    const result = await askGrok(prompt);
    // store token snapshot
    if (result.usage) {
      tokenHistory.push({
        ts:         Date.now(),
        prompt:     result.usage.prompt_tokens     || 0,
        completion: result.usage.completion_tokens || 0,
        total:      result.usage.total_tokens      || 0,
      });
      if (tokenHistory.length > MAX_TOKENS_HISTORY) tokenHistory.shift();
    }
    return result;
  });

  ipcMain.handle("get-history", () => history);

  ipcMain.handle("get-token-history", () => tokenHistory);

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
