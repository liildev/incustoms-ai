import { describe, expect, it } from 'vitest'
import { parseGtd } from '../lib/parse-gtd'
import { exportGtd } from '../lib/export-gtd'
import { gtdXml } from '../test/gtd-fixture'
import { childBlocks, updateBlockAt } from './block'
import type { GtdDocument } from './gtd'
import { getMainBlock } from './goods'
import { readSchedule, scheduleRowSchema, writeSchedule, type ScheduleRow } from './schedule'
import { getSpecWarnings } from './spec-value'

const row = (index: string, extra = ''): string =>
  `<T54><P2T54>${index}</P2T54><P3T54>1000.5</P3T54><P4T54>2026-05-01</P4T54><P5T54>100</P5T54><P6T54>0</P6T54><P7T54>120.125</P7T54>${extra}</T54>`

const load = (scheduleXml: string): GtdDocument => {
  const result = parseGtd(gtdXml({ main: scheduleXml }))
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

const scheduleOf = (document: GtdDocument) => {
  const [schedule] = childBlocks(getMainBlock(document), 'T53')
  if (!schedule) throw new Error('T53 expected')
  return schedule
}

const emptyRow: ScheduleRow = {
  index: '',
  invoiceValue: '',
  paymentDate: '',
  customsDuty: '',
  excise: '',
  vat: '',
  additionalDuty: '',
}

describe('periodic payment schedule (T53/T54)', () => {
  it('reads T54 without P8T54 as an empty additional duty', () => {
    const { rows } = readSchedule(scheduleOf(load(`<T53><P6T53>1</P6T53>${row('1')}</T53>`)).block)
    expect(rows).toEqual([
      {
        index: '1',
        invoiceValue: '1000.5',
        paymentDate: '2026-05-01',
        customsDuty: '100',
        excise: '0',
        vat: '120.125',
        additionalDuty: '',
        source: 0,
      },
    ])
  })

  it('reads T54 with P8T54', () => {
    const { rows } = readSchedule(
      scheduleOf(load(`<T53>${row('1', '<P8T54>55.250</P8T54>')}</T53>`)).block,
    )
    expect(rows.map((item) => item.additionalDuty)).toEqual(['55.250'])
  })

  it.each([
    ['with P8T54', '10.5', 1],
    ['without P8T54', '', 0],
  ])('exports a single T54 %s and reads it back', (_, additionalDuty, occurrences) => {
    const document = load('<T53><P6T53>1</P6T53></T53>')
    const schedule = scheduleOf(document)
    const next = {
      header: { previousPost: '', previousDate: '', previousNumber: '', paymentTerms: '1' },
      rows: [{ ...emptyRow, index: '1', paymentDate: '2026-05-01', additionalDuty }],
    }
    const root = updateBlockAt(document.root, schedule.path, (block) => writeSchedule(block, next))
    const exported = exportGtd({ root })
    if (!exported.ok) throw new Error(exported.errors.join('\n'))
    expect(exported.xml.match(/<P8T54>/g) ?? []).toHaveLength(occurrences)
    expect(exported.xml.match(/<T54>/g)).toHaveLength(1)

    const reparsed = parseGtd(exported.xml)
    if (!reparsed.ok) throw new Error(reparsed.errors.join('\n'))
    const { header, rows } = readSchedule(scheduleOf(reparsed.document).block)
    expect({ header, rows: rows.map(({ source: _source, ...item }) => item) }).toEqual(next)
  })

  it('removes P8T54 when cleared and preserves unmodeled row fields', () => {
    const schedule = scheduleOf(
      load(`<T53>${row('1', '<P8T54>5</P8T54><P9T54>keep</P9T54>')}</T53>`),
    )
    const { header, rows } = readSchedule(schedule.block)
    const next = writeSchedule(schedule.block, {
      header,
      rows: rows.map((item) => ({ ...item, additionalDuty: '' })),
    })
    const [written] = next.blocks
    expect(written?.fields.P8T54).toBeUndefined()
    expect(written?.fields.P9T54).toBe('keep')
  })

  it('saves untouched values exactly as read, padded values and empty elements included', () => {
    const schedule = scheduleOf(
      load(`<T53><P3T53> 00101 </P3T53><P6T53></P6T53>${row(' 1 ', '<P8T54></P8T54>')}</T53>`),
    )
    const read = readSchedule(schedule.block)
    const next = writeSchedule(schedule.block, read)
    expect(next).toEqual(schedule.block)
    const edited = writeSchedule(schedule.block, {
      header: read.header,
      rows: read.rows.map((item) => ({ ...item, vat: ' 7 ' })),
    })
    expect(edited.blocks[0]?.fields).toMatchObject({ P2T54: ' 1 ', P7T54: '7', P8T54: '' })
  })

  it('keeps unmodeled fields of the remaining T54 when a repeated one is removed', () => {
    const schedule = scheduleOf(
      load(`<T53>${row('1', '<P9T54>first</P9T54>')}${row('2', '<P9T54>second</P9T54>')}</T53>`),
    )
    const { header, rows } = readSchedule(schedule.block)
    const next = writeSchedule(schedule.block, { header, rows: rows.slice(1) })
    expect(next.blocks.map((block) => block.fields.P9T54)).toEqual(['second'])
  })

  it('rejects non-numeric amounts and warns about precision beyond number(16,3)', () => {
    expect(scheduleRowSchema.safeParse({ ...emptyRow, additionalDuty: '12.345' }).success).toBe(
      true,
    )
    expect(scheduleRowSchema.safeParse({ ...emptyRow, additionalDuty: '1,5' }).success).toBe(false)
    expect(scheduleRowSchema.safeParse({ ...emptyRow, paymentDate: '2026-02-30' }).success).toBe(
      false,
    )
    expect(scheduleRowSchema.safeParse({ ...emptyRow, additionalDuty: '12.3456' }).success).toBe(
      true,
    )
    expect(getSpecWarnings('P8T54', '12.3456')).toEqual(['Больше 3 знаков после точки.'])
  })
})
