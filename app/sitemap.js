export default function sitemap() {
  const baseUrl = "https://sciencethoughts.com";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...["contact", "refund-policy", "privacy-policy", "terms-of-service", "data-notice"].map((path) => ({
      url: `${baseUrl}/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    })),
  ];
}
