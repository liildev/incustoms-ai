import type { AuditSource } from './audit-source'

/** `kept` — the value reached the next record; `lost` — it did not or became text; `context` — a plain fact. */
export type CaseMark = 'kept' | 'lost' | 'context'

export type CaseFact = { mark: CaseMark; text: string }

export type CaseStep = {
  name: string
  /** Record the facts were read from, as the audit names it. */
  record: string
  facts: readonly CaseFact[]
  source: AuditSource
}

export const CASE_TITLE = 'Где данные теряются между этапами'

export const CASE_LEAD =
  'Сценарий ООО UzbekTech ← Guangzhou Everbright, два прогона. Значения — из записей API и экранов продукта.'

export const CASE_STEPS: readonly CaseStep[] = [
  {
    name: 'Сделка',
    record: '09481f78',
    facts: [
      { mark: 'lost', text: '`contract_id = null`, `order_id = null`' },
      { mark: 'context', text: 'контракт и заявка того же контрагента уже есть' },
    ],
    source: 'Δ D-10 (§1.4)',
  },
  {
    name: 'Контракт',
    record: 'UT/CN-2026/04-0906-01',
    facts: [
      { mark: 'context', text: 'сумма 100 USD' },
      { mark: 'lost', text: 'контрагент — текст, `supplier_id` нет' },
    ],
    source: 'V2 W-11; Δ D-12 (§2.2)',
  },
  {
    name: 'Заявка',
    record: 'ORD-20260906-00004',
    facts: [
      { mark: 'kept', text: '`contract_id` заполнен' },
      { mark: 'lost', text: '`total = 0`, форма показывала 100 USD' },
      { mark: 'lost', text: 'список: «Маршрут: —», `route_from` сохранён' },
    ],
    source: 'V2 W-11, W-4 (§2.2b)',
  },
  {
    name: 'ГТД',
    record: 'из ORD-20260905-00002',
    facts: [
      { mark: 'lost', text: '«OCR → ГТД» из заявки: 404' },
      { mark: 'lost', text: 'обход создал отдельную запись, ГТД привязана к ней' },
    ],
    source: 'V2 D-1 (§3.2), D-2 (§3.3)',
  },
  {
    name: 'Логистический отчёт',
    record: '«по всем модулям»',
    facts: [{ mark: 'lost', text: '«Заказы 0», хотя заявка с документом есть' }],
    source: 'Δ D-13 (§4.2)',
  },
]

/** Row read back after the request was submitted (V2 §2.2b, abridged). */
export const CASE_RECORD = {
  label: 'Запись `orders` после отправки заявки',
  code: '"contract_id": "244b71b8-…", "total": 0, "route_from": "Guangzhou, China", "origin_city": null',
} as const

/** The ГТД step comes from the first run: the declarant side was not tested on 06–07.09 (V2 §0.2). */
export const CASE_NOTE =
  'Сделка, контракт, заявка и отчёт — один клиентский аккаунт, 06–07.09. Шаг ГТД — тот же сценарий в прогоне 05.09: во втором прогоне сторона декларанта не проверялась.'
