import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock, Calendar, ArrowRight, BookOpen, Smartphone, ShieldCheck, Wrench } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Tech Blog, Buying Guides & Gadget Insights | 1PLACE.LK",
  description:
    "Expert tech buying guides, smartphone comparisons, gadget maintenance tips, and lifestyle electronics advice from 1PLACE.LK Sri Lanka.",
  alternates: {
    canonical: "https://www.1place.lk/blog",
  },
  openGraph: {
    title: "Tech Blog, Buying Guides & Gadget Insights | 1PLACE.LK",
    description:
      "Expert tech guides, smartphone tips, and genuine electronics advice from 1PLACE.LK Sri Lanka.",
    url: "https://www.1place.lk/blog",
    siteName: "1PLACE.LK",
    type: "website",
    locale: "en_LK",
    images: [
      {
        url: "https://www.1place.lk/logo.svg",
        width: 1200,
        height: 630,
        alt: "1PLACE.LK Tech Blog Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Blog, Buying Guides & Gadget Insights | 1PLACE.LK",
    description: "Expert smartphone guides and tips from 1PLACE.LK.",
    images: ["https://www.1place.lk/logo.svg"],
  },
};

export default function BlogIndexPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.1place.lk/blog#collection",
    "name": "1PLACE.LK Tech Blog & Guides",
    "description":
      "Expert smartphone buying guides, battery care tips, and mobile accessory advice from 1PLACE.LK Sri Lanka.",
    "url": "https://www.1place.lk/blog",
    "hasPart": BLOG_POSTS.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `https://www.1place.lk/blog/${post.slug}`,
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt,
      "image": post.coverImage,
      "author": {
        "@type": "Organization",
        "name": post.author.name,
      },
    })),
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.1place.lk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog & Guides",
        "item": "https://www.1place.lk/blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="min-h-screen bg-black text-white">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <ol className="flex items-center space-x-2 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </li>
              <li className="text-zinc-200 font-medium" aria-current="page">
                Blog & Guides
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-black py-14 sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge & Buying Guides</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-outfit text-white mb-4">
                1PLACE.LK Tech Blog & Guides
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Honest buying guides, battery longevity tips, and tech insights from the electronics and tech specialists at 1PLACE.LK. Built to help Sri Lankan consumers make smart tech decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col rounded-2xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/50"
              >
                {/* Cover Image */}
                <Link href={`/blog/${post.slug}`} className="relative h-48 sm:h-52 w-full overflow-hidden block bg-zinc-950">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/70 backdrop-blur-md text-zinc-200 border border-zinc-700/60">
                    {post.category}
                  </span>
                </Link>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold font-outfit text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2.5">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">
                      By {post.author.name}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Local Showroom Callout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-950/40 via-zinc-900 to-zinc-950 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-400 mb-2 block">
                Flagship Experience in Colombo 03
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-outfit text-white mb-2">
                Need Help Choosing the Right Phone or Accessory?
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
                Visit our physical flagship showroom at 42, Galle Road, Colombo 03 for in-person advice, hands-on demonstrations, and verified warranty service.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                href="/contact"
                className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition-colors text-center w-full sm:w-auto"
              >
                Visit Colombo Flagship Store
              </Link>
              <Link
                href="/products"
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors text-center w-full sm:w-auto"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
