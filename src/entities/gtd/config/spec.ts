import catalog from './spec-catalog.json'

export type SpecCardinality = { min: number; max: number | null }

export type SpecEntry = {
  tag: string
  parent: string | null
  kind: 'block' | 'field'
  label: string
  type: 'text' | 'number' | 'date' | null
  /** Maximum number of characters (text) or digits (number). */
  length: number | null
  /** Maximum number of digits after the decimal point. */
  scale: number | null
  /** Cardinality within a GTD (as opposed to a KTD). */
  gtd: SpecCardinality | null
  ktd: SpecCardinality | null
}

/** Generated from the official specification; applied without implementation overrides. */
const entries = catalog.entries as SpecEntry[]

const byTag = new Map(entries.map((entry) => [entry.tag, entry]))
const orderByTag = new Map(entries.map((entry, index) => [entry.tag, index]))
const childrenByParent = new Map<string | null, SpecEntry[]>()
for (const entry of entries) {
  childrenByParent.set(entry.parent, [...(childrenByParent.get(entry.parent) ?? []), entry])
}

export const getSpec = (tag: string): SpecEntry | undefined => byTag.get(tag)

/** Position of the tag in the specification; unknown tags sort last. */
export const getSpecOrder = (tag: string): number => orderByTag.get(tag) ?? Number.MAX_SAFE_INTEGER

/** Specification entries nested directly in `parentTag`; `null` returns top-level sections. */
export const getChildSpecs = (parentTag: string | null): readonly SpecEntry[] =>
  childrenByParent.get(parentTag) ?? []

/** Label split into a short title and the parenthesized clarification, if any. */
export const splitSpecLabel = (label: string): { title: string; note: string | null } => {
  const match = /^(.+?)\s*\((.+)\)\.?$/.exec(label)
  if (!match?.[1] || !match[2] || match[1].length < 8 || match[2].length < 12) {
    return { title: label, note: null }
  }
  return { title: match[1], note: match[2] }
}
