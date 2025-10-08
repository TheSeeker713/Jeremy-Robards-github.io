/**
 * Jeremy Robards Portfolio - Main JavaScript
 * ES2025+ Compatible Code with GSAP Animations
 * Modern JavaScript with Web Standards
 */

// ES2025+ Module Pattern with Modern Features
class PortfolioApp {
    // Private fields (ES2022+)
    #timeline = null;
    #prefersReducedMotion = false;
    #animationConfig = {
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.15
    };

    constructor() {
        this.#checkReducedMotion();
        this.#init();
    }

    async #init() {
        // Wait for GSAP to be available
        await this.#waitForGSAP();
        
        this.#setupEventListeners();
        this.#initializeComponents();
        
        // Initialize animations when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#initAnimations());
        } else {
            this.#initAnimations();
        }
    }

    #checkReducedMotion() {
        // Respect user's motion preferences (ES2025+ modern approach)
        this.#prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Listen for changes in motion preference
        window.matchMedia('(prefers-reduced-motion: reduce)')
            .addEventListener('change', (e) => {
                this.#prefersReducedMotion = e.matches;
                this.#updateAnimationConfig();
            });
    }

    #updateAnimationConfig() {
        if (this.#prefersReducedMotion) {
            this.#animationConfig = {
                duration: 0.01,
                ease: "none",
                stagger: 0
            };
        }
    }

    async #waitForGSAP() {
        // Modern async/await pattern for dependency loading
        return new Promise((resolve) => {
            if (typeof gsap !== 'undefined') {
                resolve();
            } else {
                const checkGSAP = () => {
                    if (typeof gsap !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(checkGSAP, 50);
                    }
                };
                checkGSAP();
            }
        });
    }

    #initAnimations() {
        // Create GSAP timeline for page entrance
        this.#timeline = gsap.timeline();
        
        const welcomeHeading = document.querySelector('h1');
        const portfolioButtons = document.querySelectorAll('[data-action="navigate"]');

        if (welcomeHeading && portfolioButtons.length) {
            // Set initial states
            gsap.set(welcomeHeading, { 
                opacity: 0, 
                scale: 0.8, 
                y: 30 
            });
            
            gsap.set(portfolioButtons, { 
                opacity: 0, 
                scale: 0.5, 
                y: 50,
                rotationY: 45
            });

            // Animate entrance
            this.#timeline
                .to(welcomeHeading, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: this.#animationConfig.duration,
                    ease: this.#animationConfig.ease
                })
                .to(portfolioButtons, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotationY: 0,
                    duration: this.#animationConfig.duration * 0.8,
                    ease: this.#animationConfig.ease,
                    stagger: this.#animationConfig.stagger
                }, "-=0.3");
        }
    }

    #setupEventListeners() {
        // Modern event delegation with ES2025+ features
        document.addEventListener('click', this.#handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.#handleKeyboardInteraction.bind(this));
        
        // Enhanced hover effects for portfolio buttons
        this.#setupHoverEffects();
    }

    #setupHoverEffects() {
        const portfolioButtons = document.querySelectorAll('[data-action="navigate"]');
        
        portfolioButtons.forEach(button => {
            // Mouse events
            button.addEventListener('mouseenter', () => this.#enhanceHoverEffect(button, true));
            button.addEventListener('mouseleave', () => this.#enhanceHoverEffect(button, false));
            
            // Focus events for accessibility
            button.addEventListener('focus', () => this.#enhanceHoverEffect(button, true));
            button.addEventListener('blur', () => this.#enhanceHoverEffect(button, false));
        });
    }

    #enhanceHoverEffect(element, isHovering) {
        if (this.#prefersReducedMotion) return;

        const img = element.querySelector('img');
        if (!img) return;

        if (isHovering) {
            gsap.to(element, {
                scale: 1.08,
                y: -8,
                rotationX: 5,
                rotationY: 5,
                duration: 0.3,
                ease: "power2.out"
            });
            
            gsap.to(img, {
                brightness: 1.2,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            gsap.to(element, {
                scale: 1,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                duration: 0.4,
                ease: "power2.out"
            });
            
            gsap.to(img, {
                brightness: 1,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }

    #handleGlobalClick(event) {
        // Global click handler using modern event delegation
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        this.#executeAction(action, target, event);
    }

    #handleKeyboardInteraction(event) {
        // Enhanced keyboard accessibility
        const target = event.target.closest('[data-action]');
        if (!target) return;

        // Handle Enter and Space keys
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            
            // Add visual feedback for keyboard activation
            this.#addActivationFeedback(target);
            
            // Trigger the action
            const action = target.dataset.action;
            this.#executeAction(action, target, event);
        }
    }

    #addActivationFeedback(element) {
        // Visual feedback for keyboard/programmatic activation
        if (this.#prefersReducedMotion) return;

        gsap.fromTo(element, 
            { scale: 1 },
            { 
                scale: 0.95, 
                duration: 0.1, 
                yoyo: true, 
                repeat: 1,
                ease: "power2.inOut"
            }
        );
    }

    #executeAction(action, element, event) {
        // Action dispatcher with ES2025+ switch expression style
        const actions = {
            navigate: () => this.#handleNavigation(element, event),
            'toggle-theme': () => this.#toggleTheme(),
            default: () => console.warn(`Unknown action: ${action}`)
        };

        (actions[action] || actions.default)();
    }

    #handleNavigation(element, event) {
        // Handle page navigation with smooth transition
        const href = element.getAttribute('href');
        
        if (href && (href.startsWith('./') || href.startsWith('/'))) {
            // For external navigation, let default behavior handle it
            // Add exit animation if needed
            this.#animatePageExit(() => {
                window.location.href = href;
            });
        }
    }

    #animatePageExit(callback) {
        if (this.#prefersReducedMotion) {
            callback?.();
            return;
        }

        // Smooth exit animation
        const elements = document.querySelectorAll('main > *');
        
        gsap.to(elements, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            stagger: 0.1,
            ease: "power2.in",
            onComplete: callback
        });
    }

    #toggleTheme() {
        // Theme toggle functionality with animation
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark-theme');
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Add theme transition effect
        if (!this.#prefersReducedMotion) {
            gsap.fromTo(document.body, 
                { opacity: 1 },
                { 
                    opacity: 0.8, 
                    duration: 0.2, 
                    yoyo: true, 
                    repeat: 1,
                    ease: "power2.inOut"
                }
            );
        }
    }

    #initializeComponents() {
        // Initialize any page-specific components
        this.#initAssetPaths();
        this.#initTheme();
    }

    #initAssetPaths() {
        // Ensure GitHub Pages compatible asset paths
        const images = document.querySelectorAll('img[src^="/assets/"]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src.startsWith('/assets/')) {
                img.setAttribute('src', `.${src}`);
            }
        });
    }

    #initTheme() {
        // Initialize theme from localStorage
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored ? stored === 'dark' : prefersDark;
        
        document.documentElement.classList.toggle('dark-theme', isDark);
    }

    // Public API methods
    playIntroAnimation() {
        this.#timeline?.restart();
    }

    pauseAnimations() {
        gsap.globalTimeline.pause();
    }

    resumeAnimations() {
        gsap.globalTimeline.resume();
    }
}

// Initialize app with modern error handling
try {
    new PortfolioApp();
} catch (error) {
    console.error('Portfolio initialization failed:', error);
    // Fallback behavior
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Portfolio loaded with fallback behavior');
    });
}