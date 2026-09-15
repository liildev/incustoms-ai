// beui.dev/components/motion/animated-badge — roll variants for icon and label swaps
import type { Variants } from 'motion/react'
import { EASE_OUT } from '../lib/ease'

const ROLL_SPRING = { type: 'spring', stiffness: 210, damping: 24, mass: 0.85 } as const

export const BADGE_ICON_ROLL: Variants = {
  initial: { opacity: 0.72, y: '80%', scale: 0.92, rotate: -8, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: '0%',
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: {
      y: ROLL_SPRING,
      scale: { type: 'spring', stiffness: 250, damping: 24, mass: 0.75 },
      rotate: { duration: 0.28, ease: EASE_OUT },
      opacity: { duration: 0.28, ease: EASE_OUT },
      filter: { duration: 0.42, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0.5,
    y: '-80%',
    scale: 0.96,
    rotate: 8,
    filter: 'blur(6px)',
    transition: { duration: 0.22, ease: EASE_OUT },
  },
}

export const BADGE_TEXT_ROLL: Variants = {
  initial: { opacity: 0.76, y: '85%', filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: '0%',
    filter: 'blur(0px)',
    transition: {
      y: ROLL_SPRING,
      opacity: { duration: 0.3, ease: EASE_OUT },
      filter: { duration: 0.42, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0.5,
    y: '-85%',
    filter: 'blur(6px)',
    transition: { duration: 0.2, ease: EASE_OUT },
  },
}
