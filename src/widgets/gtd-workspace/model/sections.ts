import {
  collectFromGoods,
  DESCRIPTION_TAG,
  DOCUMENT_TAG,
  getMainBlock,
  IMEI_TAG,
  listGoods,
  PAYMENT_TAG,
  SCHEDULE_LIMIT,
  SCHEDULE_ROW_TAG,
  SCHEDULE_TAG,
  childBlocks,
  type GtdDocument,
  type GtdIssue,
} from '@/entities/gtd'
import { groupIssues } from '../lib/group-issues'

export type SectionId =
  | 'general'
  | 'goods'
  | 'payments'
  | 'documents'
  | 'transport'
  | 'imei'
  | 'schedule'
  | 'structure'
  | 'issues'

export type SectionItem = {
  id: SectionId
  title: string
  /** Number of records in the section; `null` when the section has no countable records. */
  count: number | null
  tone?: 'danger' | 'warn'
}

export const TRANSPORT_TAGS = ['T5', 'T6'] as const

export const getSections = (document: GtdDocument, issues: readonly GtdIssue[]): SectionItem[] => {
  const main = getMainBlock(document)
  const schedules = childBlocks(main, SCHEDULE_TAG)
  const imeiCount = collectFromGoods(document, DESCRIPTION_TAG).reduce(
    (sum, description) => sum + childBlocks(description, IMEI_TAG).length,
    0,
  )
  const errors = issues.filter((issue) => issue.severity === 'error').length

  return [
    { id: 'general', title: 'Общие сведения', count: null },
    { id: 'goods', title: 'Товары', count: listGoods(document).length },
    { id: 'payments', title: 'Платежи', count: collectFromGoods(document, PAYMENT_TAG).length },
    { id: 'documents', title: 'Документы', count: collectFromGoods(document, DOCUMENT_TAG).length },
    {
      id: 'transport',
      title: 'Транспорт',
      count: TRANSPORT_TAGS.reduce((sum, tag) => sum + childBlocks(main, tag).length, 0),
    },
    { id: 'imei', title: 'IMEI устройств', count: imeiCount },
    {
      id: 'schedule',
      title: 'ГУПТП',
      count:
        schedules.length > 0
          ? schedules.reduce(
              (sum, schedule) => sum + childBlocks(schedule, SCHEDULE_ROW_TAG).length,
              0,
            )
          : null,
      // Repeated T53 need a repair in this section before export.
      tone: schedules.length > SCHEDULE_LIMIT ? 'danger' : undefined,
    },
    { id: 'structure', title: 'Структура XML', count: null },
    {
      id: 'issues',
      title: 'Проверка',
      count: groupIssues(issues).length,
      tone: errors > 0 ? 'danger' : issues.length > 0 ? 'warn' : undefined,
    },
  ]
}
