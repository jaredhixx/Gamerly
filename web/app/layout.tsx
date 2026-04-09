import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gamerly.net"),
  title: {
    default: "Gamerly",
    template: "%s | Gamerly"
  },
  description: "Discover new and upcoming video games by platform, genre, and release date."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
return (
  <html lang="en">
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=pub-3907331496669900"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
    <body>
      <SiteHeader />

      <div className="pageContainer">
        {children}
      </div>

      <SiteFooter />
    </body>
  </html>
);
}