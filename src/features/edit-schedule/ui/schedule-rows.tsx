import { Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { SCHEDULE_ROW_FIELDS, SCHEDULE_ROW_LIMIT, SCHEDULE_ROW_TAG } from '@/entities/gtd'
import { cn } from '@/shared/lib/cn'
import { Button, TABLE } from '@/shared/ui'
import { SCHEDULE_COLUMNS } from '../config/columns'
import { createScheduleRow, type ScheduleForm } from '../model/schedule-form'
import { ScheduleRow } from './schedule-row'
import { ScheduleTotals } from './schedule-totals'

/** T54 sections of the schedule. The specification allows at most SCHEDULE_ROW_LIMIT of them. */
export const ScheduleRows = () => {
  const { control } = useFormContext<ScheduleForm>()
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' })
  const rows = useWatch({ control, name: 'rows' }) ?? []
  const overLimit = fields.length > SCHEDULE_ROW_LIMIT

  return (
    <div className="flex flex-col gap-3">
      {overLimit ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-dense text-destructive"
        >
          Файл содержит {fields.length} раздела {SCHEDULE_ROW_TAG}, спецификация допускает не более{' '}
          {SCHEDULE_ROW_LIMIT}. Данные показаны без потерь, но экспорт будет недоступен, пока лишние
          разделы не удалены и изменения не сохранены.
        </p>
      ) : null}
      {fields.length > 0 ? (
        <div className={TABLE.wrapper}>
          <table className={TABLE.table}>
            <thead>
              <tr>
                {SCHEDULE_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className={cn(TABLE.headCell, column.kind === 'amount' && 'text-right')}
                  >
                    <span className="block">{column.title}</span>
                    <span className="font-mono text-[10px] font-normal text-subtle-foreground">
                      {SCHEDULE_ROW_FIELDS[column.key]}
                    </span>
                  </th>
                ))}
                <th className={TABLE.headCell}>
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {fields.map((field, index) => (
                  <ScheduleRow key={field.id} index={index} onRemove={() => remove(index)} />
                ))}
              </AnimatePresence>
              {fields.length > 1 ? <ScheduleTotals /> : null}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-dense text-subtle-foreground">
          Детализация ({SCHEDULE_ROW_TAG}) не заполнена.
        </p>
      )}
      {fields.length < SCHEDULE_ROW_LIMIT ? (
        <div>
          <Button size="sm" onClick={() => append(createScheduleRow(rows))}>
            <Plus aria-hidden />
            Заполнить детализацию
          </Button>
        </div>
      ) : null}
    </div>
  )
}
