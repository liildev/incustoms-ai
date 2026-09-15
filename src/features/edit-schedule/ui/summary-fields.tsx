import type { SummaryField } from '../model/schedule-summary'

/** Read-only tag / label / value rows; values outside the specification are marked. */
export const SummaryFields = ({ fields }: { fields: readonly SummaryField[] }) =>
  fields.length === 0 ? (
    <p className="text-2xs text-subtle-foreground">Поля не заполнены.</p>
  ) : (
    <dl className="grid grid-cols-[minmax(4.5rem,auto)_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-2xs">
      {fields.map(({ tag, label, value }) => (
        <div key={tag} className="contents">
          <dt className="font-mono text-muted-foreground" title={label ?? undefined}>
            {tag}
          </dt>
          <dd className="wrap-break-word text-foreground">
            {value === '' ? <span className="text-subtle-foreground">пусто</span> : value}
            {label === null ? <span className="ml-2 text-warning">вне спецификации</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
