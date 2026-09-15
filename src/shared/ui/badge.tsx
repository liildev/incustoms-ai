// beui.dev/components/motion/animated-badge — adapted: compact size, small radius, no pulse,
// icon off by default. Status changes roll the icon and label into place.
import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { BADGE_ICONS, BADGE_STATUS_CLASS, type BadgeStatus } from './badge-styles'
import { BADGE_ICON_ROLL, BADGE_TEXT_ROLL } from './badge-variants'

type BadgeProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  status?: BadgeStatus
  showIcon?: boolean
  /** Key for the label roll animation; defaults to the label text. */
  contentKey?: string | number
  children?: ReactNode
}

export const Badge = ({
  status = 'neutral',
  showIcon = false,
  contentKey,
  className,
  children,
  ...props
}: BadgeProps) => {
  const reduce = useReducedMotion()
  const Icon = BADGE_ICONS[status]
  const labelKey =
    contentKey ?? (typeof children === 'string' || typeof children === 'number' ? children : status)

  return (
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.7 }}
      className={cn(
        'relative inline-flex h-5 shrink-0 items-center gap-1 overflow-hidden rounded-sm border px-1.5 text-2xs font-medium whitespace-nowrap tabular-nums transition-colors duration-300',
        BADGE_STATUS_CLASS[status],
        className,
      )}
      {...props}
    >
      {showIcon ? (
        <span className="inline-flex items-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              aria-hidden
              variants={BADGE_ICON_ROLL}
              initial={reduce ? false : 'initial'}
              animate={reduce ? { opacity: 1 } : 'animate'}
              exit={reduce ? undefined : 'exit'}
              className="inline-flex"
            >
              <Icon className="size-3" />
            </motion.span>
          </AnimatePresence>
        </span>
      ) : null}
      {children != null ? (
        <span className="inline-flex overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={labelKey}
              variants={BADGE_TEXT_ROLL}
              initial={reduce ? false : 'initial'}
              animate={reduce ? { opacity: 1 } : 'animate'}
              exit={reduce ? undefined : 'exit'}
              className="inline-block"
            >
              {children}
            </motion.span>
          </AnimatePresence>
        </span>
      ) : null}
    </motion.span>
  )
}
