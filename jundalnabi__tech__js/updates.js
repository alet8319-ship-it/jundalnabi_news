/**
 * Updates Page Manager
 * Handles displaying, filtering, and sorting site updates
 */

class UpdatesManager {
  constructor() {
    // Data - Centralized updates information
    this.updates = [
      {
        "id": "update-4",
        "title": "Category Sorting Enhancement",
        "description": "Completely redesigned category filtering system with improved performance and user experience.",
        "content": `We've implemented a comprehensive fix for the category sorting feature that addresses multiple issues:
        
**Key Improvements:**
• Seamless category selection with instant filtering
• Smart case-insensitive matching for better results
• Optimized database queries for faster loading
• Enhanced error handling with helpful user feedback
• Smooth transitions between different sort modes

**Technical Enhancements:**
• Client-side sorting fallback for improved reliability
• Automatic retry with case variations
• Better memory management for pagination
• Comprehensive error logging for debugging

The system now provides a smooth, intuitive experience when browsing news by category, with all categories (World, Pakistan, Technology, Religion, Health, Finance, Opinion, Education, Sports) working flawlessly.`,
        "author": "Development Team",
        "category": "Feature",
        // "imageUrls": [
        //   "https://codetoweb.tech/logo/logo.png"
        // ],
        "keywords": [
          "category filtering",
          "performance",
          "bug fix",
          "user experience"
        ],
        "views": 0,
        "createdAt": "2025-12-13T12:00:00.000Z",
        "version": "2.1.0"
      },
      {
        "id": "update-3",
        "title": "UI/UX Improvements Across Multiple Pages",
        "description": "Enhanced visual design and user experience with comprehensive UI fixes and responsive improvements.",
        "content": `We've rolled out significant UI/UX improvements to enhance your browsing experience:

**Pages Updated:**
• Home page layout optimization
• About page information architecture
• Updates page card design
• Contact form accessibility improvements

**Visual Enhancements:**
• Refined typography for better readability
• Improved color contrast for accessibility
• Smoother animations and transitions
• Enhanced mobile responsiveness
• Better spacing and visual hierarchy

**User Experience:**
• Faster page load times
• More intuitive navigation
• Clear visual feedback on interactions
• Consistent design language throughout

These changes ensure that all information is clearly presented and easily accessible across all devices.`,
        "author": "Design Team",
        "category": "Improvement",
        "imageUrls": [],
        "keywords": [
          "UI design",
          "UX improvements",
          "responsive design",
          "accessibility"
        ],
        "views": 0,
        "createdAt": "2025-12-06T10:00:00.000Z",
        "version": "2.0.5"
      },
      {
        "id": "update-2",
        "title": "Performance Optimization Update",
        "description": "Major performance improvements resulting in 30% faster page loads and enhanced responsiveness.",
        "content": `We've implemented comprehensive performance optimizations across the entire platform:

**Loading Speed Improvements:**
• Image optimization with modern WebP format
• Lazy loading for images and heavy components
• Code splitting for faster initial page loads
• Improved caching strategies
• Minified CSS and JavaScript files

**Technical Enhancements:**
• Reduced bundle size by 40%
• Implemented service worker for offline support
• Optimized database queries
• Enhanced CDN delivery
• Compressed all static assets

**Results:**
• 30% faster Time to Interactive (TTI)
• 25% improvement in First Contentful Paint (FCP)
• 35% reduction in data transfer
• Improved Lighthouse scores across all metrics

These optimizations ensure a smooth, fast experience for all users, regardless of their connection speed or device.`,
        "author": "Performance Team",
        "category": "Improvement",
        "imageUrls": [
          "https://codetoweb.tech/logo/logo.png"
        ],
        "keywords": [
          "performance",
          "optimization",
          "speed",
          "caching"
        ],
        "views": 0,
        "createdAt": "2025-10-20T08:00:00.000Z",
        "version": "2.0.0"
      },
      {
        "id": "update-1",
        "title": "Bug Fixes and Maintenance",
        "description": "Critical bug fixes for contact form validation and navigation menu highlighting issues.",
        "content": `This maintenance release addresses several important bugs reported by our community:

**Contact Form Fixes:**
• Resolved validation errors in Safari and Firefox
• Fixed email format validation inconsistencies
• Improved error message clarity
• Enhanced form submission feedback
• Added better spam protection

**Navigation Issues:**
• Fixed active link highlighting across all pages
• Corrected mobile menu toggle behavior
• Improved keyboard navigation accessibility
• Fixed dropdown menu positioning

**Additional Fixes:**
• CSS alignment issues on mobile devices
• Date formatting inconsistencies
• Browser compatibility improvements
• Memory leak in event listeners
• Missing alt text for images

We continuously monitor user feedback and prioritize fixing issues that impact your experience. Thank you for reporting these problems!`,
        "author": "QA Team",
        "category": "Maintenance",
        "imageUrls": [],
        "keywords": [
          "bug fixes",
          "maintenance",
          "contact form",
          "navigation"
        ],
        "views": 0,
        "createdAt": "2025-10-10T14:30:00.000Z",
        "version": "1.9.8"
      }
    ];

    // DOM Elements
    this.container = document.getElementById("updatesContainer");
    this.loadingMsg = document.getElementById("loadingMsg");
    this.sortSelect = document.getElementById("sortSelect");
    this.searchInput = document.getElementById("searchInput");
    this.statsContainer = document.getElementById("updateStats");

    // State
    this.filteredUpdates = [...this.updates];
    this.isLoading = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.simulateLoading();
    this.renderStats();
  }

  setupEventListeners() {
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", () => this.applyFilters());
    }

    if (this.searchInput) {
      // Debounce search input for better performance
      let searchTimeout;
      this.searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.applyFilters(), 300);
      });
    }

    // Add keyboard shortcut for search (Ctrl/Cmd + K)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (this.searchInput) {
          this.searchInput.focus();
        }
      }
    });
  }

  simulateLoading() {
    this.isLoading = true;
    if (this.loadingMsg) {
      this.loadingMsg.style.display = "flex";
    }

    // Simulate network delay for better UX
    setTimeout(() => {
      this.isLoading = false;
      if (this.loadingMsg) {
        this.loadingMsg.style.display = "none";
      }
      this.applyFilters();
    }, 800);
  }

  applyFilters() {
    if (this.isLoading) return;

    // Sort updates
    let sorted = [...this.updates];
    const sortValue = this.sortSelect ? this.sortSelect.value : "latest";

    if (sortValue === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortValue === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Filter by search query
    const query = this.searchInput ? this.searchInput.value.toLowerCase().trim() : "";

    if (query) {
      this.filteredUpdates = sorted.filter(update =>
        update.title.toLowerCase().includes(query) ||
        update.description.toLowerCase().includes(query) ||
        update.content.toLowerCase().includes(query) ||
        update.category.toLowerCase().includes(query) ||
        update.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    } else {
      this.filteredUpdates = sorted;
    }

    this.renderUpdates();
  }

  renderStats() {
    if (!this.statsContainer) return;

    const categories = [...new Set(this.updates.map(u => u.category))];
    const latestUpdate = new Date(Math.max(...this.updates.map(u => new Date(u.createdAt))));

    this.statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <i class="fa-solid fa-newspaper"></i>
          <div class="stat-content">
            <h3>${this.updates.length}</h3>
            <p>Total Updates</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fa-solid fa-tags"></i>
          <div class="stat-content">
            <h3>${categories.length}</h3>
            <p>Categories</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fa-solid fa-clock"></i>
          <div class="stat-content">
            <h3>${this.formatRelativeDate(latestUpdate)}</h3>
            <p>Latest Update</p>
          </div>
        </div>
      </div>
    `;
  }

  renderUpdates() {
    if (!this.container) return;

    // Clear container with fade out
    this.container.style.opacity = "0";

    setTimeout(() => {
      this.container.innerHTML = "";

      if (this.filteredUpdates.length === 0) {
        this.renderEmptyState();
        this.container.style.opacity = "1";
        return;
      }

      // Create updates with staggered animation
      this.filteredUpdates.forEach((update, index) => {
        const updateCard = this.createUpdateCard(update);
        updateCard.style.animationDelay = `${index * 0.1}s`;
        this.container.appendChild(updateCard);
      });

      this.container.style.opacity = "1";
    }, 300);
  }

  createUpdateCard(update) {
    const div = document.createElement("div");
    div.classList.add("update-card");
    div.setAttribute("data-category", update.category.toLowerCase());

    const categoryIcon = this.getCategoryIcon(update.category);
    const formattedDate = this.formatDate(update.createdAt);
    const relativeDate = this.formatRelativeDate(update.createdAt);
    const hasImage = update.imageUrls && update.imageUrls.length > 0;

    div.innerHTML = `
      ${hasImage ? `
        <div class="update-image">
          <img class="Update_image" src="${update.imageUrls[0]}" alt="${update.title}" loading="lazy">
        </div>
      ` : ''}
      
      <div class="update-content">
        <div class="update-header">
          <span class="update-badge ${update.category.toLowerCase()}">
            <i class="${categoryIcon}"></i>
            ${update.category}
          </span>
          ${update.version ? `<span class="version-badge">v${update.version}</span>` : ''}
        </div>
        
        <h3 class="update-title">${update.title}</h3>
        
        <div class="update-meta">
          <span class="meta-item">
            <i class="fa-solid fa-user"></i>
            ${update.author}
          </span>
          <span class="meta-item">
            <i class="fa-regular fa-calendar"></i>
            <time datetime="${update.createdAt}" title="${formattedDate}">
              ${relativeDate}
            </time>
          </span>
        </div>
        
        <p class="update-description">${update.description}</p>
        
        <div class="update-details" style="display: none;">
          <div class="update-full-content">
            ${this.formatContent(update.content)}
          </div>
          
          ${update.keywords && update.keywords.length > 0 ? `
            <div class="update-keywords">
              ${update.keywords.map(keyword =>
      `<span class="keyword-tag"><i class="fa-solid fa-tag"></i>${keyword.trim()}</span>`
    ).join('')}
            </div>
          ` : ''}
        </div>
        
        <button class="toggle-details-btn" onclick="window.updatesManager.toggleDetails(this)">
          <span class="btn-text">Read More</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
      </div>
    `;

    return div;
  }

  renderEmptyState() {
    const query = this.searchInput ? this.searchInput.value : "";
    this.container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-search"></i>
        <h3>No updates found</h3>
        <p>${query ? `No results for "${query}". Try a different search term.` : 'No updates available at this time.'}</p>
        ${query ? `<button class="clear-search-btn" onclick="window.updatesManager.clearSearch()">Clear Search</button>` : ''}
      </div>
    `;
  }

  toggleDetails(button) {
    const card = button.closest(".update-card");
    const details = card.querySelector(".update-details");
    const icon = button.querySelector("i");
    const btnText = button.querySelector(".btn-text");

    if (details.style.display === "none" || !details.style.display) {
      details.style.display = "block";
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
      btnText.textContent = "Read Less";
      card.classList.add("expanded");

      // Smooth scroll to show expanded content
      setTimeout(() => {
        details.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } else {
      details.style.display = "none";
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
      btnText.textContent = "Read More";
      card.classList.remove("expanded");
    }
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = "";
      this.searchInput.focus();
      this.applyFilters();
    }
  }

  formatContent(content) {
    return content
      .split('\n\n')
      .map(paragraph => {
        // Handle bullet points
        if (paragraph.trim().startsWith('•')) {
          const items = paragraph.split('\n').filter(line => line.trim());
          return `<ul class="content-list">${items.map(item =>
            `<li>${item.replace('•', '').trim()}</li>`
          ).join('')}</ul>`;
        }

        // Handle bold text with **
        paragraph = paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Handle section headers
        if (paragraph.includes(':') && paragraph.length < 100) {
          return `<h4 class="content-heading">${paragraph}</h4>`;
        }

        return `<p>${paragraph}</p>`;
      })
      .join('');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  getCategoryIcon(category) {
    const icons = {
      'Feature': 'fa-solid fa-star',
      'Improvement': 'fa-solid fa-arrow-up',
      'Maintenance': 'fa-solid fa-wrench',
      'Security': 'fa-solid fa-shield-halved',
      'Bug Fix': 'fa-solid fa-bug'
    };
    return icons[category] || 'fa-solid fa-circle-info';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.updatesManager = new UpdatesManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UpdatesManager;
}