import { Variants } from 'framer-motion'

/**
 * Enterprise Animation System
 * Core variants for consistent application behavior.
 */

// Staggered entry for containers
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// Fade up effect for items
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

// Scale and fade for modals/notifications
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
}

// Hover effects for buttons/cards
export const hoverScale = {
  scale: 1.02,
  transition: { type: 'spring', stiffness: 400, damping: 10 },
}

export const tapScale = {
  scale: 0.98,
}

// Shake for error states
export const shakeVariants: Variants = {
  shake: {
    x: [-1, 2, -4, 4, -4, 4, -4, 2, -1],
    transition: { duration: 0.4 },
  },
}
