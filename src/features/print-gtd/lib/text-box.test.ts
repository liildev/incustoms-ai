import { describe, expect, it } from 'vitest'
import { fitsBox, wrappedLineCount } from './text-box'

describe('text box capacity', () => {
  it('wraps at word boundaries, an empty line still taking one', () => {
    expect(wrappedLineCount([''], 10)).toBe(1)
    expect(wrappedLineCount(['aaaa bbbb'], 10)).toBe(1)
    // Fits by character count (11 ≤ 12) but not by words: "aaaaa" + "bbbbb" + "c" wrap to two lines.
    expect(wrappedLineCount(['aaaaa bbbbb c'], 11)).toBe(2)
  })

  it('breaks a word longer than the line', () => {
    expect(wrappedLineCount(['a'.repeat(25)], 10)).toBe(3)
    expect(wrappedLineCount(['ab ' + 'c'.repeat(15)], 10)).toBe(3)
  })

  it('counts capital letters wider than lower-case ones', () => {
    expect(wrappedLineCount(['a'.repeat(10)], 10)).toBe(1)
    // 10 capitals take 12.5 character widths.
    expect(wrappedLineCount(['A'.repeat(10)], 10)).toBe(2)
    expect(wrappedLineCount(['СМАРТФОН ТЕЛЕФОН'], 16)).toBe(2)
  })

  it('fits text up to the capacity and not beyond', () => {
    expect(fitsBox(['aaaa bbbb', 'cccc'], { lines: 2, chars: 10 })).toBe(true)
    expect(fitsBox(['aaaaaa bbbbbb'], { lines: 1, chars: 10 })).toBe(false)
  })
})
