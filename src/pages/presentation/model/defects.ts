import type { AuditSource } from './audit-source'

/** Confirmed, fixable screen by screen; kept out of the main story, which is about links. */
export type LocalDefect = { text: string; source: AuditSource }

export const DEFECTS_LEAD = 'Реальные, но исправляются точечно и не меняют главный вывод.'

export const LOCAL_DEFECTS: readonly LocalDefect[] = [
  { text: 'OCR: брутто 1 860 < нетто 2 056 кг без ошибки', source: 'D-3' },
  { text: 'OCR: страна происхождения по строкам `000`', source: 'D-4' },
  { text: 'Искажённые строки: «Доrate грузов», «Чат с declarantом»', source: 'W-10' },
  { text: 'Сломанная кодировка в реестре складов', source: 'WH-2' },
  { text: '«Готовность 100 %» при «Чек-лист для этой заявки не задан»', source: 'W-7' },
  { text: '«Certification ✓ Done» на нетронутой заявке', source: 'W-8' },
  { text: '«Документы 1» во вкладке и «Документы 2» в заголовке', source: 'W-13' },
  { text: '15 записей «critical» в `error_logs` на одно действие', source: 'D-11' },
  {
    text: 'Incoterms есть в сделке, но не в форме контракта; в контракте нет CNY',
    source: 'D-8, D-9',
  },
  {
    text: '«Энергия» в интерфейсе, `credit_*` в схеме; журнал +2 000 при балансе 3 000',
    source: 'B-1, B-2',
  },
]
