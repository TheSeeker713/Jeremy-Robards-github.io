/**
 * Writing Feed Loader
 * Fetches and renders articles from the CMS feed.json
 * Feed schema: [{title, slug, url, hero, excerpt, published_at}]
 */

document.addEventListener('DOMContentLoaded', () => {
  const articlesGrid = document.getElementById('articles-grid');

  // Feed URL - can be local or from jr-articles project
  const FEED_URL = './article/feed.json'; // Will be proxied by worker to jr-articles.pages.dev

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date (e.g., "Jan 15, 2025")
   */
  function formatDate(dateString) {
    if (!dateString) {return '';}
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Create HTML for a single article card
   * @param {Object} article - Feed entry {title, slug, url, hero, excerpt, published_at}
   * @returns {string} HTML string for article card
   */
  function createArticleCard(article) {
    const { title, slug, url, hero, excerpt, published_at } = article;

    return `
      <article 
        class="article-card bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-emerald-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl" 
        data-action="view-article" 
        data-url="${url}"
      >
        ${
          hero
            ? `
          <div class="relative w-full h-56 overflow-hidden bg-gray-900">
            <img 
              src="${hero}" 
              alt="${title}" 
              class="w-full h-full object-cover"
              loading="lazy"
              onerror="this.parentElement.style.display='none'"
            />
          </div>
        `
            : `
          <div class="w-full h-56 bg-gradient-to-br from-emerald-900 to-gray-900 flex items-center justify-center">
            <svg class="w-16 h-16 text-emerald-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
        `
        }
        
        <div class="p-6">
          <h2 class="text-2xl font-bold text-white mb-2 leading-tight hover:text-emerald-400 transition-colors">
            ${title || 'Untitled Article'}
          </h2>
          
          ${
            published_at
              ? `
            <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <time datetime="${published_at}">${formatDate(published_at)}</time>
            </div>
          `
              : ''
          }
          
          ${
            excerpt
              ? `
            <p class="text-gray-300 text-sm mb-4 line-clamp-3">
              ${excerpt}
            </p>
          `
              : ''
          }
          
          <div class="mt-4 text-emerald-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Read Article 
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Render loading state
   */
  function showLoading() {
    articlesGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400 mb-4"></div>
        <p class="text-gray-400">Loading articles...</p>
      </div>
    `;
  }

  /**
   * Render empty state
   */
  function showEmpty() {
    articlesGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12">
        <svg class="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <p class="text-center text-gray-400">No articles have been published yet.</p>
        <p class="text-center text-gray-600 text-sm mt-2">Check back soon for new content!</p>
      </div>
    `;
  }

  /**
   * Render error state
   * @param {Error} error - Error object
   */
  function showError(error) {
    console.error('Failed to load articles:', error);
    articlesGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12">
        <svg class="w-16 h-16 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-center text-red-500 mb-2">Could not load articles</p>
        <p class="text-center text-gray-600 text-sm">${error.message}</p>
        <button 
          onclick="location.reload()" 
          class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    `;
  }

  /**
   * Fetch and render articles from feed.json
   */
  async function loadArticles() {
    showLoading();

    try {
      const response = await fetch(FEED_URL);

      if (!response.ok) {
        throw new Error(`Feed not found (${response.status})`);
      }

      const feed = await response.json();

      // Validate feed structure
      if (!Array.isArray(feed)) {
        throw new Error('Invalid feed format (expected array)');
      }

      if (feed.length === 0) {
        showEmpty();
        return;
      }

      // Render articles
      const articlesHtml = feed.map((article) => createArticleCard(article)).join('');

      articlesGrid.innerHTML = articlesHtml;

      // Apply grid layout
      articlesGrid.style.display = 'grid';
      articlesGrid.style.gap = '1.5rem';
      articlesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';

      // Add click handlers for article cards
      document.querySelectorAll('[data-action="view-article"]').forEach((card) => {
        card.addEventListener('click', (e) => {
          const url = e.currentTarget.dataset.url;
          if (url) {
            window.location.href = url;
          }
        });
      });
    } catch (error) {
      showError(error);
    }
  }

  // Initialize
  loadArticles();
});
