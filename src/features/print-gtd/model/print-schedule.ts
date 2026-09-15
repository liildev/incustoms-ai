import {
  getSpec,
  type GtdBlock,
  SCHEDULE_HEADER_FIELDS,
  SCHEDULE_ROW_FIELDS,
  SCHEDULE_ROW_TAG,
  SCHEDULE_TAG,
} from '@/entities/gtd'
import { graphDate, graphValue } from './graph-lines'
import type { LabelledValue, PrintSchedule } from './print-form'

/**
 * Fields in specification order with the specification's own labels; P8T54 reads «Дополнительная
 * таможенная пошлина (21)». Empty fields are listed too, so a blank value is visibly blank.
 */
const labelledValues = (block: GtdBlock, tags: readonly string[]): LabelledValue[] =>
  tags.map((tag) => {
    const spec = getSpec(tag)
    return {
      tag,
      label: spec?.label ?? tag,
      value: spec?.type === 'date' ? graphDate(block.fields, tag) : graphValue(block.fields, tag),
    }
  })

/**
 * ГУПТП of the declaration (T53 in T1, its T54). Documents with a repeated T53 or T54 are refused
 * before printing (see findExportBlockers), so at most one of each is present here.
 */
export const printSchedule = (main: GtdBlock): PrintSchedule | null => {
  const schedule = main.blocks.find((block) => block.tag === SCHEDULE_TAG)
  if (!schedule) return null
  return {
    header: labelledValues(schedule, Object.values(SCHEDULE_HEADER_FIELDS)),
    rows: schedule.blocks
      .filter((block) => block.tag === SCHEDULE_ROW_TAG)
      .map((row) => labelledValues(row, Object.values(SCHEDULE_ROW_FIELDS))),
  }
}
