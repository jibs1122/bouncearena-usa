import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 flex flex-col items-center text-center">
      <p className="text-7xl font-bold text-[#38b1ab] mb-6">404</p>
      <h1 className="text-2xl font-bold text-black mb-3">Page not found</h1>
      <p className="text-black/50 mb-8 max-w-sm">
        We couldn&apos;t find what you were looking for. Try browsing brands or comparing trampolines.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/brands/"
          className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] hover:bg-[#2e9a94] text-white font-semibold px-7 py-3 transition-colors"
        >
          Browse brands
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-black/15 hover:border-black/30 text-black font-medium px-7 py-3 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
