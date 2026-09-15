// beui.dev/components/motion/tooltip — anchor point on the trigger edge facing `side`
import type { TooltipSide } from './tooltip-variants'

/** Gap between trigger and tooltip, in px. */
const GAP = 8

/** Viewport coordinates for a fixed-positioned tooltip, so it escapes overflow and stacking contexts. */
export const placeTooltip = (rect: DOMRect, side: TooltipSide): { top: number; left: number } => {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  switch (side) {
    case 'top':
      return { top: rect.top - GAP, left: cx }
    case 'bottom':
      return { top: rect.bottom + GAP, left: cx }
    case 'left':
      return { top: cy, left: rect.left - GAP }
    case 'right':
      return { top: cy, left: rect.right + GAP }
  }
}
