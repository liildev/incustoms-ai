import { Plus, Trash2 } from 'lucide-react'
import { motion, useIsPresent } from 'motion/react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FADE } from '@/shared/lib/ease'
import { cn } from '@/shared/lib/cn'
import { usePresentRegister } from '@/shared/lib/form/use-present-register'
import { Button, FieldMessage, Input, TABLE } from '@/shared/ui'
import type { ImeiForm } from '../model/imei-form'
import { getImeiWarnings } from '../model/imei-warnings'

type ImeiRowProps = {
  index: number
  /** First record of a device in a run of consecutive records. */
  groupStart: boolean
  /** The device/slot pair of this record occurs more than once. */
  duplicate: boolean
  onAddSlot: () => void
  onRemove: () => void
}

export const ImeiRow = ({ index, groupStart, duplicate, onAddSlot, onRemove }: ImeiRowProps) => {
  const { register, formState, control } = useFormContext<ImeiForm>()
  const bind = usePresentRegister(register)
  // An exiting row keeps its old index while it fades; a second click on it would remove the row that moved up.
  const present = useIsPresent()
  const record = useWatch({ control, name: `records.${index}` })
  const errors = formState.errors.records?.[index]
  const errorMessages = [
    errors?.device?.message,
    errors?.slot?.message,
    errors?.code?.message,
  ].filter(Boolean)
  const warnings = record ? getImeiWarnings(record, duplicate) : []

  return (
    <motion.tr
      inert={!present}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
      className={cn(groupStart && index > 0 && '[&>td]:border-t [&>td]:border-t-input')}
    >
      <td className={cn(TABLE.cell, 'w-28 min-w-20')}>
        <Input
          aria-label={`Порядковый номер устройства (P3T21), запись ${index + 1}`}
          inputMode="numeric"
          error={Boolean(errors?.device)}
          {...bind(`records.${index}.device`)}
        />
      </td>
      <td className={cn(TABLE.cell, 'w-28 min-w-20')}>
        <Input
          aria-label={`Порядковый номер слота (P4T21), запись ${index + 1}`}
          inputMode="numeric"
          error={Boolean(errors?.slot)}
          {...bind(`records.${index}.slot`)}
        />
      </td>
      <td className={cn(TABLE.cell, 'min-w-52')}>
        <Input
          aria-label={`IMEI код (P5T21), запись ${index + 1}`}
          inputClassName="font-mono"
          error={Boolean(errors?.code)}
          {...bind(`records.${index}.code`)}
        />
        <div className="mt-1">
          <FieldMessage
            id={`imei-record-${index}-message`}
            error={errorMessages.length > 0 ? errorMessages.join(' ') : undefined}
            warnings={warnings}
          />
        </div>
      </td>
      <td className={cn(TABLE.cell, 'w-px whitespace-nowrap')}>
        <div className="flex h-8 items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onAddSlot}>
            <Plus aria-hidden />
            Слот
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Удалить запись ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}
