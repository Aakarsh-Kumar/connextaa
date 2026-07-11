import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: [
          "/dashboard",
          "/onboarding",
        ],
      },
    ],
    sitemap: "https://connectify.aakarsh.xyz/sitemap.xml",
    host: "https://connectify.aakarsh.xyz",
  };
}