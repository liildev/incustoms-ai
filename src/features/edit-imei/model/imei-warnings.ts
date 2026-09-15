import { getSpecWarnings, IMEI_FIELDS, isStandardImei, type ImeiRecord } from '@/entities/gtd'

/**
 * Non-blocking remarks for one record. Existing declarations may contain incomplete T21 records
 * (all P3–P5 are [0..1] in the specification), so these never prevent saving.
 */
export const getImeiWarnings = (record: ImeiRecord, duplicate: boolean): string[] => {
  const code = record.code.trim()
  return [
    ...getSpecWarnings(IMEI_FIELDS.device, record.device),
    ...getSpecWarnings(IMEI_FIELDS.slot, record.slot),
    ...getSpecWarnings(IMEI_FIELDS.code, record.code),
    record.device.trim() === '' ? 'Не указан номер устройства.' : null,
    record.slot.trim() === '' ? 'Не указан номер слота.' : null,
    code === ''
      ? 'IMEI не указан.'
      : isStandardImei(code)
        ? null
        : 'Стандартный IMEI состоит из 15 цифр.',
    duplicate ? 'Этот слот устройства указан повторно.' : null,
  ].filter((warning): warning is string => warning !== null)
}
