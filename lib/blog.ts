import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "blog articles");

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  href: string;
  filename: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
};

const BLOG_IMAGE_META: Record<
  string,
  { src: string; alt: string }
> = {
  "best-trampoline-for-kids": {
    src: "/blog/best-trampoline-for-kids-featured.jpg",
    alt: "Children jumping together on an outdoor backyard trampoline.",
  },
  "best-trampoline-for-adults": {
    src: "/blog/best-trampoline-for-adults-featured-v3.jpg",
    alt: "A man jumping on an outdoor trampoline.",
  },
  "best-trampoline-for-toddlers": {
    src: "/blog/best-trampoline-for-toddlers-featured-v3.jpg",
    alt: "A toddler standing inside a small enclosed outdoor trampoline.",
  },
  "best-trampoline-for-heavy-adults": {
    src: "/blog/best-trampoline-for-heavy-adults-featured-v2.png",
    alt: "Close-up of an adult bouncing on a trampoline mat outdoors.",
  },
  "best-trampoline-for-exercise": {
    src: "/blog/best-trampoline-for-exercise-featured.jpg",
    alt: "An indoor fitness setting with a coach and exercise trampolines.",
  },
  "best-trampoline-for-small-backyard": {
    src: "/blog/best-trampoline-for-small-backyard-featured-v2.png",
    alt: "A small enclosed trampoline fitted into a narrow backyard beside a house.",
  },
  "best-trampoline-for-gymnastics": {
    src: "/blog/best-trampoline-for-gymnastics-featured.jpg",
    alt: "A gymnast jumping high on a trampoline in an indoor training space.",
  },
  "best-trampoline-for-teenagers": {
    src: "/blog/best-trampoline-for-teenagers-featured.jpg",
    alt: "A teenage girl bouncing on an outdoor backyard trampoline.",
  },
  "best-in-ground-trampoline": {
    src: "/blog/best-in-ground-trampoline-featured-v2.png",
    alt: "A rectangular in-ground trampoline installed flush with a backyard lawn.",
  },
};

function getBlogFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .sort();
}

function filenameToSlug(filename: string): string {
  return filename
    .replace(/^\d+\-/, "")
    .replace(/-v\d+(?=\.md$)/i, "")
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function extractExcerpt(markdown: string): string {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("#")) continue;
    if (line.startsWith("##")) continue;
    return line;
  }

  return "";
}

export function getAllBlogPosts(): BlogPost[] {
  return getBlogFiles().map((filename) => {
    const fullPath = path.join(BLOG_DIR, filename);
    const content = fs.readFileSync(fullPath, "utf8");
    const slug = filenameToSlug(filename);
    const title = extractTitle(content, slug.replace(/-/g, " "));
    const excerpt = extractExcerpt(content);
    const imageMeta = BLOG_IMAGE_META[slug] ?? null;

    return {
      slug,
      title,
      excerpt,
      content,
      href: `/blog/${slug}/`,
      filename,
      featuredImage: imageMeta?.src ?? null,
      featuredImageAlt: imageMeta?.alt ?? null,
    };
  });
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}
