import { describe, expect, it } from 'vitest'
import { checkFieldValue } from './check-spec'
import { getSpecWarnings, specValueSchema } from './spec-value'

/** P8T54: number(16,3). P4T54: date. P5T21: text(40). */
const accepts = (tag: string, value: string) => specValueSchema(tag).safeParse(value).success

describe('field values are validated as strings, never through JS numbers', () => {
  it.each(['0', '0.000', '-12.5', '0012.500', ' 12.5 ', '123456789012.345', ''])(
    'accepts "%s" as number(16,3)',
    (value) => expect(accepts('P8T54', value)).toBe(true),
  )

  it.each(['1e5', '1,5', '1.', '.5', '+1', '12 345', 'NaN', 'Infinity', '0x10'])(
    'refuses "%s", which is not a plain decimal',
    (value) => expect(accepts('P8T54', value)).toBe(false),
  )

  it('keeps precision beyond what a double can hold', () => {
    expect(getSpecWarnings('P8T54', '1234567890123.456')).toEqual([])
    expect(getSpecWarnings('P8T54', '12345678901234.567')).toEqual([
      'Число содержит больше 16 цифр.',
    ])
    expect(getSpecWarnings('P8T54', '1.2345')).toEqual(['Больше 3 знаков после точки.'])
  })

  it('checks dates against the calendar, in YYYY-MM-DD only', () => {
    expect(accepts('P4T54', '2028-02-29')).toBe(true)
    expect(accepts('P4T54', '2026-02-29')).toBe(false)
    expect(accepts('P4T54', '2026-1-01')).toBe(false)
    expect(accepts('P4T54', '01.02.2026')).toBe(false)
  })

  it('warns about text length by characters, not bytes', () => {
    expect(getSpecWarnings('P5T21', 'Ж'.repeat(40))).toEqual([])
    expect(getSpecWarnings('P5T21', 'Ж'.repeat(41))).toHaveLength(1)
  })

  it('refuses characters XML cannot represent, for tags with or without a specification entry', () => {
    const control = `a${String.fromCharCode(0x1b)}`
    expect(accepts('P5T21', control)).toBe(false)
    expect(checkFieldValue('X_UNKNOWN', control)).toEqual([
      expect.objectContaining({ severity: 'error', message: expect.stringContaining('U+001B') }),
    ])
  })
})
