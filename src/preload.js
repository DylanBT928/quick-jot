const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toggleAlwaysOnTop: () => ipcRenderer.send("toggleAlwaysOnTop"),
  saveNote: (note) => ipcRenderer.invoke("saveNote", note),
  getAllNotes: () => ipcRenderer.invoke("getAllNotes"),
  getNote: (id) => ipcRenderer.invoke("getNote", id),
  deleteNote: (id) => ipcRenderer.invoke("deleteNote", id),
  openNote: (id) => ipcRenderer.send("openNote", id),
  returnToNotes: () => ipcRenderer.send("returnToNotes"),
  onLoadNote: (callback) =>
    ipcRenderer.on("loadNote", (_, noteId) => callback(noteId)),
  pinWindow: (shouldPin) => ipcRenderer.send("pinWindow", shouldPin),
  unpinWindow: () => ipcRenderer.send("pinWindow", false),
});
