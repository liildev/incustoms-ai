import { formatDate } from '@/shared/lib/format'

/**
 * Graph texts composed the way Instruction No. 2773 (глава 5, глава 20) prescribes for the paper form.
 * Values stay verbatim strings; only ISO dates become DD.MM.YYYY, as in the instruction's examples.
 * A missing value drops its part instead of leaving a dangling separator.
 */

export type Fields = Readonly<Record<string, string>>

export const graphValue = (fields: Fields, tag: string): string => fields[tag]?.trim() ?? ''

/** ISO date of the field as DD.MM.YYYY; other values unchanged. */
export const graphDate = (fields: Fields, tag: string): string =>
  formatDate(graphValue(fields, tag))

const joinPresent = (parts: readonly string[], separator: string): string =>
  parts.filter(Boolean).join(separator)

/** Non-empty values in order, one per line. */
export const presentLines = (...values: readonly string[]): string[] => values.filter(Boolean)

/** «код/значение» pairs after the «№» sign: ИНН/код района. */
export const slashPair = (fields: Fields, first: string, second: string): string =>
  joinPresent([graphValue(fields, first), graphValue(fields, second)], '/')

/** Graph 7: код поста / дата принятия / порядковый номер. */
export const registrationNumber = (main: Fields): string =>
  joinPresent([graphValue(main, 'P19T1'), graphDate(main, 'P20T1'), graphValue(main, 'P21T1')], '/')

/** Graphs 18 and 21: «4 ЖД: 51233518; 51301414». `count` is the declared number of vehicles. */
export const transportLine = (
  count: string,
  vehicles: readonly Fields[],
  kindTag: string,
  numberTag: string,
): string => {
  if (vehicles.length === 0) return count
  const kinds = [...new Set(vehicles.map((vehicle) => graphValue(vehicle, kindTag)))]
  const numbers =
    kinds.length === 1
      ? vehicles.map((vehicle) => graphValue(vehicle, numberTag))
      : vehicles.map((vehicle) =>
          joinPresent([graphValue(vehicle, kindTag), graphValue(vehicle, numberTag)], ' '),
        )
  const prefix = joinPresent([count, kinds.length === 1 ? (kinds[0] ?? '') : ''], ' ')
  return joinPresent([prefix, joinPresent(numbers, '; ')], ': ')
}

/** Graph 37: режим (2) + предшествующий режим (2) + особенность перемещения (3); empty if a part is missing. */
export const procedureCode = (regime: string, good: Fields): string => {
  const parts = [regime.trim(), graphValue(good, 'P16T2'), graphValue(good, 'P17T2')]
  return parts.every(Boolean) ? parts.join('') : ''
}

/** Graph 40: «ТД 35010/06.04.2026/1492964 — 1 — 63468 кг — 63468 кг». */
export const previousDocumentLine = (record: Fields): string => {
  const quantity = joinPresent([graphValue(record, 'P9T8'), graphValue(record, 'P10T8')], ' ')
  const weight = (tag: string) => (graphValue(record, tag) ? `${graphValue(record, tag)} кг` : '')
  return joinPresent(
    [
      joinPresent(
        [
          graphValue(record, 'P200T8'),
          joinPresent(
            [graphValue(record, 'P6T8'), graphDate(record, 'P7T8'), graphValue(record, 'P8T8')],
            '/',
          ),
        ],
        ' ',
      ),
      graphValue(record, 'P4T8'),
      weight('P11T8'),
      weight('P12T8'),
      quantity,
    ],
    ' — ',
  )
}

/**
 * Graph 44: «220 ИНВ № 25 от 03.03.2026», then the validity date, amount and other information when present,
 * so the box and the supplement table show the same T9 fields.
 */
export const documentLine = (record: Fields): string => {
  const number = graphValue(record, 'P7T9')
  const issued = graphDate(record, 'P8T9')
  const valid = graphDate(record, 'P11T9')
  const amount = joinPresent([graphValue(record, 'P9T9'), graphValue(record, 'P10T9')], ' ')
  return joinPresent(
    [
      joinPresent(
        [
          graphValue(record, 'P4T9'),
          graphValue(record, 'P6T9'),
          number ? `№ ${number}` : '',
          issued ? `от ${issued}` : '',
        ],
        ' ',
      ),
      valid ? `срок действия — ${valid}` : '',
      amount ? `сумма — ${amount}` : '',
      graphValue(record, 'P12T9'),
    ],
    ', ',
  )
}

/**
 * Graph 48. Instalment: «1. 20 01.06.2025, 100000000» (номер месяца, вид платежа, срок, сумма);
 * deferral: «20.01.06.2025» (вид платежа, крайний срок).
 */
export const deferralLine = (record: Fields): string => {
  const code = graphValue(record, 'P1T42')
  const due = graphDate(record, 'P2T42')
  const amount = graphValue(record, 'P3T42')
  const index = graphValue(record, 'P4T42')
  if (!amount) return joinPresent([code, due], '.')
  return joinPresent([joinPresent([index ? `${index}.` : '', code, due], ' '), amount], ', ')
}

/** «№ 1234 от 01.02.2026» for licences (graphs 30 and 49). */
export const licenceLine = (fields: Fields, numberTag: string, dateTag: string): string => {
  const number = graphValue(fields, numberTag)
  const issued = graphDate(fields, dateTag)
  return number ? joinPresent([`№ ${number}`, issued ? `от ${issued}` : ''], ' ') : ''
}

/** Graph 54: numbered lines 1–5 of the declaring person. */
export const placeAndDateLines = (main: Fields): string[] => {
  const items: Array<[number, string]> = [
    [1, graphValue(main, 'P84T1')],
    [2, joinPresent([graphValue(main, 'P209T1'), graphValue(main, 'P211T1')], ', ')],
    [3, graphValue(main, 'P87T1')],
    [4, graphValue(main, 'P212T1')],
    [
      5,
      joinPresent(
        [graphValue(main, 'P86T1'), graphDate(main, 'P85T1'), graphValue(main, 'P210T1')],
        '/',
      ),
    ],
  ]
  return items.flatMap(([index, text]) => (text ? [`${index} — ${text}`] : []))
}
