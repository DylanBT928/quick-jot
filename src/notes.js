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

      if (note.color) {
        switch (note.color) {
          case "color-blue":
            noteCard.style.backgroundColor = "#bbdefb";
            break;
          case "color-green":
            noteCard.style.backgroundColor = "#c8e6c9";
            break;
          case "color-orange":
            noteCard.style.backgroundColor = "#ffccbc";
            break;
          case "color-purple":
            noteCard.style.backgroundColor = "#e1bee7";
            break;
          default:
            noteCard.style.backgroundColor = "#fff9c4";
        }
      } else {
        const colorOptions = [
          "#fff9c4",
          "#bbdefb",
          "#c8e6c9",
          "#ffccbc",
          "#e1bee7",
        ];
        const index = sortedNotes.indexOf(note) % colorOptions.length;
        noteCard.style.backgroundColor = colorOptions[index];
      }

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

      noteCard.addEventListener("click", () => {
        let noteColorClass = "color-yellow";
        const bgColor = getComputedStyle(noteCard).backgroundColor;

        if (bgColor === "rgb(187, 222, 251)") {
          noteColorClass = "color-blue";
        } else if (bgColor === "rgb(200, 230, 201)") {
          noteColorClass = "color-green";
        } else if (bgColor === "rgb(255, 204, 188)") {
          noteColorClass = "color-orange";
        } else if (bgColor === "rgb(225, 190, 231)") {
          noteColorClass = "color-purple";
        }

        if (note.color) {
          noteColorClass = note.color;
        }

        localStorage.setItem("currentNoteId", note.id);
        localStorage.setItem("currentNoteColor", noteColorClass);

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
    const colorClasses = [
      "color-yellow",
      "color-blue",
      "color-green",
      "color-orange",
      "color-purple",
    ];
    const randomColorClass =
      colorClasses[Math.floor(Math.random() * colorClasses.length)];

    const newNote = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      pinned: false,
      color: randomColorClass,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await window.electronAPI.saveNote(newNote);
    localStorage.setItem("currentNoteId", newNote.id);
    localStorage.setItem("currentNoteColor", newNote.color);

    window.electronAPI.openNote(newNote.id);
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
