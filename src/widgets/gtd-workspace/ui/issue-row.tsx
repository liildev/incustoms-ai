import { CircleAlert, TriangleAlert } from 'lucide-react'
import { getSpec, type GtdBlock } from '@/entities/gtd'
import { Badge } from '@/shared/ui'
import { describePath } from '../lib/describe-path'
import type { IssueGroup } from '../lib/group-issues'

const SOURCE_LABELS = {
  spec: 'Спецификация',
  domain: 'Согласованность',
  import: 'Чтение файла',
} as const

const MAX_LOCATIONS = 3

export const IssueRow = ({ group, root }: { group: IssueGroup; root: GtdBlock }) => {
  const locations = group.paths.map((path) => describePath(root, path))
  const hidden = locations.length - MAX_LOCATIONS

  return (
    <li className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span
        className={group.severity === 'error' ? 'mt-0.5 text-destructive' : 'mt-0.5 text-warning'}
      >
        {group.severity === 'error' ? (
          <CircleAlert aria-label="Ошибка" className="size-4" />
        ) : (
          <TriangleAlert aria-label="Предупреждение" className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-dense text-foreground">
          <span className="mr-2 font-mono text-[12px] font-medium">{group.tag}</span>
          {group.message}
        </p>
        {getSpec(group.tag) ? (
          <p className="mt-0.5 text-2xs text-subtle-foreground">{getSpec(group.tag)?.label}</p>
        ) : null}
        <p className="mt-1 text-2xs text-muted-foreground">
          {locations.slice(0, MAX_LOCATIONS).join('; ')}
          {hidden > 0 ? ` и ещё ${hidden}` : ''}
        </p>
      </div>
      <Badge className="self-start">{SOURCE_LABELS[group.source]}</Badge>
    </li>
  )
}
