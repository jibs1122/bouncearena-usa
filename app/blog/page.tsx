import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { getAllBlogPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

export const metadata: Metadata = {
  title: "Blog — Trampoline Buying Guides",
  description:
    "Trampoline buying guides, rankings, and long-form advice to help you choose the right model for your family and yard.",
  alternates: { canonical: `${SITE_URL}/blog/` },
  openGraph: {
    title: "Blog — Trampoline Buying Guides",
    description:
      "Trampoline buying guides, rankings, and long-form advice to help you choose the right model for your family and yard.",
    url: `${SITE_URL}/blog/`,
  },
};

function categoryLabel(title: string) {
  return title.replace(/^Best Trampoline for\s+/i, "").replace(/\s+in\s+\d{4}$/i, "").trim();
}

export default function BlogPage() {
  const posts = getAllBlogPosts();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog/` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bounce Arena Blog",
    url: `${SITE_URL}/blog/`,
    hasPart: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}${post.href}`,
        name: post.title,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemListSchema} />

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="mb-6 text-sm text-black/40">
          <Link href="/" className="transition-colors hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">Blog</span>
        </nav>

        <h1 className="mb-2 text-3xl font-bold text-black sm:text-4xl">
          Find the best trampoline for...
        </h1>
        <p className="mb-10 max-w-2xl text-black/60">
          Browse category guides for different ages, budgets, and use cases.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={post.href}
              className="group block overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition-all hover:border-[#38b1ab]/40 hover:shadow-sm"
            >
              {post.featuredImage ? (
                <div className="relative aspect-[1200/627] w-full overflow-hidden bg-black/[0.03]">
                  <Image
                    src={post.featuredImage}
                    alt={post.featuredImageAlt ?? post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 896px, 100vw"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#38b1ab]">
                  Category guide
                </p>
                <h2 className="mb-2 text-2xl font-bold text-black transition-colors group-hover:text-[#38b1ab]">
                  {categoryLabel(post.title)}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-black/65">{post.excerpt}</p>
                <span className="text-sm font-medium text-[#38b1ab] group-hover:underline">
                  View guide →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
