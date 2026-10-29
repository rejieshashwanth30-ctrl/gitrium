import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { PRODUCT_INFO } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gitrium.dev"),
  title: `${PRODUCT_INFO.name} — ${PRODUCT_INFO.tagline}`,
  description: PRODUCT_INFO.description,
  keywords: [
    "developer intelligence",
    "code evidence",
    "github audit",
    "AST code analysis",
    "skill verification",
    "software engineering portfolio",
    "ADYK Gitrium",
  ],
  authors: [{ name: "ADYK Multi Venture Company" }],
  openGraph: {
    title: `${PRODUCT_INFO.name} — ${PRODUCT_INFO.tagline}`,
    description: PRODUCT_INFO.description,
    url: "https://gitrium.dev",
    siteName: PRODUCT_INFO.name,
    images: [
      {
        url: "/gitrium-official-logo.png",
        width: 1200,
        height: 630,
        alt: `${PRODUCT_INFO.name} — ${PRODUCT_INFO.tagline}`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRODUCT_INFO.name} — ${PRODUCT_INFO.tagline}`,
    description: PRODUCT_INFO.description,
    images: ["/gitrium-official-logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen bg-[#F7F6F1] text-[#17201B] font-sans antialiased selection:bg-[#DDF4EA] selection:text-[#087453]">
        {children}
      </body>
    </html>
  );
}
