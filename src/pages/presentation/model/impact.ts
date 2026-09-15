import type { AuditSource } from './audit-source'

/** `example` is observed; `meaning` is the business consequence the author infers from it. */
export type Impact = { consequence: string; example: string; meaning: string; source: AuditSource }

export const IMPACT_TITLE = 'Что это значит для работы'

export const IMPACTS: readonly Impact[] = [
  {
    consequence: 'Повторный ввод',
    example: 'Поставщик — текст в сделке и контракте; выбор контракта не заполняет поля заявки',
    meaning: 'Одни и те же данные вводят несколько раз, и копии друг о друге не знают',
    source: 'Δ D-12; V2 W-11',
  },
  {
    consequence: 'Нет сквозной трассировки',
    example: 'Сделка ни к чему не привязана; ГТД привязана к новой записи, а не к заявке клиента',
    meaning: 'Одну поставку нельзя проследить от сделки до ГТД по данным системы',
    source: 'Δ D-10; V2 D-2',
  },
  {
    consequence: 'Отчёты требуют ручной сверки',
    example: 'Заявка есть, отчёт показывает «Заказы 0»; маршрут сохранён, в списке «Маршрут: —»',
    meaning: 'Цифрам в отчёте нельзя верить без проверки исходных записей',
    source: 'Δ D-13; V2 W-4',
  },
]
