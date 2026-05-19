import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import JsonLd from "@/components/seo/JsonLd";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { resolveBlogModelImage } from "@/lib/blogModelImages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const BLOG_MODEL_IMAGE_EXCLUSIONS: Record<string, Set<string>> = {
  "best-in-ground-trampoline": new Set([
    "2. Avyna Pro-Line 14ft Round In-Ground",
    "5. Avyna Pro-Line 10x17 Rectangle In-Ground",
    "6. Capital Play 11x8ft In-Ground Trampoline",
    "9. Avyna Pro-Line 12ft Round In-Ground",
  ]),
  "best-trampoline-for-gymnastics": new Set([
    "2. Akrobat XCITYX 17x12",
    "8. Avyna Pro-Line 10x17 Rectangle Above-Ground",
    "10. Texas Trampolines 7.3x12.3 Kids Delight Rectangular",
  ]),
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}${post.href}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}${post.href}`,
      type: "article",
      images: post.featuredImage ? [{ url: `${SITE_URL}${post.featuredImage}` }] : undefined,
    },
  };
}

function injectQuizCta(markdown: string): string {
  const lines = markdown.split("\n");
  let h2Count = 0;

  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      h2Count += 1;

      if (h2Count === 3) {
        lines.splice(i, 0, "", "<QuizCta />", "");
        break;
      }
    }
  }

  return lines.join("\n");
}

function injectModelImages(markdown: string, slug: string): string {
  const lines = markdown.split("\n");
  const exclusions = BLOG_MODEL_IMAGE_EXCLUSIONS[slug] ?? new Set<string>();

  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(/^##\s+(\d+\.\s+.+)$/);
    if (!match) continue;
    if (exclusions.has(match[1])) continue;

    const title = match[1].replace(/&/g, "&amp;").replace(/"/g, "&quot;");

    lines.splice(i + 1, 0, "", `<BlogModelImage title="${title}" />`, "");
  }

  return lines.join("\n");
}

function enrichBlogMarkdown(markdown: string, slug: string): string {
  return injectQuizCta(injectModelImages(markdown, slug));
}

function QuizCta() {
  return (
    <section className="my-10 rounded-xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
      <h2 className="mb-2 text-lg font-bold text-black">Not sure which trampoline fits best?</h2>
      <p className="mb-4 text-sm leading-6 text-black/60">
        Take the quiz and get a tailored trampoline recommendation based on yard size,
        budget, safety priorities, and who will be using it.
      </p>
      <Link
        href="/quiz/"
        className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
      >
        Take the quiz →
      </Link>
    </section>
  );
}

function BlogModelImage({ title }: { title?: string }) {
  if (!title) return null;
  const image = resolveBlogModelImage(title);
  if (!image) return null;

  return (
    <figure className="mb-7 overflow-hidden rounded-2xl border border-black/[0.08] bg-[#f7fbfa]">
      <div className="relative aspect-[16/9]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-contain p-5"
          sizes="(min-width: 1024px) 768px, 100vw"
        />
      </div>
    </figure>
  );
}

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-6 text-3xl font-bold leading-tight text-black sm:text-4xl" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-4 mt-10 text-2xl font-bold text-black" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-5 text-[17px] leading-8 text-black/75" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-6 list-disc space-y-2 pl-6 text-[17px] leading-8 text-black/75" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-6 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-black/75" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-[#38b1ab] underline decoration-[#38b1ab]/40 underline-offset-4" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-black" {...props} />
  ),
  QuizCta,
  BlogModelImage,
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const relatedPosts = getAllBlogPosts().filter((item) => item.slug !== post.slug).slice(0, 3);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}${post.href}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}${post.href}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: post.featuredImage ? `${SITE_URL}${post.featuredImage}` : undefined,
    author: {
      "@type": "Organization",
      name: "Bounce Arena",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Bounce Arena",
      url: SITE_URL,
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={articleSchema} />

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="mb-6 text-sm text-black/40">
          <Link href="/" className="transition-colors hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog/" className="transition-colors hover:text-black">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{post.title}</span>
        </nav>

        <div className="max-w-3xl">
          {post.featuredImage ? (
            <div className="relative mb-8 aspect-[1200/627] overflow-hidden rounded-2xl bg-black/[0.03]">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt ?? post.title}
                fill
                className="object-cover"
              sizes="(min-width: 1024px) 896px, 100vw"
              priority
            />
          </div>
          ) : null}
          <MDXRemote
            source={enrichBlogMarkdown(post.content, post.slug)}
            components={components}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />

          {relatedPosts.length > 0 ? (
            <section className="mt-12 rounded-xl border border-black/[0.08] bg-black/[0.02] p-6">
              <h2 className="mb-4 text-lg font-bold text-black">Related Guides</h2>
              <div className="flex flex-wrap gap-3">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10 rounded-xl border border-[#38b1ab]/20 bg-[#38b1ab]/[0.06] p-6">
            <h2 className="mb-2 text-lg font-bold text-black">Still not sure which trampoline fits best?</h2>
            <p className="mb-4 text-sm leading-6 text-black/60">
              Take the quiz and get a tailored trampoline recommendation based on yard size,
              budget, safety priorities, and who will be using it.
            </p>
            <Link
              href="/quiz/"
              className="inline-flex items-center justify-center rounded-xl bg-[#38b1ab] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2e9a94]"
            >
              Take the quiz →
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
