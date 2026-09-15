import { useFormContext, useWatch } from 'react-hook-form'
import { formatAmount } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import { TABLE } from '@/shared/ui'
import { SCHEDULE_COLUMNS } from '../config/columns'
import { totalOf, type ScheduleForm } from '../model/schedule-form'

export const ScheduleTotals = () => {
  const { control } = useFormContext<ScheduleForm>()
  const rows = useWatch({ control, name: 'rows' }) ?? []

  return (
    <tr className="bg-surface-muted font-medium">
      {SCHEDULE_COLUMNS.map((column, index) => (
        <td
          key={column.key}
          className={cn(TABLE.cell, column.kind === 'amount' && TABLE.numeric, 'px-5')}
        >
          {index === 0
            ? 'Итого'
            : column.kind === 'amount'
              ? formatAmount(totalOf(rows, column.key))
              : null}
        </td>
      ))}
      <td className={TABLE.cell} />
    </tr>
  )
}
