import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { PermissionProvider } from "@/providers/PermissionProvider";
import { PwaProvider } from "@/providers/PwaProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#14B8A6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://connectify.aakarsh.xyz"),
  title: {
    default: "Connectify | Find People For Anything",
    template: "%s | Connectify",
  },
  description:
    "Find nearby people for study sessions, trips, sports, events, carpooling, and more.",
  keywords: [
    "connectify",
    "activities",
    "meetups",
    "sports",
    "study group",
    "carpool",
    "collaborate",
    "social network",
    "nearby collaborations",
  ],
  authors: [{ name: "Aakarsh Kumar" }, { name: "Aarohi Sahu" }],
  creator: "Aakarsh Kumar & Aarohi Sahu",
  publisher: "Connectify",
  category: "social",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  applicationName: "Connectify",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Connectify",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Connectify",
    title: "Connectify | Find People For Anything",
    description:
      "Discover nearby activities and connect with people around you.",
    url: "https://connectify.aakarsh.xyz",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Connectify - Connect with people nearby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Connectify | Find People For Anything",
    description:
      "Discover nearby activities and connect with people around you.",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Connectify",
  "url": "https://connectify.aakarsh.xyz",
  "logo": "https://connectify.aakarsh.xyz/logo192x192.png",
  "description":
    "Connectify helps you find nearby people for study sessions, trips, sports, events, carpooling, and more.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Connectify",
  "url": "https://connectify.aakarsh.xyz",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://connectify.aakarsh.xyz/dashboard?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased font-sans overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgSchema, websiteSchema]),
          }}
        />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "temp-client-id"}>
          <QueryProvider>
            <AuthProvider>
              <SocketProvider>
                <PermissionProvider>
                  <PwaProvider>
                    {children}
                    <Toaster position="top-right" reverseOrder={false} />
                  </PwaProvider>
                </PermissionProvider>
              </SocketProvider>
            </AuthProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
