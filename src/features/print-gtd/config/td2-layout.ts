import type { Frame, GoodLayout, Rect } from './form-geometry'

export const TD2_FRAME: Frame = { width: 1132, height: 1731 }

/** Boxes of the additional sheet (ТД2) outside the goods slots. */
export const TD2_BOXES = {
  title: [12, 12, 580, 68],
  a: [777, 0, 1110, 170],
  parties: [80, 68, 600, 170],
  g1: [600, 30, 777, 118],
  g3: [600, 118, 688, 170],
  sheetMark: [688, 118, 777, 170],
  label47: [0, 1202, 80, 1731],
  totalLabel: [835, 1460, 1105, 1500],
  c: [835, 1595, 1105, 1720],
} as const satisfies Record<string, Rect>

const SLOT_TOP = 170
const SLOT_HEIGHT = 344

/** Graphs 31–46 of the good in slot 0, 1 or 2; the three slots are identical apart from their offset. */
export const td2GoodLayout = (slot: number): GoodLayout => {
  const top = SLOT_TOP + slot * SLOT_HEIGHT
  const at = (left: number, from: number, right: number, to: number): Rect => [
    left,
    top + from,
    right,
    top + to,
  ]
  return {
    label31: at(0, 0, 80, 210),
    g31: at(80, 0, 732, 210),
    consumer: at(80, 185, 242, 210),
    extraQuantity: at(617, 185, 732, 210),
    g32: at(660, 0, 732, 50),
    g33: at(732, 0, 1105, 50),
    g34: at(732, 50, 850, 95),
    g35: at(850, 50, 1007, 95),
    g36: at(1007, 50, 1105, 95),
    g37: at(732, 95, 850, 140),
    g38: at(850, 95, 1007, 140),
    g39: at(1007, 95, 1105, 140),
    g40: at(732, 140, 1105, 185),
    g41: at(732, 185, 893, 235),
    g42: at(893, 185, 1020, 235),
    g43: at(1020, 185, 1105, 235),
    label44: at(0, 210, 80, SLOT_HEIGHT),
    g44: at(80, 210, 732, SLOT_HEIGHT),
    g45: at(893, 235, 1105, 290),
    g46: at(893, 290, 1105, SLOT_HEIGHT),
  }
}

/** Graph 47 tables per good: first and third on the left, second on the right. */
export const TD2_PAYMENT_TABLES = [
  {
    rect: [80, 1202, 603, 1460],
    columns: [80, 140, 285, 430, 575, 603],
    total: 'Всего по первому товару:',
  },
  {
    rect: [603, 1202, 1105, 1460],
    columns: [603, 660, 805, 935, 1080, 1105],
    total: 'Всего по второму товару:',
  },
  {
    rect: [80, 1460, 603, 1720],
    columns: [80, 140, 285, 430, 575, 603],
    total: 'Всего по третьему товару:',
  },
] as const satisfies ReadonlyArray<{ rect: Rect; columns: readonly number[]; total: string }>

/** «Общая сумма» table: Вид платежа | Сумма | СП, closed by «Итого». */
export const TD2_SUMMARY_TABLE = {
  rect: [603, 1460, 835, 1720],
  columns: [603, 660, 805, 835],
} as const
