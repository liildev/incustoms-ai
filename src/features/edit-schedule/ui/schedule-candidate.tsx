import { useId } from 'react'
import { SCHEDULE_ROW_TAG, SCHEDULE_TAG, type GtdBlock } from '@/entities/gtd'
import { Button } from '@/shared/ui'
import { summarizeSchedule } from '../model/schedule-summary'
import { SummaryFields } from './summary-fields'

type ScheduleCandidateProps = {
  schedule: GtdBlock
  /** Position among the repeated T53 sections, starting at 0. */
  position: number
  onKeep: () => void
}

/** One of several T53 sections, shown in full so the user can decide which one to keep. */
export const ScheduleCandidate = ({ schedule, position, onKeep }: ScheduleCandidateProps) => {
  const { fields, rows, otherSections } = summarizeSchedule(schedule)
  const attributes = Object.entries(schedule.attributes)
  const titleId = useId()

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={titleId} className="text-dense font-semibold text-foreground">
          {SCHEDULE_TAG} № {position + 1}
        </h3>
        <span className="text-2xs text-subtle-foreground">
          {SCHEDULE_ROW_TAG}: {rows.length}
          {otherSections.length > 0 ? `, другие разделы: ${otherSections.join(', ')}` : ''}
          {attributes.length > 0
            ? `, атрибуты: ${attributes.map(([name, value]) => `${name}="${value}"`).join(' ')}`
            : ''}
        </span>
        <Button size="sm" className="ml-auto" aria-describedby={titleId} onClick={onKeep}>
          Оставить этот раздел
        </Button>
      </div>
      <SummaryFields fields={fields} />
      {rows.map((row, index) => (
        <section key={index} className="flex flex-col gap-1 border-l-2 border-border pl-3">
          <h4 className="text-2xs font-medium text-muted-foreground">
            {SCHEDULE_ROW_TAG} № {index + 1}
          </h4>
          <SummaryFields fields={row} />
        </section>
      ))}
    </li>
  )
}
