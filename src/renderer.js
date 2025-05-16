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
  const colorPickerButton = document.getElementById("colorPickerButton");
  const colorPickerPopup = document.getElementById("colorPickerPopup");
  const colorDot = document.querySelector(".color-dot");
  const noteElement = document.getElementById("note");
  const backButton = document.getElementById("backButton");

  function updateNoteColor(colorClass) {
    noteElement.classList.remove(
      "color-yellow",
      "color-blue",
      "color-green",
      "color-orange",
      "color-purple"
    );

    switch (colorClass) {
      case "color-blue":
        noteElement.style.backgroundColor = "#bbdefb";
        colorDot.style.backgroundColor = "#bbdefb";
        break;
      case "color-green":
        noteElement.style.backgroundColor = "#c8e6c9";
        colorDot.style.backgroundColor = "#c8e6c9";
        break;
      case "color-orange":
        noteElement.style.backgroundColor = "#ffccbc";
        colorDot.style.backgroundColor = "#ffccbc";
        break;
      case "color-purple":
        noteElement.style.backgroundColor = "#e1bee7";
        colorDot.style.backgroundColor = "#e1bee7";
        break;
      default:
        noteElement.style.backgroundColor = "#fff9c4"; // Default yellow
        colorDot.style.backgroundColor = "#fff9c4";
    }

    currentNote.color = colorClass;
    localStorage.setItem("currentNoteColor", colorClass);
    saveCurrentNote();
  }

  const savedColor = localStorage.getItem("currentNoteColor") || "color-yellow";
  updateNoteColor(savedColor);

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

  colorPickerButton.addEventListener("click", (e) => {
    e.stopPropagation();
    colorPickerPopup.style.display =
      colorPickerPopup.style.display === "flex" ? "none" : "flex";
  });

  const colorOptions = document.querySelectorAll(".color-option");
  colorOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const colorClass = option.dataset.color;
      updateNoteColor(colorClass);
      colorPickerPopup.style.display = "none";
    });
  });

  window.addEventListener("click", (e) => {
    if (
      colorPickerPopup.style.display === "flex" &&
      !colorPickerPopup.contains(e.target) &&
      e.target !== colorPickerButton
    ) {
      colorPickerPopup.style.display = "none";
    }
  });

  window.electronAPI.onLoadNote(async (noteId) => {
    try {
      localStorage.setItem("currentNoteId", noteId);
      const loadedNote = await window.electronAPI.getNote(noteId);
      if (loadedNote) {
        currentNote = loadedNote;
        noteTitle.textContent = currentNote.title;
        noteElement.innerHTML = currentNote.content;

        pinButton.textContent = "📌";

        window.electronAPI.unpinWindow();

        const noteColor = loadedNote.color || "color-yellow";
        updateNoteColor(noteColor);
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

  if (pinButton) {
    pinButton.textContent = "📌";

    pinButton.addEventListener("click", () => {
      const isPinned = pinButton.textContent === "📍";

      if (isPinned) {
        pinButton.textContent = "📌";
        window.electronAPI.pinWindow(false);
      } else {
        pinButton.textContent = "📍";
        window.electronAPI.pinWindow(true);
      }
    });
  }

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
