import { describe, expect, it } from 'vitest'
import { readSchedule, writeSchedule, type GtdBlock } from '@/entities/gtd'
import { savedScheduleForm } from './schedule-form'

const row = (index: string, note: string): GtdBlock => ({
  tag: 'T54',
  attributes: {},
  fields: { P2T54: index, P3T54: '1000.500', P9T54: note },
  blocks: [],
})

const schedule: GtdBlock = {
  tag: 'T53',
  attributes: {},
  fields: { P6T53: '1' },
  blocks: [row('1', 'first'), row('2', 'second')],
}

describe('schedule editor saves', () => {
  it('keeps the surviving T54 intact when it is edited again after removing the extra one', () => {
    const { header, rows } = readSchedule(schedule)
    const firstSave = { header, rows: rows.slice(1) }
    const afterFirst = writeSchedule(schedule, firstSave)
    const form = savedScheduleForm(schedule, firstSave)
    expect(form.rows.map((item) => item.source)).toEqual([0])

    const afterSecond = writeSchedule(afterFirst, {
      header: form.header,
      rows: form.rows.map((item) => ({ ...item, additionalDuty: '12.5' })),
    })
    expect(afterSecond.blocks.map((block) => block.fields)).toEqual([
      { P2T54: '2', P3T54: '1000.500', P8T54: '12.5', P9T54: 'second' },
    ])
  })
})
