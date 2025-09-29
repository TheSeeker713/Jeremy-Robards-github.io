// Performance optimization utilities
window.PerformanceOptimizer = {
    // Debounce function to prevent excessive re-renders
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll and resize events
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Optimized DOM manipulation
    batchDOMUpdates: function(callback) {
        requestAnimationFrame(() => {
            callback();
        });
    },

    // Virtual scrolling for large lists
    virtualScrolling: {
        setup: function(container, items, itemHeight, renderItem) {
            const containerHeight = container.clientHeight;
            const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
            let scrollTop = 0;
            
            const viewport = document.createElement('div');
            viewport.style.height = items.length * itemHeight + 'px';
            viewport.style.position = 'relative';
            
            const visibleItems = document.createElement('div');
            visibleItems.style.position = 'absolute';
            visibleItems.style.top = '0';
            visibleItems.style.width = '100%';
            
            viewport.appendChild(visibleItems);
            container.appendChild(viewport);
            
            const updateVisibleItems = this.throttle(() => {
                const startIndex = Math.floor(scrollTop / itemHeight);
                const endIndex = Math.min(startIndex + visibleCount, items.length);
                
                visibleItems.innerHTML = '';
                visibleItems.style.transform = `translateY(${startIndex * itemHeight}px)`;
                
                for (let i = startIndex; i < endIndex; i++) {
                    const item = renderItem(items[i], i);
                    visibleItems.appendChild(item);
                }
            }, 16); // ~60fps
            
            container.addEventListener('scroll', (e) => {
                scrollTop = e.target.scrollTop;
                updateVisibleItems();
            });
            
            updateVisibleItems();
        }
    },

    // Optimize innerHTML usage
    safeInnerHTML: function(element, html) {
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        while (temp.firstChild) {
            fragment.appendChild(temp.firstChild);
        }
        
        element.innerHTML = '';
        element.appendChild(fragment);
    },

    // Memory cleanup for event listeners
    eventManager: {
        listeners: new Map(),
        
        add: function(element, event, handler, options = {}) {
            if (!this.listeners.has(element)) {
                this.listeners.set(element, []);
            }
            
            const listenerInfo = { event, handler, options };
            this.listeners.get(element).push(listenerInfo);
            element.addEventListener(event, handler, options);
        },
        
        remove: function(element, event, handler) {
            if (this.listeners.has(element)) {
                const listeners = this.listeners.get(element);
                const index = listeners.findIndex(l => l.event === event && l.handler === handler);
                if (index > -1) {
                    listeners.splice(index, 1);
                    element.removeEventListener(event, handler);
                }
            }
        },
        
        cleanup: function(element) {
            if (this.listeners.has(element)) {
                const listeners = this.listeners.get(element);
                listeners.forEach(({ event, handler }) => {
                    element.removeEventListener(event, handler);
                });
                this.listeners.delete(element);
            }
        }
    },

    // Optimize animations
    animationOptimizer: {
        runningAnimations: new Set(),
        
        animate: function(element, keyframes, options) {
            // Cancel existing animation on same element
            this.runningAnimations.forEach(anim => {
                if (anim.element === element) {
                    anim.animation.cancel();
                    this.runningAnimations.delete(anim);
                }
            });
            
            const animation = element.animate(keyframes, options);
            const animInfo = { element, animation };
            
            this.runningAnimations.add(animInfo);
            
            animation.addEventListener('finish', () => {
                this.runningAnimations.delete(animInfo);
            });
            
            return animation;
        },
        
        cancelAll: function() {
            this.runningAnimations.forEach(({ animation }) => {
                animation.cancel();
            });
            this.runningAnimations.clear();
        }
    },

    // Initialize all optimizations
    init: function() {
        // Preload critical resources
        this.preloadResources();
        
        // Set up passive event listeners for better scroll performance
        this.setupPassiveListeners();
        
        // Monitor performance
        this.setupPerformanceMonitoring();
    },

    preloadResources: function() {
        // Preload commonly used scripts
        const scripts = [
            'js/cards.js',
            'js/notes.js'
        ];
        
        scripts.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = src;
            document.head.appendChild(link);
        });
    },

    setupPassiveListeners: function() {
        // Add passive listeners for better performance
        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
        
        passiveEvents.forEach(event => {
            document.addEventListener(event, () => {}, { passive: true });
        });
    },

    setupPerformanceMonitoring: function() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        console.warn('Long task detected:', entry.duration + 'ms', entry);
                    }
                });
            });
            
            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Longtask API not supported
            }
        }
    },

    // Lazy loading for images and content
    lazyLoad: {
        observer: null,
        
        init: function() {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;
                            
                            // Load image
                            if (element.dataset.src) {
                                element.src = element.dataset.src;
                                element.removeAttribute('data-src');
                            }
                            
                            // Load content
                            if (element.dataset.content) {
                                element.innerHTML = element.dataset.content;
                                element.removeAttribute('data-content');
                            }
                            
                            this.observer.unobserve(element);
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.1
                });
            }
        },
        
        observe: function(element) {
            if (this.observer) {
                this.observer.observe(element);
            }
        }
    }
};

// Initialize performance optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PerformanceOptimizer.init();
        PerformanceOptimizer.lazyLoad.init();
    });
} else {
    PerformanceOptimizer.init();
    PerformanceOptimizer.lazyLoad.init();
}