import type { DocumentRow } from '../model/print-form'

/**
 * Columns of the graph 44 supplement table, named after the T9 fields. Optional columns are shown only
 * when at least one document has a value.
 */
export const DOCUMENT_COLUMNS: ReadonlyArray<{
  key: keyof DocumentRow
  heading: string
  optional: boolean
}> = [
  { key: 'code', heading: 'Код документа', optional: false },
  { key: 'kind', heading: 'Буквенный код', optional: false },
  { key: 'number', heading: 'Номер документа', optional: false },
  { key: 'date', heading: 'Дата документа', optional: false },
  { key: 'validUntil', heading: 'Срок действия', optional: true },
  { key: 'amount', heading: 'Сумма по документу', optional: true },
  { key: 'note', heading: 'Остальная информация', optional: true },
]

/** Graph 47 columns as named on the form. */
export const PAYMENT_HEADINGS = [
  'Вид платежа',
  'Основа начисления',
  'Ставка',
  'Сумма',
  'СП',
] as const

/** T21 columns: P3T21, P4T21, P5T21. */
export const IMEI_HEADINGS = ['№ устройства', '№ SIM-слота', 'IMEI'] as const
