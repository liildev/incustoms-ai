import { useEffect } from 'react'

/**
 * Asks the browser to confirm reloading, closing the tab or leaving the site while `active`.
 * In-app route changes keep the editor mounted (see app/routes), so they do not need this prompt.
 */
export const useLeaveWarning = (active: boolean): void => {
  useEffect(() => {
    if (!active) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Legacy browsers show the prompt only when returnValue is set.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [active])
}
