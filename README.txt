# JundAlNabi News Web App

A modern, Firebase-powered news platform built for speed, security, and strong SEO. The app delivers real-time content, optimized metadata, and smooth social media previews across all major platforms.


## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Technical Specifications](#technical-specifications)
* [SEO Optimization](#seo-optimization)
* [Installation and Setup](#installation-and-setup)
* [Firebase Configuration](#firebase-configuration)
* [Document Structure](#document-structure)
* [Usage Examples](#usage-examples)
* [Meta Tags Reference](#meta-tags-reference)
* [Performance Optimization](#performance-optimization)
* [Browser Compatibility](#browser-compatibility)
* [Troubleshooting](#troubleshooting)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## Overview

JundAlNabi is a lightweight news application that uses Firebase to deliver articles instantly. It updates metadata on the fly, supports rich previews, and helps search engines index content efficiently. It’s built with clean HTML, CSS, and vanilla JavaScript.

### Built With

* Firebase Firestore
* JavaScript (ES6+)
* HTML5 / CSS3
* Open Graph protocol
* Twitter Card metadata

---

## Key Features

### Core

* Real-time data from Firestore
* Automatic SEO and metadata generation
* Responsive layout for all screen sizes
* Built-in sharing tools for major social platforms
* Lightbox-style image gallery
* Optional markdown formatting
* Lazy loading and optimized assets

### User Experience

* Simple interface
* Fast loading
* Easy navigation
* Print-friendly pages
* Supports browser-based dark mode

---

## Technical Specifications

### Directory Structure

```
JundAlNabi/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   └── images/
└── README.md
```

### Technology Stack

| Component | Technology                         | Version |
| --------- | ---------------------------------- | ------- |
| Database  | Firestore                          | Latest  |
| Frontend  | HTML/CSS/JavaScript                | ES6+    |
| Hosting   | Firebase Hosting or custom hosting | —       |
| CDN       | Firebase SDK                       | 9.x+    |

---

## SEO Optimization

### Automatic Features

* Dynamic page titles
* Article-specific meta descriptions
* Auto-generated keywords
* Complete Open Graph implementation
* Twitter Card support
* Semantic HTML structure
* Mobile-first layout
* Clean URLs with query parameters

### Benefits

* Better visibility on Google and Bing
* Rich previews on social media
* Faster indexing
* Higher click-through rates

---

## Installation and Setup

### Requirements

* A modern browser
* Firebase account with Firestore enabled
* Hosting provider or local server
* Basic HTML/JavaScript knowledge

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/alet8319-ship-it/jundalnabi_news.git
   cd jundalnabi-news
   ```

2. **Upload the files**
   Place all project files on your server and make sure `index.html` is accessible.

3. **Set up Firebase**
   Add your Firebase configuration inside your script.

4. **Verify SDK scripts**

   ```html
   <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>
   ```

5. **Test**
   Visit your domain and confirm articles load correctly.

---

## Firebase Configuration

### Setup

1. Create a Firebase project
2. Enable Firestore
3. Copy your project credentials

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Recommended Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /news/{article} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Document Structure

### Collection: `news`

Each article should include:

```javascript
{
  title: "String",
  content: "String",
  imageUrl: "String",
  category: "String",
  author: "String",
  createdAt: Timestamp,
  keywords: "String",
  excerpt: "String",
  images: ["Array of URLs"]
}
```

---

## Usage Examples

### All Articles

```
https://www.codetoweb.tech/index.html
```

### Single Article

```
https://www.codetoweb.tech/index.html?id=dMZ5Af2m8oZkDCzDQNCW
```

### Embed Article

```html
<iframe src="https://www.codetoweb.tech/index.html?id=dMZ5Af2m8oZkDCzDQNCW" 
        width="100%" height="600" frameborder="0"></iframe>
```

---

## Meta Tags Reference

(Keep in your `<head>` section.)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<meta name="description" content="Latest verified news from JundAlNabi.">
<meta name="keywords" content="News, Articles, JundAlNabi">
<meta name="author" content="Taha Ale">
<meta name="robots" content="index, follow">

<meta property="og:type" content="article">
<meta property="og:title" content="JundAlNabi News - Latest Stories">
<meta property="og:image" content="https://codetoweb.tech/logo/logo.png">

<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://codetoweb.tech/">
```

---

## Performance Optimization

* Lazy loading images
* Minified CSS and JS
* Optimized image formats
* Browser caching
* CDN-served Firebase SDK

### Performance Targets

| Metric     | Target |
| ---------- | ------ |
| FCP        | < 1.5s |
| TTI        | < 3.0s |
| CLS        | < 0.1  |
| Lighthouse | > 90   |

---

## Browser Compatibility

| Browser        | Minimum Version |
| -------------- | --------------- |
| Chrome         | 90+             |
| Firefox        | 88+             |
| Safari         | 14+             |
| Edge           | 90+             |
| Opera          | 76+             |
| iOS Safari     | 14+             |
| Chrome Android | 90+             |

---

## Troubleshooting

### Articles Not Loading

* Confirm Firebase config
* Check console errors
* Ensure collection name is `news`

### Images Not Loading

* Verify URLs
* Check CORS rules

### SEO Tags Not Updating

* Clear cache
* Check JS execution

### Slow Performance

* Reduce image sizes
* Add Firestore indexes

---

## Contributing

Contributions are welcome.

**Steps**

1. Fork the project
2. Create a branch
3. Commit your changes
4. Open a pull request

**Guidelines**

* Use ES6+
* Follow semantic HTML
* Keep design responsive
* Test across devices

---

## License

Licensed under the MIT License.

---

## Contact

**Developer:** Taha Ale
**Project:** JundAlNabi News
**Year:** 2025

**Support**
Email: [support@codetoweb.tech](mailto:support@codetoweb.tech)
GitHub Issues: [https://github.com/alet8319-ship-it/jundalnabi_news/issues](https://github.com/alet8319-ship-it/jundalnabi_news/issues)

---

## Acknowledgments

* Firebase documentation
* Open source community
* Early testers for feedback

---

<div align="center">

Built with ❤️ by **Taha Ale**

Star the repo if you find it helpful.

</div>