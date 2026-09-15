import { createContext, use } from 'react'
import type { BlockPath, GtdBlock, GtdDocument } from './gtd'
import type { GtdIssue } from './issue'
import type { GtdSession } from './session'

export type GtdSessionValue = {
  session: GtdSession
  /** Notices from import plus current specification and consistency findings. */
  issues: GtdIssue[]
  load: (fileName: string, document: GtdDocument, notices: GtdIssue[]) => void
  update: (path: BlockPath, update: (block: GtdBlock) => GtdBlock) => void
  markExported: () => void
  setDraft: (id: string, dirty: boolean) => void
}

export const GtdSessionContext = createContext<GtdSessionValue | null>(null)

export const useGtdSession = (): GtdSessionValue => {
  const value = use(GtdSessionContext)
  if (!value) throw new Error('useGtdSession must be used inside GtdSessionProvider')
  return value
}
