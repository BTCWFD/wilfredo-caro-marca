// --- Medium Blog Dynamic Fetch ---
const getTranslation = (key, fallback) => {
  const lang = document.documentElement.lang || 'en';
  if (window.translations && window.translations[lang] && window.translations[lang][key]) {
    return window.translations[lang][key];
  }
  return fallback;
};

const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const fetchMediumBlog = async () => {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  const mediumUsername = '@wilfredocaro';
  const rssUrl = `https://medium.com/feed/${mediumUsername}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status === 'ok' && data.items.length > 0) {
      blogGrid.innerHTML = ''; // Clear loading text
      
      // Get latest 3 posts
      const posts = data.items.slice(0, 3);
      
      posts.forEach(post => {
        // Extract first image from description if thumbnail is empty
        let imgUrl = post.thumbnail;
        if (!imgUrl) {
          const imgMatch = post.description.match(/<img[^>]+src="([^">]+)"/);
          imgUrl = imgMatch ? imgMatch[1] : '/og-image.png'; // Fallback
        }

        const pubDate = new Date(post.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        const safeLink = escapeHTML(post.link);
        const safeImgUrl = escapeHTML(imgUrl).replace(/'/g, "\\'");
        const safeTitle = escapeHTML(post.title);
        const safeCategories = post.categories.slice(0, 3).map(cat => `<span>#${escapeHTML(cat)}</span>`).join('');

        const cardHTML = `
          <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="project-card glass-panel" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
            <div class="project-preview" style="background-image: url('${safeImgUrl}'); background-size: cover; background-position: center; min-height: 200px;">
              <div class="preview-overlay">${getTranslation('blog_read_article', 'READ ARTICLE')}</div>
            </div>
            <div class="project-info" style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
              <div style="font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 0.5rem;">${pubDate}</div>
              <h3 style="margin-top: 0; font-size: 1.2rem; line-height: 1.4;">${safeTitle}</h3>
              <div class="project-tags" style="margin-top: auto; padding-top: 1rem;">
                ${safeCategories}
              </div>
            </div>
          </a>
        `;
        blogGrid.insertAdjacentHTML('beforeend', cardHTML);
      });
    } else {
      blogGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">${getTranslation('thought_leadership_no_posts', 'No articles published yet. Check back later!')}</p>`;
    }
  } catch (err) {
    console.error('Failed to fetch Medium RSS:', err);
    blogGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">${getTranslation('thought_leadership_failed', 'Failed to load articles.')}</p>`;
  }
};
fetchMediumBlog();
