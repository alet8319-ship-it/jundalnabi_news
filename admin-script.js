// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const newsForm = document.getElementById('newsForm');
const logoutBtn = document.getElementById('logoutBtn');
const imageUrlInput = document.getElementById('imageUrl');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const keywordsInput = document.getElementById('keywords');
const categoryInput = document.getElementById('newsCategory'); // ADDED for category select
const customCategoryInput = document.getElementById('customCategory'); // ADDED for custom category

// ======= Dynamic Categories =======
// You can adjust these as your app grows
const PREDEFINED_CATEGORIES = [
    'World', 'Pakistan', 'Technology', 'Religion', 'Health', 'Finance', 'Opinion', 'Education', 'Sports', 'Other'
];

// Populate category select at load time (to let admin pick category or add their own)
function populateCategoryOptions() {
    if (!categoryInput) return;
    // Clear existing options except for first
    categoryInput.innerHTML = '';
    // Add some system categories
    PREDEFINED_CATEGORIES.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoryInput.appendChild(opt);
    });
    // Add an 'Other' option for custom category if not present
    if (![...categoryInput.options].some(o => o.value === 'custom')) {
        const opt = document.createElement('option');
        opt.value = 'custom';
        opt.textContent = 'Custom...';
        categoryInput.appendChild(opt);
    }
}
populateCategoryOptions();

// Show/hide custom category field for admins
if (categoryInput && customCategoryInput) {
    categoryInput.addEventListener('change', () => {
        if (categoryInput.value === 'custom') {
            customCategoryInput.style.display = '';
            customCategoryInput.required = true;
            customCategoryInput.focus();
        } else {
            customCategoryInput.style.display = 'none';
            customCategoryInput.required = false;
            customCategoryInput.value = '';
        }
    });
    // Hide initially
    if (categoryInput.value !== 'custom') customCategoryInput.style.display = 'none';
}

// Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        adminDashboard.style.display = 'block';
        loadNews();
    } else {
        loginSection.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showAlert('loginAlert', 'Login successful!', 'success');
    } catch (error) {
        showAlert('loginAlert', 'Invalid credentials. Please try again.', 'error');
    }
});

// Logout
logoutBtn.addEventListener('click', async () => await signOut(auth));

// ======= RICH TEXT EDITOR SETUP =======
const contentArea = document.getElementById('content');
const toolbar = document.getElementById('toolbar');

toolbar.addEventListener('click', (e) => {
    if (e.target.dataset.cmd) {
        document.execCommand(e.target.dataset.cmd, false, null);
        contentArea.focus();
    }
});

// ======= MULTIPLE IMAGE PREVIEW =======
imageUrlInput.addEventListener('input', (e) => {
    const urls = e.target.value
        .split(/[\n,]+/)
        .map(u => u.trim())
        .filter(u => u);
    imagePreviewContainer.innerHTML = '';

    urls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'image-preview';
        imagePreviewContainer.appendChild(img);
    });
});

// ======= SUBMIT NEWS WITH CHOSEN CATEGORY =======
newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';

    try {
        const imageUrls = imageUrlInput.value
            .split(/[\n,]+/)
            .map(u => u.trim())
            .filter(u => u);

        // Parse keywords input into an array of trimmed keywords (comma or newline separated)
        let keywordsValue = [];
        if (keywordsInput) {
            keywordsValue = keywordsInput.value
                .split(/[\n,]+/)
                .map(k => k.trim())
                .filter(k => k);
        }

        // Get category value
        let categoryValue = categoryInput.value;
        if (categoryValue === 'custom') {
            // Use custom category field, stripped and validated
            categoryValue = customCategoryInput.value.trim() || 'General';
        }

        const newsData = {
            title: document.getElementById('title').value.trim(),
            description: (document.getElementById('description') ? document.getElementById('description').value.trim() : '') || '',
            content: contentArea.innerHTML, // Save formatted HTML
            author: document.getElementById('author').value.trim() || 'Admin',
            imageUrls: imageUrls, // Array of images
            keywords: keywordsValue, // Array of keywords
            createdAt: Timestamp.now(),
            views: 0, // Initialize views to zero
            category: categoryValue // Store the category
        };

        await addDoc(collection(db, 'news'), newsData);
        showAlert('uploadAlert', 'Article published successfully!', 'success');
        newsForm.reset();
        imagePreviewContainer.innerHTML = '';
        contentArea.innerHTML = '';
        customCategoryInput.value = '';
        if (keywordsInput) keywordsInput.value = '';
        loadNews();
    } catch (error) {
        console.error('Publish error:', error);
        showAlert('uploadAlert', 'Error publishing article. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Publish Article';
    }
});

// ======= LOAD NEWS =======
async function loadNews() {
    const newsList = document.getElementById('newsList');
    try {
        const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(newsQuery);

        const total = querySnapshot.size;
        const today = new Date().setHours(0, 0, 0, 0);
        let todayCount = 0;

        newsList.innerHTML = '';

        if (querySnapshot.empty) {
            newsList.innerHTML = '<p style="text-align: center; color: #666;">No articles yet.</p>';
        } else {
            querySnapshot.forEach((docSnap) => {
                const news = docSnap.data();
                const newsDate = new Date(news.createdAt.seconds * 1000).setHours(0, 0, 0, 0);
                if (newsDate === today) todayCount++;

                const newsItem = createNewsItem(docSnap.id, news);
                newsList.appendChild(newsItem);
            });
        }

        document.getElementById('totalNews').textContent = total;
        document.getElementById('todayNews').textContent = todayCount;
    } catch (error) {
        console.error('Error loading news:', error);
        newsList.innerHTML = '<p style="text-align: center; color: #666;">Error loading articles.</p>';
    }
}

// ======= CREATE NEWS ITEM =======
// Show category as well in admin list
function createNewsItem(id, news) {
    const item = document.createElement('div');
    item.className = 'news-item';
    const date = new Date(news.createdAt.seconds * 1000).toLocaleString();

    // Strip HTML tags and shorten content
    const plainText = (news.content || '').replace(/<[^>]+>/g, '');
    const shortText = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;

    // Show views count, default to 0 if not set
    const views = typeof news.views === "number" ? news.views : 0;

    // Prepare keywords display (if any)
    let keywordsHtml = '';
    if (Array.isArray(news.keywords) && news.keywords.length > 0) {
        keywordsHtml = `<div class="news-keywords">${news.keywords.map(k => `<span class="keyword-badge">${escapeHtml(k)}</span>`).join(' ')}</div>`;
    }

    // Show article category
    const categoryHtml = news.category
        ? `<div class="news-category">Category: <span class="category-badge">${escapeHtml(news.category)}</span></div>`
        : '';

    item.innerHTML = `
        <div class="news-item-content">
            <h3>${escapeHtml(news.title)}</h3>
            <p class="meta">${escapeHtml(date)} - By ${escapeHtml(news.author || 'Admin')}</p>
            ${categoryHtml}
            <p class="short-preview">${escapeHtml(shortText)}</p>
            ${keywordsHtml}
            <p class="views-count"><i class="fa-solid fa-eye"></i> ${views} views</p>
        </div>
        <div class="news-item-actions">
            <button class="btn btn-small btn-danger" onclick="deleteNews('${id}')">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        </div>
    `;
    return item;
}

// ======= DELETE NEWS =======
window.deleteNews = async function(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        try {
            await deleteDoc(doc(db, 'news', id));
            loadNews();
        } catch (error) {
            alert('Error deleting article.');
        }
    }
};

// ======= ALERT HELPER =======
function showAlert(elementId, message, type) {
    const alertEl = document.getElementById(elementId);
    alertEl.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
    setTimeout(() => alertEl.innerHTML = '', 5000);
}

// ======= Simple HTML escape for user-provided strings =======
function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}