# Jeremy Robards Portfolio

## GitHub Pages Compatible Portfolio Website

A modern, responsive portfolio website built with vanilla ES2025+ JavaScript, optimized for GitHub Pages deployment.

## 🚀 Project Structure

```
/
├── index.html          # Main landing page
├── aidev.html         # AI Development portfolio
├── mpd.html           # Motion Picture & Design portfolio  
├── iis.html           # Innovative Interactive Systems
├── about.html         # About page
├── css/
│   └── style.css      # Main stylesheet with CSS custom properties
├── js/
│   └── main.js        # ES2025+ JavaScript modules
├── assets/            # All image and media assets
│   ├── *.png          # Image files
│   ├── *.jpg          # Image files
│   ├── *.webp         # Optimized images
│   └── *.svg          # Vector graphics
├── CNAME              # Custom domain configuration
└── README.md          # This file
```

## 🎨 Design System

### CSS Architecture
- **Custom Properties**: CSS variables for consistent theming
- **Modern Layout**: CSS Grid and Flexbox
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Built-in dark/light mode support

### Color Palette
- Primary: `#10b981` (Emerald)
- Background: Black gradient (`#000000` to `#2d2d2d`)
- Text: White with muted variants
- Accents: Emerald with hover states

## ⚡ JavaScript Features

### ES2025+ Implementation
- **Class-based Architecture**: Modern OOP patterns
- **Event Delegation**: Efficient event handling
- **Module Pattern**: Organized, maintainable code
- **Local Storage**: Theme persistence
- **History API**: Client-side navigation

### Key Components
- `PortfolioApp`: Main application class
- Theme toggle system
- Asset path management for GitHub Pages
- Global event handling system

## 🌐 GitHub Pages Deployment

### Asset Path Management
The JavaScript automatically handles GitHub Pages asset path requirements:
- Converts `/assets/` paths to `./assets/` for compatibility
- Ensures all resources load correctly on GitHub Pages

### Deployment Steps
1. Push to `main` branch
2. Enable GitHub Pages in repository settings
3. Select source: Deploy from branch `main` / `root`
4. Custom domain configured via `CNAME` file

### Custom Domain Setup
- Domain: `www.jeremyrobards.com`
- DNS: CNAME record pointing to `{username}.github.io`
- HTTPS: Automatically enabled by GitHub Pages

## 🛠️ Development

### Local Development
```bash
# Serve locally (any static server)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

### File Organization
- **HTML**: Semantic, accessible markup
- **CSS**: Component-based architecture with utilities
- **JS**: Modern ES modules with class-based patterns
- **Assets**: Centralized in `/assets/` directory

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Responsive Design

### Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Features
- Touch-optimized navigation
- Responsive images
- Flexible typography
- Adaptive layouts

## 🎯 Performance

### Optimization Features
- Minimal dependencies (vanilla JS)
- Optimized images (WebP support)
- CSS custom properties for theming
- Efficient event delegation
- Local storage for user preferences

### Loading Strategy
- Critical CSS inline for above-fold content
- Progressive enhancement
- Lazy loading for images
- Minimal JavaScript bundle

## 📄 Pages Overview

### index.html
Main landing page with navigation to portfolio sections

### aidev.html  
AI Development projects and case studies

### mpd.html
Motion Picture & Design portfolio showcase

### iis.html
Innovative Interactive Systems and experiments

### about.html
Personal information, skills, and contact details

## 🔧 Configuration

### Theme Customization
Modify CSS custom properties in `style.css`:
```css
:root {
    --primary-color: #10b981;
    --background-gradient: linear-gradient(...);
    /* Add your custom values */
}
```

### JavaScript Configuration
Update app settings in `main.js`:
```javascript
class PortfolioApp {
    constructor() {
        this.config = {
            // Your configuration
        };
    }
}
```

## 📈 Analytics & SEO

### Meta Tags
- Proper meta descriptions
- Open Graph tags ready
- Twitter Card support
- Structured data markup ready

### Performance Monitoring
- Core Web Vitals optimized
- Lighthouse score targets: 90+
- Minimal third-party dependencies

---

**Built with modern web standards for GitHub Pages deployment**
*ES2025+ | CSS Grid | Custom Properties | GitHub Pages*