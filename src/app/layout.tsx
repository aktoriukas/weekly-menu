import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://menuforaweek.app"
  ),
  title: {
    default: "Menu for a Week",
    template: "%s | Menu for a Week",
  },
  description:
    "Plan your weekly meals, organize recipes, and automatically generate shopping lists. Simplify your meal planning with AI-powered suggestions and family sharing.",
  keywords: [
    "meal planning",
    "weekly menu",
    "recipe management",
    "shopping list",
    "family meals",
    "meal prep",
    "AI meal suggestions",
  ],
  authors: [{ name: "Menu for a Week" }],
  creator: "Menu for a Week",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://menuforaweek.app",
    title: "Menu for a Week - Simplify Your Meal Planning",
    description:
      "Plan your weekly meals, organize recipes, and automatically generate shopping lists. Simplify your meal planning with AI-powered suggestions and family sharing.",
    siteName: "Menu for a Week",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Menu for a Week - Meal Planning Made Easy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu for a Week - Simplify Your Meal Planning",
    description:
      "Plan your weekly meals, organize recipes, and automatically generate shopping lists.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Menu for a Week",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
