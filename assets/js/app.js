
document.addEventListener("DOMContentLoaded", () => {
  // Highlight active navigation link
  const navLinks = document.querySelectorAll(".nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Workspace notification
  const workspaceButton = document.querySelector(".button");

  if (workspaceButton) {
    workspaceButton.addEventListener("click", () => {
      alert("Welcome to NEXORA Management Workspace!");
    });
  }

  // Dashboard initialization
  console.log("NEXORA Dashboard initialized successfully.");

});
