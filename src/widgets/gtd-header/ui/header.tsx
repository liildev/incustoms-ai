import { FileText } from 'lucide-react'
import type { ReadySession } from '@/entities/gtd'
import { ExportButton } from '@/features/export-gtd'
import { PrintButton } from '@/features/print-gtd'
import { OpenButton } from '@/features/upload-gtd'
import { Badge } from '@/shared/ui'
import { getSessionStatus } from '../model/session-status'

export const Header = ({ session }: { session: ReadySession }) => {
  const status = getSessionStatus(session)

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-surface px-4">
      <h1 className="sr-only text-dense font-semibold text-foreground md:not-sr-only md:shrink-0">
        Редактор ГТД
      </h1>
      <span className="hidden h-5 w-px shrink-0 bg-border md:inline" aria-hidden="true" />
      <span className="flex min-w-0 items-center gap-2 text-dense text-muted-foreground">
        <FileText aria-hidden className="size-4 shrink-0 text-subtle-foreground" />
        <span className="truncate" title={session.fileName}>
          {session.fileName}
        </span>
      </span>
      <span role="status" className="sr-only shrink-0 sm:not-sr-only sm:inline-flex">
        <Badge status={status.status} contentKey={status.key}>
          {status.label}
        </Badge>
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <OpenButton />
        <PrintButton />
        <ExportButton />
      </div>
    </header>
  )
}
