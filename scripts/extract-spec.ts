/**
 * Extracts the field catalog from the official GTD format specification
 * (docs/spec/gtd-format-2026.docx) into a JSON file consumed by the app.
 *
 * The catalog is generated, never edited by hand.
 *
 * Nesting is derived from the grid column where a row's tag cell starts (w:gridBefore + w:gridSpan).
 * The specification places a nested section at the column of its parent's fields, e.g. T34 starts in
 * the column of the T27 fields, and real accepted XML (docs/examples/gtd) confirms T26 > T27 > T34.
 *
 * The script fails on structural problems it cannot resolve without guessing (duplicate tags, a field
 * outside its own section, tag-like cells it cannot read) and prints contradictions in the source
 * document as notes without resolving them beyond the rules stated below.
 *
 * Usage: bun run spec:extract          regenerate the catalog
 *        bun run spec:check            fail if the committed catalog differs from the specification
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'
import { readZipEntry } from './read-zip-entry.ts'

const SOURCE = 'docs/spec/gtd-format-2026.docx'
const TARGET = 'src/entities/gtd/config/spec-catalog.json'

/** Index of the overview table (structure tree) and the field table in the document. */
const OVERVIEW_TABLE = 1
const FIELD_TABLE = 2

type OrderedNode = Record<string, OrderedNode[] | Record<string, string> | string>

type Cell = { column: number; text: string }

type Cardinality = { min: number; max: number | null }

type CatalogEntry = {
  tag: string
  parent: string | null
  kind: 'block' | 'field'
  label: string
  type: 'text' | 'number' | 'date' | null
  length: number | null
  scale: number | null
  gtd: Cardinality | null
  ktd: Cardinality | null
}

const xml = readZipEntry(SOURCE, 'word/document.xml')

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: false,
  trimValues: false,
})

const tree = parser.parse(xml) as OrderedNode[]

const childrenOf = (node: OrderedNode, name: string): OrderedNode[] => {
  const value = node[name]
  return Array.isArray(value) ? value : []
}

const findAll = (nodes: OrderedNode[], name: string): OrderedNode[] =>
  nodes.flatMap((node) => {
    const own = name in node ? [node] : []
    const nested = Object.entries(node).flatMap(([key, value]) =>
      key === name || !Array.isArray(value) ? [] : findAll(value, name),
    )
    return [...own, ...nested]
  })

const textOf = (nodes: OrderedNode[]): string =>
  nodes
    .map((node) => {
      if (typeof node['#text'] === 'string') return node['#text']
      return Object.values(node)
        .map((value) => (Array.isArray(value) ? textOf(value) : ''))
        .join('')
    })
    .join('')

const tables = findAll(tree, 'w:tbl')

/** Integer `w:val` of a property element (e.g. w:gridSpan) inside a w:tcPr / w:trPr node. */
const propertyValue = (node: OrderedNode, container: string, property: string): number | null => {
  const attributes = childrenOf(node, container).find((child) => property in child)?.[':@']
  const value =
    attributes && typeof attributes === 'object' && !Array.isArray(attributes)
      ? attributes['w:val']
      : undefined
  return value === undefined ? null : Number(value)
}

const readRows = (tableIndex: number): Cell[][] => {
  const table = tables[tableIndex]
  if (!table) throw new Error(`Table ${tableIndex} not found in ${SOURCE}`)
  return childrenOf(table, 'w:tbl')
    .filter((node) => 'w:tr' in node)
    .map((row) => {
      const rowContent = childrenOf(row, 'w:tr')
      const rowProperties = rowContent.find((node) => 'w:trPr' in node)
      let column = rowProperties ? (propertyValue(rowProperties, 'w:trPr', 'w:gridBefore') ?? 0) : 0
      return rowContent
        .filter((node) => 'w:tc' in node)
        .map((cell) => {
          const cellContent = childrenOf(cell, 'w:tc')
          const cellProperties = cellContent.find((node) => 'w:tcPr' in node)
          const span = cellProperties
            ? (propertyValue(cellProperties, 'w:tcPr', 'w:gridSpan') ?? 1)
            : 1
          const result = { column, text: textOf(cellContent).replace(/\s+/g, ' ').trim() }
          column += span
          return result
        })
    })
}

/** Texts starting at the first non-empty cell, and that cell's grid column. */
const splitRow = (cells: Cell[]): { column: number; values: string[] } => {
  const start = cells.findIndex((cell) => cell.text !== '')
  return start === -1
    ? { column: -1, values: [] }
    : { column: cells[start]?.column ?? -1, values: cells.slice(start).map((cell) => cell.text) }
}

/** The specification mixes Cyrillic "Т" into some tag names (e.g. "Т54"); XML uses Latin. */
const normalizeTag = (value: string): string => value.replace(/Т/g, 'T').trim()

const TAG_PATTERN = /^(P\d+)?T\d+$/
/** A cell that looks like a tag (Latin or Cyrillic P/T followed by digits) but is not one. */
const TAG_LIKE = /^[PРTТ]\s*\d/

/** Unreadable structure: the catalog is not written. */
const problems: string[] = []
/** Contradictions or gaps in the specification itself, kept as extracted. */
const notes: string[] = []

const readTag = (value: string, table: string): string | null => {
  const tag = normalizeTag(value)
  if (TAG_PATTERN.test(tag)) return tag
  if (TAG_LIKE.test(value.trim())) problems.push(`${table}: cannot read tag "${value}"`)
  return null
}

const parseCardinality = (value: string): Cardinality | null => {
  const match = /\[\s*(\d+)\s*(?:(?:\.\.|…|-)\s*(\d+|n))?\s*\]/.exec(value)
  if (!match) return null
  const min = Number(match[1])
  if (match[2] === undefined) return { min, max: min }
  return { min, max: match[2] === 'n' ? null : Number(match[2]) }
}

const parseType = (value: string): CatalogEntry['type'] => {
  const normalized = value.replace(/T/g, 'Т')
  if (normalized === 'Т') return 'text'
  if (normalized === 'Ч') return 'number'
  if (normalized === 'Д') return 'date'
  return null
}

const parseInteger = (value: string | undefined): number | null =>
  value && /^\d+$/.test(value) ? Number(value) : null

type OverviewRow = { label: string; gtd: Cardinality | null; ktd: Cardinality | null }

/**
 * The overview table states whether a block must be present in a declaration,
 * while the field table states how many times it may repeat. The two tables
 * disagree on minimums (e.g. T42 is [0..1] in the overview and [1..n] in the
 * field table; accepted real declarations omit T42), so the minimum comes from
 * the overview and the maximum from the field table.
 */
const overview = new Map<string, OverviewRow>()
for (const cells of readRows(OVERVIEW_TABLE)) {
  const values = cells.map((cell) => cell.text).filter(Boolean)
  const tag = readTag(values[0] ?? '', 'overview table')
  if (tag === null) continue
  overview.set(tag, {
    label: values[1] ?? '',
    gtd: parseCardinality(values[2] ?? ''),
    ktd: parseCardinality(values[3] ?? ''),
  })
}

const combine = (
  presence: Cardinality | null | undefined,
  repetition: Cardinality | null,
): Cardinality | null => {
  if (!presence) return repetition
  if (!repetition) return presence
  return { min: presence.min, max: repetition.max }
}

const entries: CatalogEntry[] = []
/** Open sections with the grid column of their tag cell. */
const openBlocks: Array<{ tag: string; column: number }> = []

for (const cells of readRows(FIELD_TABLE)) {
  const { column, values } = splitRow(cells)
  const tag = readTag(values[0] ?? '', 'field table')
  if (tag === null) continue

  while ((openBlocks.at(-1)?.column ?? -1) >= column) openBlocks.pop()
  const parent = openBlocks.at(-1)?.tag ?? null
  const isBlock = tag.startsWith('T')

  if (isBlock) {
    // Block rows: tag | label | (empty type/length/scale cells) | gtd | ktd
    const cardinalities = values.slice(2).filter((value) => value !== '')
    const summary = overview.get(tag)
    entries.push({
      tag,
      parent,
      kind: 'block',
      label: summary?.label || values[1] || tag,
      type: null,
      length: null,
      scale: null,
      gtd: combine(summary?.gtd, parseCardinality(cardinalities.at(-2) ?? '')),
      ktd: combine(summary?.ktd, parseCardinality(cardinalities.at(-1) ?? '')),
    })
    openBlocks.push({ tag, column })
    continue
  }

  // Field rows: tag | label | type | length | scale | gtd | ktd
  entries.push({
    tag,
    parent,
    kind: 'field',
    label: values[1] ?? tag,
    type: parseType(values[2] ?? ''),
    length: parseInteger(values[3]),
    scale: parseInteger(values[4]),
    gtd: parseCardinality(values[5] ?? ''),
    ktd: parseCardinality(values[6] ?? ''),
  })
}

const tags = entries.map((entry) => entry.tag)
for (const tag of new Set(tags.filter((tag, index) => tags.indexOf(tag) !== index))) {
  problems.push(`${tag} occurs more than once in the field table`)
}
for (const entry of entries) {
  const section = entry.tag.replace(/^P\d+/, '')
  if (entry.kind === 'field' && entry.parent !== section) {
    problems.push(`${entry.tag} is nested in ${entry.parent ?? 'no section'} instead of ${section}`)
  }
  if (entry.gtd === null) notes.push(`${entry.tag}: no readable GTD cardinality`)
  if (entry.scale !== null && entry.type !== 'number') {
    notes.push(`${entry.tag}: decimal places given for a non-number field`)
  }
  const presence = overview.get(entry.tag)?.gtd
  if (entry.kind === 'block' && presence?.max === 0 && entry.gtd?.max !== 0) {
    notes.push(`${entry.tag}: overview marks it unused in a GTD, the field table allows it`)
  }
}
for (const tag of overview.keys()) {
  if (!tags.includes(tag)) notes.push(`${tag}: listed in the overview table only`)
}

const checkOnly = process.argv.includes('--check')
if (!checkOnly) for (const note of notes) console.warn(`note: ${note}`)
if (problems.length > 0) {
  for (const problem of problems) console.error(`error: ${problem}`)
  process.exit(1)
}

const output = `${JSON.stringify({ source: SOURCE, entries }, null, 2)}\n`
if (checkOnly) {
  if (readFileSync(TARGET, 'utf8') !== output) {
    console.error(`${TARGET} does not match ${SOURCE}. Run: bun run spec:extract`)
    process.exit(1)
  }
  console.log(`${TARGET} matches ${SOURCE} (${entries.length} entries)`)
} else {
  writeFileSync(TARGET, output)
  console.log(`Extracted ${entries.length} catalog entries to ${TARGET}`)
}
