// beui.dev/components/motion/tabs — list
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

type TabsListProps = {
  label: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children: ReactNode
}

export const TabsList = ({ label, orientation, className, children }: TabsListProps) => (
  <div
    role="tablist"
    aria-label={label}
    aria-orientation={orientation}
    className={cn('flex gap-0.5', className)}
  >
    {children}
  </div>
)
