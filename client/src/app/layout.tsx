import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Connectify",
  description: "Find People For Anything and collaborate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased font-sans overflow-x-hidden">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "temp-client-id"}>
          <QueryProvider>
            <AuthProvider>
              <SocketProvider>
                {children}
                <Toaster position="top-right" reverseOrder={false} />
              </SocketProvider>
            </AuthProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
