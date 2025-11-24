import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc, orderBy, query, where, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * Configuration & Constants
 */
const Config = {
    firebase: {
        apiKey: "AIzaSyA1kGDOAuQRqdgXHX3Ugjj_zL7_bqYXos0",
        authDomain: "myapp-3a874.firebaseapp.com",
        databaseURL: "https://myapp-3a874-default-rtdb.firebaseio.com",
        projectId: "myapp-3a874",
        storageBucket: "myapp-3a874.appspot.com",
        messagingSenderId: "430236087961",
        appId: "1:430236087961:web:d7b0e75c6cf2498c9b6a08",
    },
    categories: [
        "World", "Pakistan", "Technology", "Religion",
        "Health", "Finance", "Opinion", "Education", "Sports", "Other"
    ],
    placeholders: {
        image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23e1e4e8%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23666666%22%3EJundAlNabi%3C%2Ftext%3E%3C%2Fsvg%3E',
        noImage: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22300%22%20fill%3D%22%23e1e4e8%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23666666%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'
    }
};

/**
 * Theme Manager
 * Handles Light/Dark mode toggling and persistence
 */
class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.icon = this.themeToggleBtn ? this.themeToggleBtn.querySelector('i') : null;
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateIcon(savedTheme);

        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateIcon(newTheme);
    }

    updateIcon(theme) {
        if (!this.icon) return;
        if (theme === 'dark') {
            this.icon.classList.remove('fa-moon');
            this.icon.classList.add('fa-sun');
        } else {
            this.icon.classList.remove('fa-sun');
            this.icon.classList.add('fa-moon');
        }
    }
}

/**
 * UI Manager
 * Handles Toast notifications, Loading states, and general UI interactions
 */
class UIManager {
    constructor() {
        this.loadingEl = document.getElementById('loading');
        this.newsContainer = document.getElementById('newsContainer');
        this.toastContainer = this.createToastContainer();
    }

    createToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}"></i>
            <span>${message}</span>
        `;
        this.toastContainer.appendChild(toast);
    }

    showLoading(show) {
        if (this.loadingEl) {
            this.loadingEl.style.display = show ? 'block' : 'none';
        }
    }

    renderError(message) {
        if (this.newsContainer) {
            this.newsContainer.innerHTML = `<div class="no-news">${message}</div>`;
        }
    }
}

class NewsApp {
    constructor() {
        this.app = initializeApp(Config.firebase);
        this.db = getFirestore(this.app);
        this.ui = new UIManager();
        this.themeManager = new ThemeManager();

        // DOM Elements
        this.sortTypeEl = document.getElementById('newsSortType');
        this.categoryInputEl = document.getElementById('newsCategoryInput');
        this.categoryDropdownEl = document.getElementById('newsCategoryDropdown');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateCategories();

        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (articleId) {
            this.loadSingleArticle(articleId);
        } else {
            this.loadNews();
        }
    }

    setupEventListeners() {
        // Sort Type Change
        if (this.sortTypeEl) {
            this.sortTypeEl.addEventListener('change', () => {
                this.handleSortChange();
                this.loadNews();
            });
        }

        // Category Dropdown Change
        if (this.categoryDropdownEl) {
            this.categoryDropdownEl.addEventListener('change', () => {
                this.handleCategoryDropdownChange();
                this.loadNews();
            });
        }

        // Category Input Change
        if (this.categoryInputEl) {
            this.categoryInputEl.addEventListener('input', () => {
                if (this.shouldLoadFromInput()) {
                    this.loadNews();
                }
            });
        }

        // Mobile Menu
        const menu = document.getElementById('menu_bar');
        const nav = document.getElementById('nav_bar');
        if (menu && nav) {
            menu.addEventListener('click', () => nav.classList.toggle('active'));
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !nav.contains(e.target)) {
                    nav.classList.remove('active');
                }
            });
        }
    }

    populateCategories() {
        if (this.categoryDropdownEl && this.categoryDropdownEl.options.length <= 1) {
            Config.categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                this.categoryDropdownEl.appendChild(opt);
            });
        }
    }

    handleSortChange() {
        const isCategory = this.sortTypeEl.value === 'category';
        if (this.categoryDropdownEl) this.categoryDropdownEl.style.display = isCategory ? '' : 'none';
        if (this.categoryInputEl) {
            this.categoryInputEl.style.display = 'none'; // Reset input visibility
            this.categoryInputEl.value = '';
        }
        if (isCategory && this.categoryDropdownEl) {
            this.categoryDropdownEl.value = "";
        }
    }

    handleCategoryDropdownChange() {
        const isOther = this.categoryDropdownEl.value === 'Other' || this.categoryDropdownEl.value === "";
        if (this.categoryInputEl) {
            this.categoryInputEl.style.display = isOther ? '' : 'none';
            if (!isOther) this.categoryInputEl.value = '';
        }
    }

    shouldLoadFromInput() {
        return (this.sortTypeEl && this.sortTypeEl.value === 'category') &&
            (this.categoryDropdownEl && (this.categoryDropdownEl.value === 'Other' || this.categoryDropdownEl.value === ""));
    }

    async loadNews() {
        this.ui.showLoading(true);
        if (this.ui.newsContainer) this.ui.newsContainer.innerHTML = '';

        try {
            const newsQuery = this.buildQuery();
            const querySnapshot = await getDocs(newsQuery);

            this.ui.showLoading(false);

            if (querySnapshot.empty) {
                this.ui.renderError('No articles found.');
                return;
            }

            querySnapshot.forEach((docSnap) => {
                const news = docSnap.data();
                this.ui.newsContainer.appendChild(this.createNewsCard(docSnap.id, news));
            });

        } catch (error) {
            console.error('Error loading news:', error);
            this.ui.showLoading(false);
            this.ui.renderError('Failed to load news. Please try again later.');
        }
    }

    buildQuery() {
        const sortType = this.sortTypeEl ? this.sortTypeEl.value : 'latest';
        let q = collection(this.db, 'news');

        if (sortType === 'category') {
            let category = "";
            if (this.categoryDropdownEl && this.categoryDropdownEl.value &&
                this.categoryDropdownEl.value !== "" && this.categoryDropdownEl.value !== "Other") {
                category = this.categoryDropdownEl.value;
            } else if (this.categoryInputEl) {
                category = this.categoryInputEl.value.trim();
            }

            if (category) {
                return query(q, where('category', '==', category), orderBy('createdAt', 'desc'));
            }
        } else if (sortType === 'featured') {
            return query(q, orderBy('featured', 'desc'), orderBy('createdAt', 'desc'));
        } else if (sortType === 'popular') {
            return query(q, orderBy('views', 'desc'), orderBy('createdAt', 'desc'));
        }

        return query(q, orderBy('createdAt', 'desc'));
    }

    async loadSingleArticle(id) {
        this.ui.showLoading(true);
        try {
            const docRef = doc(this.db, 'news', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Increment views
                updateDoc(docRef, { views: increment(1) }).catch(console.error);

                const news = docSnap.data();
                this.ui.showLoading(false);

                if (this.ui.newsContainer) {
                    this.ui.newsContainer.innerHTML = this.createArticleView(news);
                }

                this.updatePageMeta(news, id);
                this.addStructuredData(news, id);
            } else {
                this.ui.showLoading(false);
                this.ui.renderError('Article not found.');
            }
        } catch (error) {
            console.error('Error loading article:', error);
            this.ui.showLoading(false);
            this.ui.renderError('Error loading article.');
        }
    }

    createNewsCard(id, news) {
        const imageUrl = this.getImageUrl(news, 'card');
        const date = this.formatDate(news.createdAt);
        const description = this.getCardDescription(news);
        const categoryBadge = news.category ? `<span class="category-badge">${news.category}</span>` : '';

        const card = document.createElement('div');
        card.className = 'news-card';
        card.addEventListener('click', () => (window.location.href = `index.html?id=${id}`));

        card.innerHTML = `
            <img src="${imageUrl}" alt="${news.title}" loading="lazy"
                 onerror="this.onerror=null; this.src='${Config.placeholders.noImage}'">
            <div class="news-card-content">
                ${categoryBadge}
                <h3>${news.title}</h3>
                <p class="news-description">${description}</p>
                <div class="news-meta">
                    <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
                    <span><i class="fa-regular fa-calendar"></i> ${date}</span>
                    <span><i class="fa-regular fa-eye"></i> ${news.views || 0}</span>
                </div>
            </div>
        `;
        return card;
    }

    createArticleView(news) {
        const date = this.formatDate(news.createdAt, true);
        const formattedContent = this.formatContent(news.content);
        const imageUrl = this.getImageUrl(news, 'full');
        const categoryBadge = news.category ? `<span class="category-badge">${news.category}</span>` : '';

        return `
            <div class="article-full">
                <button class="back-btn" onclick="window.location.href='index.html'">
                    <i class="fa-solid fa-arrow-left"></i> Back to News
                </button>
                
                <div class="article-header">
                    ${categoryBadge}
                    <h1>${news.title}</h1>
                    <div class="article-meta">
                        <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${date}</span>
                        <span><i class="fa-regular fa-eye"></i> ${news.views || 0} views</span>
                    </div>
                </div>

                <img src="${imageUrl}" alt="${news.title}" class="article-image" 
                     onerror="this.onerror=null; this.src='${Config.placeholders.noImage}'">
                
                <div class="article-content">${formattedContent}</div>
                
                <div class="share-buttons">
                    <h4>Share this article</h4>
                    <div class="share-icons">
                        <button onclick="window.newsApp.share('facebook')" class="share-btn"><i class="fa-brands fa-facebook-f"></i></button>
                        <button onclick="window.newsApp.share('twitter')" class="share-btn"><i class="fa-brands fa-twitter"></i></button>
                        <button onclick="window.newsApp.share('whatsapp')" class="share-btn"><i class="fa-brands fa-whatsapp"></i></button>
                        <button onclick="window.newsApp.share('copy')" class="share-btn"><i class="fa-solid fa-link"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    getImageUrl(news, type) {
        // 1. Check for array of images (common in some CMS)
        if (Array.isArray(news.imageUrls) && news.imageUrls.length > 0) {
            const validImg = news.imageUrls.find(item => {
                if (typeof item === 'string' && item.trim().length > 0) return true;
                if (typeof item === 'object' && (item.url || item.src)) return true;
                return false;
            });
            if (validImg) {
                if (typeof validImg === 'string') return validImg;
                return validImg.url || validImg.src;
            }
        }

        // 2. Check if imageUrls is a string (legacy/error case)
        if (typeof news.imageUrls === 'string' && news.imageUrls.trim().length > 0) {
            return news.imageUrls;
        }

        // 3. Check for common image field names
        const possibleKeys = [
            'imageUrl', 'image', 'img', 'photo', 'thumbnail',
            'cover', 'coverImage', 'urlToImage', 'media', 'banner'
        ];

        // Find the first key that exists and has a valid value
        const foundKey = possibleKeys.find(k => {
            const val = news[k];
            if (!val) return false;
            // Check if it's a direct string URL
            if (typeof val === 'string' && val.trim().length > 0) return true;
            // Check if it's an object with a 'url' or 'src' property (e.g. Firebase Storage object)
            if (typeof val === 'object') {
                return (val.url && typeof val.url === 'string') ||
                    (val.src && typeof val.src === 'string');
            }
            return false;
        });

        if (foundKey) {
            const val = news[foundKey];
            let result;
            if (typeof val === 'string') result = val;
            if (typeof val === 'object') result = val.url || val.src;
            return result;
        }

        // 4. Fallback
        return Config.placeholders.image;
    }

    formatDate(timestamp, full = false) {
        if (!timestamp) return 'No date';
        const date = new Date(timestamp.seconds * 1000);

        if (full) {
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Relative time for cards
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    }

    formatContent(content = '') {
        return content
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')

        if (sortType === 'category') {
            let category = "";
            if (this.categoryDropdownEl && this.categoryDropdownEl.value &&
                this.categoryDropdownEl.value !== "" && this.categoryDropdownEl.value !== "Other") {
                category = this.categoryDropdownEl.value;
            } else if (this.categoryInputEl) {
                category = this.categoryInputEl.value.trim();
            }

            if (category) {
                return query(q, where('category', '==', category), orderBy('createdAt', 'desc'));
            }
        } else if (sortType === 'featured') {
            return query(q, orderBy('featured', 'desc'), orderBy('createdAt', 'desc'));
        } else if (sortType === 'popular') {
            return query(q, orderBy('views', 'desc'), orderBy('createdAt', 'desc'));
        }

        return query(q, orderBy('createdAt', 'desc'));
    }

    async loadSingleArticle(id) {
        this.ui.showLoading(true);
        try {
            const docRef = doc(this.db, 'news', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Increment views
                updateDoc(docRef, { views: increment(1) }).catch(console.error);

                const news = docSnap.data();
                this.ui.showLoading(false);

                if (this.ui.newsContainer) {
                    this.ui.newsContainer.innerHTML = this.createArticleView(news);
                }

                this.updatePageMeta(news, id);
                this.addStructuredData(news, id);
            } else {
                this.ui.showLoading(false);
                this.ui.renderError('Article not found.');
            }
        } catch (error) {
            console.error('Error loading article:', error);
            this.ui.showLoading(false);
            this.ui.renderError('Error loading article.');
        }
    }

    createNewsCard(id, news) {
        const imageUrl = this.getImageUrl(news, 'card');
        const date = this.formatDate(news.createdAt);
        const description = this.getCardDescription(news);
        const categoryBadge = news.category ? `<span class="category-badge">${news.category}</span>` : '';

        const card = document.createElement('div');
        card.className = 'news-card';
        card.addEventListener('click', () => (window.location.href = `index.html?id=${id}`));

        card.innerHTML = `
            <img src="${imageUrl}" alt="${news.title}" loading="lazy"
                 onerror="this.onerror=null; this.src='${Config.placeholders.noImage}'">
            <div class="news-card-content">
                ${categoryBadge}
                <h3>${news.title}</h3>
                <p class="news-description">${description}</p>
                <div class="news-meta">
                    <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
                    <span><i class="fa-regular fa-calendar"></i> ${date}</span>
                    <span><i class="fa-regular fa-eye"></i> ${news.views || 0}</span>
                </div>
            </div>
        `;
        return card;
    }

    createArticleView(news) {
        const date = this.formatDate(news.createdAt, true);
        const formattedContent = this.formatContent(news.content);
        const imageUrl = this.getImageUrl(news, 'full');
        const categoryBadge = news.category ? `<span class="category-badge">${news.category}</span>` : '';

        return `
            <div class="article-full">
                <button class="back-btn" onclick="window.location.href='index.html'">
                    <i class="fa-solid fa-arrow-left"></i> Back to News
                </button>
                
                <div class="article-header">
                    ${categoryBadge}
                    <h1>${news.title}</h1>
                    <div class="article-meta">
                        <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${date}</span>
                        <span><i class="fa-regular fa-eye"></i> ${news.views || 0} views</span>
                    </div>
                </div>

                <img src="${imageUrl}" alt="${news.title}" class="article-image" 
                     onerror="this.onerror=null; this.src='${Config.placeholders.noImage}'">
                
                <div class="article-content">${formattedContent}</div>
                
                <div class="share-buttons">
                    <h4>Share this article</h4>
                    <div class="share-icons">
                        <button onclick="window.newsApp.share('facebook')" class="share-btn"><i class="fa-brands fa-facebook-f"></i></button>
                        <button onclick="window.newsApp.share('twitter')" class="share-btn"><i class="fa-brands fa-twitter"></i></button>
                        <button onclick="window.newsApp.share('whatsapp')" class="share-btn"><i class="fa-brands fa-whatsapp"></i></button>
                        <button onclick="window.newsApp.share('copy')" class="share-btn"><i class="fa-solid fa-link"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    getImageUrl(news, type) {
        // 1. Check for array of images (common in some CMS)
        if (Array.isArray(news.imageUrls) && news.imageUrls.length > 0) {
            const validImg = news.imageUrls.find(item => {
                if (typeof item === 'string' && item.trim().length > 0) return true;
                if (typeof item === 'object' && (item.url || item.src)) return true;
                return false;
            });
            if (validImg) {
                if (typeof validImg === 'string') return validImg;
                return validImg.url || validImg.src;
            }
        }

        // 2. Check if imageUrls is a string (legacy/error case)
        if (typeof news.imageUrls === 'string' && news.imageUrls.trim().length > 0) {
            return news.imageUrls;
        }

        // 3. Check for common image field names
        const possibleKeys = [
            'imageUrl', 'image', 'img', 'photo', 'thumbnail',
            'cover', 'coverImage', 'urlToImage', 'media', 'banner'
        ];

        // Find the first key that exists and has a valid value
        const foundKey = possibleKeys.find(k => {
            const val = news[k];
            if (!val) return false;
            // Check if it's a direct string URL
            if (typeof val === 'string' && val.trim().length > 0) return true;
            // Check if it's an object with a 'url' or 'src' property (e.g. Firebase Storage object)
            if (typeof val === 'object') {
                return (val.url && typeof val.url === 'string') ||
                    (val.src && typeof val.src === 'string');
            }
            return false;
        });

        if (foundKey) {
            const val = news[foundKey];
            let result;
            if (typeof val === 'string') result = val;
            if (typeof val === 'object') result = val.url || val.src;
            return result;
        }

        // 4. Fallback
        return Config.placeholders.image;
    }

    formatDate(timestamp, full = false) {
        if (!timestamp) return 'No date';
        const date = new Date(timestamp.seconds * 1000);

        if (full) {
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Relative time for cards
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    }

    formatContent(content = '') {
        return content
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
            .replace(/\n/g, '<br>');
    }

    getCardDescription(news) {
        if (news.description && news.description.trim()) return news.description.trim();
        const div = document.createElement('div');
        div.innerHTML = news.content || '';
        return (div.textContent || div.innerText || '').substring(0, 160) + '...';
    }

    updatePageMeta(news, id) {
        const title = `${news.title} - JundAlNabi`;
        const description = this.getCardDescription(news);
        const imageUrl = this.getImageUrl(news, 'full');
        const url = window.location.href;
        const keywords = this.generateKeywords(news.title + ' ' + news.content);

        // Update Title
        document.title = title;

        // Update Meta Tags
        const metaTags = {
            'description': description,
            'keywords': keywords,
            'og:title': title,
            'og:description': description,
            'og:image': imageUrl,
            'og:url': url,
            'og:type': 'article',
            'twitter:card': 'summary_large_image',
            'twitter:title': title,
            'twitter:description': description,
            'twitter:image': imageUrl
        };

        for (const [name, content] of Object.entries(metaTags)) {
            // Check for name or property
            let element = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                if (name.startsWith('og:')) {
                    element.setAttribute('property', name);
                } else {
                    element.setAttribute('name', name);
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        }

        // Update Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);
    }

    addStructuredData(news, id) {
        const imageUrl = this.getImageUrl(news, 'full');
        const datePublished = new Date(news.createdAt.seconds * 1000).toISOString();
        const dateModified = new Date().toISOString(); // Ideally this should come from DB if available

        const schema = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": news.title,
            "image": [imageUrl],
            "datePublished": datePublished,
            "dateModified": dateModified,
            "author": [{
                "@type": "Person",
                "name": news.author || "JundAlNabi Team",
                "url": "https://www.codetoweb.tech/"
            }],
            "publisher": {
                "@type": "Organization",
                "name": "JundAlNabi",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.codetoweb.tech/logo/logo.png"
                }
            },
            "description": this.getCardDescription(news)
        };

        let script = document.querySelector('script[type="application/ld+json"]');
        if (!script) {
            script = document.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema, null, 2);
    }

    generateKeywords(text) {
        if (!text) return '';
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after']);
        const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
        const uniqueWords = new Set();

        words.forEach(word => {
            if (word.length > 3 && !stopWords.has(word)) {
                uniqueWords.add(word);
            }
        });

        return Array.from(uniqueWords).slice(0, 10).join(', ');
    }

    share(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${title}%20${url}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(window.location.href);
                this.ui.showToast('Link copied to clipboard!');
                break;
        }
    }
}

// Initialize App
window.newsApp = new NewsApp();