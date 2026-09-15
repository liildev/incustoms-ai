import { z } from 'zod'
import { checkFieldValue } from './check-spec'

/**
 * Form schema for one specification field. Only values that cannot be read as the field type
 * (number, date) are rejected; length and precision deviations are warnings (see check-spec.ts).
 * Values are checked trimmed, and writers store them trimmed.
 */
export const specValueSchema = (tag: string) =>
  z.string().superRefine((value, context) => {
    for (const issue of checkFieldValue(tag, value.trim())) {
      if (issue.severity === 'error') context.addIssue({ code: 'custom', message: issue.message })
    }
  })

/** Non-blocking specification remarks for a field value. */
export const getSpecWarnings = (tag: string, value: string): string[] =>
  checkFieldValue(tag, value.trim())
    .filter((issue) => issue.severity === 'warning')
    .map((issue) => issue.message)
