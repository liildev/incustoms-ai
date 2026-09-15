import type { AuditSource } from './audit-source'

/** Order of work proposed after the audit; it is not the audit's P0–P3 severity scale. */
export type Phase = { title: string; actions: readonly string[]; source: AuditSource }
export type OpenQuestion = { text: string; source: AuditSource }

export const ROADMAP_TITLE =
  'Сначала связать сущности, затем синхронизировать данные и только потом автоматизировать'

export const PHASES: readonly Phase[] = [
  {
    title: 'Связать',
    actions: [
      '`counterparty_id` вместо текста в сделке и контракте',
      'Контракт и заявка ссылаются на сделку',
      'OCR и ГТД, открытые из заявки, прикрепляются к ней',
    ],
    source: 'Δ D-12, D-10; V2 D-1, D-2',
  },
  {
    title: 'Синхронизировать',
    actions: [
      'Одно поле на факт: маршрут, исполнитель, статус',
      'Заявка с документами — одна серверная команда',
      'Отчёт и очереди считают по ссылкам',
    ],
    source: 'V2 W-4, W-9, §5.1; Δ D-13',
  },
  {
    title: 'Автоматизировать и очищать',
    actions: [
      'Проверки веса и происхождения в OCR',
      'Переводы, кодировка реестра, шум в `error_logs`',
      'Заполнение заявки из контракта — после решения продукта',
    ],
    source: 'V2 D-3, D-4, W-10, WH-2, §13 Q16; Δ D-11',
  },
]

export const OPEN_QUESTIONS: readonly OpenQuestion[] = [
  {
    text: 'Какие ГТД по бизнес-правилу обязаны происходить из заявки клиента, а какие являются самостоятельной работой декларанта?',
    source: 'V2 §5.4, §13 Q1',
  },
  {
    text: 'Должны ли контрагент и сумма контракта копироваться в заявку, или достаточно ссылки на контракт?',
    source: 'V2 W-11, §13 Q16',
  },
]
