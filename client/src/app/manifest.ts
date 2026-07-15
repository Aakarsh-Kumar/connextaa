import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Connextaa",
    short_name: "Connextaa",
    description:
      "Discover nearby activities, collaborate with people around you, and build meaningful real-world connections.",

    start_url: "/",
    scope: "/",

    display: "standalone",
    orientation: "portrait",

    background_color: "#FAFAF9",
    theme_color: "#14B8A6",

    categories: ["social", "travel", "productivity", "lifestyle"],

    lang: "en",
    dir: "ltr",

    icons: [
      {
        src: "/logo192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
