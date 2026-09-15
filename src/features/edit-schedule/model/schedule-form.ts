import { z } from 'zod'
import {
  readSchedule,
  scheduleHeaderSchema,
  scheduleRowSchema,
  writeSchedule,
  type GtdBlock,
  type ScheduleRow,
} from '@/entities/gtd'
import { sumDecimals } from '@/shared/lib/decimal'

export const scheduleFormSchema = z.object({
  header: scheduleHeaderSchema,
  rows: z.array(scheduleRowSchema),
})

export type ScheduleForm = z.infer<typeof scheduleFormSchema>

/**
 * Form values after a save, re-read from the written T53 section so that each row's `source`
 * matches the position of its T54 after rows were removed (see savedImeiForm for the failure mode).
 */
export const savedScheduleForm = (schedule: GtdBlock, values: ScheduleForm): ScheduleForm =>
  readSchedule(writeSchedule(schedule, values))

export type AmountKey = 'invoiceValue' | 'customsDuty' | 'excise' | 'vat' | 'additionalDuty'

export const createScheduleRow = (rows: readonly ScheduleRow[]): ScheduleRow => ({
  index: String(
    rows.reduce(
      (max, row) => (/^\d+$/.test(row.index) ? Math.max(max, Number(row.index)) : max),
      0,
    ) + 1,
  ),
  invoiceValue: '',
  paymentDate: '',
  customsDuty: '',
  excise: '',
  vat: '',
  additionalDuty: '',
})

export const totalOf = (rows: readonly ScheduleRow[], key: AmountKey): string =>
  sumDecimals(rows.map((row) => row[key].trim()))
