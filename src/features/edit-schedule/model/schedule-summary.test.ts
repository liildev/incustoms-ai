import { describe, expect, it } from 'vitest'
import type { GtdBlock } from '@/entities/gtd'
import { summarizeSchedule } from './schedule-summary'

describe('summarizeSchedule', () => {
  it('lists every field, row and nested section, including those outside the specification', () => {
    const schedule: GtdBlock = {
      tag: 'T53',
      attributes: {},
      fields: { P3T53: '26003', P99T53: 'x' },
      blocks: [
        { tag: 'T54', attributes: {}, fields: { P8T54: '150.125' }, blocks: [] },
        { tag: 'X', attributes: {}, fields: {}, blocks: [] },
      ],
    }
    expect(summarizeSchedule(schedule)).toEqual({
      fields: [
        { tag: 'P3T53', label: 'Код поста предыдущий ГУПТП', value: '26003' },
        { tag: 'P99T53', label: null, value: 'x' },
      ],
      rows: [[{ tag: 'P8T54', label: 'Дополнительная таможенная пошлина (21)', value: '150.125' }]],
      otherSections: ['X'],
    })
  })
})
