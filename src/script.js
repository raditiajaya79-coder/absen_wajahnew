document.addEventListener("DOMContentLoaded", () => {
  // Navigasi aktif
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("aside nav ul li a");

  navLinks.forEach((link) => {
    let linkPath = link.getAttribute("href");
    // Adjust linkPath for comparison if it's a relative path like "../dashboard.html"
    if (linkPath.startsWith("../")) {
      linkPath = linkPath.substring(3); // Remove "../"
    }

    if (currentPath.includes(linkPath)) {
      link.classList.add("border-blue-500");
      link.classList.remove("hover:bg-gray-700");
    } else {
      link.classList.remove("border-blue-500");
      link.classList.add("hover:bg-gray-700");
    }
  });

  // Dashboard Tab Navigation
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabSections = document.querySelectorAll(".tab-section");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => {
        btn.classList.remove("border-blue-500", "text-white");
        btn.classList.add("text-gray-400", "hover:text-white");
      });
      tabSections.forEach((section) => section.classList.add("hidden"));

      button.classList.add("border-blue-500", "text-white");
      button.classList.remove("text-gray-400", "hover:text-white");
      document.getElementById(button.dataset.tab).classList.remove("hidden");
    });
  });

  // Set default tab for dashboard
  const defaultTabButton = document.querySelector(
    '.tab-button[data-tab="ringkasan"]'
  );
  if (defaultTabButton) {
    defaultTabButton.click();
  }
});
