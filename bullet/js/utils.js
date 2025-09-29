// Utility functions and global error handling
class AppUtils {
    static debug = true; // Set to false in production

    static log(message, type = 'info') {
        if (!this.debug) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        
        console.log(logEntry);
        this.addToDebugPanel(logEntry, type);
    }

    static error(message, error = null) {
        console.error(message, error);
        this.log(message, 'error');
        this.showError(message);
    }

    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        
        // Format time as 10:21pm
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        const timeStr = `${hours}:${minutes}${ampm}`;
        
        // Format date as 9-26-2025
        const month = date.getMonth() + 1; // getMonth() is 0-indexed
        const day = date.getDate();
        const year = date.getFullYear();
        const dateStr = `${month}-${day}-${year}`;
        
        return `${timeStr} ${dateStr}`;
    }

    static addToDebugPanel(message, type) {
        const debugLog = document.getElementById('debugLog');
        if (!debugLog) return;

        const logItem = document.createElement('div');
        logItem.className = `text-${type === 'error' ? 'red' : type === 'warn' ? 'yellow' : 'green'}-400`;
        logItem.textContent = message;
        
        debugLog.appendChild(logItem);
        debugLog.scrollTop = debugLog.scrollHeight;

        // Keep only last 50 log entries
        while (debugLog.children.length > 50) {
            debugLog.removeChild(debugLog.firstChild);
        }
    }

    static showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorDisplay && errorMessage) {
            errorMessage.textContent = message;
            errorDisplay.classList.remove('hidden');
            errorDisplay.classList.add('error-shake');
            
            setTimeout(() => {
                errorDisplay.classList.remove('error-shake');
            }, 500);
        }
    }

    static updateLoadingProgress(message) {
        const progressElement = document.getElementById('loadingProgress');
        if (progressElement) {
            progressElement.textContent = message;
        }
        this.log(`Loading: ${message}`);
    }

    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const month = (date.getMonth() + 1);
        const day = date.getDate();
        const year = date.getFullYear();
        return `${displayHours}:${minutes}${ampm} ${month}-${day}-${year}`;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static async loadScript(src, name) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.log(`Loaded module: ${name}`);
                resolve();
            };
            script.onerror = () => {
                this.error(`Failed to load module: ${name}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    static showLoadingPlaceholder(element) {
        element.classList.add('lazy-loading');
        element.innerHTML = '<div class="h-8 w-full rounded bg-gray-600"></div>';
    }

    static hideLoadingPlaceholder(element) {
        element.classList.remove('lazy-loading');
    }

    static async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                this.log('Text copied to clipboard');
            } catch (err) {
                this.error('Failed to copy text to clipboard', err);
            }
            document.body.removeChild(textArea);
        }
    }

    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        this.log(`Downloaded file: ${filename}`);
    }

    // Lightweight toast notification
    static showToast(message, { type = 'info', duration = 3000, action } = {}) {
        try {
            const containerId = 'toastContainer';
            let container = document.getElementById(containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                // Default position: bottom-right
                container.style.position = 'fixed';
                container.style.right = '16px';
                container.style.bottom = '16px';
                container.style.zIndex = '99999';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = '8px';
                container.style.maxWidth = '320px';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `app-toast app-toast-${type}`;
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.style.display = 'flex';
            toast.style.alignItems = 'center';
            toast.style.justifyContent = 'space-between';
            toast.style.padding = '10px 12px';
            toast.style.borderRadius = '10px';
            toast.style.boxShadow = '0 8px 24px rgba(2,6,23,0.6)';
            toast.style.color = '#fff';
            toast.style.fontSize = '13px';
            toast.style.opacity = '1';
            toast.style.transition = 'opacity 180ms ease, transform 220ms ease';

            // Background by type
            switch (type) {
                case 'success':
                    toast.style.background = '#16a34a';
                    break;
                case 'error':
                    toast.style.background = '#dc2626';
                    break;
                case 'warning':
                    toast.style.background = '#d97706';
                    break;
                default:
                    toast.style.background = '#0ea5e9';
            }

            const text = document.createElement('div');
            text.style.flex = '1';
            text.style.marginRight = '8px';
            text.textContent = message;
            toast.appendChild(text);

            if (action && typeof action === 'object') {
                const btn = document.createElement('button');
                btn.textContent = action.label || 'Action';
                btn.style.background = 'rgba(255,255,255,0.12)';
                btn.style.color = '#fff';
                btn.style.border = 'none';
                btn.style.padding = '6px 8px';
                btn.style.borderRadius = '6px';
                btn.style.cursor = 'pointer';
                btn.onclick = () => {
                    try { action.onClick && action.onClick(); } catch (e) { AppUtils.error('Toast action failed', e); }
                    remove();
                };
                toast.appendChild(btn);
            }

            const remove = () => {
                try {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(6px)';
                    setTimeout(() => {
                        if (toast.parentElement) container.removeChild(toast);
                    }, 220);
                } catch (e) {
                    if (toast.parentElement) container.removeChild(toast);
                }
            };

            let timer = setTimeout(remove, duration);
            toast.addEventListener('mouseenter', () => clearTimeout(timer));
            toast.addEventListener('mouseleave', () => timer = setTimeout(remove, duration));

            container.appendChild(toast);
            // Return control for callers if needed
            return { toast, remove };
        } catch (err) {
            this.error('Failed to show toast', err);
            return null;
        }
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    AppUtils.error(`Global error: ${event.message}`, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    AppUtils.error(`Unhandled promise rejection: ${event.reason}`);
});

// Export for use in other modules
window.AppUtils = AppUtils;