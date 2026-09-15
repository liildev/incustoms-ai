import type { BoxCapacity } from '../lib/text-box'

/** Boxes of graphs 31–47 that can run out of space. `paymentLines` counts printed lines, not rows. */
export type GoodCapacity = {
  description: BoxCapacity
  previous: BoxCapacity
  documents: BoxCapacity
  paymentLines: number
}

/**
 * How much text a box of the printed form holds before its content moves to a supplement sheet.
 * Lines follow from the box heights in config/td1-layout.ts and config/td2-layout.ts at the print text
 * size (7pt × 1.2; 6pt × 1.1 for graphs 27, 30, 40 and 53); characters per line are close to what the rendered
 * sheets hold for mixed-case text. Capitals count 1.25 characters (lib/text-box.ts), so upper-case text moves
 * to the supplement earlier; the preview still reports any graph whose text is cut.
 */
export const MAIN_GOOD_CAPACITY: GoodCapacity = {
  description: { lines: 9, chars: 70 },
  previous: { lines: 2, chars: 54 },
  documents: { lines: 6, chars: 76 },
  paymentLines: 11,
}

export const ADDITIONAL_GOOD_CAPACITY: GoodCapacity = {
  description: { lines: 8, chars: 72 },
  previous: { lines: 2, chars: 50 },
  documents: { lines: 6, chars: 78 },
  paymentLines: 11,
}

/** Declaration-level boxes of the main sheet. */
export const HEADER_CAPACITY = {
  exporter: { lines: 5, chars: 52 },
  importer: { lines: 5, chars: 52 },
  financialParty: { lines: 3, chars: 54 },
  declarant: { lines: 3, chars: 52 },
  transport: { lines: 1, chars: 52 },
  loadingPlace: { lines: 2, chars: 36 },
  goodsLocation: { lines: 2, chars: 36 },
  deferral: { lines: 2, chars: 30 },
  warehouse: { lines: 2, chars: 30 },
  principal: { lines: 6, chars: 68 },
  destinationCustoms: { lines: 2, chars: 50 },
  placeAndDate: { lines: 7, chars: 40 },
} satisfies Record<string, BoxCapacity>

/** Goods per additional sheet (Instruction No. 2773, п. 17). */
export const GOODS_PER_ADDITIONAL_SHEET = 3
