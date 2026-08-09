import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/orders/", "/wishlist/", "/api/"],
    },
    sitemap: "https://www.streetmobile.lk/sitemap.xml",
  };
}
