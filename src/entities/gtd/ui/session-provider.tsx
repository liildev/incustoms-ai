import { useReducer, useState, type ReactNode } from 'react'
import { checkDomain } from '../model/check-domain'
import { checkSpec } from '../model/check-spec'
import { initialSession, sessionReducer } from '../model/session'
import { createSessionActions } from '../model/session-actions'
import { GtdSessionContext } from '../model/session-context'

export const GtdSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, dispatch] = useReducer(sessionReducer, initialSession)
  // Lazy state keeps action identities stable without relying on compiler memoization;
  // useDraft effects depend on that stability.
  const [actions] = useState(() => createSessionActions(dispatch))

  const issues =
    session.status === 'ready'
      ? [...session.notices, ...checkSpec(session.document.root), ...checkDomain(session.document)]
      : []

  return <GtdSessionContext value={{ session, issues, ...actions }}>{children}</GtdSessionContext>
}
