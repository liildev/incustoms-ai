import { findInvalidXmlChar } from '@/shared/lib/xml'
import { EXPORT_LIMITED_TAGS } from '../config/export-limits'
import { getSpec } from '../config/spec'
import type { GtdBlock, GtdDocument } from '../model/gtd'
import { serializeGtd } from './serialize-gtd'

export type GtdExportResult = { ok: true; xml: string } | { ok: false; errors: string[] }

/**
 * Sections repeated beyond the specification limit (T53 in T1, T54 in T53): tolerated when
 * reading, never written. Only sections placed where the specification defines them are counted,
 * as in check-spec.ts: the ГУПТП section repairs those, while a T53 misplaced elsewhere stays a warning.
 */
const findRepeatedSections = (block: GtdBlock, specParent: string | null): string[] => [
  ...[...EXPORT_LIMITED_TAGS].flatMap((tag) => {
    const spec = getSpec(tag)
    const limit = spec?.gtd?.max
    if (spec?.parent !== block.tag || limit === null || limit === undefined) return []
    const count = block.blocks.filter((child) => child.tag === tag).length
    if (count <= limit) return []
    return [
      `Раздел ${block.tag} содержит ${count} раздела ${tag} («${spec.label}»), а спецификация допускает не более ${limit}. Удалите лишние в разделе «ГУПТП» и повторите экспорт.`,
    ]
  }),
  ...block.blocks
    .filter(
      (child) => getSpec(child.tag)?.parent === specParent && getSpec(child.tag)?.kind === 'block',
    )
    .flatMap((child) => findRepeatedSections(child, child.tag)),
]

/**
 * Values XML 1.0 cannot represent. Parsing rejects them and forms refuse them, so this only guards
 * against writing a document that is not well-formed if one reaches the model another way.
 */
const findUnwritableValues = (block: GtdBlock): string[] => [
  ...[...Object.entries(block.fields), ...Object.entries(block.attributes)].flatMap(
    ([name, value]) => {
      const invalid = findInvalidXmlChar(value)
      return invalid ? [`${block.tag}/${name} содержит символ ${invalid}, недопустимый в XML.`] : []
    },
  ),
  ...block.blocks.flatMap(findUnwritableValues),
]

/**
 * Reasons the document cannot be exported: structures the specification forbids and values that cannot
 * be written as XML. Other deviations are warnings, because accepted declarations contain them.
 * The printable form applies the same rule, so it never shows a document export would refuse.
 */
export const findExportBlockers = (document: GtdDocument): string[] => [
  ...findRepeatedSections(document.root, null),
  ...findUnwritableValues(document.root),
]

/** Serializes the document for download unless `findExportBlockers` reports a reason not to. */
export const exportGtd = (document: GtdDocument): GtdExportResult => {
  const errors = findExportBlockers(document)
  return errors.length > 0 ? { ok: false, errors } : { ok: true, xml: serializeGtd(document) }
}
