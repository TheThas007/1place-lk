"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Review } from "@/lib/types";

export default function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    rating: 5,
    text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author_name || !formData.text) return;
    setIsSubmitting(true);

    try {
      const newReview = {
        ...formData,
        author_photo: "",
        review_date: new Date().toISOString(),
        visible: true,
      };

      const docRef = await addDoc(collection(db, "reviews"), newReview);
      
      // Update local state immediately
      setReviews([{ ...newReview, id: docRef.id } as Review, ...reviews]);
      setIsModalOpen(false);
      setFormData({ author_name: "", rating: 5, text: "" });
      alert("Thank you for your review!");
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold tracking-tight mb-2">Customer Reviews</h1>
              <p className="text-muted-foreground">Read what our community has to say about us.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-95 shadow-lg shadow-foreground/10"
              >
                Write a Review
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-6 bg-background p-6 rounded-3xl border border-border shadow-xl shadow-black/5"
            >
              <div className="text-5xl font-bold">4.9</div>
              <div>
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Based on hundreds of Reviews</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review, index) => (
            <motion.div 
              key={review.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card p-8 rounded-3xl border border-border/50 hover:shadow-2xl hover:border-border transition-all duration-300 break-inside-avoid"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6 italic text-muted-foreground">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {review.author_photo ? (
                    <img src={review.author_photo} alt={review.author_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm text-white">{review.author_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm">{review.author_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(review.review_date).toLocaleDateString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card border border-border w-full max-w-lg rounded-3xl p-6 lg:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Write a Review</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star className={`w-8 h-8 ${star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground fill-transparent"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all resize-none custom-scrollbar"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
