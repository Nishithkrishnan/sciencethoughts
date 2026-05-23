import { getPostById } from "../../../lib/wordpress";
import { ArrowLeft, Calendar, User } from "lucide-react";

// Dynamically generate SEO metadata for the post
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);
  
  if (!post) {
    return {
      title: "Post Not Found | Science Thoughts",
    };
  }

  return {
    title: `${post.title} | Science Thoughts`,
    description: post.excerpt ? post.excerpt.replace(/<[^>]*>/g, "").slice(0, 160) : "Read this article on Science Thoughts.",
    openGraph: {
      title: post.title,
      description: post.excerpt ? post.excerpt.replace(/<[^>]*>/g, "").slice(0, 160) : "",
      images: [{ url: post.featuredImage }],
    },
  };
}

export default async function PostPage({ params }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);

  if (!post) {
    return (
      <div className="container" style={{ padding: "100px 24px", textAlign: "center" }}>
        <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "20px" }}>Post Offline</h1>
        <p style={{ marginBottom: "30px" }}>This article could not be retrieved from the database.</p>
        <a href="/" className="nav-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={16} /> Back to Home
        </a>
      </div>
    );
  }

  // Format the date
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="article-container">
      {/* Back Button */}
      <div style={{ marginBottom: "30px" }}>
        <a href="/#blog" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          <ArrowLeft size={16} /> Back to Think Tank
        </a>
      </div>

      {/* Header */}
      <header className="article-header">
        <div className="article-meta">
          <span className="article-category">{post.category}</span>
          <span style={{ color: "var(--text-muted)" }}>&bull;</span>
          <span className="article-date" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Calendar size={14} /> {formattedDate}
          </span>
        </div>
        <h1 className="article-title">{post.title}</h1>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          <User size={16} style={{ color: "var(--accent-teal)" }} />
          <span>By <strong>{post.author}</strong></span>
        </div>
      </header>

      {/* Featured Hero Banner */}
      {post.featuredImage && (
        <div className="article-hero">
          <img src={post.featuredImage} alt={post.title} />
        </div>
      )}

      {/* Body Content */}
      <div 
        className="article-body" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </article>
  );
}
