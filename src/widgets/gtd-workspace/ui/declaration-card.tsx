import { getMainBlock, type GtdDocument } from '@/entities/gtd'
import { formatDate } from '@/shared/lib/format'

/** Registration identity of the declaration: post, date and number (T1 P19, P20, P21). */
export const DeclarationCard = ({ document }: { document: GtdDocument }) => {
  const { fields } = getMainBlock(document).block
  const rows = [
    ['Пост', fields.P19T1],
    ['Дата', fields.P20T1 ? formatDate(fields.P20T1) : undefined],
    ['Номер', fields.P21T1],
  ] as const

  return (
    <div className="border-l-2 border-primary pl-3">
      <p className="text-2xs text-subtle-foreground">
        Декларация {fields.P3T1 ?? '—'}
        {fields.P4T1 ? `, режим ${fields.P4T1}` : ''}
      </p>
      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-2xs leading-5 text-subtle-foreground">{label}</dt>
            <dd className="text-sm font-medium tabular-nums text-foreground">{value || '—'}</dd>
          </div>
        ))}
      </dl>
      {fields.P22T1 ? (
        <p className="mt-2 line-clamp-2 text-2xs text-muted-foreground">{fields.P22T1}</p>
      ) : null}
    </div>
  )
}
