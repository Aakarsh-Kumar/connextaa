import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/chat",
        "/settings",
        "/create",
        "/onboarding",
        "/api",
      ],
    },
    sitemap: "https://connectify.aakarsh.xyz/sitemap.xml",
    host: "https://connectify.aakarsh.xyz",
  };
}