const WP_BASE_URL = "https://blog.sciencethoughts.com/wp-json/wp/v2";

/**
 * Helper to map raw WordPress post object to a clean structured object
 */
function mapWPPost(post) {
  if (!post) return null;

  // Extract featured image
  let featuredImage = null;
  const embeddedMedia = post._embedded?.["wp:featuredmedia"];
  if (embeddedMedia && embeddedMedia.length > 0) {
    // Prefer large or full size, fallback to source_url
    featuredImage = 
      embeddedMedia[0].media_details?.sizes?.large?.source_url || 
      embeddedMedia[0].media_details?.sizes?.full?.source_url || 
      embeddedMedia[0].source_url;
  }

  // Extract author
  let author = "Science Thoughts";
  const embeddedAuthor = post._embedded?.["author"];
  if (embeddedAuthor && embeddedAuthor.length > 0) {
    author = embeddedAuthor[0].name || author;
  }

  // Extract category
  let category = "Science & AI";
  const embeddedTerms = post._embedded?.["wp:term"];
  if (embeddedTerms && embeddedTerms.length > 0) {
    // Term at index 0 is usually categories
    const categories = embeddedTerms[0];
    if (categories && categories.length > 0) {
      category = categories[0].name;
    }
  }

  return {
    id: post.id,
    title: post.title?.rendered || "Untitled",
    excerpt: post.excerpt?.rendered || "",
    content: post.content?.rendered || "",
    date: post.date,
    slug: post.slug,
    author,
    category,
    featuredImage: featuredImage || "/placeholder-blog.jpg",
  };
}

/**
 * Fetch a list of posts
 */
export async function getPosts(limit = 9) {
  try {
    const url = `${WP_BASE_URL}/posts?_embed&per_page=${limit}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch posts, status: ${res.status}`);
    }

    const data = await res.json();
    return data.map(mapWPPost);
  } catch (error) {
    console.error("Error in getPosts:", error);
    return [];
  }
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(id) {
  try {
    const url = `${WP_BASE_URL}/posts/${id}?_embed`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch post with id ${id}, status: ${res.status}`);
    }

    const data = await res.json();
    return mapWPPost(data);
  } catch (error) {
    console.error(`Error in getPostById(${id}):`, error);
    return null;
  }
}

/**
 * Search posts
 */
export async function searchPosts(query) {
  if (!query) return [];
  try {
    const url = `${WP_BASE_URL}/posts?_embed&search=${encodeURIComponent(query)}&per_page=10`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Search failed, status: ${res.status}`);
    }

    const data = await res.json();
    return data.map(mapWPPost);
  } catch (error) {
    console.error(`Error searching posts for "${query}":`, error);
    return [];
  }
}
