document.addEventListener('DOMContentLoaded', () => {
  // Get article slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    showError();
    return;
  }

  // Parse YAML frontmatter
  function parseFrontmatter(text) {
    const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = frontmatterRegex.exec(text);
    if (!match) {
      return { frontmatter: {}, body: text };
    }
    const frontmatterBlock = match[1];
    const body = text.substring(match[0].length);
    const frontmatter = {};

    const lines = frontmatterBlock.split('\n');
    let currentKey = null;
    let arrayValues = [];

    lines.forEach((line, index) => {
      // Check if line starts a YAML list item
      if (line.trim().startsWith('- ')) {
        if (currentKey) {
          arrayValues.push(line.trim().substring(2).trim());
        }
      } else {
        // Save previous array if exists
        if (currentKey && arrayValues.length > 0) {
          frontmatter[currentKey] = arrayValues.join(', ');
          arrayValues = [];
        }

        // Parse key-value pair
        const [key, ...valueParts] = line.split(':');
        if (key && key.trim()) {
          currentKey = key.trim();
          const value = valueParts.join(':').trim();

          if (value) {
            // Has inline value
            frontmatter[currentKey] = value.replace(/^["']|["']$/g, '');
            currentKey = null;
          }
          // else: key exists but no value, might be followed by array
        }
      }
    });

    // Save last array if exists
    if (currentKey && arrayValues.length > 0) {
      frontmatter[currentKey] = arrayValues.join(', ');
    }

    return { frontmatter, body };
  }

  // Load and display article
  async function loadArticle() {
    try {
      const response = await fetch(`./articles/${slug}.md`);
      if (!response.ok) {throw new Error('Article not found');}

      const markdown = await response.text();
      const { frontmatter, body } = parseFrontmatter(markdown);

      // Update document title
      document.title = `${frontmatter.title || 'Article'} | Jeremy Robards`;

      // Calculate read time (average 200 words per minute)
      const wordCount = body.trim().split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);

      // Display article header with magazine-style layout
      const headerHtml = `
        <div class="article-header-magazine">
          ${frontmatter.category ? `<div class="article-category">${frontmatter.category}</div>` : ''}
          <h1 class="article-title-magazine">${frontmatter.title || 'Untitled Article'}</h1>
          ${frontmatter.subtitle ? `<p class="article-subtitle">${frontmatter.subtitle}</p>` : ''}
          ${frontmatter.excerpt ? `<p class="text-xl text-gray-400 leading-relaxed mb-6">${frontmatter.excerpt}</p>` : ''}
          
          <div class="article-meta">
            ${frontmatter.author ? `<span class="article-author">By ${frontmatter.author}</span>` : ''}
            ${frontmatter.date ? `<time class="article-date" datetime="${frontmatter.date}">${new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>` : ''}
            <span class="article-read-time">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              ${readTime} min read
            </span>
          </div>
        </div>
        
        ${
          frontmatter.thumbnail
            ? `
          <div class="article-hero-image">
            <img src="${frontmatter.thumbnail}" alt="${frontmatter.title}" />
          </div>
          ${frontmatter.thumbnail_caption ? `<p class="article-hero-caption">${frontmatter.thumbnail_caption}</p>` : ''}
        `
            : ''
        }
      `;
      document.getElementById('article-header').innerHTML = headerHtml;

      // Display article body with magazine styling
      const htmlBody = marked.parse(body);

      // Add tags at the end if they exist (clean display, no hashtags)
      let tagsHtml = '';
      if (frontmatter.tags) {
        const tagList =
          typeof frontmatter.tags === 'string'
            ? frontmatter.tags.split(',').map((t) => t.trim().replace(/^#+/, ''))
            : Array.isArray(frontmatter.tags)
              ? frontmatter.tags.map((t) => String(t).trim().replace(/^#+/, ''))
              : [];

        if (tagList.length > 0 && tagList[0]) {
          tagsHtml = `
            <div class="article-tags">
              ${tagList.map((tag) => `<span class="article-tag">${tag}</span>`).join('')}
            </div>
          `;
        }
      }

      document.getElementById('article-body').innerHTML = htmlBody + tagsHtml;
      document.getElementById('article-body').classList.add('article-body-magazine');

      // Hide loading, show content
      document.getElementById('loading').style.display = 'none';
      document.getElementById('article-content').style.display = 'block';

      // Initialize interactions
      initializeLikeDislike(slug);
      initializeShare(frontmatter.title);
      initializeComments(slug);
    } catch (error) {
      console.error('Error loading article:', error);
      showError();
    }
  }

  // Show error state
  function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
  }

  // Like/Dislike functionality with privacy-first user identification
  function initializeLikeDislike(articleSlug) {
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const likeCount = document.getElementById('like-count');
    const dislikeCount = document.getElementById('dislike-count');

    // Generate anonymous user ID (privacy-friendly, no IP collection)
    function getAnonymousUserId() {
      let userId = localStorage.getItem('anonymous_user_id');
      if (!userId) {
        // Create random UUID-like identifier
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('anonymous_user_id', userId);
      }
      return userId;
    }

    const userId = getAnonymousUserId();
    const storageKey = `article_${articleSlug}_reactions`;
    const userVoteKey = `article_${articleSlug}_user_${userId}_vote`;

    // Get global counts and user's specific vote
    const reactions = JSON.parse(localStorage.getItem(storageKey) || '{"likes": 0, "dislikes": 0}');
    let userVote = localStorage.getItem(userVoteKey); // 'like', 'dislike', or null

    // Update button states based on current vote
    function updateButtonStates() {
      likeCount.textContent = reactions.likes;
      dislikeCount.textContent = reactions.dislikes;

      // Reset both buttons
      likeBtn.classList.remove(
        'bg-blue-600',
        'border-blue-400',
        'opacity-50',
        'cursor-not-allowed'
      );
      dislikeBtn.classList.remove(
        'bg-red-600',
        'border-red-400',
        'opacity-50',
        'cursor-not-allowed'
      );
      likeBtn.disabled = false;
      dislikeBtn.disabled = false;

      if (userVote === 'like') {
        // Highlight like, disable dislike
        likeBtn.classList.add('bg-blue-600', 'border-blue-400');
        dislikeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        dislikeBtn.disabled = true;
      } else if (userVote === 'dislike') {
        // Highlight dislike, disable like
        dislikeBtn.classList.add('bg-red-600', 'border-red-400');
        likeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        likeBtn.disabled = true;
      }
    }

    // Initial state
    updateButtonStates();

    // Like button
    likeBtn.addEventListener('click', () => {
      if (userVote === 'like') {
        // User is removing their like
        reactions.likes--;
        userVote = null;
        localStorage.removeItem(userVoteKey);
      } else if (userVote === null) {
        // User is liking for the first time
        reactions.likes++;
        userVote = 'like';
        localStorage.setItem(userVoteKey, 'like');
      }
      // If userVote === 'dislike', button is disabled, so this won't run

      localStorage.setItem(storageKey, JSON.stringify(reactions));
      updateButtonStates();
    });

    // Dislike button
    dislikeBtn.addEventListener('click', () => {
      if (userVote === 'dislike') {
        // User is removing their dislike
        reactions.dislikes--;
        userVote = null;
        localStorage.removeItem(userVoteKey);
      } else if (userVote === null) {
        // User is disliking for the first time
        reactions.dislikes++;
        userVote = 'dislike';
        localStorage.setItem(userVoteKey, 'dislike');
      }
      // If userVote === 'like', button is disabled, so this won't run

      localStorage.setItem(storageKey, JSON.stringify(reactions));
      updateButtonStates();
    });
  }

  // Share functionality
  function initializeShare(articleTitle) {
    const shareBtn = document.getElementById('share-btn');

    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: articleTitle || 'Check out this article',
        text: 'I found this article interesting!',
        url: window.location.href,
      };

      // Try Web Share API first (mobile/modern browsers)
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        // Fallback: Show share options
        showShareMenu(shareData);
      }
    });
  }

  // Fallback share menu
  function showShareMenu(shareData) {
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedTitle = encodeURIComponent(shareData.title);

    const shareOptions = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="share-modal">
        <div class="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 class="text-xl font-bold mb-4">Share Article</h3>
          <div class="space-y-3">
            <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" class="flex items-center gap-3 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              Twitter
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" class="flex items-center gap-3 p-3 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <button onclick="navigator.clipboard.writeText('${shareData.url}'); alert('Link copied to clipboard!')" class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              Copy Link
            </button>
          </div>
          <button onclick="document.getElementById('share-modal').remove()" class="mt-4 w-full px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', shareOptions);
  }

  // Comments functionality
  function initializeComments(articleSlug) {
    const commentsList = document.getElementById('comments-list');
    const commentName = document.getElementById('comment-name');
    const commentText = document.getElementById('comment-text');
    const submitBtn = document.getElementById('submit-comment');

    const storageKey = `article_${articleSlug}_comments`;

    // Load existing comments
    function loadComments() {
      const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');

      if (comments.length === 0) {
        commentsList.innerHTML =
          '<p class="text-gray-400">No comments yet. Be the first to comment!</p>';
        return;
      }

      commentsList.innerHTML = comments
        .map(
          (comment) => `
        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-emerald-400">${comment.name}</span>
            <time class="text-sm text-gray-400">${new Date(comment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
          </div>
          <p class="text-gray-300">${comment.text}</p>
        </div>
      `
        )
        .join('');
    }

    // Submit comment
    submitBtn.addEventListener('click', () => {
      const name = commentName.value.trim();
      const text = commentText.value.trim();

      if (!name || !text) {
        alert('Please fill in both name and comment fields.');
        return;
      }

      const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
      comments.push({
        name,
        text,
        date: new Date().toISOString(),
      });
      localStorage.setItem(storageKey, JSON.stringify(comments));

      // Clear form
      commentName.value = '';
      commentText.value = '';

      // Reload comments
      loadComments();
    });

    // Initial load
    loadComments();
  }

  // Start loading article
  loadArticle();
});
