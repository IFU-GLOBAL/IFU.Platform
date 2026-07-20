import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GTranslateWidget } from "@/components/gtranslate-widget";
import { getSiteUrl } from "@/lib/site-url";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "IFU Platform",
  title: {
    default: "IFU Platform | Global Agriculture Network",
    template: "%s | IFU Platform",
  },
  description:
    "Discover IFU role pathways, country intelligence, invitation flows, and the International Farm Union agriculture network.",
  keywords: [
    "International Farm Union",
    "IFU Platform",
    "agriculture network",
    "farmer cooperative",
    "agricultural intelligence",
    "AgriFinance",
    "AgriSphere",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "IFU Platform",
    title: "IFU Platform | Global Agriculture Network",
    description:
      "Discover IFU role pathways, country intelligence, invitation flows, and the International Farm Union agriculture network.",
    url: "/",
    images: [
      {
        url: "/images/ifu-logo-hero.png",
        width: 1200,
        height: 630,
        alt: "International Farm Union",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IFU Platform | Global Agriculture Network",
    description:
      "Discover IFU role pathways, country intelligence, invitation flows, and the International Farm Union agriculture network.",
    images: ["/images/ifu-logo-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <GTranslateWidget id="global" variant="floating" hideOnDiscovery />
        {children}
      </body>
    </html>
  );
}
