import { Trash2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  readSchedule,
  SCHEDULE_TAG,
  replaceChildBlocks,
  useDraft,
  useGtdSession,
  writeSchedule,
  type LocatedBlock,
} from '@/entities/gtd'
import { Button, Collapsible, Dialog, FormActions } from '@/shared/ui'
import {
  savedScheduleForm,
  scheduleFormSchema,
  type ScheduleForm as ScheduleFormValues,
} from '../model/schedule-form'
import { ScheduleHeaderFields } from './schedule-header-fields'
import { ScheduleRows } from './schedule-rows'

type ScheduleFormProps = { main: LocatedBlock; schedule: LocatedBlock }

export const ScheduleForm = ({ main, schedule }: ScheduleFormProps) => {
  const { update } = useGtdSession()
  const [removing, setRemoving] = useState(false)
  const formId = `schedule-${schedule.path.join('-')}`
  const initial: ScheduleFormValues = readSchedule(schedule.block)

  const form = useForm<ScheduleFormValues>({
    defaultValues: initial,
    resolver: zodResolver(scheduleFormSchema),
    mode: 'onChange',
  })
  const { isDirty, errors } = form.formState
  useDraft(formId, isDirty)

  const save = (values: ScheduleFormValues) => {
    update(schedule.path, (block) => writeSchedule(block, values))
    form.reset(savedScheduleForm(schedule.block, values))
  }

  const removeSchedule = () => {
    setRemoving(false)
    update(main.path, (block) => replaceChildBlocks(block, SCHEDULE_TAG, []))
  }

  const errorCount =
    Object.keys(errors.header ?? {}).length +
    (Array.isArray(errors.rows) ? errors.rows.filter(Boolean).length : 0)

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit(save)}
        className="overflow-clip rounded-lg border border-border bg-surface"
      >
        <Collapsible title="Общие данные по ГУПТП (T53)">
          <ScheduleHeaderFields formId={formId} />
        </Collapsible>
        <Collapsible title="Детализация по ГУПТП (T54)">
          <div className="flex flex-col gap-3">
            <ScheduleRows />
            <div className="flex">
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setRemoving(true)}
              >
                <Trash2 aria-hidden />
                Удалить ГУПТП
              </Button>
            </div>
          </div>
        </Collapsible>
        <FormActions dirty={isDirty} errorCount={errorCount} onReset={() => form.reset(initial)} />
      </form>
      <Dialog
        open={removing}
        title="Удалить ГУПТП из декларации?"
        description="Разделы T53 и T54 будут удалены. Действие можно отменить, открыв исходный файл заново."
        onClose={() => setRemoving(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setRemoving(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={removeSchedule}>
              Удалить
            </Button>
          </>
        }
      />
    </FormProvider>
  )
}
