import { z } from 'zod'
import { createBlock, patchChangedFields, replaceChildBlocks } from './block'
import type { GtdBlock } from './gtd'
import { specValueSchema } from './spec-value'

export const IMEI_TAG = 'T21'

export const IMEI_FIELDS = { device: 'P3T21', slot: 'P4T21', code: 'P5T21' } as const

/**
 * One T21 record: an IMEI code bound to a SIM slot of a device.
 * A device with two SIM slots is represented by two records with the same device number.
 * Specification: P3T21, P4T21 — number(4); P5T21 — text(40); all [0..1].
 */
export const imeiRecordSchema = z.object({
  device: specValueSchema(IMEI_FIELDS.device),
  slot: specValueSchema(IMEI_FIELDS.slot),
  code: specValueSchema(IMEI_FIELDS.code),
  /** Index of the T21 section the record was read from; absent for new records. */
  source: z.number().int().nonnegative().optional(),
})

export type ImeiRecord = z.infer<typeof imeiRecordSchema>

export type ImeiDevice = { device: string; slots: ImeiRecord[] }

/**
 * IMEI as defined by 3GPP TS 23.003: 15 digits. The GTD specification only limits P5T21
 * to 40 characters, so a non-standard value is a warning, not a format error.
 */
export const isStandardImei = (code: string): boolean => /^\d{15}$/.test(code)

/** "01" and "1" denote the same sequence number. Compared as text, so long values stay exact. */
export const sequenceKey = (value: string): string => {
  const trimmed = value.trim()
  return /^\d+$/.test(trimmed) ? trimmed.replace(/^0+(?=\d)/, '') : trimmed
}

export const slotKey = ({ device, slot }: Pick<ImeiRecord, 'device' | 'slot'>): string =>
  `${sequenceKey(device)}:${sequenceKey(slot)}`

const imeiBlocks = (description: GtdBlock): GtdBlock[] =>
  description.blocks.filter((block) => block.tag === IMEI_TAG)

/** Reads T21 records of a goods description section (T7). Absent fields become empty strings. */
export const readImeiRecords = (description: GtdBlock): ImeiRecord[] =>
  imeiBlocks(description).map((block, source) => ({
    device: block.fields[IMEI_FIELDS.device] ?? '',
    slot: block.fields[IMEI_FIELDS.slot] ?? '',
    code: block.fields[IMEI_FIELDS.code] ?? '',
    source,
  }))

/**
 * Writes records back as T21 sections of a goods description (T7), in the given order.
 * A record with `source` patches the T21 it was read from, so fields and attributes outside
 * P3–P5 stay with that record even after rows are inserted or removed. Only changed values are written
 * (trimmed; an emptied value removes the field).
 */
export const writeImeiRecords = (
  description: GtdBlock,
  records: readonly ImeiRecord[],
): GtdBlock => {
  const existing = imeiBlocks(description)
  const next = records.map((record) =>
    patchChangedFields(
      (record.source === undefined ? undefined : existing[record.source]) ?? createBlock(IMEI_TAG),
      {
        [IMEI_FIELDS.device]: record.device,
        [IMEI_FIELDS.slot]: record.slot,
        [IMEI_FIELDS.code]: record.code,
      },
    ),
  )
  return replaceChildBlocks(description, IMEI_TAG, next)
}

/** Groups records by device number, keeping first-appearance order of devices and slots. */
export const groupImeiByDevice = (records: readonly ImeiRecord[]): ImeiDevice[] => {
  const devices = new Map<string, ImeiDevice>()
  for (const record of records) {
    const key = sequenceKey(record.device)
    const group = devices.get(key)
    if (group) group.slots.push(record)
    else devices.set(key, { device: record.device, slots: [record] })
  }
  return [...devices.values()]
}

/**
 * Device/slot pairs that occur more than once, as normalized "device:slot" keys. Records without
 * a device and a slot number identify no slot, so they are not compared (their gaps are reported separately).
 */
export const findDuplicateSlots = (records: readonly ImeiRecord[]): string[] => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (record.device.trim() === '' && record.slot.trim() === '') continue
    const key = slotKey(record)
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  }
  return [...duplicates]
}
