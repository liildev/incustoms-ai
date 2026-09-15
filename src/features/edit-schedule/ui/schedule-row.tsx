import { Trash2 } from 'lucide-react'
import { motion, useIsPresent } from 'motion/react'
import { useFormContext, useWatch } from 'react-hook-form'
import { getSpecWarnings, SCHEDULE_ROW_FIELDS } from '@/entities/gtd'
import { FADE } from '@/shared/lib/ease'
import { cn } from '@/shared/lib/cn'
import { usePresentRegister } from '@/shared/lib/form/use-present-register'
import { Button, FieldMessage, Input, TABLE } from '@/shared/ui'
import { SCHEDULE_COLUMNS } from '../config/columns'
import type { ScheduleForm } from '../model/schedule-form'

export const ScheduleRow = ({ index, onRemove }: { index: number; onRemove: () => void }) => {
  const { register, formState, control } = useFormContext<ScheduleForm>()
  const bind = usePresentRegister(register)
  // An exiting row keeps its old index while it fades; a second click on it would remove the row that moved up.
  const present = useIsPresent()
  const errors = formState.errors.rows?.[index]
  const row = useWatch({ control, name: `rows.${index}` })

  return (
    <motion.tr
      inert={!present}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
    >
      {SCHEDULE_COLUMNS.map((column) => (
        <td
          key={column.key}
          className={cn(
            TABLE.cell,
            column.kind === 'index' ? 'w-16' : column.kind === 'date' ? 'w-36' : 'min-w-32',
          )}
        >
          <Input
            aria-label={`${column.title} (${SCHEDULE_ROW_FIELDS[column.key]}), строка ${index + 1}`}
            inputMode={column.kind === 'date' ? undefined : 'decimal'}
            placeholder={column.kind === 'date' ? 'ГГГГ-ММ-ДД' : undefined}
            error={Boolean(errors?.[column.key])}
            inputClassName={cn(column.kind === 'amount' && 'text-right')}
            {...bind(`rows.${index}.${column.key}`)}
          />
          <div className="mt-1">
            <FieldMessage
              id={`schedule-row-${index}-${column.key}-message`}
              error={errors?.[column.key]?.message}
              warnings={
                row ? getSpecWarnings(SCHEDULE_ROW_FIELDS[column.key], row[column.key]) : []
              }
            />
          </div>
        </td>
      ))}
      <td className={cn(TABLE.cell, 'w-px')}>
        <div className="flex h-8 items-center">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Удалить строку ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}
