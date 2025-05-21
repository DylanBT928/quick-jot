const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

app.name = "Quick Jot";
app.setName("Quick Jot");

let win;
let notesDir;
let windowPosition = { x: undefined, y: undefined };

let iconPath;
if (process.platform === "darwin") {
  iconPath = path.join(__dirname, "../assets/mac/icon.icns");
} else if (process.platform === "win32") {
  iconPath = path.join(__dirname, "../assets/win/icon.ico");
} else {
  iconPath = path.join(__dirname, "../assets/png/512x512.png");
}

function setupNotesDirectory() {
  const documentsPath = path.join(os.homedir(), "Documents");
  notesDir = path.join(documentsPath, "QuickJot");

  if (!fs.existsSync(notesDir)) {
    try {
      fs.mkdirSync(notesDir, { recursive: true });
      console.log("Created notes directory:", notesDir);
    } catch (err) {
      console.error("Error creating notes directory:", err);
    }
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 500,
    minWidth: 350,
    minHeight: 300,
    maxWidth: 650,
    maxHeight: 650,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("src/notes.html");

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }
}

function createNotesListWindow() {
  const windowOptions = {
    width: 500,
    height: 500,
    resizable: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (windowPosition.x !== undefined && windowPosition.y !== undefined) {
    windowOptions.x = windowPosition.x;
    windowOptions.y = windowPosition.y;
  }

  win = new BrowserWindow(windowOptions);
  win.loadFile("src/notes.html");

  win.on("move", () => {
    const position = win.getPosition();
    windowPosition.x = position[0];
    windowPosition.y = position[1];
  });
}

function createNoteEditorWindow(noteId) {
  const windowOptions = {
    width: 500,
    height: 500,
    minWidth: 350,
    minHeight: 300,
    maxWidth: 650,
    maxHeight: 650,
    resizable: true,
    alwaysOnTop: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (windowPosition.x !== undefined && windowPosition.y !== undefined) {
    windowOptions.x = windowPosition.x;
    windowOptions.y = windowPosition.y;
  }

  win = new BrowserWindow(windowOptions);
  win.loadFile("src/index.html");

  win.on("move", () => {
    const position = win.getPosition();
    windowPosition.x = position[0];
    windowPosition.y = position[1];
  });

  if (noteId) {
    win.webContents.on("didFinishLoad", () => {
      win.webContents.send("loadNote", noteId);
    });
  }
}

// Set app icon for macOS dock
if (process.platform === "darwin") {
  app.dock.setIcon(path.join(__dirname, "../assets/png/512x512.png"));
}

app.whenReady().then(() => {
  setupNotesDirectory();
  createNotesListWindow();
});

app.on("windowAllClosed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createNotesListWindow();
  }
});

ipcMain.on("toggleAlwaysOnTop", () => {
  const current = win.isAlwaysOnTop();
  win.setAlwaysOnTop(!current);
});

ipcMain.on("pinWindow", (event, shouldPin) => {
  if (win) {
    win.setAlwaysOnTop(shouldPin);
  }
});

ipcMain.handle("saveNote", async (event, note) => {
  try {
    if (!note.id) {
      note.id = Date.now().toString();
    }

    if (!fs.existsSync(notesDir)) {
      await fs.promises.mkdir(notesDir, { recursive: true });
    }

    const filePath = path.join(notesDir, `${note.id}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(note, null, 2));
    return note;
  } catch (error) {
    console.error("Error saving note:", error);
    throw error;
  }
});

ipcMain.handle("getAllNotes", async () => {
  try {
    if (!fs.existsSync(notesDir)) {
      await fs.promises.mkdir(notesDir, { recursive: true });
      return [];
    }

    const files = await fs.promises.readdir(notesDir);
    const notes = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const filePath = path.join(notesDir, file);
          const data = await fs.promises.readFile(filePath, "utf8");
          const note = JSON.parse(data);
          notes.push(note);
        } catch (error) {
          console.error(`Error reading note file ${file}:`, error);
        }
      }
    }

    return notes;
  } catch (error) {
    console.error("Error getting all notes:", error);
    return [];
  }
});

ipcMain.handle("getNote", async (event, id) => {
  try {
    const filePath = path.join(notesDir, `${id}.json`);
    const data = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting note with id ${id}:`, error);
    throw error;
  }
});

ipcMain.handle("deleteNote", async (event, id) => {
  try {
    const filePath = path.join(notesDir, `${id}.json`);
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting note with id ${id}:`, error);
    throw error;
  }
});

ipcMain.on("openNote", (event, noteId) => {
  if (win) {
    const position = win.getPosition();
    windowPosition.x = position[0];
    windowPosition.y = position[1];
    win.close();
  }
  createNoteEditorWindow(noteId);
});

ipcMain.on("returnToNotes", () => {
  if (win) {
    const position = win.getPosition();
    windowPosition.x = position[0];
    windowPosition.y = position[1];
    win.close();
  }
  createNotesListWindow();
});
