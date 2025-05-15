window.addEventListener("DOMContentLoaded", () => {
  const pinButton = document.getElementById("pinButton");
  const menuButton = document.getElementById("menuButton");
  const menuPopup = document.getElementById("menuPopup");

  let isPinned = true;
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
