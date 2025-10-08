# Portfolio Website - AI Coding Instructions

## Architecture Overview

This is a **GitHub Pages compatible portfolio website** built with vanilla ES2025+ JavaScript, modern CSS, and semantic HTML. The site uses a **multi-page architecture** with shared components and consistent theming.

### Key Components
- **PortfolioApp class** (`js/main.js`) - Main application controller using modern event delegation
- **CSS Custom Properties** (`css/style.css`) - Design system with systematic color/spacing variables
- **GitHub Pages Asset Handling** - Automatic path conversion from `/assets/` to `./assets/`

## Critical Patterns

### Asset Path Management
**ALWAYS** use relative paths for GitHub Pages compatibility:
```html
<!-- Correct -->
<img src="./assets/image.webp" alt="...">
<link rel="stylesheet" href="./css/style.css">

<!-- Incorrect -->
<img src="/assets/image.webp" alt="...">
```

The `PortfolioApp.initAssetPaths()` method automatically converts absolute asset paths to relative ones.

### Event Handling Pattern
Use the **data-action attribute system** for all interactive elements:
```html
<button data-action="toggle-theme">Toggle Theme</button>
<a href="./about.html" data-action="navigate">About</a>
```

All events flow through `PortfolioApp.handleGlobalClick()` using modern event delegation.

### CSS Architecture
Follow the **custom properties design system**:
```css
:root {
    --primary-color: #10b981;
    --space-md: 1.5rem;
    --transition-medium: 300ms ease;
}
```

Use the established spacing scale (`--space-xs` to `--space-xl`) and color variables.

### Theme System
Theme persistence uses localStorage with the pattern:
```javascript
// Toggle theme
document.documentElement.classList.toggle('dark-theme');
localStorage.setItem('theme', isDark ? 'dark' : 'light');
```

## File Structure Conventions

### HTML Pages
- `index.html` - Main landing with portfolio navigation
- `aidev.html` - AI Development portfolio
- `mpd.html` - Motion Picture & Design portfolio  
- `iis.html` - Innovative Interactive Systems
- `about.html` - Personal/contact information

### Asset Organization
- `/assets/` - All images, videos, and media files
- Use `.webp` for optimized images when possible
- Follow naming convention: `projectname_type.webp` (e.g., `aidev_button.webp`)

## Development Workflows

### Local Development
```bash
# Serve locally with any static server
python -m http.server 8000
# or
npx serve .
```

### GitHub Pages Deployment
1. Push changes to `main` branch
2. GitHub Pages automatically deploys from `/root`
3. Custom domain configured via `CNAME` file: `www.jeremyrobards.com`

## Performance Requirements

- **Vanilla JavaScript only** - No build tools or bundlers
- **Minimal dependencies** - Only external dependency is Tailwind CSS (CDN)
- **WebP images** preferred for performance
- **CSS custom properties** for theming instead of CSS-in-JS

## Browser Compatibility

Target modern browsers with ES2025+ support:
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Use modern JavaScript features (classes, arrow functions, destructuring)
- No polyfills required

## Code Quality Standards

- Use **semantic HTML5** elements
- Follow **BEM-like** CSS naming when not using utilities
- **Event delegation** over individual event listeners
- **Class-based JavaScript** architecture
- **Accessible markup** with proper ARIA labels