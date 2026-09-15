import {
  DESCRIPTION_TAG,
  DOCUMENT_TAG,
  type GtdBlock,
  PAYMENT_TAG,
  readImeiRecords,
} from '@/entities/gtd'
import type { GoodCapacity } from '../config/box-capacity'
import { boxText } from './box-text'
import {
  documentLine,
  graphDate,
  graphValue,
  previousDocumentLine,
  procedureCode,
  slashPair,
} from './graph-lines'
import { paymentGraph } from './payment-rows'
import type { DescriptionPosition, DocumentRow, PrintGood } from './print-form'

/** T8 — «Детализация по 40 графе ГТД предшествующие режимы». */
const PREVIOUS_DOCUMENT_TAG = 'T8'

const children = (block: GtdBlock, tag: string): GtdBlock[] =>
  block.blocks.filter((child) => child.tag === tag)

/** P4T2 is the text of graph 31 as the declarant wrote it: numbered items on separate lines. */
const descriptionLines = (good: GtdBlock): string[] => {
  const text = good.fields.P4T2 ?? ''
  return text.trim() ? text.split(/\r?\n/).map((line) => line.trimEnd()) : []
}

/** Graphs 31–47 of one good (T2). `regime` is graph 1, second subsection, used in graph 37. */
export const printGood = (good: GtdBlock, regime: string, capacity: GoodCapacity): PrintGood => {
  const fields = good.fields
  const positions = descriptionPositions(good)
  const detailed = positions.length > 1 || positions.some((position) => position.imei.length > 0)
  return {
    number: graphValue(fields, 'P8T2'),
    // A detailed good keeps one line of graph 31 free for the reference to the supplement.
    description: boxText(descriptionLines(good), {
      ...capacity.description,
      lines: capacity.description.lines - (detailed ? 1 : 0),
    }),
    consumer: slashPair(fields, 'P5T2', 'P204T2'),
    extraQuantity: graphValue(fields, 'P6T2'),
    code: graphValue(fields, 'P9T2'),
    origin: graphValue(fields, 'P10T2'),
    gross: graphValue(fields, 'P11T2'),
    procedure: procedureCode(regime, fields),
    net: graphValue(fields, 'P18T2'),
    quota: graphValue(fields, 'P19T2'),
    previous: boxText(
      children(good, PREVIOUS_DOCUMENT_TAG).map((record) => previousDocumentLine(record.fields)),
      capacity.previous,
    ),
    extraUnit: graphValue(fields, 'P20T2'),
    invoiceValue: graphValue(fields, 'P21T2'),
    ownUse: graphValue(fields, 'P22T2'),
    documents: boxText(
      children(good, DOCUMENT_TAG).map((record) => documentLine(record.fields)),
      capacity.documents,
    ),
    customsValue: graphValue(fields, 'P23T2'),
    statisticalValue: graphValue(fields, 'P24T2'),
    payments: paymentGraph(
      children(good, PAYMENT_TAG).map((record) => record.fields),
      capacity.paymentLines,
    ),
    detail: detailed ? positions : null,
  }
}

/** Supporting documents of graph 44 as table rows for the supplement sheet. */
export const documentRows = (good: GtdBlock): DocumentRow[] =>
  children(good, DOCUMENT_TAG).map(({ fields }) => ({
    code: graphValue(fields, 'P4T9'),
    kind: graphValue(fields, 'P6T9'),
    number: graphValue(fields, 'P7T9'),
    date: graphDate(fields, 'P8T9'),
    validUntil: graphDate(fields, 'P11T9'),
    amount: [graphValue(fields, 'P9T9'), graphValue(fields, 'P10T9')].filter(Boolean).join(' '),
    note: graphValue(fields, 'P12T9'),
  }))

/**
 * Graph 31 detail of the electronic GTD (T7) with the IMEI records of each position (T21), in document
 * order. IMEI values and sequence numbers are copied as written, so "01" stays "01".
 */
export const descriptionPositions = (good: GtdBlock): DescriptionPosition[] =>
  children(good, DESCRIPTION_TAG).map((position) => ({
    number: graphValue(position.fields, 'P4T7'),
    name: graphValue(position.fields, 'P5T7'),
    netWeight: graphValue(position.fields, 'P6T7'),
    extraQuantity: graphValue(position.fields, 'P7T7'),
    vin: graphValue(position.fields, 'P12T7'),
    engine: graphValue(position.fields, 'P13T7'),
    imei: readImeiRecords(position).map(({ device, slot, code }) => ({ device, slot, code })),
  }))
