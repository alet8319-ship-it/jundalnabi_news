const updates = [
  {
    "title": "Performance Improvements",
    "description": "The website now loads 30% faster with optimized images and scripts.",
    "content": "<p>We optimized image delivery, enabled better caching and split large scripts to improve load times. These changes reduce time-to-interactive and improve overall responsiveness.</p>",
    "author": "Admin",
    "category": "Improvement",
    "imageUrls": [
      "https://example.com/uploads/perf-graph.png"
    ],
    "keywords": [
      "performance",
      "optimization",
      "images"
    ],
    "views": 0,
    "createdAt": "2025-10-20T00:00:00.000Z"
  },
  {
    "title": "Bug Fixes",
    "description": "Fixed several small issues on the contact form and navigation menu.",
    "content": "<p>Addressed issues causing form validation errors on some browsers and fixed a navigation bug that caused incorrect highlighting for active links. Miscellaneous CSS fixes included.</p>",
    "author": "Admin",
    "category": "Maintenance",
    "imageUrls": [],
    "keywords": [
      "bugfix",
      "maintenance",
      "contact form"
    ],
    "views": 0,
    "createdAt": "2025-10-10T00:00:00.000Z"
  }
];

const container = document.getElementById("updatesContainer");
const loadingMsg = document.getElementById("loadingMsg");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

function renderUpdates(list) {
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = `<p class="no-results">No updates found.</p>`;
    return;
  }
  list.forEach(update => {
    const div = document.createElement("div");
    div.classList.add("update");
    div.innerHTML = `
      <span class="update-badge">${update.category}</span>
      <h3>${update.title}</h3>
      <small>${new Date(update.date).toLocaleDateString()}</small>
      <p>${update.description}</p>
    `;
    container.appendChild(div);
  });
}

function applyFilters() {
  let sorted = [...updates];
  if (sortSelect.value === "latest") {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  const query = searchInput.value.toLowerCase();
  const filtered = sorted.filter(u =>
    u.title.toLowerCase().includes(query) ||
    u.description.toLowerCase().includes(query)
  );
  renderUpdates(filtered);
}

sortSelect.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

// Simulate loading
setTimeout(() => {
  loadingMsg.style.display = "none";
  renderUpdates(updates);
}, 800);

// Mobile menu
const menuIcon = document.getElementById("menu_icon");
const navBar = document.getElementById("nav_bar");
menuIcon.addEventListener("click", () => navBar.classList.toggle("active"));
