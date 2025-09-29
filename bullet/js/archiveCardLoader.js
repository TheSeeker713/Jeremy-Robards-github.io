// Loads the archive card partial and injects it into the app container
(function(){
    function insertArchiveCard() {
        const appContainer = document.getElementById('appContainer');
        if (!appContainer) return;

        // Fetch partial (local file) and insert after header
        fetch('partials/archive-card.html')
            .then(res => res.text())
            .then(html => {
                // Create a wrapper and insert before the main content area
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html;

                // Place it after the header (if header exists)
                const header = appContainer.querySelector('header');
                if (header && header.parentNode) {
                    header.parentNode.insertBefore(wrapper, header.nextSibling);
                } else {
                    appContainer.insertBefore(wrapper, appContainer.firstChild);
                }

                // If there was a fixed footer, hide it
                const oldFooter = document.getElementById('appFooter');
                if (oldFooter) oldFooter.style.display = 'none';
            })
            .catch(err => {
                console.warn('Failed to load archive card partial', err);
            });
    }

    // Insert when DOMContent loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertArchiveCard);
    } else {
        insertArchiveCard();
    }
})();
