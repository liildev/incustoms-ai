import type { AuditSource } from './audit-source'

export type MethodStep = { title: string; detail: string }
export type CoverageRow = { label: string; value: string; source: AuditSource }

export const SCOPE_LEAD =
  'Повторный аудит 05–07.09.2026 на production. Выводы первого прохода в августе перепроверены, опровергнутые исключены.'

/** Protocol from V2 §11 (method note); evidence labels from V2 §0.1. */
export const METHOD: readonly MethodStep[] = [
  {
    title: 'Действие от роли-отправителя',
    detail: 'Клиент заводит контракт, создаёт заявку, прикладывает инвойс',
  },
  {
    title: 'Проверка у роли-получателя',
    detail: 'Декларант просматривает все вкладки очереди, а не только «Новые»',
  },
  {
    title: 'Чтение записи через API',
    detail: 'Какие поля изменились, в каком запросе и чьей стороной',
  },
  {
    title: 'Метка доказательности',
    detail: 'Подтверждено, состояние данных, вывод о модели или не проверено',
  },
]

export const COVERAGE: readonly CoverageRow[] = [
  {
    label: 'Роли',
    value:
      'Клиент-юрлицо, физлицо, декларант, логист, модератор и две карточки персон: 8 учётных записей, 5 рабочих пространств',
    source: 'V2 §1.1, §15 (7 accounts) + fresh client in V2 §2.2b / Δ',
  },
  {
    label: 'Модули',
    value:
      'Заявки, OCR и ГТД, сделки, поставщики, контракты, логистический отчёт, склады, финансы, консоль модератора',
    source: 'V2 §2–§9, Δ §1–§9',
  },
  {
    label: 'Переходы',
    value:
      'Контракт → заявка, обращение → заявка → принятие → чат, заявка → OCR и ГТД, сделка → контракт и заявка, заявка → отчёт',
    source: 'V2 §2.2, §2.2b, §3.2; Δ §1.4, §4.2',
  },
  {
    label: 'Сверка',
    value: 'Форма, запись в базе, список и отчёт для одной и той же сущности',
    source: 'V2 W-4, W-11, W-13; Δ D-13',
  },
  {
    label: 'Сценарий',
    value:
      'ООО UzbekTech ввозит смартфоны у Guangzhou Everbright: инвойс USD 98 400, FCA Guangzhou',
    source: 'V2 header',
  },
]

export const SCOPE_LIMITS =
  'Не проверялось: исходный код, миграции, RLS-политики и серверные логи — причины выводятся из поведения. Запись в общий реестр складов сознательно не выполнялась.'
