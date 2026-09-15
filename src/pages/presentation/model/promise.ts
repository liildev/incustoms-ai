/**
 * Public positioning is not audit evidence: it frames what the product sets out to be. Rendered
 * on https://incustoms.ai/welcome?lang=ru («02 · Платформа») and checked on 14.09.2026. «Один контур
 * вместо десяти таблиц» (/platform) says the same and is left for the spoken script.
 */
export const POSITIONING = {
  claim: 'Вся поставка — от заявки до закрытия — под присмотром ИИ',
  detail:
    'Сделки, перевозки, склад и СВХ, декларирование, расчёты и биллинг живут в одной системе. Данные вводятся один раз, справочники общие…',
  attribution: 'incustoms.ai, главная страница, 14.09.2026',
} as const

export type PromiseNode = { name: string; detail: string }

/**
 * The chain as the product's own interface copy describes it: deal — Δ §1.1 (paraphrase of the deal
 * card, verbatim only in V1 §4.4); contract required — WT2 §7.2; warehouse — V2 §8.2; supplier CRM — Δ §2.1.
 */
export const PROMISE_CHAIN: readonly PromiseNode[] = [
  { name: 'Поставщик', detail: 'CRM поставщиков' },
  { name: 'Сделка', detail: 'объединяет поставщика, контракт, отгрузку и оформление' },
  { name: 'Контракт', detail: 'обязателен для заявки на оформление' },
  { name: 'Заявка', detail: 'клиент → декларант' },
  { name: 'ГТД', detail: 'OCR и редактор' },
  { name: 'Склад', detail: 'остатки по строкам ГТД' },
]

/** Report page subtitle (Δ §4.1). */
export const PROMISE_REPORT = {
  name: 'Логистический отчёт',
  quote: 'Ежедневный operational-срез по всем модулям',
} as const

export const PROMISE_NOTE =
  'Цепочка собрана из текстов интерфейса: это замысел продукта, а не проверенная реализация.'
