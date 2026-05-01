import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";
const SITE_NAME = "Bounce Arena";
const DEFAULT_DESCRIPTION =
  "Independent trampoline reviews and comparisons for US buyers. We compare safety ratings, sizes, and prices to help you find the best trampoline for your family.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Trampoline Reviews & Comparisons`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bounce Arena",
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" style={{ background: "#ffffff" }}>
      <body suppressHydrationWarning className="flex flex-col min-h-screen bg-white">
        <JsonLd data={organizationSchema} />
        <HeaderWrapper />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
