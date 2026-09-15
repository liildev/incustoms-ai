import type { AuditSource } from './audit-source'

/** `source` is shown on the slide: the finding codes let the audience ask for the detail. */
export type Evidence = { observed: string; impact: string; source: AuditSource }

export const EVIDENCE: readonly Evidence[] = [
  {
    observed:
      'Сделка создана при существующих контракте и заявке того же контрагента: `contract_id = null`, `order_id = null`.',
    impact: 'Объект, который должен объединять поставку, ни к чему не привязан.',
    source: 'D-10',
  },
  {
    observed:
      '`supplier_id` нет ни в сделках, ни в контрактах: контрагент хранится текстом. В `orders.supplier_name` записаны контакты самого клиента.',
    impact: 'Контрагент введён отдельно в каждом модуле, и копии не связаны между собой.',
    source: 'D-12, W-12',
  },
  {
    observed:
      'Форма показывает сумму контракта 100 USD, заявка сохраняет `total = 0`. Маршрут сохранён в `route_from`, `origin_city` пуст, список показывает «Маршрут: —».',
    impact: 'Пользователь видит не то, что лежит в базе.',
    source: 'W-11, W-4',
  },
  {
    observed:
      '«OCR → ГТД» из заявки клиента вызывает функцию с ответом 404. Обходной путь создаёт отдельную запись в `orders` с `client_id = declarant_id`, и ГТД привязывается к ней.',
    impact: 'В этом прогоне заявка клиента осталась без ГТД, а ГТД — без связи с ней.',
    source: 'D-1, D-2',
  },
  {
    observed:
      'Заявка `ORD-20260906-00004` с приложенным документом существует. Логистический отчёт «по всем модулям» показывает «Заказы 0».',
    impact: 'Отчёту нельзя верить без ручной сверки с исходными данными.',
    source: 'D-13',
  },
]
