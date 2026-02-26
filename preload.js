const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lyra", {
  ask: (prompt) => ipcRenderer.invoke("ask-grok", prompt),
  hide: () => ipcRenderer.send("hide-window"),
  getHistory: () => ipcRenderer.invoke("get-history"),
  pushHistory: (item) => ipcRenderer.send("push-history", item),
  getTokenHistory: () => ipcRenderer.invoke("get-token-history"),
  onToggleStats: (cb) => ipcRenderer.on("toggle-stats", cb),
});