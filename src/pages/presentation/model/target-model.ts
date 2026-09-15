import type { AuditSource } from './audit-source'

/**
 * Proposed, not the current schema. Children point to parents (a deal can hold several contracts and
 * requests); the reference directions are explained verbally (audit/presentation-script.md).
 */
export type ModelEntity = { name: string; key: string }
export type ModelPrinciple = { title: string; detail: string; source: AuditSource }

export const TARGET_NOTICE = 'Рекомендация, а не описание текущего backend'

export const TARGET_TITLE = 'Целевая модель: один граф сущностей'

export const TARGET_LEAD = 'Я бы связал записи стабильными ID, оставив экраны отдельными.'

export const MODEL_CHAIN: readonly ModelEntity[] = [
  { name: 'Контрагент', key: 'counterparty_id' },
  { name: 'Сделка', key: 'deal_id' },
  { name: 'Контракт', key: 'contract_id' },
  { name: 'Заявка', key: 'order_id' },
  { name: 'ГТД', key: 'declaration_id' },
  { name: 'Складская партия', key: 'lot_id' },
]

/** Index in MODEL_CHAIN the OCR session feeds. */
export const OCR_FEEDS = 4

/**
 * Index in MODEL_CHAIN whose link to the previous entity is optional (drawn dashed): a ГТД references a
 * request only when it came from one, since standalone declarant work is supported (V2 §5.4).
 */
export const OPTIONAL_LINK_TO = 4

/** V2 §3.3: an OCR session as its own entity, linked to a request only when opened from one. */
export const OCR_SESSION: ModelEntity & { note: string } = {
  name: 'OCR-сессия',
  key: 'ocr_job_id',
  note: 'создаёт ГТД. Пунктир: ГТД ссылается на заявку, только если работа началась с заявки',
}

export const PRINCIPLES: readonly ModelPrinciple[] = [
  {
    title: 'Стабильные ссылки',
    detail: 'Запись ссылается на соседние по ID, а не повторяет их текстом',
    source: 'Δ D-10, D-12; V2 W-4',
  },
  {
    title: 'Явное происхождение',
    detail: '`source` у заявки и `origin` у ГТД отличают работу клиента от самостоятельной',
    source: 'V2 §3.3, §5.1, §5.4',
  },
  {
    title: 'Отчёты по тем же связям',
    detail: 'Отчёт, очереди и счётчики считают по ссылкам графа',
    source: 'Δ D-13; V2 §5.1',
  },
]
