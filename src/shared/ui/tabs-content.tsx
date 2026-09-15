// beui.dev/components/motion/tabs — panel. Adapted: the panel element stays the same while
// inactive (hidden), so its content keeps state instead of remounting on activation.
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE_OUT } from '../lib/ease'
import { tabPanelId, tabTriggerId, useTabs } from './tabs-context'

type TabsContentProps = {
  value: string
  className?: string
  children: ReactNode
}

export const TabsContent = ({ value, className, children }: TabsContentProps) => {
  const { value: current, baseId } = useTabs()
  const reduce = useReducedMotion()
  const active = current === value

  return (
    <motion.div
      role="tabpanel"
      id={tabPanelId(baseId, value)}
      aria-labelledby={tabTriggerId(baseId, value)}
      hidden={!active}
      initial={{ opacity: 0, y: reduce ? 0 : 4 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 4 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
