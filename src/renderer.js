let currentNote = {
  id: null,
  title: "New Note",
  content: "",
  pinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let saveTimeout;

window.addEventListener("DOMContentLoaded", async () => {
  const noteTitle = document.getElementById("noteTitle");
  const noteTitleInput = document.getElementById("noteTitleInput");
  const pinButton = document.getElementById("pinButton");
  const menuButton = document.getElementById("menuButton");
  const menuPopup = document.getElementById("menuPopup");
  const noteElement = document.getElementById("note");
  const backButton = document.getElementById("backButton");

  const currentNoteId = localStorage.getItem("currentNoteId");

  if (currentNoteId) {
    try {
      const loadedNote = await window.electronAPI.getNote(currentNoteId);
      if (loadedNote) {
        currentNote = loadedNote;
        noteTitle.textContent = currentNote.title;
        noteElement.innerHTML = currentNote.content;
        pinButton.textContent = currentNote.pinned ? "📍" : "📌";
      }
    } catch (error) {
      console.error("Error loading note:", error);
    }
  }

  window.electronAPI.onLoadNote(async (noteId) => {
    try {
      localStorage.setItem("currentNoteId", noteId);
      const loadedNote = await window.electronAPI.getNote(noteId);
      if (loadedNote) {
        currentNote = loadedNote;
        noteTitle.textContent = currentNote.title;
        noteElement.innerHTML = currentNote.content;
        pinButton.textContent = currentNote.pinned ? "📍" : "📌";
      }
    } catch (error) {
      console.error("Error loading note:", error);
    }
  });

  const autoSave = async () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await saveCurrentNote();
    }, 500);
  };

  async function saveCurrentNote() {
    try {
      currentNote.content = noteElement.innerHTML;
      currentNote.updatedAt = new Date().toISOString();
      if (!currentNote.id) {
        currentNote.id = Date.now().toString();
        currentNote.createdAt = new Date().toISOString();
      }
      await window.electronAPI.saveNote(currentNote);
      return currentNote.id;
    } catch (error) {
      console.error("Error saving note:", error);
    }
  }

  noteElement.addEventListener("input", autoSave);

  backButton.addEventListener("click", async () => {
    await saveCurrentNote();
    window.electronAPI.returnToNotes();
  });

  noteTitle.addEventListener("click", () => {
    noteTitleInput.value = noteTitle.textContent;
    noteTitle.style.display = "none";
    noteTitleInput.style.display = "inline-block";
    noteTitleInput.focus();
    noteTitleInput.select();
  });

  noteTitleInput.addEventListener("blur", saveNoteTitle);
  noteTitleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveNoteTitle();
    }
  });

  async function saveNoteTitle() {
    const value = noteTitleInput.value.trim() || "New Note";
    noteTitle.textContent = value;
    noteTitle.style.display = "inline-block";
    noteTitleInput.style.display = "none";
    currentNote.title = value;
    await saveCurrentNote();
  }

  pinButton.addEventListener("click", async () => {
    currentNote.pinned = !currentNote.pinned;
    pinButton.textContent = currentNote.pinned ? "📍" : "📌";
    await saveCurrentNote();
    window.electronAPI.toggleAlwaysOnTop();
  });

  menuButton.addEventListener("click", (e) => {
    menuPopup.style.display =
      menuPopup.style.display === "block" ? "none" : "block";
  });

  window.addEventListener("click", (e) => {
    if (
      menuPopup.style.display === "block" &&
      !menuPopup.contains(e.target) &&
      e.target !== menuButton
    ) {
      menuPopup.style.display = "none";
    }
  });

  document.getElementById("boldButton").addEventListener("click", () => {
    document.execCommand("bold");
    autoSave();
  });

  document.getElementById("italicButton").addEventListener("click", () => {
    document.execCommand("italic");
    autoSave();
  });

  document.getElementById("underlineButton").addEventListener("click", () => {
    document.execCommand("underline");
    autoSave();
  });
});
