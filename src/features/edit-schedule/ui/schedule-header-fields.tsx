import { useFormContext, useWatch } from 'react-hook-form'
import {
  getSpec,
  getSpecWarnings,
  SCHEDULE_HEADER_FIELDS,
  type ScheduleHeader,
} from '@/entities/gtd'
import { Input } from '@/shared/ui'
import type { ScheduleForm } from '../model/schedule-form'

const KEYS = Object.keys(SCHEDULE_HEADER_FIELDS) as Array<keyof ScheduleHeader>

/** General data of the schedule (T53). */
export const ScheduleHeaderFields = ({ formId }: { formId: string }) => {
  const { register, formState, control } = useFormContext<ScheduleForm>()
  const header = useWatch({ control, name: 'header' })

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
      {KEYS.map((key) => {
        const tag = SCHEDULE_HEADER_FIELDS[key]
        const id = `${formId}-${tag}`
        const error = formState.errors.header?.[key]?.message
        return (
          <Input
            key={key}
            id={id}
            label={getSpec(tag)?.label ?? tag}
            labelAside={tag}
            error={error}
            warnings={header ? getSpecWarnings(tag, header[key]) : []}
            placeholder={key === 'previousDate' ? 'ГГГГ-ММ-ДД' : undefined}
            {...register(`header.${key}`)}
          />
        )
      })}
    </div>
  )
}
