// beui.dev/components/motion/bouncy-accordion — row mechanics adapted into an independent
// collapsible section: measured content height, spring open/close, rotating chevron, inert
// closed content. Adapted for forms: sections open independently, content mounts on first
// open and stays mounted, height is released to `auto` once open so inputs can grow freely.
import { ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useId, useState } from 'react'
import { useElementHeight } from '../lib/hooks/use-element-height'

type CollapsibleProps = {
  title: ReactNode
  /** Content shown on the right side of the header. */
  meta?: ReactNode
  defaultOpen?: boolean
  /** Expands the section when it turns true, e.g. to reveal invalid fields after submit. */
  forceOpen?: boolean
  children: ReactNode
}

const OPEN_TRANSITION = { type: 'spring', duration: 0.5, bounce: 0.14 } as const
const CLOSE_TRANSITION = { type: 'spring', duration: 0.4, bounce: 0 } as const
const CHEVRON_TRANSITION = { type: 'spring', duration: 0.42, bounce: 0.28 } as const

export const Collapsible = ({
  title,
  meta,
  defaultOpen = true,
  forceOpen = false,
  children,
}: CollapsibleProps) => {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(defaultOpen)
  const [mounted, setMounted] = useState(defaultOpen)
  const [settled, setSettled] = useState(true)
  const [previousForceOpen, setPreviousForceOpen] = useState(forceOpen)
  const { ref: contentRef, height: contentHeight } = useElementHeight()
  const triggerId = useId()
  const contentId = useId()

  const setOpenState = (next: boolean) => {
    setMounted(true)
    setSettled(false)
    setOpen(next)
  }

  if (forceOpen !== previousForceOpen) {
    setPreviousForceOpen(forceOpen)
    if (forceOpen && !open) setOpenState(true)
  }

  const height = open ? (settled || contentHeight === 0 ? 'auto' : contentHeight) : 0

  return (
    <section className="border-b border-border last:border-b-0">
      <button
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={mounted ? contentId : undefined}
        onClick={() => setOpenState(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors -outline-offset-2 hover:bg-muted"
      >
        <motion.span
          aria-hidden
          initial={false}
          animate={{ rotate: open ? 0 : -90 }}
          transition={reduce ? { duration: 0 } : CHEVRON_TRANSITION}
          className="grid size-4 shrink-0 place-items-center text-subtle-foreground"
        >
          <ChevronDown className="size-3.5" />
        </motion.span>
        <span className="text-dense font-semibold text-foreground">{title}</span>
        {meta ? <span className="ml-auto flex min-w-0 items-center gap-2">{meta}</span> : null}
      </button>
      {mounted ? (
        <motion.div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          inert={!open}
          initial={defaultOpen ? false : { height: 0 }}
          animate={{ height }}
          transition={reduce ? { duration: 0 } : open ? OPEN_TRANSITION : CLOSE_TRANSITION}
          onAnimationComplete={() => setSettled(true)}
          // clip, not hidden: `hidden` makes a scroll container, which breaks sticky form actions inside.
          className="overflow-clip"
        >
          <motion.div
            ref={contentRef}
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.18 }}
            className="px-4 pt-1 pb-4"
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </section>
  )
}
