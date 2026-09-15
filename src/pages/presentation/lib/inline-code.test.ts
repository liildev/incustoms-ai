import { describe, expect, it } from 'vitest'
import { splitInlineCode } from './inline-code'

describe('splitInlineCode', () => {
  it('marks backtick-quoted parts as code', () => {
    expect(splitInlineCode('Сделка: `contract_id = null`, `order_id`.')).toEqual([
      { kind: 'text', value: 'Сделка: ' },
      { kind: 'code', value: 'contract_id = null' },
      { kind: 'text', value: ', ' },
      { kind: 'code', value: 'order_id' },
      { kind: 'text', value: '.' },
    ])
  })

  it('returns plain text unchanged and drops empty parts', () => {
    expect(splitInlineCode('без кода')).toEqual([{ kind: 'text', value: 'без кода' }])
    expect(splitInlineCode('`id`')).toEqual([{ kind: 'code', value: 'id' }])
  })
})
