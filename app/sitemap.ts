import type { MetadataRoute } from "next";
import { getAllBrands } from "@/lib/products";
import { getApprovedComparisons } from "@/lib/comparisons";
import { REVIEW_CARDS } from "@/lib/reviews";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bouncearena.us";

export default function sitemap(): MetadataRoute.Sitemap {
  const brands = getAllBrands();
  const comparisons = getApprovedComparisons();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/quiz/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/brands/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/models/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/compare/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/reviews/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}/brands/${b.slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const comparePages: MetadataRoute.Sitemap = comparisons.map((comparison) => ({
    url: `${SITE_URL}${comparison.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const reviewPages: MetadataRoute.Sitemap = REVIEW_CARDS.map((review) => ({
    url: `${SITE_URL}${review.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...comparePages, ...reviewPages];
}
