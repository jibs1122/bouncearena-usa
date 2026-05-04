import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";

function getSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us").trim();
  if (!raw) return "https://bouncearena.us";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return "https://bouncearena.us";
  }
}

const SITE_URL = getSiteUrl();
const SITE_NAME = "Bounce Arena";
const GA_ID = "G-2M6DL32KPB";
const DEFAULT_DESCRIPTION =
  "Independent trampoline reviews and comparisons. We compare safety ratings, sizes, and prices to help you find the best trampoline for your family.";

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
  verification: {
    google: "qVElmmc7dnFAI7y4tij8STQ1tixvjCbJ0KeZlVzxkcg",
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning className="flex flex-col min-h-screen bg-white">
        <JsonLd data={organizationSchema} />
        <HeaderWrapper />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
