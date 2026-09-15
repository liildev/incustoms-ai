import { useEffect } from 'react'
import { useGtdSession } from './session-context'

/** Reports whether an editor holds unsaved changes, so export can warn about them. */
export const useDraft = (id: string, dirty: boolean): void => {
  const { setDraft } = useGtdSession()
  useEffect(() => {
    setDraft(id, dirty)
    return () => setDraft(id, false)
  }, [id, dirty, setDraft])
}
