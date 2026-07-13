import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://connectify.aakarsh.xyz";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Placeholder structure for future dynamic pages (e.g., profiles, collaborations)
  // Example pattern:
  // const collaborations = await fetch("https://api.connectify.aakarsh.xyz/public/collaborations").then(res => res.json());
  // const dynamicCollabRoutes = collaborations.map(collab => ({
  //   url: `${baseUrl}/collaboration/${collab.id}`,
  //   lastModified: new Date(collab.updatedAt),
  //   changeFrequency: "daily",
  //   priority: 0.6,
  // }));
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  return [...staticRoutes, ...dynamicRoutes];
}