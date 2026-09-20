import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/products/feed", "/feed.xml"],
        disallow: [
          "/admin",
          "/admin/*",
          "/login",
          "/cart",
          "/checkout",
          "/checkout/*",
          "/orders",
          "/orders/*",
          "/wishlist",
          "/payment/*",
          "/api/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/products/feed", "/feed.xml"],
        disallow: [
          "/admin",
          "/admin/*",
          "/login",
          "/cart",
          "/checkout",
          "/checkout/*",
          "/orders",
          "/orders/*",
          "/wishlist",
          "/payment/*",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://www.streetmobile.lk/sitemap.xml",
    host: "https://www.streetmobile.lk",
  };
}
