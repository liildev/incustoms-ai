import { useFormContext, useWatch } from 'react-hook-form'
import { getSpec, getSpecWarnings, splitSpecLabel } from '@/entities/gtd'
import { cn } from '@/shared/lib/cn'
import { Input, Textarea } from '@/shared/ui'
import type { FieldValues } from '../model/fields-form'

const LONG_TEXT_LENGTH = 100

export const FieldControl = ({ tag, formId }: { tag: string; formId: string }) => {
  const { register, formState, control } = useFormContext<FieldValues>()
  const value = useWatch({ control, name: tag }) ?? ''
  const saved = formState.defaultValues?.[tag] ?? ''
  const spec = getSpec(tag)
  const { title } = splitSpecLabel(spec?.label ?? tag)
  // Decided by the saved value too: switching Textarea to Input while typing would drop focus.
  const multiline = saved.includes('\n') || value.includes('\n') || (spec?.length ?? 0) >= 254
  const wide = multiline || (spec?.length ?? 0) >= LONG_TEXT_LENGTH

  const fieldProps = {
    id: `${formId}-${tag}`,
    label: title,
    labelAside: tag,
    hint: spec?.label ?? null,
    markRequired: (spec?.gtd?.min ?? 0) > 0,
    error: formState.errors[tag]?.message,
    warnings: getSpecWarnings(tag, value),
    className: cn(wide && 'sm:col-span-2'),
    ...register(tag),
  }

  return multiline ? (
    <Textarea rows={Math.min(6, Math.max(2, value.split('\n').length))} {...fieldProps} />
  ) : (
    <Input
      inputMode={spec?.type === 'number' ? 'decimal' : undefined}
      placeholder={spec?.type === 'date' ? 'ГГГГ-ММ-ДД' : undefined}
      {...fieldProps}
    />
  )
}
