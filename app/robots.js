export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/"],
    },
    sitemap: "https://sciencethoughts.com/sitemap.xml",
  };
}
