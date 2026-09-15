// beui.dev/components/motion/tabs — shared state of a tabs group
import { createContext, use } from 'react'

export type TabsContextValue = {
  value: string
  setValue: (value: string) => void
  /** Prefix for trigger/panel ids and the shared indicator layoutId. */
  baseId: string
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export const useTabs = (): TabsContextValue => {
  const context = use(TabsContext)
  if (!context) throw new Error('Tabs.* must be used inside <Tabs>')
  return context
}

export const tabTriggerId = (baseId: string, value: string) => `${baseId}-tab-${value}`
export const tabPanelId = (baseId: string, value: string) => `${baseId}-panel-${value}`
