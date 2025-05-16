window.addEventListener("DOMContentLoaded", () => {
  const noteTitle = document.getElementById("noteTitle");
  const noteTitleInput = document.getElementById("noteTitleInput");

  const pinButton = document.getElementById("pinButton");
  const menuButton = document.getElementById("menuButton");
  const menuPopup = document.getElementById("menuPopup");

  let isPinned = true;

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

  function saveNoteTitle() {
    const value = noteTitleInput.value.trim() || "New Note";
    noteTitle.textContent = value;
    noteTitle.setAttribute("title", value);
    noteTitle.style.display = "inline-block";
    noteTitleInput.style.display = "none";
  }

  pinButton.addEventListener("click", () => {
    isPinned = !isPinned;
    pinButton.textContent = isPinned ? "📌" : "📍";
    window.electronAPI.toggleAlwaysOnTop();
  });

  menuButton.addEventListener("click", (e) => {
    const menuPopup = document.getElementById("menuPopup");
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
  });

  document.getElementById("italicButton").addEventListener("click", () => {
    document.execCommand("italic");
  });

  document.getElementById("underlineButton").addEventListener("click", () => {
    document.execCommand("underline");
  });
});
