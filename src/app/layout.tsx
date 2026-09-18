import type { Metadata, Viewport } from "next";
import { Bitter, Inter } from "next/font/google";
import React, { Suspense } from "react";
import { APP_NAME } from "@/constants/brand";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { PwaRegister } from "@/components/shared/pwa/pwa-register";
import { RefineContext } from "./_refine_context";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-bitter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#182356",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Young Foundations Cameroon: camps, Creations, and Cub Corner for young Christians.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: ["/favicon.ico"],
  },
  other: {
    "msapplication-TileColor": "#182356",
    "msapplication-config": "/browserconfig.xml",
    "mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${bitter.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var theme="light";var raw=localStorage.getItem(${JSON.stringify(
              STORAGE_KEYS.UI_PREFERENCES
            )});if(raw){var parsed=JSON.parse(raw);if(parsed.theme==="dark"||parsed.theme==="light"){theme=parsed.theme;}}else{var legacy=localStorage.getItem(${JSON.stringify(
              STORAGE_KEYS.THEME
            )});if(legacy==="dark"||legacy==="light"){theme=legacy;}}document.documentElement.classList.add(theme);}catch(e){}})();`,
          }}
        />
        <Suspense>
          <RefineContext>{children}</RefineContext>
        </Suspense>
        <PwaRegister />
      </body>
    </html>
  );
}
