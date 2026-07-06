"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Star, X, Loader2, Quote, Sparkles, PenLine, CheckCircle2, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Review } from "@/lib/types";

/* ─── Avatar gradient palette ─── */
const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

function avatarGradient(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

/* ─── Stagger variants ─── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/* ─── Animated count-up ─── */
function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setVal(Math.round(progress * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);

  return <>{val}</>;
}

/* ─── Floating particle ─── */
function Particle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-yellow-400/40 pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }}
      transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

export default function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [formData, setFormData] = useState({ author_name: "", rating: 5, text: "" });
  const [filterRating, setFilterRating] = useState(0);

  const visibleReviews = reviews.filter((r) =>
    filterRating === 0 ? true : r.rating === filterRating
  );

  /* ─── Average rating ─── */
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  /* ─── Rating distribution ─── */
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
        : 0,
  }));

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
      setReviews([{ ...newReview, id: docRef.id } as Review, ...reviews]);
      setSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        setFormData({ author_name: "", rating: 5, text: "" });
      }, 1800);
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Particles config ─── */
  const particles = [
    { delay: 0, x: "10%", y: "20%" },
    { delay: 1, x: "80%", y: "15%" },
    { delay: 0.5, x: "50%", y: "60%" },
    { delay: 1.5, x: "25%", y: "75%" },
    { delay: 0.8, x: "70%", y: "80%" },
    { delay: 2, x: "40%", y: "40%" },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-yellow-400/8 to-orange-400/8 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-violet-400/8 to-fuchsia-400/8 blur-3xl" />
          {particles.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            {/* Left: Title */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs font-semibold text-yellow-600 mb-5 uppercase tracking-widest"
              >
                <Sparkles className="w-3 h-3" />
                Customer Reviews
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
                What People{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                    Say
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full origin-left -z-0"
                  />
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg">
                Real experiences from real customers. See why Street Mobile is Tamil Nadu's
                most trusted phone store.
              </p>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
                className="mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 bg-foreground text-background rounded-2xl font-semibold text-sm shadow-xl shadow-foreground/10 hover:shadow-foreground/20 transition-shadow"
              >
                <PenLine className="w-4 h-4" />
                Write a Review
              </motion.button>

              {/* Google Reviews Button */}
              <motion.a
                href="https://www.google.com/maps/search/Street+Mobile+Vavuniya/@8.7511,80.4997,15z/data=!3m1!4b1"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="mt-3 inline-flex items-center gap-2.5 px-7 py-3.5 bg-white border-2 border-foreground/10 text-foreground rounded-2xl font-semibold text-sm shadow-lg hover:border-foreground/20 hover:shadow-xl transition-all"
              >
                {/* Google G icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Check Google Reviews
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </motion.a>
            </motion.div>

            {/* Right: Rating card */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:w-auto shrink-0"
            >
              <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-black/5 min-w-[300px]">
                {/* Big score */}
                <div className="flex items-end gap-4 mb-6">
                  <div className="text-7xl font-black text-foreground leading-none">
                    {avgRating}
                  </div>
                  <div className="pb-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.div
                          key={s}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + s * 0.08, type: "spring", stiffness: 400 }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      <CountUp to={reviews.length} /> reviews
                    </p>
                  </div>
                </div>

                {/* Distribution bars */}
                <div className="space-y-2.5">
                  {dist.map(({ star, count, pct }, i) => (
                    <motion.div
                      key={star}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.07, duration: 0.4 }}
                      className="flex items-center gap-3 group cursor-pointer"
                      onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                    >
                      <span className="text-xs font-semibold text-muted-foreground w-2">
                        {star}
                      </span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full ${
                            filterRating === star
                              ? "bg-yellow-400"
                              : "bg-yellow-400/60 group-hover:bg-yellow-400/80"
                          } transition-colors`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">
                        {count}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {filterRating > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setFilterRating(0)}
                    className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear filter ✕
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ REVIEW CARDS ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        {/* Filter indicator */}
        <AnimatePresence>
          {filterRating > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-8 text-sm text-muted-foreground"
            >
              Showing <span className="font-semibold text-foreground">{visibleReviews.length}</span> reviews
              for{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                {filterRating} <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {visibleReviews.map((review, index) => (
            <motion.div
              key={review.id || index}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative bg-card border border-border/50 rounded-3xl p-7 break-inside-avoid group cursor-default hover:border-border hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
            >
              {/* Glowing top border on hover */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-yellow-400/0 to-transparent group-hover:via-yellow-400/50 transition-all duration-500 rounded-full" />

              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="w-10 h-10 fill-foreground" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 transition-all ${
                      s <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-border"
                    }`}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm leading-relaxed text-muted-foreground italic mb-6 relative z-10">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Divider */}
              <div className="h-px bg-border/50 mb-5" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatarGradient(
                    review.author_name
                  )} flex items-center justify-center shrink-0 shadow-md`}
                >
                  {review.author_photo ? (
                    <img
                      src={review.author_photo}
                      alt={review.author_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="font-bold text-sm text-white">
                      {review.author_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{review.author_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(review.review_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                {/* Verified badge */}
                <div className="flex items-center gap-1 text-emerald-500 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Verified</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {visibleReviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share your experience!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-95"
            >
              Write a Review
            </button>
          </motion.div>
        )}

        {/* CTA bottom */}
        {visibleReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex flex-col items-center gap-4 px-8 py-8 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-3xl">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground font-semibold text-lg">Loved our service?</p>
              <p className="text-muted-foreground text-sm max-w-sm">
                Your feedback helps us grow. Share your experience and help others!
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-7 py-3 bg-foreground text-background rounded-xl font-semibold text-sm shadow-lg shadow-foreground/10 hover:shadow-foreground/20 transition-shadow"
              >
                <PenLine className="w-4 h-4" />
                Write a Review
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════ WRITE REVIEW MODAL ═══════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="relative bg-card border border-border w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 lg:p-8 shadow-2xl z-10 max-h-[95vh] overflow-y-auto"
            >
              {/* Handle for mobile */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-border sm:hidden" />

              <AnimatePresence mode="wait">
                {submitted ? (
                  /* Success state */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold">Thank you!</h3>
                    <p className="text-muted-foreground text-center text-sm">
                      Your review has been submitted successfully.
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.div
                          key={s}
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: s * 0.1, type: "spring", stiffness: 300 }}
                        >
                          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  /* Form state */
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-7 mt-2 sm:mt-0">
                      <div>
                        <h3 className="text-xl font-bold">Share Your Experience</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your honest review means a lot to us
                        </p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formData.author_name}
                          onChange={(e) =>
                            setFormData({ ...formData, author_name: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/15 outline-none transition-all placeholder:text-muted-foreground/50"
                          placeholder="e.g. Ravi Kumar"
                        />
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-semibold mb-3">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              whileHover={{ scale: 1.25 }}
                              whileTap={{ scale: 0.9 }}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              onClick={() => setFormData({ ...formData, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-9 h-9 transition-all duration-150 ${
                                  star <= (hoveredStar || formData.rating)
                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                                    : "fill-transparent text-border"
                                }`}
                              />
                            </motion.button>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][
                            hoveredStar || formData.rating
                          ]}
                        </p>
                      </div>

                      {/* Text */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">Your Review</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.text}
                          onChange={(e) =>
                            setFormData({ ...formData, text: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/15 outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                          placeholder="Tell us about your experience with Street Mobile..."
                        />
                        <p className="mt-1 text-xs text-muted-foreground text-right">
                          {formData.text.length} chars
                        </p>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition-all disabled:opacity-60 shadow-lg shadow-foreground/10"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Submit Review
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
