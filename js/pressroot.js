// /js/press.js
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('posts-container');

  try {
    const res = await fetch('/blog/posts.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-500">No press articles available yet.</p>';
      return;
    }

    container.innerHTML = posts.map(post => {
      // Clean title for display
      const cleanedTitle = post.title.replace(/==/g, ''); 

      // Build the pretty URL using the post ID
      // e.g., /ai-driven-clarity/
      const postUrl = `/${post.id}/`;

      return `
        <article class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100">
          <a href="${postUrl}" class="block">
            <div class="aspect-[16/9] w-full bg-gray-100">
              <img src="${post.image}" alt="${post.title}" loading="lazy" class="object-cover w-full h-full">
            </div>
            <div class="p-6 space-y-3">
              <p class="text-sm font-semibold text-klyr-red uppercase">
                ${new Date(post.date).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'})}
              </p>
              <h2 class="text-xl font-bold text-klyr-dark hover:text-klyr-red transition duration-150 leading-snug">
                ${cleanedTitle}
              </h2>
              <p class="text-gray-600 text-base line-clamp-3">${post.excerpt}</p>
              <span class="inline-flex items-center text-klyr-red font-semibold text-sm pt-2 hover:underline">
                Read More <i class="fas fa-arrow-right ml-2 text-xs"></i>
              </span>
            </div>
          </a>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading posts:', err);
    container.innerHTML = '<p class="text-center text-gray-500">Failed to load press articles.</p>';
  }
});
