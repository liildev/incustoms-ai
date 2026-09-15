import type { GtdDocument } from './gtd'
import { collectFromGoods } from './goods'

export const DOCUMENT_TAG = 'T9'

export type SupportingDocument = {
  goodNumber: string
  /** P4T9 — numeric document code. */
  code: string
  /** P6T9 — letter document code. */
  kind: string
  /** P7T9 */
  number: string
  /** P8T9 */
  date: string
  /** P12T9 — other information. */
  note: string
}

/** Supporting documents (box 44, T9) of all goods. */
export const listSupportingDocuments = (document: GtdDocument): SupportingDocument[] =>
  collectFromGoods(document, DOCUMENT_TAG).map(({ block, good }) => ({
    goodNumber: good.number,
    code: block.fields.P4T9 ?? '',
    kind: block.fields.P6T9 ?? '',
    number: block.fields.P7T9 ?? '',
    date: block.fields.P8T9 ?? '',
    note: block.fields.P12T9 ?? '',
  }))
