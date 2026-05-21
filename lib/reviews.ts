export interface ReviewCard {
  href: string;
  brand: string;
  model: string;
  author: string;
  owned: string;
  excerpt: string;
  tags: string[];
  videoUrl: string;
  videoThumbnailUrl: string;
  publishedAt: string;
}

export const REVIEW_CARDS: ReviewCard[] = [
  {
    href: "/reviews/springfree-medium-round/",
    brand: "Springfree",
    model: "Medium Round Trampoline",
    author: "Anthea",
    owned: "18 months",
    excerpt:
      "Anthea reviews the Springfree Medium Round after 18 months in a Melbourne backyard with two young boys. Covers sizing, safety, accessories, durability, assembly, and whether she would buy it again.",
    tags: ["Springfree", "Small yard", "Young kids"],
    videoUrl: "https://www.youtube.com/watch?v=ADUR7OSCDNc",
    videoThumbnailUrl: "https://i.ytimg.com/vi/ADUR7OSCDNc/hqdefault.jpg",
    publishedAt: "2026-03-01",
  },
  {
    href: "/reviews/vuly-ultra-2-pro-xl/",
    brand: "Vuly",
    model: "Ultra 2 Pro Trampoline",
    author: "Imogen",
    owned: "3 months",
    excerpt:
      "Imogen chose the XL for family use and hasn't looked back. A thorough walkthrough covering safety, build quality, the accessories, and one assembly mistake you'll want to avoid.",
    tags: ["Springless", "Large backyard", "Family use"],
    videoUrl: "https://www.youtube.com/watch?v=V6cas8XFsXQ&t",
    videoThumbnailUrl: "https://i.ytimg.com/vi/V6cas8XFsXQ/hqdefault.jpg",
    publishedAt: "2026-04-01",
  },
  {
    href: "/reviews/vuly-thunder-2-medium/",
    brand: "Vuly",
    model: "Thunder 2 Trampoline",
    author: "Jess",
    owned: "4 months",
    excerpt:
      "Jess reviews the Thunder 2 after four months of near-daily use in Brisbane with two young boys. Covers the leaf-spring bounce, assembly tips, and how it holds up in heat and storms.",
    tags: ["Leaf spring", "Young kids", "Brisbane"],
    videoUrl: "https://www.youtube.com/watch?v=erGgwAxLSIA&t",
    videoThumbnailUrl: "/reviews/vuly-thunder-2-5s.jpg",
    publishedAt: "2026-04-15",
  },
];
