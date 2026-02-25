const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lyra", {
  ask: (prompt) => ipcRenderer.invoke("ask-grok", prompt),
  hide: () => ipcRenderer.send("hide")
});