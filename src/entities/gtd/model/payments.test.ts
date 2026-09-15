import { describe, expect, it } from 'vitest'
import { parseGtd } from '../lib/parse-gtd'
import { gtdXml } from '../test/gtd-fixture'
import { totalPaymentsByCode } from './payments'

const totals = (payments: string) => {
  const result = parseGtd(gtdXml({ goods: [payments] }))
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return totalPaymentsByCode(result.document)
}

describe('payment totals', () => {
  it('adds amounts of one payment type exactly', () => {
    expect(
      totals('<T4><P3T4>20</P3T4><P9T4>0.10</P9T4></T4><T4><P3T4>20</P3T4><P9T4>0.2</P9T4></T4>'),
    ).toEqual([{ code: '20', name: expect.any(String), currency: '', amount: '0.30', count: 2 }])
  })

  it('keeps amounts in different currencies apart', () => {
    const result = totals(
      '<T4><P3T4>20</P3T4><P9T4>10</P9T4><P202T4>840</P202T4></T4><T4><P3T4>20</P3T4><P9T4>5</P9T4></T4>',
    )
    expect(result.map(({ currency, amount }) => [currency, amount])).toEqual([
      ['840', '10'],
      ['', '5'],
    ])
  })

  it('shows no total when an amount is not a decimal, instead of skipping it', () => {
    const result = totals(
      '<T4><P3T4>20</P3T4><P9T4>5</P9T4></T4><T4><P3T4>20</P3T4><P9T4> 1000.00</P9T4></T4>',
    )
    expect(result).toMatchObject([{ amount: '', count: 2 }])
  })
})
