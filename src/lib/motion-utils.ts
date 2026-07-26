import type { Variants } from "framer-motion";

/**
 * Standardized easing curves for high-end e-commerce interactions.
 * cubic-bezier(0.22, 1, 0.36, 1) provides a smooth, fast, luxury response.
 */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_FAST = [0.16, 1, 0.3, 1] as const;

export const TRANSITION_FAST = { duration: 0.25, ease: EASE_PREMIUM };
export const TRANSITION_BASE = { duration: 0.4, ease: EASE_PREMIUM };
export const TRANSITION_SLOW = { duration: 0.7, ease: EASE_PREMIUM };

/**
 * Page & Container Fade-Up Reveal Variants
 */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_BASE,
  },
};

export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const modalOverlayVariant: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const bottomSheetVariant: Variants = {
  hidden: { y: "100%", opacity: 0.5 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: EASE_PREMIUM },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: EASE_PREMIUM },
  },
};

export const drawerSlideRightVariant: Variants = {
  hidden: { x: "100%" },
  show: {
    x: 0,
    transition: { duration: 0.35, ease: EASE_PREMIUM },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.25, ease: EASE_PREMIUM },
  },
};
