import type { AuditSource } from './audit-source'

/** Where the evidence stops. `status` names the evidence class, so no row is quoted as a defect. */
export type EvidenceLimit = { subject: string; status: string; detail: string; source: AuditSource }

export const LIMITS_LEAD = 'Что я видел, но не могу интерпретировать без команды.'

export const EVIDENCE_LIMITS: readonly EvidenceLimit[] = [
  {
    subject: '1 550 из 1 594 ГТД без `order_id`',
    status: 'Смысл неизвестен',
    detail:
      'Снимок 05.09. Норма (самостоятельная работа декларанта) или потерянная связь — ни одно поле этого не различает',
    source: 'V2 §5.4, §13 Q1; HN §2',
  },
  {
    subject: '418 из 464 строк `orders` — записи OCR-заданий',
    status: 'Состояние данных',
    detail: 'Счёт по шаблону описания: говорит о происхождении, а не о том, ошибка ли это',
    source: 'V2 §5.1; HN §3',
  },
  {
    subject: 'Переход «OCR → ГТД» из заявки',
    status: 'Один маршрут',
    detail: 'Проверен один путь с одного экрана; другие пути в систему не исключены',
    source: 'V2 D-1; HN §1',
  },
  {
    subject: 'Логистический отчёт: «Заказы 0»',
    status: 'Причина не установлена',
    detail: 'Расхождение наблюдалось; фильтр или другая причина — не проверялось',
    source: 'Δ D-13',
  },
  {
    subject: 'Публикация склада в общий реестр',
    status: 'Не проверялось',
    detail: 'Форма и описание подтверждены; запись сознательно не выполнялась',
    source: 'Δ WH-3 (§5.3)',
  },
  {
    subject: 'Исходный код, миграции, RLS, логи',
    status: 'Не читались',
    detail: 'Причины выведены из поведения продукта и ответов API',
    source: 'V2 §0.2',
  },
]
