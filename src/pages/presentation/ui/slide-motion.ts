import type { Variants } from 'motion/react'
import { EASE_OUT } from '@/shared/lib/ease'

/** Direction-aware slide change: the new slide enters from the side the presenter moves toward. */
export const SLIDE_VARIANTS: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.24, ease: EASE_OUT } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -32,
    transition: { duration: 0.12, ease: 'easeIn' },
  }),
}
