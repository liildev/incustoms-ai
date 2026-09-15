import { getSpec, SCHEDULE_ROW_TAG, type GtdBlock } from '@/entities/gtd'

export type SummaryField = { tag: string; label: string | null; value: string }

export type ScheduleSummary = {
  /** Every field of the T53, in document order, including fields outside the specification. */
  fields: SummaryField[]
  /** Fields of each T54, in document order. */
  rows: SummaryField[][]
  /** Tags of nested sections other than T54, e.g. sections outside the specification. */
  otherSections: string[]
}

const toFields = (block: GtdBlock): SummaryField[] =>
  Object.entries(block.fields).map(([tag, value]) => ({
    tag,
    label: getSpec(tag)?.label ?? null,
    value,
  }))

/** Everything needed to tell repeated T53 sections apart before choosing the one to keep. */
export const summarizeSchedule = (schedule: GtdBlock): ScheduleSummary => ({
  fields: toFields(schedule),
  rows: schedule.blocks.filter((block) => block.tag === SCHEDULE_ROW_TAG).map(toFields),
  otherSections: schedule.blocks
    .filter((block) => block.tag !== SCHEDULE_ROW_TAG)
    .map((block) => block.tag),
})
