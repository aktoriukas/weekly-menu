import type { Metadata } from "next";
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
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
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
