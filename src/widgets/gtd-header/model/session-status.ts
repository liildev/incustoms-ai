import type { ReadySession } from '@/entities/gtd'
import type { BadgeStatus } from '@/shared/ui'

type SessionStatus = { key: string; label: string; status: BadgeStatus }

/**
 * Most urgent state first: form input not saved into the declaration, then saved changes not yet
 * exported to a file. "Saved" means committed to the in-memory declaration, never written to disk.
 */
export const getSessionStatus = ({ drafts, modified, exported }: ReadySession): SessionStatus => {
  if (drafts.length > 0)
    return { key: 'drafts', label: `Несохранённые правки: ${drafts.length}`, status: 'warning' }
  if (modified) return { key: 'modified', label: 'Изменён, не экспортирован', status: 'warning' }
  if (exported) return { key: 'exported', label: 'Экспортирован', status: 'success' }
  return { key: 'clean', label: 'Без изменений', status: 'neutral' }
}
