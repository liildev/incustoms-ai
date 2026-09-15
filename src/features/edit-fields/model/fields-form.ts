import { z } from 'zod'
import { specValueSchema } from '@/entities/gtd'

export type FieldValues = Record<string, string>

/** Form schema for a set of section fields; blocking rules are defined by `specValueSchema`. */
export const createFieldsSchema = (tags: readonly string[]) =>
  z.object(Object.fromEntries(tags.map((tag) => [tag, specValueSchema(tag)])))

export const readFieldValues = (
  fields: Readonly<Record<string, string>>,
  tags: readonly string[],
): FieldValues => Object.fromEntries(tags.map((tag) => [tag, fields[tag] ?? '']))

/**
 * Converts form values into a patch of changed fields. Changed values are stored trimmed,
 * the same way they are validated; clearing a value removes the field from the section.
 * Untouched values are left exactly as they were in the file.
 */
export const toFieldPatch = (
  initial: FieldValues,
  values: FieldValues,
): Record<string, string | undefined> =>
  Object.fromEntries(
    Object.entries(values)
      .filter(([tag, value]) => value !== initial[tag])
      .map(([tag, value]) => [tag, value.trim() === '' ? undefined : value.trim()]),
  )
