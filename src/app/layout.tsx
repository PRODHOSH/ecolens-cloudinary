import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";


const displayFont = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoLens | Optimize Your Website. Reduce Carbon.",
  description:
    "EcoLens is a real-time media optimization and carbon reduction platform powered by Cloudinary. Scan your site, reduce bandwidth, and lower your digital carbon footprint.",
  keywords: ["media optimization", "carbon footprint", "sustainability", "Cloudinary", "web performance", "image optimization"],
  authors: [{ name: "EcoLens Team" }],
  creator: "EcoLens",
  publisher: "EcoLens",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ecolens-cloudinary.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EcoLens | Optimize Your Website. Reduce Carbon.",
    description: "Real-time media optimization and carbon reduction platform powered by Cloudinary.",
    url: "https://ecolens-cloudinary.vercel.app",
    siteName: "EcoLens",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EcoLens - Media Optimization for a Greener Web",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoLens | Optimize Your Website. Reduce Carbon.",
    description: "Real-time media optimization and carbon reduction platform powered by Cloudinary.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "UaoSRKAHIpDzT6sD0-yziuiyGSNpEyp9RaDEA009Vcs",
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
    icon: "/logo.png",
    apple: "/logo.png",
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
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-ec-ink">
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-27HPF43PZE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-27HPF43PZE');
          `}
        </Script>
        {children}
      </body>

    </html>
  );
}
