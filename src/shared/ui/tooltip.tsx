// beui.dev/components/motion/tooltip — adapted: wraps long text, project surface colors.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'
import {
  type TooltipSide,
  tooltipAnchorTransform,
  tooltipOrigin,
  tooltipVariants,
} from './tooltip-variants'
import { useTooltip } from './use-tooltip'

type TooltipProps = {
  content: ReactNode
  children: ReactElement
  side?: TooltipSide
  /** Delay before showing (ms). */
  delay?: number
  className?: string
  /** Classes for the wrapper span, e.g. `min-w-0` to allow truncation inside. */
  wrapperClassName?: string
}

export const Tooltip = ({
  content,
  children,
  side = 'top',
  delay = 250,
  className,
  wrapperClassName,
}: TooltipProps) => {
  const id = useId()
  const reduce = useReducedMotion()
  const { open, coords, anchorProps } = useTooltip(side, delay)

  if (!isValidElement(children)) return children
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    'aria-describedby': id,
  })

  return (
    <>
      <span className={cn('relative inline-flex align-middle', wrapperClassName)} {...anchorProps}>
        {trigger}
      </span>
      {createPortal(
        <AnimatePresence>
          {open && coords ? (
            <span
              aria-hidden
              className="pointer-events-none fixed z-9999"
              style={{
                top: coords.top,
                left: coords.left,
                transform: tooltipAnchorTransform[side],
              }}
            >
              <motion.span
                id={id}
                role="tooltip"
                variants={tooltipVariants(side, Boolean(reduce))}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ transformOrigin: tooltipOrigin[side] }}
                className={cn(
                  'block w-max max-w-xs rounded-md border border-border bg-surface px-2.5 py-1.5 text-2xs font-medium text-foreground shadow-popover',
                  className,
                )}
              >
                {content}
              </motion.span>
            </span>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
