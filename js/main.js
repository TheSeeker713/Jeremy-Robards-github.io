/**
 * Jeremy Robards Portfolio - Main JavaScript
 * ES2025+ Compatible Code for GitHub Pages
 * Modern JavaScript with Web Standards
 */

// ES2025+ Module Pattern
class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
    }

    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Portfolio loaded');
        });

        // Modern event delegation
        document.addEventListener('click', this.handleGlobalClick.bind(this));
    }

    handleGlobalClick(event) {
        // Global click handler using modern event delegation
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        this.executeAction(action, target, event);
    }

    executeAction(action, element, event) {
        // Action dispatcher
        switch (action) {
            case 'navigate':
                this.handleNavigation(element, event);
                break;
            case 'toggle-theme':
                this.toggleTheme();
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }

    handleNavigation(element, event) {
        // Handle page navigation
        const href = element.getAttribute('href');
        if (href && href.startsWith('/')) {
            // Internal navigation
            event.preventDefault();
            this.navigateToPage(href);
        }
    }

    navigateToPage(path) {
        // Client-side navigation for SPA-like behavior
        window.history.pushState({}, '', path);
        // Add page loading logic here
    }

    toggleTheme() {
        // Theme toggle functionality
        document.documentElement.classList.toggle('dark-theme');
        localStorage.setItem('theme', 
            document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light'
        );
    }

    initializeComponents() {
        // Initialize any page-specific components
        this.initAssetPaths();
    }

    initAssetPaths() {
        // Ensure GitHub Pages compatible asset paths
        const images = document.querySelectorAll('img[src^="/assets/"]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src.startsWith('/assets/')) {
                // GitHub Pages compatibility
                img.setAttribute('src', `.${src}`);
            }
        });
    }
}

// Initialize app
new PortfolioApp();