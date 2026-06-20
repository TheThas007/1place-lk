"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { reviews } from "@/lib/data";

export default function ReviewsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Customer Reviews</h1>
              <p className="text-muted-foreground">Read what our community has to say about us.</p>
              <button className="mt-4 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-95">
                Write a Review
              </button>
            </div>
            
            <div className="flex items-center gap-6 bg-background p-6 rounded-3xl border border-border">
              <div className="text-5xl font-bold">4.9</div>
              <div>
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Based on hundreds of Google Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card p-8 rounded-3xl border border-border/50 hover:shadow-xl hover:border-border transition-all duration-300">
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-foreground/10 overflow-hidden border border-border flex items-center justify-center shrink-0">
                  {review.author_photo ? (
                    <img src={review.author_photo} alt={review.author_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm">{review.author_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm">{review.author_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(review.review_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
