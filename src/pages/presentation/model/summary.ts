import type { AuditSource } from './audit-source'

export type SummaryPoint = { title: string; detail: string; source: AuditSource }

export const SUMMARY_TITLE = 'Модули глубокие, слабое место — связи между ними'

export const SUMMARY: readonly SummaryPoint[] = [
  {
    title: 'Ключевые модули уже работают',
    detail: 'Приём заявки → принятие → чат, автономный OCR → ГТД, склад с остатками по строкам ГТД',
    source: 'V2 §2.2, §3.1, §8.2; Δ §5.1',
  },
  {
    title: 'Основной разрыв — между модулями',
    detail:
      'В проверенном сценарии сделка не ссылается на контракт и заявку, поставщик хранится текстом, а ГТД привязалась к отдельной записи',
    source: 'Δ D-10, D-12; V2 W-11, D-1, D-2',
  },
  {
    title: 'Начинать стоит со связей',
    detail: 'Стабильные ID → согласованные данные → отчёты без ручной сверки → автоматизация',
    source: 'V2 §3.3, §5.1, W-4, W-9; Δ D-13',
  },
]

/** How the audit was done, as one line of credibility; the full method is appendix slide П1. */
export const AUDIT_FACTS: readonly string[] = [
  'production, 05–07.09.2026',
  '8 учётных записей в 5 рабочих пространствах',
  'один импортный сценарий',
  'действие одной ролью, проверка у роли-получателя и чтение записи через API',
]
