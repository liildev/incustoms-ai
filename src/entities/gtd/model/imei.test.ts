import { describe, expect, it } from 'vitest'
import { parseGtd } from '../lib/parse-gtd'
import { serializeGtd } from '../lib/serialize-gtd'
import { descriptionXml, gtdXml, imeiXml } from '../test/gtd-fixture'
import { childBlocks, updateBlockAt } from './block'
import type { GtdDocument } from './gtd'
import { listGoods } from './goods'
import {
  findDuplicateSlots,
  groupImeiByDevice,
  imeiRecordSchema,
  readImeiRecords,
  writeImeiRecords,
  type ImeiRecord,
} from './imei'
import { getSpecWarnings } from './spec-value'

const IMEI_A = '356938035643809'
const IMEI_B = '356938035643817'
const IMEI_C = '490154203237518'

const load = (descriptionInner: string): GtdDocument => {
  const result = parseGtd(gtdXml({ goods: [descriptionXml(descriptionInner)] }))
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

const firstDescription = (document: GtdDocument) => {
  const [good] = listGoods(document)
  const [description] = good ? childBlocks(good, 'T7') : []
  if (!description) throw new Error('T7 expected')
  return description
}

const withoutSource = (records: readonly ImeiRecord[]) =>
  records.map(({ source: _source, ...record }) => record)

describe('IMEI records (T21)', () => {
  it('returns no records for a description without T21', () => {
    expect(readImeiRecords(firstDescription(load('')).block)).toEqual([])
  })

  it('reads one device with one SIM slot', () => {
    const records = readImeiRecords(firstDescription(load(imeiXml(1, 1, IMEI_A))).block)
    expect(records).toEqual([{ device: '1', slot: '1', code: IMEI_A, source: 0 }])
    expect(groupImeiByDevice(records)).toEqual([{ device: '1', slots: records }])
  })

  it('reads one device with two SIM slots as two records of the same device', () => {
    const records = readImeiRecords(
      firstDescription(load(imeiXml(1, 1, IMEI_A) + imeiXml(1, 2, IMEI_B))).block,
    )
    expect(groupImeiByDevice(records)).toEqual([
      {
        device: '1',
        slots: [
          { device: '1', slot: '1', code: IMEI_A, source: 0 },
          { device: '1', slot: '2', code: IMEI_B, source: 1 },
        ],
      },
    ])
  })

  it('groups multiple devices with multiple slots', () => {
    const xml = imeiXml(1, 1, IMEI_A) + imeiXml(2, 1, IMEI_C) + imeiXml(1, 2, IMEI_B)
    const groups = groupImeiByDevice(readImeiRecords(firstDescription(load(xml)).block))
    expect(groups.map(({ device, slots }) => [device, slots.map((slot) => slot.slot)])).toEqual([
      ['1', ['1', '2']],
      ['2', ['1']],
    ])
  })

  it('writes new records and survives serialization', () => {
    const document = load('')
    const description = firstDescription(document)
    const records = [
      { device: '1', slot: '1', code: IMEI_A },
      { device: '1', slot: '2', code: IMEI_B },
      { device: '2', slot: '1', code: IMEI_C },
    ]
    const root = updateBlockAt(document.root, description.path, (block) =>
      writeImeiRecords(block, records),
    )
    const reparsed = parseGtd(serializeGtd({ root }))
    if (!reparsed.ok) throw new Error(reparsed.errors.join('\n'))
    expect(withoutSource(readImeiRecords(firstDescription(reparsed.document).block))).toEqual(
      records,
    )
  })

  it('keeps unmodeled fields with their record when an earlier record is removed', () => {
    const xml = `<T21><P3T21>1</P3T21><P9T21>first</P9T21></T21>${imeiXml(1, 2, IMEI_B)}<T21><P3T21>2</P3T21><P9T21>third</P9T21></T21>`
    const description = firstDescription(load(xml))
    const [, second, third] = readImeiRecords(description.block)
    if (!second || !third) throw new Error('records expected')
    const next = writeImeiRecords(description.block, [second, { ...third, code: IMEI_C }])
    expect(next.blocks.map((block) => block.fields)).toEqual([
      { P3T21: '1', P4T21: '2', P5T21: IMEI_B },
      { P3T21: '2', P5T21: IMEI_C, P9T21: 'third' },
    ])
  })

  it('saves untouched records exactly as read and trims only changed values', () => {
    const xml = `<T21><P3T21> 01 </P3T21><P4T21>1</P4T21><P5T21/></T21>${imeiXml(1, 2, IMEI_B)}`
    const description = firstDescription(load(xml))
    const [first, second] = readImeiRecords(description.block)
    if (!first || !second) throw new Error('records expected')
    const next = writeImeiRecords(description.block, [first, { ...second, code: ` ${IMEI_C} ` }])
    expect(next.blocks.map((block) => block.fields)).toEqual([
      { P3T21: ' 01 ', P4T21: '1', P5T21: '' },
      { P3T21: '1', P4T21: '2', P5T21: IMEI_C },
    ])
  })

  it('treats "01" and "1" as the same device and slot', () => {
    const records = [
      { device: '1', slot: '1', code: IMEI_A },
      { device: '01', slot: '001', code: IMEI_B },
    ]
    expect(findDuplicateSlots(records)).toEqual(['1:1'])
    expect(groupImeiByDevice(records)).toHaveLength(1)
  })

  it('compares long sequence numbers exactly instead of through floating point', () => {
    const records = [
      { device: '9007199254740993', slot: '1', code: IMEI_A },
      { device: '9007199254740992', slot: '1', code: IMEI_B },
    ]
    expect(findDuplicateSlots(records)).toEqual([])
    expect(groupImeiByDevice(records)).toHaveLength(2)
  })

  it('rejects only values that are not numbers; length deviations are warnings', () => {
    expect(imeiRecordSchema.safeParse({ device: '1', slot: '2', code: IMEI_A }).success).toBe(true)
    expect(imeiRecordSchema.safeParse({ device: 'A', slot: '2', code: IMEI_A }).success).toBe(false)
    expect(imeiRecordSchema.safeParse({ device: '', slot: '', code: '' }).success).toBe(true)
    expect(
      imeiRecordSchema.safeParse({ device: '1', slot: '1', code: 'x'.repeat(41) }).success,
    ).toBe(true)
    expect(getSpecWarnings('P5T21', 'x'.repeat(41))).toEqual([
      'Длина 41 превышает допустимые 40 символов.',
    ])
  })
})
