import { z } from 'zod'
import {
  imeiRecordSchema,
  readImeiRecords,
  sequenceKey,
  writeImeiRecords,
  type GtdBlock,
  type ImeiRecord,
} from '@/entities/gtd'

export const imeiFormSchema = z.object({ records: z.array(imeiRecordSchema) })

export type ImeiForm = z.infer<typeof imeiFormSchema>

/**
 * Form values after a save: records re-read from the written T21 sections. Before the save, `source`
 * points at positions in the old section list; reusing those values would make the next save patch
 * the wrong T21 (moving its unmodeled fields to another record) once a record was removed or inserted.
 */
export const savedImeiForm = (description: GtdBlock, values: ImeiForm): ImeiForm => ({
  records: readImeiRecords(writeImeiRecords(description, values.records)),
})

const toNumber = (value: string): number | null =>
  /^\d+$/.test(value.trim()) ? Number(value) : null

const sameDevice = (a: string, b: string): boolean => sequenceKey(a) === sequenceKey(b)

const maxNumber = (values: readonly string[]): number =>
  values.reduce((max, value) => Math.max(max, toNumber(value) ?? 0), 0)

export const createDeviceRecord = (records: readonly ImeiRecord[]): ImeiRecord => ({
  device: String(maxNumber(records.map((record) => record.device)) + 1),
  slot: '1',
  code: '',
})

/** A record for the next SIM slot of `device`, and the index right after that device's last record. */
export const createSlotRecord = (
  records: readonly ImeiRecord[],
  device: string,
): { record: ImeiRecord; index: number } => {
  const own = records.filter((record) => sameDevice(record.device, device))
  const lastIndex = records.findLastIndex((record) => sameDevice(record.device, device))
  return {
    record: { device, slot: String(maxNumber(own.map((record) => record.slot)) + 1), code: '' },
    index: lastIndex === -1 ? records.length : lastIndex + 1,
  }
}
