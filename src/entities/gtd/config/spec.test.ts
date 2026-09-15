import { describe, expect, it } from 'vitest'
import catalog from './spec-catalog.json'
import { getSpec } from './spec'

describe('specification catalog hierarchy', () => {
  it('nests T34 in T27 in T26, as confirmed by the accepted example declarations', () => {
    expect([getSpec('T26')?.parent, getSpec('T27')?.parent, getSpec('T34')?.parent]).toEqual([
      'T1',
      'T26',
      'T27',
    ])
  })

  it('nests T21 (IMEI) in T7 by the same layout rule: T21 starts in the column of the T7 fields', () => {
    expect(getSpec('T7')?.parent).toBe('T2')
    expect(getSpec('T21')?.parent).toBe('T7')
    expect(getSpec('P3T21')?.parent).toBe('T21')
    expect(getSpec('T8')?.parent).toBe('T2')
  })

  it('keeps T54 at the specification limit [0..1] without overrides', () => {
    expect(getSpec('T54')).toMatchObject({ parent: 'T53', gtd: { min: 0, max: 1 } })
  })
})

describe('specification catalog invariants', () => {
  const entries = catalog.entries

  it('lists every tag once', () => {
    const tags = entries.map((entry) => entry.tag)
    expect(tags.filter((tag, index) => tags.indexOf(tag) !== index)).toEqual([])
  })

  it('places every field P{n}T{m} directly in section T{m}', () => {
    expect(
      entries
        .filter(
          (entry) => entry.kind === 'field' && entry.parent !== entry.tag.replace(/^P\d+/, ''),
        )
        .map((entry) => entry.tag),
    ).toEqual([])
  })
})
