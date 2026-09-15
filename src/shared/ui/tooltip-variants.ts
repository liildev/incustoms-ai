// beui.dev/components/motion/tooltip — placement and motion variants
import type { Variants } from 'motion/react'
import { EASE_OUT } from '../lib/ease'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

/** Centering transform for the fixed anchor point, per side. */
export const tooltipAnchorTransform: Record<TooltipSide, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
}

export const tooltipOrigin: Record<TooltipSide, string> = {
  top: 'center bottom',
  bottom: 'center top',
  left: 'right center',
  right: 'left center',
}

/** Offset away from the trigger: content originates near it and rises into place. */
const OFFSET: Record<TooltipSide, { x: number; y: number }> = {
  top: { x: 0, y: 8 },
  bottom: { x: 0, y: -8 },
  left: { x: 8, y: 0 },
  right: { x: -8, y: 0 },
}

const REDUCED: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.14, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } },
}

export const tooltipVariants = (side: TooltipSide, reduce: boolean): Variants => {
  if (reduce) return REDUCED
  const { x, y } = OFFSET[side]
  return {
    initial: { opacity: 0, scale: 0.9, filter: 'blur(5px)', x, y },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 30,
        mass: 0.7,
        opacity: { duration: 0.14, ease: EASE_OUT },
        filter: { duration: 0.18, ease: EASE_OUT },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.94,
      filter: 'blur(3px)',
      x: x * 0.6,
      y: y * 0.6,
      transition: { duration: 0.12, ease: EASE_OUT },
    },
  }
}
