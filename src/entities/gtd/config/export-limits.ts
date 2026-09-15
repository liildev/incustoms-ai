/** T53 — general data of the periodic customs payment schedule (ГУПТП). */
export const SCHEDULE_TAG = 'T53'
/** T54 — «Детализация по ГУПТП». */
export const SCHEDULE_ROW_TAG = 'T54'

/**
 * Sections read without data loss when repeated beyond the specification limit ([0..1] for both),
 * reported as errors, and refused by export. Other repetition findings stay warnings, because
 * accepted declarations deviate from the catalog.
 */
export const EXPORT_LIMITED_TAGS: ReadonlySet<string> = new Set([SCHEDULE_TAG, SCHEDULE_ROW_TAG])
