import type { Dispatch } from 'react'
import type { SessionAction } from './session'
import type { GtdSessionValue } from './session-context'

export type SessionActions = Omit<GtdSessionValue, 'session' | 'issues'>

/** Action creators bound to a reducer dispatch; create once per provider so their identity is stable. */
export const createSessionActions = (dispatch: Dispatch<SessionAction>): SessionActions => ({
  load: (fileName, document, notices) => dispatch({ type: 'loaded', fileName, document, notices }),
  update: (path, update) => dispatch({ type: 'updated', path, update }),
  markExported: () => dispatch({ type: 'exported' }),
  setDraft: (id, dirty) => dispatch({ type: 'draft', id, dirty }),
})
