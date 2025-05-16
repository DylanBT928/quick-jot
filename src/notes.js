let notes = [];

async function displayNotes() {
  try {
    notes = await window.electronAPI.getAllNotes();
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    const sortedNotes = [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    if (sortedNotes.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.textContent =
        "No notes yet. Create one with the + New Note button!";
      emptyMsg.style.margin = "20px auto";
      container.appendChild(emptyMsg);
      return;
    }

    sortedNotes.forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.className = "noteCard";
      noteCard.dataset.id = note.id;

      const noteTitle = document.createElement("div");
      noteTitle.className = "noteTitle";
      noteTitle.textContent = note.title || "Untitled";

      const notePreview = document.createElement("div");
      notePreview.className = "notePreview";

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = note.content || "";
      notePreview.textContent =
        tempDiv.textContent.substring(0, 50) +
        (tempDiv.textContent.length > 50 ? "..." : "");

      noteCard.appendChild(noteTitle);
      noteCard.appendChild(notePreview);

      if (note.pinned) {
        const pinnedIcon = document.createElement("div");
        pinnedIcon.className = "notePinned";
        pinnedIcon.textContent = "📌";
        noteCard.appendChild(pinnedIcon);
      }

      noteCard.addEventListener("click", () => {
        localStorage.setItem("currentNoteId", note.id);
        window.electronAPI.openNote(note.id);
      });

      container.appendChild(noteCard);
    });
  } catch (error) {
    console.error("Error displaying notes:", error);
    const errorMsg = document.createElement("div");
    errorMsg.textContent = "Error loading notes. Please try again.";
    errorMsg.style.color = "red";
    errorMsg.style.margin = "20px auto";
    document.getElementById("notesContainer").appendChild(errorMsg);
  }
}

document.getElementById("newNoteButton").addEventListener("click", async () => {
  try {
    const newNote = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await window.electronAPI.saveNote(newNote);
    localStorage.setItem("currentNoteId", newNote.id);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error creating new note:", error);
    alert("Error creating new note. Please try again.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.electronAPI) {
    displayNotes();
  } else {
    console.error("electronAPI not available. Check preload.js configuration.");
    const errorMsg = document.createElement("div");
    errorMsg.textContent =
      "Error: Application not properly initialized. Please restart.";
    errorMsg.style.color = "red";
    errorMsg.style.margin = "20px auto";
    document.getElementById("notesContainer").appendChild(errorMsg);
  }
});
