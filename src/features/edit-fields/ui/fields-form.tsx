import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form'
import { patchFields, useDraft, useGtdSession, type LocatedBlock } from '@/entities/gtd'
import { Badge, Collapsible, FormActions } from '@/shared/ui'
import type { FieldGroup } from '../model/field-group'
import {
  createFieldsSchema,
  readFieldValues,
  toFieldPatch,
  type FieldValues,
} from '../model/fields-form'
import { FieldControl } from './field-control'

type FieldsFormProps = {
  /** Unique form id; also identifies the editor in the session's unsaved-changes list. */
  id: string
  section: LocatedBlock
  groups: readonly FieldGroup[]
}

/** Editable fields of one section, grouped; saves only changed values into the session. */
export const FieldsForm = ({ id: formId, section, groups }: FieldsFormProps) => {
  const { update } = useGtdSession()
  const tags = groups.flatMap((group) => group.tags)
  const initial = readFieldValues(section.block.fields, tags)

  const form = useForm<FieldValues>({
    defaultValues: initial,
    resolver: zodResolver(createFieldsSchema(tags)),
    mode: 'onChange',
    // Invalid fields may sit in collapsed (inert) groups; focus happens after they are expanded.
    shouldFocusError: false,
  })
  const { isDirty, errors, submitCount } = form.formState
  useDraft(formId, isDirty)

  const save = (values: FieldValues) => {
    const patch = toFieldPatch(initial, values)
    update(section.path, (block) => patchFields(block, patch))
    form.reset({
      ...values,
      ...Object.fromEntries(Object.entries(patch).map(([tag, value]) => [tag, value ?? ''])),
    })
  }

  const revealFirstError = (invalid: FieldErrors<FieldValues>) => {
    const first = tags.find((tag) => invalid[tag])
    if (first) requestAnimationFrame(() => form.setFocus(first))
  }

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit(save, revealFirstError)}
        className="overflow-clip rounded-lg border border-border bg-surface"
      >
        {groups.map((group) => {
          const filled = group.tags.filter((tag) => (section.block.fields[tag] ?? '') !== '').length
          return (
            <Collapsible
              key={group.title}
              title={group.title}
              meta={<Badge>{`${filled} из ${group.tags.length}`}</Badge>}
              forceOpen={submitCount > 0 && group.tags.some((tag) => errors[tag])}
            >
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
                {group.tags.map((tag) => (
                  <FieldControl key={tag} tag={tag} formId={formId} />
                ))}
              </div>
            </Collapsible>
          )
        })}
        <FormActions
          dirty={isDirty}
          errorCount={Object.keys(errors).length}
          onReset={() => form.reset(initial)}
        />
      </form>
    </FormProvider>
  )
}
