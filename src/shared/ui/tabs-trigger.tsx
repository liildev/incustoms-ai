// beui.dev/components/motion/tabs — trigger with a shared-layout indicator.
// Adapted: list look for navigation lists, ids and aria-controls for the panel.
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { tabPanelId, tabTriggerId, useTabs } from './tabs-context'

/** Settles without overshoot: a scrollable tab list would turn overshoot into scrollbar jitter. */
const INDICATOR_SPRING = { type: 'spring', stiffness: 170, damping: 30, mass: 1.2 } as const

type TabsTriggerProps = {
  value: string
  className?: string
  indicatorClassName?: string
  wrapperClassName?: string
  children: ReactNode
}

export const TabsTrigger = ({
  value,
  className,
  indicatorClassName,
  wrapperClassName,
  children,
}: TabsTriggerProps) => {
  const { value: current, setValue, baseId } = useTabs()
  const reduce = useReducedMotion()
  const active = current === value

  return (
    <div className={cn('relative', wrapperClassName)}>
      {active ? (
        <motion.span
          layoutId={`${baseId}-indicator`}
          layout="position"
          transition={reduce ? { duration: 0 } : INDICATOR_SPRING}
          className={cn('absolute inset-0 rounded-md bg-accent', indicatorClassName)}
        />
      ) : null}
      <button
        type="button"
        role="tab"
        id={tabTriggerId(baseId, value)}
        aria-selected={active}
        aria-controls={tabPanelId(baseId, value)}
        onClick={() => setValue(value)}
        className={cn(
          'relative z-10 inline-flex w-full items-center gap-3 rounded-md bg-transparent px-3 text-left text-dense whitespace-nowrap transition-colors',
          active
            ? 'font-medium text-accent-foreground'
            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
          className,
        )}
      >
        {children}
      </button>
    </div>
  )
}
