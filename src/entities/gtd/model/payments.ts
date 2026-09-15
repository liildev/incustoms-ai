import { isDecimal, sumDecimals } from '@/shared/lib/decimal'
import { PAYMENT_CODES } from '../config/payment-codes'
import type { GtdDocument } from './gtd'
import { collectFromGoods } from './goods'

export const PAYMENT_TAG = 'T4'

export type PaymentTotal = {
  /** P3T4 — payment type code. */
  code: string
  name: string | null
  /** P202T4 — currency of the amounts; empty for amounts in national currency. */
  currency: string
  /** Exact sum of P9T4 across all goods; empty when an amount is missing or not a decimal, so no total is shown. */
  amount: string
  count: number
}

export const getPaymentName = (code: string): string | null => PAYMENT_CODES[code] ?? null

/**
 * Totals of T4 payment amounts per payment type code and amount currency, in order of first appearance.
 * Amounts in different currencies are never added together.
 */
export const totalPaymentsByCode = (document: GtdDocument): PaymentTotal[] => {
  const groups = new Map<string, { code: string; currency: string; values: string[] }>()
  for (const { block } of collectFromGoods(document, PAYMENT_TAG)) {
    const code = block.fields.P3T4 ?? ''
    const currency = block.fields.P202T4 ?? ''
    const key = JSON.stringify([code, currency])
    const group = groups.get(key) ?? { code, currency, values: [] }
    group.values.push(block.fields.P9T4 ?? '')
    groups.set(key, group)
  }
  return [...groups.values()].map(({ code, currency, values }) => ({
    code,
    name: getPaymentName(code),
    currency,
    amount: values.every(isDecimal) ? sumDecimals(values) : '',
    count: values.length,
  }))
}
