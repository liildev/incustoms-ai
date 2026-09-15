import { type GtdBlock, type GtdDocument, getMainBlock, listGoods } from '@/entities/gtd'
import {
  ADDITIONAL_GOOD_CAPACITY,
  GOODS_PER_ADDITIONAL_SHEET,
  MAIN_GOOD_CAPACITY,
} from '../config/box-capacity'
import { documentRows, printGood } from './print-good'
import { printHeader } from './print-header'
import type { BoxText, PrintForm, PrintGood, Supplement } from './print-form'
import { printSchedule } from './print-schedule'

const chunk = <T>(items: readonly T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  )

/** A declaration-level graph whose text did not fit its box. */
const overflowSupplement = (graph: string, text: BoxText): Supplement[] =>
  text.overflow ? [{ graph, good: null, content: { kind: 'lines', lines: text.lines } }] : []

/**
 * Supplement sections of one good, in graph order (Instruction No. 2773, п. 18: goods number, then graph).
 * Graph 31 gets the electronic detail (T7 with IMEI) when the good has it (see PrintGood.detail).
 */
const goodSupplements = (block: GtdBlock, good: PrintGood, position: number): Supplement[] => {
  // Without P8T2 the good is named by its place in the file, marked so it cannot be taken for another good's number.
  const number = good.number || `${position + 1} (по порядку в файле)`
  const entries: Array<Supplement | false> = [
    good.description.overflow && {
      graph: '31',
      good: number,
      content: { kind: 'lines', lines: good.description.lines },
    },
    good.detail !== null && {
      graph: '31',
      good: number,
      content: { kind: 'positions', positions: good.detail },
    },
    good.previous.overflow && {
      graph: '40',
      good: number,
      content: { kind: 'lines', lines: good.previous.lines },
    },
    good.documents.overflow && {
      graph: '44',
      good: number,
      content: { kind: 'documents', rows: documentRows(block) },
    },
    good.payments.overflow && {
      graph: '47',
      good: number,
      content: { kind: 'payments', rows: good.payments.rows },
    },
  ]
  return entries.filter((entry): entry is Supplement => entry !== false)
}

/**
 * Builds the printable form from the document as it is in memory. Read-only: the document is not
 * changed, and only fields the mapping names are read, so unknown sections play no part.
 */
export const printDeclaration = (document: GtdDocument): PrintForm => {
  const main = getMainBlock(document).block
  const header = printHeader(main)
  const regime = header.declarationType[1]
  const goods = listGoods(document).map(({ block }, index) => ({
    block,
    good: printGood(block, regime, index === 0 ? MAIN_GOOD_CAPACITY : ADDITIONAL_GOOD_CAPACITY),
  }))
  const [first, ...rest] = goods
  const additionalSheets = chunk(
    rest.map(({ good }) => good),
    GOODS_PER_ADDITIONAL_SHEET,
  )

  const declarationSupplements = [
    overflowSupplement('2', header.exporter.text),
    overflowSupplement('8', header.importer.text),
    overflowSupplement('9', header.financialParty.text),
    overflowSupplement('14', header.declarant.text),
    overflowSupplement('18', header.departureTransport.text),
    overflowSupplement('21', header.borderTransport.text),
    overflowSupplement('27', header.loadingPlace),
    overflowSupplement('30', header.goodsLocation),
    overflowSupplement('48', header.deferral),
    overflowSupplement('49', header.warehouse),
    overflowSupplement('50', header.principal),
    overflowSupplement('53', header.destinationCustoms),
    overflowSupplement('54', header.placeAndDate),
  ].flat()

  return {
    header,
    sheetCount: 1 + additionalSheets.length,
    mainGood: first?.good ?? null,
    additionalSheets,
    supplements: [
      ...declarationSupplements,
      ...goods.flatMap(({ block, good }, position) => goodSupplements(block, good, position)),
    ],
    schedule: printSchedule(main),
  }
}
