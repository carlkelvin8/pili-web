import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pili AdheSeal Inc. | Industrial Sealants & Adhesives",
  description:
    "Pili AdheSeal Inc. provides high-performance sealants, adhesives, hybrid sealants, and glues customized for defense, construction, automotive, and more.",
  openGraph: {
    title: "Pili AdheSeal Inc. | Industrial Sealants & Adhesives",
    description: "High-performance sealants, adhesives, hybrid sealants, and glues for defense, construction, automotive, and more.",
    type: "website",
    locale: "en_US",
    siteName: "Pili AdheSeal Inc.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pili AdheSeal Inc. | Industrial Sealants & Adhesives",
    description: "High-performance sealants, adhesives, hybrid sealants, and glues for defense, construction, automotive, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d4d4d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
