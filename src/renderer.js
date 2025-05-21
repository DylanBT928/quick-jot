let currentNote = {
  id: null,
  title: "New Note",
  content: "",
  pinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let saveTimeout;

let currentBulletStyle = 0;
const bulletStyles = ["disc", "circle", "square"];

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
    if (currentNote.color === colorClass) {
      return;
    }

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
        noteElement.style.backgroundColor = "#fff9c4";
        colorDot.style.backgroundColor = "#fff9c4";
        colorClass = "color-yellow";
    }

    currentNote.color = colorClass;
    localStorage.setItem("currentNoteColor", colorClass);

    if (currentNote.id) {
      saveCurrentNote();
    }
  }

  const savedColor = localStorage.getItem("currentNoteColor") || "color-yellow";
  updateNoteColor(savedColor);

  const currentNoteId = localStorage.getItem("currentNoteId");

  if (currentNoteId && currentNoteId !== "null") {
    try {
      const loadedNote = await window.electronAPI.getNote(currentNoteId);
      if (loadedNote && loadedNote.id) {
        currentNote = loadedNote;
        noteTitle.textContent = currentNote.title;
        noteElement.innerHTML = currentNote.content;
        pinButton.textContent = currentNote.pinned ? "📍" : "📌";

        if (currentNote.color) {
          updateNoteColor(currentNote.color);
        }
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
      if (!noteId) return;

      localStorage.setItem("currentNoteId", noteId);
      const loadedNote = await window.electronAPI.getNote(noteId);
      if (loadedNote) {
        currentNote = loadedNote;
        noteTitle.textContent = currentNote.title;
        noteElement.innerHTML = currentNote.content;
        pinButton.textContent = "📌";
        window.electronAPI.unpinWindow();

        const noteColor = loadedNote.color || "color-yellow";

        noteElement.classList.remove(
          "color-yellow",
          "color-blue",
          "color-green",
          "color-orange",
          "color-purple"
        );

        switch (noteColor) {
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
            noteElement.style.backgroundColor = "#fff9c4";
            colorDot.style.backgroundColor = "#fff9c4";
        }

        currentNote.color = noteColor;
        localStorage.setItem("currentNoteColor", noteColor);
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

      if (!currentNote.id || currentNote.id === "null") {
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

  document.getElementById("bulletListButton").addEventListener("click", () => {
    const selection = window.getSelection();

    if (!isInsideList()) {
      document.execCommand("insertUnorderedList");

      const lists = noteElement.querySelectorAll("ul");
      if (lists.length > 0) {
        const newList = lists[lists.length - 1];
        newList.style.listStyleType = bulletStyles[currentBulletStyle];
      }
    } else {
      const listItem = getListItemParent(
        selection.getRangeAt(0).startContainer
      );
      if (listItem) {
        const parentList = listItem.parentNode;
        currentBulletStyle = (currentBulletStyle + 1) % bulletStyles.length;
        parentList.style.listStyleType = bulletStyles[currentBulletStyle];
      }
    }

    noteElement.focus();
    autoSave();
  });

  document
    .getElementById("numberedListButton")
    .addEventListener("click", () => {
      const selection = window.getSelection();

      if (!isInsideOrderedList()) {
        document.execCommand("insertOrderedList");
      } else {
        const listItem = getListItemParent(
          selection.getRangeAt(0).startContainer
        );
        if (listItem) {
          const parentList = listItem.parentNode;

          const numberStyles = [
            "decimal",
            "lower-alpha",
            "upper-alpha",
            "lower-roman",
            "upper-roman",
          ];

          let currentStyle = parentList.style.listStyleType || "decimal";
          let nextStyleIndex =
            (numberStyles.indexOf(currentStyle) + 1) % numberStyles.length;

          parentList.style.listStyleType = numberStyles[nextStyleIndex];
        }
      }

      noteElement.focus();
      autoSave();
    });

  document
    .getElementById("checkboxListButton")
    .addEventListener("click", () => {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const existingCheckbox = getParentWithClass(
        range.startContainer,
        "checklist-item"
      );

      if (existingCheckbox) {
        return;
      }

      const listItem = getListItemParent(range.startContainer);
      if (listItem) {
        const textContent = listItem.textContent.trim();
        createCheckboxItem(textContent, listItem);
        listItem.parentNode.removeChild(listItem);
      } else {
        createCheckboxItem("", null);
      }

      noteElement.focus();
      autoSave();
    });

  function createCheckboxItem(text, insertAfter) {
    const checklistItem = document.createElement("div");
    checklistItem.className = "checklist-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checklist-checkbox";

    checkbox.addEventListener("change", function () {
      const textSpan = this.nextElementSibling;
      if (this.checked) {
        textSpan.classList.add("checklist-checked");
      } else {
        textSpan.classList.remove("checklist-checked");
      }
      autoSave();
    });

    const textSpan = document.createElement("span");
    textSpan.className = "checklist-text";
    textSpan.contentEditable = true;
    textSpan.textContent = text;

    checklistItem.appendChild(checkbox);
    checklistItem.appendChild(textSpan);

    if (insertAfter) {
      if (insertAfter.nextSibling) {
        insertAfter.parentNode.insertBefore(
          checklistItem,
          insertAfter.nextSibling
        );
      } else {
        insertAfter.parentNode.appendChild(checklistItem);
      }
    } else {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      range.deleteContents();
      range.insertNode(checklistItem);

      const br = document.createElement("br");
      checklistItem.parentNode.insertBefore(br, checklistItem.nextSibling);
    }

    textSpan.focus();
    const newRange = document.createRange();
    const sel = window.getSelection();
    newRange.setStart(textSpan, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    return checklistItem;
  }

  function getParentWithClass(node, className) {
    while (node && node !== noteElement) {
      if (node.classList && node.classList.contains(className)) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  noteElement.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const listItem = getListItemParent(range.startContainer);
      if (listItem) {
        if (e.shiftKey) {
          document.execCommand("outdent");
        } else {
          document.execCommand("indent");
        }
        autoSave();
      }
    }

    if (e.key === "Enter") {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const checklistItem = getParentWithClass(
        range.startContainer,
        "checklist-item"
      );
      if (checklistItem) {
        e.preventDefault();

        const textSpan = checklistItem.querySelector(".checklist-text");
        const text = textSpan.textContent.trim();

        const newChecklistItem = createCheckboxItem("", checklistItem);

        if (text === "") {
          checklistItem.parentNode.removeChild(checklistItem);
        }

        autoSave();
        return;
      }

      const listItem = getListItemParent(range.startContainer);
      if (listItem) {
        const textContent = listItem.textContent.trim();

        if (textContent === "") {
          e.preventDefault();

          const parentList = listItem.parentNode;
          const newParagraph = document.createElement("p");
          newParagraph.innerHTML = "<br>";

          if (parentList.children.length === 1) {
            if (parentList.nextSibling) {
              parentList.parentNode.insertBefore(
                newParagraph,
                parentList.nextSibling
              );
            } else {
              parentList.parentNode.appendChild(newParagraph);
            }

            parentList.parentNode.removeChild(parentList);

            const newRange = document.createRange();
            newRange.setStart(newParagraph, 0);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } else {
            const nextSibling = listItem.nextSibling;
            if (nextSibling) {
              parentList.insertBefore(newParagraph, nextSibling);
            } else {
              parentList.parentNode.insertBefore(
                newParagraph,
                parentList.nextSibling
              );
            }

            parentList.removeChild(listItem);

            const newRange = document.createRange();
            newRange.setStart(newParagraph, 0);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }

          autoSave();
        }
      }
    }
  });

  function getListItemParent(node) {
    while (node && node !== noteElement) {
      if (node.nodeName === "LI") {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  function enhanceListBehavior() {
    const listItems = noteElement.querySelectorAll("li");

    listItems.forEach((item) => {
      if (!item.style.minHeight) {
        item.style.minHeight = "1.2em";
      }
    });

    const unorderedLists = noteElement.querySelectorAll("ul");
    unorderedLists.forEach((list) => {
      if (!list.style.listStyleType) {
        list.style.listStyleType = "disc";
      }
    });

    const orderedLists = noteElement.querySelectorAll("ol");
    orderedLists.forEach((list) => {
      if (!list.style.listStyleType) {
        list.style.listStyleType = "decimal";
      }
    });
  }

  window.electronAPI.onLoadNote(async (noteId) => {
    try {
      if (!noteId) return;

      localStorage.setItem("currentNoteId", noteId);
      const loadedNote = await window.electronAPI.getNote(noteId);
      if (loadedNote) {
        currentNote = loadedNote;
        noteTitle.textContent = currentNote.title;
        noteElement.innerHTML = currentNote.content;
        pinButton.textContent = "📌";
        window.electronAPI.unpinWindow();

        const noteColor = loadedNote.color || "color-yellow";

        noteElement.classList.remove(
          "color-yellow",
          "color-blue",
          "color-green",
          "color-orange",
          "color-purple"
        );

        switch (noteColor) {
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
            noteElement.style.backgroundColor = "#fff9c4";
            colorDot.style.backgroundColor = "#fff9c4";
        }

        currentNote.color = noteColor;
        localStorage.setItem("currentNoteColor", noteColor);

        setTimeout(enhanceListBehavior, 100);
      }
    } catch (error) {
      console.error("Error loading note:", error);
    }
  });

  function restoreCheckboxFunctionality() {
    const checkboxes = noteElement.querySelectorAll(".checklist-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const textSpan = this.nextElementSibling;
        if (this.checked) {
          textSpan.classList.add("checklist-checked");
        } else {
          textSpan.classList.remove("checklist-checked");
        }
        autoSave();
      });
    });
  }

  window.electronAPI.onLoadNote(async (noteId) => {
    try {
      if (!noteId) return;

      localStorage.setItem("currentNoteId", noteId);
      const loadedNote = await window.electronAPI.getNote(noteId);
      if (loadedNote) {
        currentNote = loadedNote;
        noteTitle.textContent = currentNote.title;
        noteElement.innerHTML = currentNote.content;
        pinButton.textContent = "📌";
        window.electronAPI.unpinWindow();

        const noteColor = loadedNote.color || "color-yellow";

        noteElement.classList.remove(
          "color-yellow",
          "color-blue",
          "color-green",
          "color-orange",
          "color-purple"
        );

        switch (noteColor) {
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
            noteElement.style.backgroundColor = "#fff9c4";
            colorDot.style.backgroundColor = "#fff9c4";
        }

        currentNote.color = noteColor;
        localStorage.setItem("currentNoteColor", noteColor);

        setTimeout(() => {
          restoreCheckboxFunctionality();
          enhanceListBehavior();
        }, 100);
      }
    } catch (error) {
      console.error("Error loading note:", error);
    }
  });
});
