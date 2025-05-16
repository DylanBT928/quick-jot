const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 500,
    minWidth: 350,
    minHeight: 300,
    maxWidth: 650,
    maxHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("src/index.html");
}

app.whenReady().then(createWindow);

ipcMain.on("toggle-always-on-top", () => {
  const current = win.isAlwaysOnTop();
  win.setAlwaysOnTop(!current);
});
