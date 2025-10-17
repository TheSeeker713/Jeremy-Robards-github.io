document.addEventListener('DOMContentLoaded', () => {
  const articlesGrid = document.getElementById('articles-grid');

  // Function to parse YAML frontmatter from a markdown file
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

  // Function to fetch and render articles
  async function loadArticles() {
    try {
      const manifestResponse = await fetch('./articles/manifest.json');
      if (!manifestResponse.ok) throw new Error('manifest.json not found.');

      const articleFiles = await manifestResponse.json();

      if (articleFiles.length === 0) {
          articlesGrid.innerHTML = '<p class="text-center text-gray-400">No articles have been published yet.</p>';
          return;
      }

      // Create an array of promises for fetching all articles
      const articlePromises = articleFiles.map(file => fetch(`./articles/${file}`).then(res => res.text()));
      const articleContents = await Promise.all(articlePromises);

      // Process and display each article
      const articlesHtml = articleContents
        .map(content => {
          const { frontmatter, body } = parseFrontmatter(content);
          
          // Skip drafts in production
          if (frontmatter.draft === 'true' || frontmatter.draft === true) {
            return null;
          }
          
          const htmlBody = marked.parse(body); // Convert markdown body to HTML
          const excerpt = frontmatter.excerpt || htmlBody.substring(0, 200) + '...';
          
          // Calculate read time (average 200 words per minute)
          const wordCount = body.trim().split(/\s+/).length;
          const readTime = Math.ceil(wordCount / 200);
          
          // Display tags if available (clean display, no hashtags)
          const tagList = frontmatter.tags 
            ? (typeof frontmatter.tags === 'string' 
                ? frontmatter.tags.split(',').map(t => t.trim().replace(/^#+/, '')) 
                : Array.isArray(frontmatter.tags) 
                ? frontmatter.tags.map(t => String(t).trim().replace(/^#+/, ''))
                : [])
            : [];
          
          const tagsHtml = tagList.length > 0 && tagList[0]
            ? `<div class="flex flex-wrap gap-2 mt-3">
                ${tagList.map(tag => 
                  `<span class="px-2 py-1 bg-emerald-600 bg-opacity-20 border border-emerald-600 text-emerald-400 text-xs rounded-full">${tag}</span>`
                ).join('')}
               </div>`
            : '';

          // Create article slug from filename for URL
          const articleSlug = articleFiles[articleContents.indexOf(content)].replace('.md', '');
          
          return `
            <article class="article-card bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-emerald-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl" data-action="view-article" data-slug="${articleSlug}">
              ${frontmatter.thumbnail ? `<img src="${frontmatter.thumbnail}" alt="${frontmatter.title}" class="w-full h-56 object-cover" />` : ''}
              <div class="p-6">
                ${frontmatter.category ? `<div class="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">${frontmatter.category}</div>` : ''}
                <h2 class="text-2xl font-bold text-white mb-2 leading-tight">${frontmatter.title || 'Untitled Article'}</h2>
                ${frontmatter.subtitle ? `<p class="text-gray-400 text-sm mb-3">${frontmatter.subtitle}</p>` : ''}
                <div class="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  ${frontmatter.date ? `<time>${new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>` : ''}
                  ${frontmatter.date && readTime ? '<span>•</span>' : ''}
                  ${readTime ? `<span>${readTime} min read</span>` : ''}
                </div>
                <div class="text-gray-300 text-sm mb-4 line-clamp-3">${excerpt}</div>
                ${tagsHtml}
                <div class="mt-4 text-emerald-400 text-sm font-semibold flex items-center gap-1">
                  Read Article 
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </article>
          `;
        })
        .filter(html => html !== null) // Remove drafts
        .join('');

      articlesGrid.innerHTML = articlesHtml;
      articlesGrid.style.display = 'grid';
      articlesGrid.style.gap = '1.5rem';
      articlesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      
      // Add click handlers for article cards
      document.querySelectorAll('[data-action="view-article"]').forEach(card => {
        card.addEventListener('click', (e) => {
          const slug = e.currentTarget.dataset.slug;
          window.location.href = `./article.html?slug=${slug}`;
        });
      });

    } catch (error) {
      console.error("Failed to load articles:", error);
      articlesGrid.innerHTML = '<p class="text-center text-red-500">Could not load articles. Please try again later.</p>';
    }
  }

  loadArticles();
});
