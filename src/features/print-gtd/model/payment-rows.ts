import { isDecimal, sumDecimals } from '@/shared/lib/decimal'
import { wrappedLineCount } from '../lib/text-box'
import { type Fields, graphValue, presentLines } from './graph-lines'
import type { PaymentGraph, PaymentRow } from './print-form'

/** "0", "0.00", "" — a rate or base that does not apply. Compared as text, never through Number. */
const isZero = (text: string): boolean => /^0*(\.0*)?$/.test(text)

const withUnit = (amount: string, unit: string): string =>
  amount && unit ? `${amount} ${unit}` : amount

/**
 * Graph 47 row from a T4 section. Instruction No. 2773 names the columns (Вид платежа, Основа
 * начисления, Ставка, Сумма, СП) but the electronic format carries two bases and two rates:
 * the ad valorem pair (P4T4, P6T4) and the specific pair (P5T4, P7T4 with its currency P8T4).
 * A pair is printed when its rate is not zero; if neither is, the raw values are printed unchanged.
 */
const paymentRow = (record: Fields): PaymentRow => {
  const adValoremBase = withUnit(graphValue(record, 'P4T4'), graphValue(record, 'P200T4'))
  const specificBase = withUnit(graphValue(record, 'P5T4'), graphValue(record, 'P201T4'))
  const adValorem = graphValue(record, 'P6T4')
  const specific = graphValue(record, 'P7T4')
  const specificCurrency = graphValue(record, 'P8T4')
  const specificRate = specificCurrency ? `${specific} (${specificCurrency})` : specific
  const useAdValorem = !isZero(adValorem)
  const useSpecific = !isZero(specific)

  return {
    code: graphValue(record, 'P3T4'),
    base:
      useAdValorem || useSpecific
        ? presentLines(useAdValorem ? adValoremBase : '', useSpecific ? specificBase : '')
        : presentLines(adValoremBase || specificBase),
    rate:
      useAdValorem || useSpecific
        ? presentLines(useAdValorem ? `${adValorem} %` : '', useSpecific ? specificRate : '')
        : presentLines(adValorem || specific),
    amount: withUnit(graphValue(record, 'P9T4'), graphValue(record, 'P202T4')),
    method: graphValue(record, 'P10T4'),
  }
}

/** Characters a column of the graph 47 table holds at 6.5pt (the narrowest table, ТД2, second good). */
const COLUMN_CHARS = 16

/** Printed lines of a row: the tallest of its cells once they wrap. */
const rowLines = (row: PaymentRow): number =>
  Math.max(
    wrappedLineCount(row.base, COLUMN_CHARS),
    wrappedLineCount(row.rate, COLUMN_CHARS),
    wrappedLineCount([row.amount], COLUMN_CHARS),
  )

/**
 * Graph 47 of one good. «Всего» is the exact decimal sum of the printed amounts; it stays empty
 * when an amount is in a foreign currency or is not a decimal, rather than adding unlike values.
 * The rows move to a supplement when their printed lines exceed `capacity`.
 */
export const paymentGraph = (records: readonly Fields[], capacity: number): PaymentGraph => {
  const rows = records.map(paymentRow)
  const amounts = records.map((record) => graphValue(record, 'P9T4'))
  const summable =
    rows.length > 0 &&
    amounts.every(isDecimal) &&
    records.every((record) => !graphValue(record, 'P202T4'))
  return {
    rows,
    total: summable ? sumDecimals(amounts) : '',
    overflow: rows.reduce((lines, row) => lines + rowLines(row), 0) > capacity,
  }
}
