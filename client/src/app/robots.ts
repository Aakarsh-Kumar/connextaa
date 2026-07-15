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
    sitemap: "https://www.connextaa.in",
    host: "https://www.connextaa.in",
  };
}
