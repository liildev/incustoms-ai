import { updateBlockAt } from './block'
import type { BlockPath, GtdBlock, GtdDocument } from './gtd'
import type { GtdIssue } from './issue'

export type ReadySession = {
  status: 'ready'
  /** Increments with every loaded file, including a reload of the same file name. */
  loadId: number
  fileName: string
  document: GtdDocument
  /** Findings produced while reading the file. */
  notices: GtdIssue[]
  /** The document differs from the loaded file or the last export. */
  modified: boolean
  /** The document was exported at least once since it was loaded. */
  exported: boolean
  /** Ids of editors that hold unsaved form changes. */
  drafts: string[]
}

export type GtdSession = { status: 'empty' } | ReadySession

export type SessionAction =
  | { type: 'loaded'; fileName: string; document: GtdDocument; notices: GtdIssue[] }
  | { type: 'updated'; path: BlockPath; update: (block: GtdBlock) => GtdBlock }
  | { type: 'exported' }
  | { type: 'draft'; id: string; dirty: boolean }

export const initialSession: GtdSession = { status: 'empty' }

export const sessionReducer = (session: GtdSession, action: SessionAction): GtdSession => {
  if (action.type === 'loaded') {
    return {
      status: 'ready',
      loadId: session.status === 'ready' ? session.loadId + 1 : 1,
      fileName: action.fileName,
      document: action.document,
      notices: action.notices,
      modified: false,
      exported: false,
      drafts: [],
    }
  }
  if (session.status !== 'ready') return session

  switch (action.type) {
    case 'updated': {
      const root = updateBlockAt(session.document.root, action.path, action.update)
      return { ...session, document: { root }, modified: true }
    }
    case 'exported':
      return { ...session, modified: false, exported: true }
    case 'draft': {
      if (session.drafts.includes(action.id) === action.dirty) return session
      const others = session.drafts.filter((id) => id !== action.id)
      return { ...session, drafts: action.dirty ? [...others, action.id] : others }
    }
  }
}
