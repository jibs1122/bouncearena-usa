import type { MetadataRoute } from "next";
import { getAllBrands } from "@/lib/products";
import { getApprovedComparisons } from "@/lib/comparisons";
import { REVIEW_CARDS } from "@/lib/reviews";
import { getAllBlogPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bouncearenareviews.com";

// Date the product/comparison data set was last meaningfully updated.
const DATA_UPDATED = new Date("2026-04-01");

export default function sitemap(): MetadataRoute.Sitemap {
  const brands = getAllBrands();
  const comparisons = getApprovedComparisons();
  const blogPosts = getAllBlogPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,             lastModified: new Date("2026-05-01"), changeFrequency: "weekly",  priority: 1   },
    { url: `${SITE_URL}/quiz/`,         lastModified: new Date("2026-04-15"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/brands/`,       lastModified: DATA_UPDATED,           changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/models/`,       lastModified: DATA_UPDATED,           changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/compare/`,      lastModified: DATA_UPDATED,           changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/reviews/`,      lastModified: new Date("2026-04-15"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog/`,         lastModified: new Date("2026-04-10"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/promo-codes/`,  lastModified: new Date("2026-05-01"), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${SITE_URL}/about/`,        lastModified: new Date("2026-03-01"), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/privacy/`,      lastModified: new Date("2026-05-19"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terms/`,        lastModified: new Date("2026-03-01"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/contact/`,      lastModified: new Date("2026-03-01"), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}/brands/${b.slug}/`,
    lastModified: DATA_UPDATED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const comparePages: MetadataRoute.Sitemap = comparisons.map((comparison) => ({
    url: `${SITE_URL}${comparison.href}`,
    lastModified: DATA_UPDATED,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const reviewPages: MetadataRoute.Sitemap = REVIEW_CARDS.map((review) => ({
    url: `${SITE_URL}${review.href}`,
    lastModified: new Date(review.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}${post.href}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...comparePages, ...reviewPages, ...blogPages];
}
