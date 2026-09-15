export { getSpec, getSpecOrder, splitSpecLabel, type SpecEntry } from './config/spec'
export { exportGtd, findExportBlockers, type GtdExportResult } from './lib/export-gtd'
export { parseGtd, type GtdParseResult } from './lib/parse-gtd'
export {
  childBlocks,
  firstChildBlock,
  getBlockAt,
  patchFields,
  replaceChildBlocks,
  type LocatedBlock,
} from './model/block'
export { DOCUMENT_TAG, listSupportingDocuments, type SupportingDocument } from './model/documents'
export {
  collectFromGoods,
  DESCRIPTION_TAG,
  getMainBlock,
  listGoods,
  type GoodSummary,
} from './model/goods'
export type { BlockPath, GtdBlock, GtdDocument } from './model/gtd'
export {
  findDuplicateSlots,
  groupImeiByDevice,
  IMEI_FIELDS,
  IMEI_TAG,
  imeiRecordSchema,
  isStandardImei,
  readImeiRecords,
  sequenceKey,
  slotKey,
  writeImeiRecords,
  type ImeiRecord,
} from './model/imei'
export type { GtdIssue } from './model/issue'
export { getSpecWarnings, specValueSchema } from './model/spec-value'
export {
  getPaymentName,
  PAYMENT_TAG,
  totalPaymentsByCode,
  type PaymentTotal,
} from './model/payments'
export {
  createScheduleBlock,
  keepSchedule,
  readSchedule,
  SCHEDULE_HEADER_FIELDS,
  SCHEDULE_LIMIT,
  SCHEDULE_ROW_FIELDS,
  SCHEDULE_ROW_LIMIT,
  SCHEDULE_ROW_TAG,
  SCHEDULE_TAG,
  scheduleHeaderSchema,
  scheduleRowSchema,
  writeSchedule,
  type ScheduleHeader,
  type ScheduleRow,
} from './model/schedule'
export type { ReadySession } from './model/session'
export { useGtdSession } from './model/session-context'
export { useDraft } from './model/use-draft'
export { GtdSessionProvider } from './ui/session-provider'
