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
});

export const viewport: Viewport = {
  themeColor: "#14B8A6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Connectify",
    template: "%s | Connectify",
  },
  description:
    "Find nearby people for study sessions, trips, sports, events, carpooling, and more.",
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
  openGraph: {
    type: "website",
    siteName: "Connectify",
    title: "Connectify — Find People For Anything",
    description:
      "Discover nearby activities and connect with people around you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connectify — Find People For Anything",
    description:
      "Discover nearby activities and connect with people around you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Connectify" />
        <link rel="apple-touch-icon" href="/logo192x192.png" />
      </head>
      <body className="antialiased font-sans overflow-x-hidden">
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
