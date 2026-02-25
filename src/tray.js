const { Tray, Menu, nativeImage } = require("electron");
const path = require("path");

let tray = null;

function createTray(toggleWindow) {
  const iconPath = path.join(__dirname, "..", "assets", "icon.png");
  const icon     = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(icon);
  tray.setToolTip("Lyra");

  const menu = Menu.buildFromTemplate([
    { label: "Show / Hide  (Ctrl+Space)", click: toggleWindow },
    { type: "separator" },
    { label: "Quit Lyra", role: "quit" },
  ]);

  tray.setContextMenu(menu);
  tray.on("click", toggleWindow);

  return tray;
}

module.exports = { createTray };
