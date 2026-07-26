"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Review } from "@/lib/types";

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-bold text-lg">4.9/5</span>
          </div>
          <p className="text-muted-foreground">Based on hundreds of Google Reviews</p>
        </div>

        {/* Marquee Carousel */}
        <div className="relative flex overflow-hidden group">
          {/* Duplicate the container to create an infinite loop effect */}
          {[1, 2].map((groupIndex) => (
            <div
              key={groupIndex}
              className="flex shrink-0 gap-6 px-3 animate-marquee group-hover:[animation-play-state:paused]"
            >
              {reviews.map((review) => (
                <div
                  key={`${groupIndex}-${review.id}`}
                  className="w-[320px] lg:w-[400px] shrink-0 bg-black p-8 rounded-[32px] border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.95)] hover:border-zinc-700 hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-100 leading-relaxed mb-6 italic">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-inner">
                      {review.author_photo ? (
                        <img src={review.author_photo} alt={review.author_name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="font-bold text-sm text-white">{review.author_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">{review.author_name}</div>
                      <div className="text-xs text-zinc-400">{new Date(review.review_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          {/* Gradient Fade Edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}
