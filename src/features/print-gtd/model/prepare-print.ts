import { findExportBlockers, type GtdDocument } from '@/entities/gtd'
import { printDeclaration } from './print-declaration'
import type { PrintForm } from './print-form'

export type PrintPreparation = { ok: true; form: PrintForm } | { ok: false; errors: string[] }

/**
 * Printing follows the export rule: a document that export refuses (a repeated T53 or T54, a value XML
 * cannot hold) is not turned into a printable form that would look valid. Warnings do not block.
 */
export const preparePrint = (document: GtdDocument): PrintPreparation => {
  const errors = findExportBlockers(document)
  return errors.length > 0 ? { ok: false, errors } : { ok: true, form: printDeclaration(document) }
}
