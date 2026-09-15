// beui.dev/components/motion/tabs — root. Adapted: controlled only, and only the `list` look
// (the pill, segment and underline demo variants are not used here). The indicator spring is set on
// the indicator itself rather than through MotionConfig, so panel content keeps its own transitions.
import { motion } from 'motion/react'
import { type ReactNode, useId } from 'react'
import { TabsContext } from './tabs-context'

type TabsProps = {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: ReactNode
}

export const Tabs = ({ value, onValueChange, className, children }: TabsProps) => {
  const baseId = useId()

  return (
    <TabsContext value={{ value, setValue: onValueChange, baseId }}>
      <motion.div layoutRoot className={className}>
        {children}
      </motion.div>
    </TabsContext>
  )
}
