// beui.dev/components/motion/center-morph-modal — adapted into a controlled confirmation dialog:
// solid scrim instead of backdrop blur, title/description/actions layout,
// focus returned to the previously focused element, inactive while its page is hidden.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { EASE_OUT } from '../lib/ease'
import { useModalFocus } from '../lib/hooks/use-modal-focus'
import { useViewVisible } from '../lib/view/view-visibility'
import { PresenceGate } from './presence-gate'

type DialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  /** Action buttons; the first one receives focus. */
  actions: ReactNode
  onClose: () => void
}

// Clip-path radius mirrors --radius-xl so the unfolded panel matches its rounded-xl border.
const FOLDED_CLIP = 'inset(48% 48% 48% 48% round 16px)'
const OPEN_CLIP = 'inset(0% 0% 0% 0% round 16px)'
const UNFOLD_TRANSITION = { duration: 0.34, ease: [0.2, 0, 0.2, 1] } as const

export const Dialog = ({ open, title, description, actions, onClose }: DialogProps) => {
  const visible = useViewVisible()
  const shown = open && visible
  const reduce = useReducedMotion() ?? false
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  useModalFocus(shown, panelRef, onClose)

  return createPortal(
    <AnimatePresence>
      {shown ? (
        <PresenceGate>
          {({ isPresent, gate }) => (
            <>
              <motion.button
                type="button"
                aria-label="Закрыть"
                tabIndex={-1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.1 : 0.22, ease: EASE_OUT }}
                {...gate}
                onClick={onClose}
                className="fixed inset-0 z-100 size-full cursor-default bg-foreground/20"
              />
              <div
                inert={!isPresent}
                className="pointer-events-none fixed inset-4 z-100 flex items-center justify-center overflow-y-auto"
              >
                <div className="w-full max-w-md drop-shadow-dialog">
                  <motion.div
                    ref={panelRef}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={description ? descriptionId : undefined}
                    tabIndex={-1}
                    initial={
                      reduce
                        ? { opacity: 0, clipPath: OPEN_CLIP }
                        : { opacity: 1, clipPath: FOLDED_CLIP }
                    }
                    animate={{ opacity: 1, clipPath: OPEN_CLIP }}
                    exit={
                      reduce
                        ? { opacity: 0, clipPath: OPEN_CLIP }
                        : { opacity: 1, clipPath: FOLDED_CLIP }
                    }
                    transition={reduce ? { duration: 0.14, ease: EASE_OUT } : UNFOLD_TRANSITION}
                    {...gate}
                    className="relative w-full rounded-xl border border-border bg-surface p-5 text-dense outline-none will-change-[clip-path]"
                  >
                    <h2 id={titleId} className="text-sm font-semibold text-foreground">
                      {title}
                    </h2>
                    {description ? (
                      <div id={descriptionId} className="mt-2 text-muted-foreground">
                        {description}
                      </div>
                    ) : null}
                    <div className="mt-5 flex flex-wrap justify-end gap-2">{actions}</div>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
