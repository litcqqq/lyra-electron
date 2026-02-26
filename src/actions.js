const { shell } = require("electron");
const { exec }   = require("child_process");

// ── App URI / path map ────────────────────────────────────────────────────
// Maps normalised keyword → URI scheme or Windows `start` target
const APP_MAP = {
  // media
  spotify:        "spotify:",
  youtube:        "https://www.youtube.com",
  "youtube music":"https://music.youtube.com",
  netflix:        "https://www.netflix.com",
  vlc:            "vlc",

  // browser / productivity
  brave:          "brave",
  "file explorer":"explorer",
  explorer:       "explorer",
  discord:        "discord:",

  // dev
  vscode:         "code",
  "vs code":      "code",
  terminal:       "wt",           // Windows Terminal
  cmd:            "cmd",
  pycharm:        "pycharm64",
};

/**
 * Execute an `open_app` tool call.
 * @param {string} app   – app name as returned by the model
 * @param {string} [url] – fallback URL if any
 * @returns {Promise<string>} human-readable result label
 */
async function openApp(app, url) {
  const key    = app.toLowerCase().trim();
  const target = APP_MAP[key];

  // URI scheme (e.g., "spotify:" or "discord:") → shell.openExternal
  if (target && (target.startsWith("http") || target.includes(":"))) {
    await shell.openExternal(target);
    return `Membuka ${app}`;
  }

  // Windows executable name → `start <exe>`
  if (target) {
    return new Promise((resolve) => {
      exec(`start ${target}`, (err) => {
        resolve(err ? `Gagal membuka ${app}` : `Membuka ${app}`);
      });
    });
  }

  // Fallback: try the raw string as a `start` command
  return new Promise((resolve) => {
    exec(`start ${key}`, (err) => {
      if (!err) return resolve(`Membuka ${app}`);
      // Last resort: open URL if provided
      if (url) {
        shell.openExternal(url).then(() => resolve(`Membuka ${url}`));
      } else {
        resolve(`Tidak bisa menemukan aplikasi: ${app}`);
      }
    });
  });
}

/**
 * Execute an `open_url` tool call.
 */
async function openUrl(url) {
  await shell.openExternal(url);
  return `Membuka ${url}`;
}

/**
 * Execute an `open_search` tool call.
 */
async function openSearch(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  await shell.openExternal(url);
  return `Mencari "${query}" di Google`;
}

/**
 * Dispatch a tool-call object returned by the Grok API.
 * @param {{ name: string, arguments: object }} toolCall
 * @returns {Promise<string>}
 */
async function dispatchTool(toolCall) {
  const args = toolCall.arguments;
  switch (toolCall.name) {
    case "open_app":    return openApp(args.app, args.url);
    case "open_url":    return openUrl(args.url);
    case "open_search": return openSearch(args.query);
    default:            return `Tool tidak dikenal: ${toolCall.name}`;
  }
}

module.exports = { dispatchTool };
