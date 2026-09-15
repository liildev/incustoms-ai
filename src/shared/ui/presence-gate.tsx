// beui.dev lib/presence-gate
import { useIsPresent } from 'motion/react'
import type { ReactNode } from 'react'

export type PresenceGateRenderProps = {
  /** False from the render that starts the exit animation onward. */
  isPresent: boolean
  /**
   * Spread onto every layer that takes pointer events while the overlay is open: interaction is
   * released in the same commit that starts the exit, while the visual exit keeps playing.
   */
  gate: { inert: boolean; style: { pointerEvents: 'auto' | 'none' } }
}

/** Reads presence inside an AnimatePresence subtree and hands it to the overlay layers. */
export const PresenceGate = ({
  children,
}: {
  children: (props: PresenceGateRenderProps) => ReactNode
}) => {
  const isPresent = useIsPresent()
  return children({
    isPresent,
    gate: { inert: !isPresent, style: { pointerEvents: isPresent ? 'auto' : 'none' } },
  })
}
