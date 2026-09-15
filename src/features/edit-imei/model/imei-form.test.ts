import { describe, expect, it } from 'vitest'
import { readImeiRecords, writeImeiRecords, type GtdBlock } from '@/entities/gtd'
import { savedImeiForm } from './imei-form'

const imei = (device: string, extra: Record<string, string>, attributes = {}): GtdBlock => ({
  tag: 'T21',
  attributes,
  fields: { P3T21: device, P4T21: '1', P5T21: `35693803564380${device}`, ...extra },
  blocks: [],
})

const description: GtdBlock = {
  tag: 'T7',
  attributes: {},
  fields: { P4T7: '1' },
  blocks: [
    imei('1', { P9T21: 'first' }),
    imei('2', { P9T21: 'second' }, { id: 'b' }),
    imei('3', { P9T21: 'third' }),
  ],
}

describe('IMEI editor saves', () => {
  it('keeps unmodeled fields with their record over consecutive saves after removing a middle record', () => {
    const [first, , third] = readImeiRecords(description)
    if (!first || !third) throw new Error('records expected')

    const firstSave = { records: [first, third] }
    const afterFirst = writeImeiRecords(description, firstSave.records)
    const form = savedImeiForm(description, firstSave)
    expect(form.records.map((record) => record.source)).toEqual([0, 1])
    // Reusing the pre-save values (source 2 in a list of two) would drop the third record's P9T21.
    expect(writeImeiRecords(afterFirst, [third]).blocks[0]?.fields.P9T21).toBeUndefined()

    const [, kept] = form.records
    if (!kept) throw new Error('record expected')
    const afterSecond = writeImeiRecords(afterFirst, [
      { ...kept, code: '490154203237518' },
      { device: '4', slot: '1', code: '' },
    ])

    expect(afterSecond.blocks.map((block) => [block.attributes, block.fields])).toEqual([
      [{}, { P3T21: '3', P4T21: '1', P5T21: '490154203237518', P9T21: 'third' }],
      [{}, { P3T21: '4', P4T21: '1' }],
    ])
  })

  it('stores trimmed values in the form, as they were written', () => {
    const [record] = readImeiRecords(description)
    if (!record) throw new Error('record expected')
    const form = savedImeiForm(description, { records: [{ ...record, code: ' 490154203237518 ' }] })
    expect(form.records[0]?.code).toBe('490154203237518')
  })
})
