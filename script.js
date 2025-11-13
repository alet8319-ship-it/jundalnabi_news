import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc, orderBy, query, where, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyA1kGDOAuQRqdgXHX3Ugjj_zL7_bqYXos0",
    authDomain: "myapp-3a874.firebaseapp.com",
    databaseURL: "https://myapp-3a874-default-rtdb.firebaseio.com",
    projectId: "myapp-3a874",
    storageBucket: "myapp-3a874.appspot.com",
    messagingSenderId: "430236087961",
    appId: "1:430236087961:web:d7b0e75c6cf2498c9b6a08",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

// News sort and category input logic (with dropdown for known categories)
const sortTypeEl = document.getElementById('newsSortType');
const categoryInputEl = document.getElementById('newsCategoryInput');
const categoryDropdownEl = document.getElementById('newsCategoryDropdown');

// Predefined categories (match those in admin and index.html)
const KNOWN_CATEGORIES = [
  "World", "Pakistan", "Technology", "Religion",
  "Health", "Finance", "Opinion", "Education", "Sports", "Other"
];

// Populate dropdown if not already in HTML (for JS dynamic category support)
if (categoryDropdownEl && categoryDropdownEl.options.length <= 1) {
  KNOWN_CATEGORIES.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryDropdownEl.appendChild(opt);
  });
}

// Show/hide appropriate category fields based on sort type and dropdown selection
if (sortTypeEl) {
    sortTypeEl.addEventListener('change', () => {
        if (sortTypeEl.value === 'category') {
            categoryDropdownEl && (categoryDropdownEl.style.display = '');
            categoryInputEl && (categoryInputEl.style.display = '');
        } else {
            categoryDropdownEl && (categoryDropdownEl.style.display = 'none');
            categoryInputEl && (categoryInputEl.style.display = 'none', categoryInputEl.value = '');
            categoryDropdownEl && (categoryDropdownEl.value = "");
        }
        loadNews();
    });
}
if (categoryDropdownEl) {
    categoryDropdownEl.addEventListener('change', () => {
        if (categoryDropdownEl.value === 'Other' || categoryDropdownEl.value === "") {
            categoryInputEl && (categoryInputEl.style.display = '');
        } else {
            categoryInputEl && (categoryInputEl.style.display = 'none', categoryInputEl.value = '');
        }
        loadNews();
    });
}
if (categoryInputEl) {
    categoryInputEl.addEventListener('input', () => {
        if ((sortTypeEl && sortTypeEl.value === 'category') &&
            (categoryDropdownEl && (categoryDropdownEl.value === 'Other' || categoryDropdownEl.value === ""))) {
            loadNews();
        }
    });
}

// Initial load
if (articleId) {
    loadSingleArticle(articleId);
} else {
    loadNews();
}

// Load and display a single article
async function loadSingleArticle(id) {
    const loadingEl = document.getElementById('loading');
    const newsContainer = document.getElementById('newsContainer');
    try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, { views: increment(1) });
            const docSnapUpdated = await getDoc(docRef);
            const news = docSnapUpdated.data();

            loadingEl.style.display = 'none';
            newsContainer.innerHTML = createArticleView(news);
            updatePageMeta(news, id);
            addStructuredData(news, id);
        } else {
            loadingEl.style.display = 'none';
            newsContainer.innerHTML = '<div class="no-news">Article not found.</div>';
        }
    } catch (error) {
        console.error('Error loading article:', error);
        loadingEl.style.display = 'none';
        loadingEl.innerHTML = '<div class="no-news">Error loading article. Please try again later.</div>';
    }
}

// Helper to get an image with a preferred fallback
function getFirstImage(news, fallback) {
    if (Array.isArray(news.imageUrls) && news.imageUrls.length > 0) {
        return news.imageUrls[0];
    }
    return [news.imageUrl, news.image, news.img, news.photo, news.thumbnail]
        .find(url => typeof url === 'string' && url.trim().length > 0) || fallback;
}

// Update meta tags for SEO and social sharing
function updatePageMeta(news, id) {
    const title = news.title || 'JundAlNabi News';
    const description = getCardDescription(news);
    const image = getFirstImage(news, 'https://via.placeholder.com/800x400?text=JundAlNabi');
    const url = `${window.location.origin}/index.html?id=${id}`;

    document.title = `${title} - JundAlNabi`;

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

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="keywords"]', 'content', news.keywords?.join(', ') || 'General news, JundAlNabi, religion, global updates'); // Keywords
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[property="twitter:title"]', 'content', title);
    setMeta('meta[property="twitter:description"]', 'content', description);
    setMeta('meta[property="twitter:image"]', 'content', image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
}

// Add structured data/JSON-LD for SEO
function addStructuredData(news, id) {
    const scriptId = 'structured-data';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const url = `${window.location.origin}/index.html?id=${id}`;
    const datePublished = news.createdAt ? new Date(news.createdAt.seconds * 1000).toISOString() : '';
    const image = getFirstImage(news, "");
    const description = getCardDescription(news);
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": news.title,
        "image": [image],
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
        "description": description,
        "keywords": news.keywords?.join(', ') || 'General news, JundAlNabi, religion, global updates',
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

// Render an article view (full page)
function createArticleView(news) {
    const date = news.createdAt
        ? new Date(news.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'No date';

    const formattedContent = formatContent(news.content);
    const categoryBadge = news.category ? `<span class="article-category">${news.category}</span>` : '';
    const imageUrl = getFirstImage(news, 'https://via.placeholder.com/800x400?text=No+Image');
    const views = typeof news.views === "number" ? news.views : 0;

    return `
        <div class="article-full">
            <button class="back-btn" onclick="window.location.href='index.html'">
                <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            ${categoryBadge}
            <img src="${imageUrl}" alt="${news.title}" class="article-image" 
                 onerror="this.src='https://via.placeholder.com/800x400?text=Image+Unavailable'">
            <div class="article-header">
                <h1>${news.title}</h1>
                <div class="article-meta">
                    <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${date}</span>
                    <span><i class="fa-solid fa-eye"></i> ${views} views</span>
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

// Minimal markdown/emphasis formatting for article content
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

// Generate short description for card/list views
function getCardDescription(news) {
    if (news.description && typeof news.description === "string" && news.description.trim() !== "") {
        return news.description.trim();
    }
    const div = document.createElement('div');
    div.innerHTML = news.content || '';
    let firstParagraph = div.querySelector('p');
    if (firstParagraph) {
        return firstParagraph.textContent.trim();
    }
    return div.textContent.trim().substring(0, 160) + '...';
}

// Main: load and render news feed/cards
async function loadNews() {
    const loadingEl = document.getElementById('loading');
    const newsContainer = document.getElementById('newsContainer');
    const sortType = sortTypeEl ? sortTypeEl.value : 'latest';

    let category = "";
    if (sortType === 'category') {
        // Try dropdown first: if value present and not "Other"/blank, it wins
        if (categoryDropdownEl && categoryDropdownEl.value && categoryDropdownEl.value !== "" && categoryDropdownEl.value !== "Other") {
            category = categoryDropdownEl.value;
        } else if (categoryInputEl) {
            category = categoryInputEl.value.trim();
        }
    }

    loadingEl.style.display = '';
    newsContainer.innerHTML = '';

    try {
        let newsQuery;
        if (sortType === 'latest') {
            newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        } else if (sortType === 'featured') {
            newsQuery = query(collection(db, 'news'), orderBy('featured', 'desc'), orderBy('createdAt', 'desc'));
        } else if (sortType === 'popular') {
            newsQuery = query(collection(db, 'news'), orderBy('views', 'desc'), orderBy('createdAt', 'desc'));
        } else if (sortType === 'category' && category) {
            // Use Firestore WHERE for category filter
            newsQuery = query(collection(db, 'news'), where('category', '==', category), orderBy('createdAt', 'desc'));
        } else {
            newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        }

        const querySnapshot = await getDocs(newsQuery);

        loadingEl.style.display = 'none';
        newsContainer.innerHTML = '';

        let newsList = [];
        querySnapshot.forEach((docSnap) => {
            const news = docSnap.data();
            news.id = docSnap.id;
            newsList.push(news);
        });

        if (newsList.length === 0) {
            newsContainer.innerHTML = '<div class="no-news">Sorry we don`t found any Article yet report us for this bug.</div>';
            return;
        }

        newsList.forEach(news => {
            newsContainer.appendChild(createNewsCard(news.id, news));
        });
    } catch (error) {
        console.error('Error loading news:', error);
        loadingEl.style.display = 'none';
        loadingEl.innerHTML = '<div class="no-news">Failed to load news.</div>';
    }
}

// Card for news feed/list
function createNewsCard(id, news) {
    const imageUrl = getFirstImage(news, 'https://via.placeholder.com/600x300?text=No+Image');
    const views = typeof news.views === "number" ? news.views : 0;
    const date = news.createdAt ? new Date(news.createdAt.seconds * 1000).toLocaleDateString() : 'No date';
    const categoryBadge = news.category ? `<span class="category-badge">${news.category}</span>` : '';
    const description = getCardDescription(news);

    const card = document.createElement('div');
    card.className = 'news-card';
    card.addEventListener('click', () => (window.location.href = `index.html?id=${id}`));

    card.innerHTML = `
        <img src="${imageUrl}" alt="${news.title || 'News Image'}"
             onerror="this.src='https://via.placeholder.com/600x300?text=Image+Unavailable'">
        <div class="news-card-content">
            ${categoryBadge}
            <h3>${news.title}</h3>
            <p class="news-description">${description}</p>
            <div class="news-meta">
                <span><i class="fa-solid fa-calendar"></i> ${date}</span>
                <span><i class="fa-solid fa-user"></i> ${news.author || 'Admin'}</span>
                <span><i class="fa-solid fa-eye"></i> ${views} views</span>
            </div>
        </div>
    `;
    return card;
}

// Social sharing functions
window.shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
window.shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(document.title)}`, '_blank');
window.shareOnWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(document.title + ' ' + window.location.href)}`, '_blank');
window.copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
};

// Menu toggle logic
const menu = document.getElementById('menu_bar');
const nav = document.getElementById('nav_bar');
if (menu && nav) {
    menu.addEventListener('click', () => nav.classList.toggle('active'));
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('active');
    });
}