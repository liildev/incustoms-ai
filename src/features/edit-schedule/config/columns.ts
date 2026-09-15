import type { AmountKey } from '../model/schedule-form'

/** Column of the schedule table. Titles are short; the XML tag identifies the specification field. */
export type ScheduleColumn =
  | { key: 'index'; kind: 'index'; title: string }
  | { key: 'paymentDate'; kind: 'date'; title: string }
  | { key: AmountKey; kind: 'amount'; title: string }

export const SCHEDULE_COLUMNS: readonly ScheduleColumn[] = [
  { key: 'index', kind: 'index', title: '№' },
  { key: 'paymentDate', kind: 'date', title: 'Дата платежа' },
  { key: 'invoiceValue', kind: 'amount', title: 'Фактурная стоимость' },
  { key: 'customsDuty', kind: 'amount', title: 'Пошлина (20)' },
  { key: 'additionalDuty', kind: 'amount', title: 'Доп. пошлина (21)' },
  { key: 'excise', kind: 'amount', title: 'Акциз (27)' },
  { key: 'vat', kind: 'amount', title: 'НДС (29)' },
]
