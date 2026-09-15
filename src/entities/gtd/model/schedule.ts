import { z } from 'zod'
import { SCHEDULE_ROW_TAG, SCHEDULE_TAG } from '../config/export-limits'
import { getSpec } from '../config/spec'
import { createBlock, patchChangedFields, replaceChildBlocks } from './block'
import type { GtdBlock } from './gtd'
import { specValueSchema } from './spec-value'

export { SCHEDULE_ROW_TAG, SCHEDULE_TAG }

/**
 * Maximum number of T53 sections in T1 and of T54 sections in a T53, as stated by the specification
 * ([0..1] each). Repeated sections are read without data loss, but the editor does not create more
 * and export refuses them (see config/export-limits.ts).
 */
export const SCHEDULE_LIMIT = getSpec(SCHEDULE_TAG)?.gtd?.max ?? 1
export const SCHEDULE_ROW_LIMIT = getSpec(SCHEDULE_ROW_TAG)?.gtd?.max ?? 1

export const SCHEDULE_HEADER_FIELDS = {
  previousPost: 'P3T53',
  previousDate: 'P4T53',
  previousNumber: 'P5T53',
  paymentTerms: 'P6T53',
} as const

export const SCHEDULE_ROW_FIELDS = {
  index: 'P2T54',
  invoiceValue: 'P3T54',
  paymentDate: 'P4T54',
  customsDuty: 'P5T54',
  excise: 'P6T54',
  vat: 'P7T54',
  /** Introduced in the 2026 format; optional. */
  additionalDuty: 'P8T54',
} as const

type HeaderKey = keyof typeof SCHEDULE_HEADER_FIELDS
type RowKey = keyof typeof SCHEDULE_ROW_FIELDS

const fieldSchemas = <K extends string>(fields: Record<K, string>) =>
  Object.fromEntries(
    Object.entries<string>(fields).map(([key, tag]) => [key, specValueSchema(tag)]),
  ) as Record<K, ReturnType<typeof specValueSchema>>

export const scheduleHeaderSchema = z.object(fieldSchemas<HeaderKey>(SCHEDULE_HEADER_FIELDS))

export const scheduleRowSchema = z.object({
  ...fieldSchemas<RowKey>(SCHEDULE_ROW_FIELDS),
  /** Index of the T54 section the row was read from; absent for new rows. */
  source: z.number().int().nonnegative().optional(),
})

export type ScheduleHeader = z.infer<typeof scheduleHeaderSchema>
export type ScheduleRow = z.infer<typeof scheduleRowSchema>
export type Schedule = { header: ScheduleHeader; rows: ScheduleRow[] }

const readFields = <K extends string>(block: GtdBlock, map: Record<K, string>): Record<K, string> =>
  Object.fromEntries(
    Object.entries<string>(map).map(([key, tag]) => [key, block.fields[tag] ?? '']),
  ) as Record<K, string>

const byTag = <K extends string>(
  values: Record<K, string>,
  map: Record<K, string>,
): Record<string, string> =>
  Object.fromEntries(
    (Object.entries(map) as Array<[K, string]>).map(([key, tag]) => [tag, values[key]]),
  )

const rowBlocks = (schedule: GtdBlock): GtdBlock[] =>
  schedule.blocks.filter((block) => block.tag === SCHEDULE_ROW_TAG)

export const readSchedule = (schedule: GtdBlock): Schedule => ({
  header: readFields(schedule, SCHEDULE_HEADER_FIELDS),
  rows: rowBlocks(schedule).map((row, source) => ({
    ...readFields(row, SCHEDULE_ROW_FIELDS),
    source,
  })),
})

/**
 * Writes the schedule back into a T53 section, T54 sections in the given order. A row with `source`
 * patches the T54 it was read from, so unmodeled fields stay with it after removals.
 * Only changed values are written (trimmed; an emptied value removes the field, so a cleared P8T54 is omitted).
 */
export const writeSchedule = (schedule: GtdBlock, { header, rows }: Schedule): GtdBlock => {
  const existing = rowBlocks(schedule)
  const nextRows = rows.map((row) =>
    patchChangedFields(
      (row.source === undefined ? undefined : existing[row.source]) ??
        createBlock(SCHEDULE_ROW_TAG),
      byTag<RowKey>(row, SCHEDULE_ROW_FIELDS),
    ),
  )
  return replaceChildBlocks(
    patchChangedFields(schedule, byTag(header, SCHEDULE_HEADER_FIELDS)),
    SCHEDULE_ROW_TAG,
    nextRows,
  )
}

export const createScheduleBlock = (): GtdBlock => createBlock(SCHEDULE_TAG)

/**
 * Repairs repeated T53: keeps the T53 with the given position among the T53 sections of `main`
 * and removes the others. The kept section is not rewritten, so its attributes, unknown fields
 * and nested T54 stay exactly as read, and it keeps its place among the other sections.
 */
export const keepSchedule = (main: GtdBlock, position: number): GtdBlock => {
  const count = main.blocks.filter((block) => block.tag === SCHEDULE_TAG).length
  if (!Number.isInteger(position) || position < 0 || position >= count) {
    throw new RangeError(`No ${SCHEDULE_TAG} at position ${position}; ${count} present`)
  }
  let seen = -1
  return {
    ...main,
    blocks: main.blocks.filter((block) => block.tag !== SCHEDULE_TAG || ++seen === position),
  }
}
