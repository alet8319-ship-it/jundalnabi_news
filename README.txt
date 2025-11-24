JundAlNabi News Web App
========================

Overview:
----------
JundAlNabi is a modern, Firebase-powered news platform designed for fast, secure, and SEO-friendly article delivery.  
It dynamically updates page titles, meta tags, and social sharing data (Open Graph and Twitter tags) for better ranking in Google, Bing, and social media previews.

Features:
----------
1. Firebase Firestore Integration – All news articles are loaded dynamically from Firestore.
2. Dynamic SEO – Each article updates meta tags, page titles, and Open Graph data for better search visibility.
3. Mobile Responsive – Fully responsive layout compatible with all devices.
4. Social Sharing – Built-in share buttons for Facebook, Twitter, and WhatsApp.
5. Image Gallery – Supports multiple images per article with modal view.
6. Markdown Formatting – Automatically formats content using markdown-like syntax.
7. Fast Loading – Optimized for speed and performance.

SEO Features:
--------------
- Auto-updated page titles (`document.title`)
- Dynamic meta descriptions and keywords
- Open Graph and Twitter card support
- Structured article formatting (H1, H2, paragraphs)
- Clean, readable URLs (e.g., `index.html?id=123`)
- Mobile-friendly and responsive design

Setup Instructions:
--------------------
1. Upload the project files to your hosting server.
2. Open `index.html` and ensure Firebase SDK URLs are correct.
3. Add your Firebase configuration in the `firebaseConfig` object.
4. Make sure your Firestore collection name is `news`.
5. Each document should contain:
   - title
   - content
   - imageUrl (optional)
   - category (optional)
   - author (optional)
   - createdAt (Firestore Timestamp)
   - keywords (optional)
6. Access the website in your browser:
   Example:
   - All news: `index.html`
   - Single article: `index.html?id=ARTICLE_ID`

Recommended Meta Tags (for index.html):
----------------------------------------
<meta name="description" content="Read the latest verified news and articles from JundAlNabi. Stay informed with updated stories and insights.">
<meta name="keywords" content="News, Articles, JundAlNabi, Latest Stories, Technology, World, Politics">
<meta property="og:type" content="article">
<meta property="og:site_name" content="JundAlNabi News">
<meta name="twitter:card" content="summary_large_image">

Author:
---------
Developed by Taha Ale  
© 2025 JundAlNabi. All rights reserved.

