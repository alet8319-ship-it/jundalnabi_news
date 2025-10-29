import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc, orderBy, query } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1kGDOAuQRqdgXHX3Ugjj_zL7_bqYXos0",
    authDomain: "myapp-3a874.firebaseapp.com",
    databaseURL: "https://myapp-3a874-default-rtdb.firebaseio.com",
    projectId: "myapp-3a874",
    storageBucket: "myapp-3a874.appspot.com",
    messagingSenderId: "430236087961",
    appId: "1:430236087961:web:d7b0e75c6cf2498c9b6a08",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URL params
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

if (articleId) {
    loadSingleArticle(articleId);
} else {
    loadNews();
}

// =============================
// LOAD SINGLE ARTICLE
// =============================
async function loadSingleArticle(id) {
    const loadingEl = document.getElementById('loading');
    const newsContainer = document.getElementById('newsContainer');

    try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);

        loadingEl.style.display = 'none';

        if (docSnap.exists()) {
            const news = docSnap.data();
            newsContainer.innerHTML = createArticleView(news);
            updatePageMeta(news, id);
            addStructuredData(news, id);
        } else {
            newsContainer.innerHTML = '<div class="no-news">Article not found.</div>';
        }
    } catch (error) {
        console.error('Error loading article:', error);
        loadingEl.innerHTML = '<div class="no-news">Error loading article. Please try again later.</div>';
    }
}

// =============================
// SEO META TAG UPDATES
// =============================
function updatePageMeta(news, id) {
    const title = news.title || 'JundAlNabi News';
    const description = (news.content || '').substring(0, 160).replace(/[#*>\[\]]/g, '');
    const image = news.imageUrl || 'https://via.placeholder.com/800x400?text=JundAlNabi';
    const url = `${window.location.origin}/index.html?id=${id}`;

    // Set <title>
    document.title = `${title} - JundAlNabi`;

    // Helper function for meta tag updates
    const setMeta = (selector, attr, value) => {
        let tag = document.querySelector(selector);
        if (!tag) {
            tag = document.createElement('meta');
            if (attr === 'name') tag.setAttribute('name', selector.match(/\[name="(.*?)"\]/)[1]);
            else if (attr === 'property') tag.setAttribute('property', selector.match(/\[property="(.*?)"\]/)[1]);
            document.head.appendChild(tag);
        }
        tag.setAttribute(attr, value);
    };

    // Standard Meta
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="keywords"]', 'content', news.keywords || 'Islamic news, JundAlNabi, religion, global updates');

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', 'article');

    // Twitter
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[property="twitter:title"]', 'content', title);
    setMeta('meta[property="twitter:description"]', 'content', description);
    setMeta('meta[property="twitter:image"]', 'content', image);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
}

// =============================
// STRUCTURED DATA (SCHEMA.ORG)
// =============================
function addStructuredData(news, id) {
    const scriptId = 'structured-data';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const url = `${window.location.origin}/index.html?id=${id}`;
    const datePublished = news.createdAt ? new Date(news.createdAt.seconds * 1000).toISOString() : '';
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": news.title,
        "image": [news.imageUrl || ""],
        "datePublished": datePublished,
        "dateModified": datePublished,
        "author": {
            "@type": "Person",
            "name": news.author || "Admin"
        },
        "publisher": {
            "@type": "Organization",
            "name": "JundAlNabi",
            "logo": {
                "@type": "ImageObject",
                "url": "https://via.placeholder.com/120x120?text=JundAlNabi"
            }
        },
        "description": news.content.substring(0, 155),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(script);
}

// =============================
// ARTICLE VIEW GENERATOR
// =============================
function createArticleView(news) {
    const date = news.createdAt
        ? new Date(news.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'No date';

    const formattedContent = formatContent(news.content);
    const categoryBadge = news.category ? `<span class="article-category">${news.category}</span>` : '';

    return `
        <div class="article-full">
            <button class="back-btn" onclick="window.location.href='index.html'">
                <i class="fa-solid fa-arrow-left"></i> Back
            </button>

            ${categoryBadge}
            ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}" class="article-image" onerror="this.style.display='none'">` : ''}

            <div class="article-header">
                <h1>${news.title}</h1>
                <div class="article-meta">
                    <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${date}</span>
                </div>
            </div>

            <div class="article-content">${formattedContent}</div>

            <div class="share-buttons">
                <h4>Share this article</h4>
                <div class="share-icons">
                    <button onclick="shareOnFacebook()" class="share-btn"><i class="fa-brands fa-facebook-f"></i></button>
                    <button onclick="shareOnTwitter()" class="share-btn"><i class="fa-brands fa-twitter"></i></button>
                    <button onclick="shareOnWhatsApp()" class="share-btn"><i class="fa-brands fa-whatsapp"></i></button>
                    <button onclick="copyLink()" class="share-btn"><i class="fa-solid fa-link"></i></button>
                </div>
            </div>
        </div>
    `;
}

// =============================
// FORMATTER & UTILITIES
// =============================
function formatContent(content = '') {
    return content
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/\n/g, '<br>');
}

// =============================
// LOAD ALL NEWS (HOMEPAGE)
// =============================
async function loadNews() {
    const loadingEl = document.getElementById('loading');
    const newsContainer = document.getElementById('newsContainer');

    try {
        const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(newsQuery);

        loadingEl.style.display = 'none';
        if (querySnapshot.empty) {
            newsContainer.innerHTML = '<div class="no-news">No news available yet.</div>';
            return;
        }

        newsContainer.innerHTML = '';
        querySnapshot.forEach((docSnap) => {
            const news = docSnap.data();
            newsContainer.appendChild(createNewsCard(docSnap.id, news));
        });
    } catch (error) {
        console.error('Error loading news:', error);
        loadingEl.innerHTML = '<div class="no-news">Failed to load news.</div>';
    }
}

function createNewsCard(id, news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.addEventListener('click', () => (window.location.href = `index.html?id=${id}`));

    const date = news.createdAt ? new Date(news.createdAt.seconds * 1000).toLocaleDateString() : 'No date';
    const excerpt = (news.content || '').substring(0, 120).replace(/[#*>\[\]]/g, '') + '...';
    const categoryBadge = news.category ? `<span class="category-badge">${news.category}</span>` : '';

    card.innerHTML = `
        ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}">` : ''}
        <div class="news-card-content">
            ${categoryBadge}
            <h3>${news.title}</h3>
            <p>${excerpt}</p>
            <div class="news-meta">
                <span><i class="fa-solid fa-calendar"></i> ${date}</span>
                <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
            </div>
        </div>
    `;
    return card;
}

// =============================
// SHARE FUNCTIONS
// =============================
window.shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
window.shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(document.title)}`, '_blank');
window.shareOnWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(document.title + ' ' + window.location.href)}`, '_blank');
window.copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
};

// =============================
// MOBILE MENU
// =============================
const menu = document.getElementById('menu_bar');
const nav = document.getElementById('nav_bar');
if (menu && nav) {
    menu.addEventListener('click', () => nav.classList.toggle('active'));
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('active');
    });
}
