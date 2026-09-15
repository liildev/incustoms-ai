import { Plus } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence } from 'motion/react'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import {
  findDuplicateSlots,
  readImeiRecords,
  sequenceKey,
  slotKey,
  useDraft,
  useGtdSession,
  writeImeiRecords,
  type LocatedBlock,
} from '@/entities/gtd'
import { Button, FormActions, TABLE } from '@/shared/ui'
import {
  createDeviceRecord,
  createSlotRecord,
  imeiFormSchema,
  savedImeiForm,
  type ImeiForm,
} from '../model/imei-form'
import { ImeiRow } from './imei-row'

/** Editor of T21 records (device → SIM slot → IMEI) for one goods description section (T7). */
export const ImeiEditor = ({ description }: { description: LocatedBlock }) => {
  const { update } = useGtdSession()
  const formId = `imei-${description.path.join('-')}`
  const initial: ImeiForm = { records: readImeiRecords(description.block) }

  const form = useForm<ImeiForm>({
    defaultValues: initial,
    resolver: zodResolver(imeiFormSchema),
    mode: 'onChange',
  })
  const { fields, append, insert, remove } = useFieldArray({
    control: form.control,
    name: 'records',
  })
  const records = useWatch({ control: form.control, name: 'records' }) ?? []
  const duplicates = new Set(findDuplicateSlots(records))
  const { isDirty, errors } = form.formState
  useDraft(formId, isDirty)

  const save = (values: ImeiForm) => {
    update(description.path, (block) => writeImeiRecords(block, values.records))
    form.reset(savedImeiForm(description.block, values))
  }

  const addSlot = (device: string) => {
    const { record, index } = createSlotRecord(records, device)
    insert(index, record)
  }

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit(save)}
        className="flex flex-col gap-3"
      >
        {fields.length > 0 ? (
          <div className={TABLE.wrapper}>
            <table className={TABLE.table}>
              <thead>
                <tr>
                  <th className={TABLE.headCell}>Устройство</th>
                  <th className={TABLE.headCell}>Слот SIM</th>
                  <th className={TABLE.headCell}>IMEI код</th>
                  <th className={TABLE.headCell}>
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {fields.map((field, index) => (
                    <ImeiRow
                      key={field.id}
                      index={index}
                      groupStart={
                        index === 0 ||
                        sequenceKey(records[index - 1]?.device ?? '') !==
                          sequenceKey(records[index]?.device ?? '')
                      }
                      duplicate={records[index] ? duplicates.has(slotKey(records[index])) : false}
                      onAddSlot={() => addSlot(records[index]?.device ?? '')}
                      onRemove={() => remove(index)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-dense text-subtle-foreground">IMEI для этой позиции не указаны.</p>
        )}
        <div>
          <Button size="sm" onClick={() => append(createDeviceRecord(records))}>
            <Plus aria-hidden />
            Добавить устройство
          </Button>
        </div>
        <FormActions
          dirty={isDirty}
          errorCount={Array.isArray(errors.records) ? errors.records.filter(Boolean).length : 0}
          onReset={() => form.reset(initial)}
        />
      </form>
    </FormProvider>
  )
}
