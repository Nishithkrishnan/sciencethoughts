import { getPosts } from "../lib/wordpress";
import SearchInput from "../components/SearchInput";
import ContactForm from "../components/ContactForm";
import { Brain, Briefcase, Sparkles, ArrowRight, Activity, Cpu, Mail } from "lucide-react";

export default async function Home() {
  // Fetch recent posts from WordPress API
  const posts = await getPosts(6);

  // Fallback posts in case the WordPress site has networking/fetch issues
  const fallbackPosts = [
    {
      id: 4717,
      title: "Multi-Agent Breakthrough: How Scalable AI Systems Are Transforming Automation in 2025",
      excerpt: "As AI systems evolve, the limitations of single-agent models are becoming apparent. Enter multi-agent architectures...",
      category: "Multi-Agent Systems",
      date: "2025-10-15",
      featuredImage: "https://blog.sciencethoughts.com/wp-content/uploads/2025/10/To-build-a-robust-MAS-several-architectural-elements-must-be-considered_-visual-selection-scaled.jpeg"
    },
    {
      id: 4712,
      title: "How Tier-2 Cities Are Powering India's AI Agent Revolution—Beyond the Metro Hype",
      excerpt: "From Coimbatore to Bhopal, a new wave of AI agent innovation is reshaping India's tech landscape...",
      category: "Industry Insights",
      date: "2025-10-12",
      featuredImage: "https://blog.sciencethoughts.com/wp-content/uploads/2025/10/AI-agents-core-scaled.jpeg"
    },
    {
      id: 4701,
      title: "Beyond Accuracy: Evaluation Metrics That Redefine Autonomous Decision Agents",
      excerpt: "In the age of autonomous decision agents, we have entered a world where AI doesn't just predict — it acts...",
      category: "Agent Evaluation",
      date: "2025-10-08",
      featuredImage: "https://blog.sciencethoughts.com/wp-content/uploads/2025/10/1.-The-Limitations-of-Accuracy-in-Decision-Systems-visual-selection.jpeg"
    }
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;

  const agents = [
    {
      id: "researcher",
      name: "The Neuro-Researcher",
      desc: "Deep-dives into scientific papers and synthesizes concepts from first principles.",
      icon: <Brain size={24} />,
      color: "var(--accent-teal)",
      badge: "Vercel AI SDK",
      stack: ["GPT-4o", "Gemini Pro", "Next.js"],
      borderColor: "rgba(0, 242, 255, 0.2)"
    },
    {
      id: "strategist",
      name: "AI Business Architect",
      desc: "Designs and outputs custom multi-agent collaboration workflows for business automation.",
      icon: <Briefcase size={24} />,
      color: "var(--accent-violet)",
      badge: "LangChain",
      stack: ["GPT-4o", "Llama-3", "LangGraph"],
      borderColor: "rgba(188, 19, 254, 0.2)"
    },
    {
      id: "simplifier",
      name: "The Concept Simplifier",
      desc: "Translates high-level quantum physics, AI algorithms, and scientific theories into intuitive analogies.",
      icon: <Sparkles size={24} />,
      color: "var(--accent-yellow)",
      badge: "Vercel AI SDK",
      stack: ["Claude 3.5 Sonnet", "Tailwind", "React"],
      borderColor: "rgba(255, 183, 0, 0.2)"
    }
  ];

  return (
    <div style={{ background: "var(--bg-dark)" }}>
      
      {/* 1. Hero Section */}
      <section style={{ padding: "140px 0 100px 0", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "8px 18px", borderRadius: "30px", marginBottom: "25px", animation: "slideUp 0.6s ease-out" }}>
            <Activity size={14} className="animate-pulse-glow" style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", letterSpacing: "0.05em" }}>PORTFOLIO & COGNITIVE LOGS</span>
          </div>

          <h1 style={{ fontSize: "4.2rem", fontWeight: "900", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: "1.1", marginBottom: "25px", animation: "slideUp 0.8s ease-out" }}>
            Architecting the <span className="gradient-text">Intelligence</span> of Tomorrow
          </h1>

          <p style={{ fontSize: "1.3rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 45px auto", lineHeight: "1.6", fontWeight: "400", animation: "slideUp 1s ease-out" }}>
            A hybrid space where science meets AI. I build autonomous agents that bridge the gap between human thought and machine execution.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", alignItems: "center", flexWrap: "wrap", animation: "slideUp 1.2s ease-out" }}>
            <a href="/lab" className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.05rem" }}>
              Explore the Lab <ArrowRight size={18} />
            </a>
            <SearchInput />
          </div>

        </div>

        {/* Decorative Grid Mesh */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)", pointerEvents: "none" }}></div>
      </section>

      {/* 2. Agent Showcase (The Lab) */}
      <section id="lab" className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-teal)", background: "rgba(0,242,255,0.05)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(0,242,255,0.1)" }}>
                <Cpu size={24} />
              </span>
            </div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" }}>The Experimental Lab</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Interactive AI agents designed for complex cognitive tasks.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className="glass" 
                style={{ 
                  padding: "35px", 
                  borderRadius: "24px", 
                  display: "flex", 
                  flexDirection: "column", 
                  height: "100%",
                  borderLeft: `4px solid ${agent.color}`,
                  background: "rgba(10, 10, 12, 0.4)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: `${agent.color}15`, color: agent.color }}>
                    {agent.icon}
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: "8px" }}>{agent.badge}</span>
                </div>

                <h3 style={{ fontSize: "1.45rem", fontWeight: "700", marginBottom: "12px", fontFamily: "var(--font-display)" }}>{agent.name}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "25px", flexGrow: 1 }}>{agent.desc}</p>
                
                <div style={{ display: "flex", gap: "8px", marginBottom: "30px", flexWrap: "wrap" }}>
                  {agent.stack.map((tech, idx) => (
                    <span key={idx} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: "6px" }}>{tech}</span>
                  ))}
                </div>

                <a href={`/lab`} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", fontSize: "0.95rem", fontWeight: "600", color: "#fff", transition: "var(--transition-fast)" }} className="launch-link">
                  Launch Agent <ArrowRight size={14} style={{ transition: "transform 0.2s" }} />
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. The Think Tank (Blog Feed) */}
      <section id="blog" className="section-padding" style={{ borderTop: "1px solid var(--border-color)", background: "rgba(5, 5, 8, 0.4)" }}>
        <div className="container">
          
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-violet)", background: "rgba(188,19,254,0.05)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(188,19,254,0.1)" }}>
                <Brain size={24} />
              </span>
            </div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" }}>The Think Tank</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Deep-dives into mind, matter, and the future of technology.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "35px" }}>
            {displayPosts.map((post) => (
              <a href={`/posts/${post.id}`} key={post.id} className="glass" style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "20px", background: "rgba(10, 10, 12, 0.4)", border: "1px solid var(--border-color)" }}>
                <div style={{ width: "100%", height: "220px", overflow: "hidden", position: "relative", borderBottom: "1px solid var(--border-color)" }}>
                  <img src={post.featuredImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                </div>
                <div style={{ padding: "25px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--accent-teal)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{post.category}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", lineHeight: "1.4", marginBottom: "12px", color: "#fff", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</h3>
                  <p 
                    style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }} 
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem", fontWeight: "600", color: "var(--accent-teal)", alignSelf: "flex-end" }}>
                    Read Article <ArrowRight size={14} />
                  </div>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Contact / Work With Me Section */}
      <section id="contact" className="section-padding" style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-teal)", background: "rgba(0,242,255,0.05)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(0,242,255,0.1)" }}>
                <Mail size={24} />
              </span>
            </div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "800", fontFamily: "var(--font-display)", marginBottom: "15px" }}>Work With Me</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Have an agentic AI workflow or technical writing requirement? Let's connect.</p>
          </div>

          <div className="glass-panel" style={{ padding: "40px", background: "rgba(15, 15, 20, 0.6)" }}>
            <ContactForm />
          </div>

        </div>
      </section>

    </div>
  );
}
