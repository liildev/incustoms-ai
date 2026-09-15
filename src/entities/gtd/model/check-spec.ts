import { isDecimal } from '@/shared/lib/decimal'
import { findInvalidXmlChar } from '@/shared/lib/xml'
import { EXPORT_LIMITED_TAGS } from '../config/export-limits'
import { getChildSpecs, getSpec, type SpecEntry } from '../config/spec'
import type { BlockPath, GtdBlock } from './gtd'
import type { GtdIssue } from './issue'

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** YYYY-MM-DD that exists in the calendar (rejects 2026-02-30). */
const isIsoDate = (value: string): boolean => {
  const match = ISO_DATE.exec(value)
  if (!match) return false
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

const issue = (
  severity: GtdIssue['severity'],
  path: BlockPath,
  tag: string,
  message: string,
): GtdIssue => ({
  source: 'spec',
  severity,
  path,
  tag,
  message,
})

const checkValue = (spec: SpecEntry, value: string, path: BlockPath): GtdIssue[] => {
  if (value === '') return []
  const { tag, length, scale } = spec

  if (spec.type === 'date') {
    return isIsoDate(value)
      ? []
      : [issue('error', path, tag, `Значение «${value}» не является датой в формате ГГГГ-ММ-ДД.`)]
  }
  if (spec.type === 'number') {
    if (!isDecimal(value))
      return [issue('error', path, tag, `Значение «${value}» не является числом.`)]
    const [integer = '', fraction = ''] = value.replace('-', '').split('.')
    const issues: GtdIssue[] = []
    if (length !== null && integer.length + fraction.length > length) {
      issues.push(issue('warning', path, tag, `Число содержит больше ${length} цифр.`))
    }
    if (scale !== null && fraction.length > scale) {
      issues.push(issue('warning', path, tag, `Больше ${scale} знаков после точки.`))
    }
    return issues
  }
  if (length !== null && value.length > length) {
    return [
      issue('warning', path, tag, `Длина ${value.length} превышает допустимые ${length} символов.`),
    ]
  }
  return []
}

/**
 * `placed`: the section and all its ancestors sit where the specification defines them. Repetition
 * limits that block export apply only there: the ГУПТП section can repair T1 > T53 > T54, not a T53
 * misplaced elsewhere (that one is reported as a section outside the specification instead).
 */
const checkBlock = (block: GtdBlock, path: BlockPath, placed: boolean): GtdIssue[] => {
  const issues: GtdIssue[] = []
  const specParent = path.length === 0 ? null : block.tag
  const childSpecs = new Map(getChildSpecs(specParent).map((spec) => [spec.tag, spec]))

  for (const [tag, value] of Object.entries(block.fields)) {
    const spec = childSpecs.get(tag)
    if (!spec || spec.kind !== 'field') {
      issues.push(
        issue('warning', path, tag, `Поле не описано в спецификации для раздела ${block.tag}.`),
      )
      continue
    }
    if (spec.gtd?.max === 0)
      issues.push(issue('warning', path, tag, 'Поле не используется в ГТД (только в КТД).'))
    issues.push(...checkValue(spec, value, path))
  }

  const counts = new Map<string, number>()
  block.blocks.forEach((child, index) => {
    counts.set(child.tag, (counts.get(child.tag) ?? 0) + 1)
    if (childSpecs.get(child.tag)?.kind !== 'block') {
      issues.push(
        issue(
          'warning',
          path,
          child.tag,
          `Раздел не описан в спецификации для раздела ${block.tag}.`,
        ),
      )
    }
    issues.push(
      ...checkBlock(child, [...path, index], placed && childSpecs.get(child.tag)?.kind === 'block'),
    )
  })

  for (const spec of childSpecs.values()) {
    const cardinality = spec.gtd
    if (!cardinality) continue
    if (spec.kind === 'field') {
      const value = block.fields[spec.tag]
      if (cardinality.min > 0 && (value === undefined || value.trim() === '')) {
        const message =
          value === undefined
            ? 'Обязательное по спецификации поле отсутствует.'
            : 'Обязательное по спецификации поле не заполнено.'
        issues.push(issue('warning', path, spec.tag, message))
      }
      continue
    }
    const count = counts.get(spec.tag) ?? 0
    if (count < cardinality.min) {
      issues.push(
        issue('warning', path, spec.tag, 'Обязательный по спецификации раздел отсутствует.'),
      )
    }
    if (cardinality.max !== null && count > cardinality.max) {
      if (placed && EXPORT_LIMITED_TAGS.has(spec.tag)) {
        const message = `Раздел встречается ${count} раз, допускается не более ${cardinality.max}. Экспорт невозможен, пока лишние разделы не удалены.`
        issues.push(issue('error', path, spec.tag, message))
        continue
      }
      const message =
        cardinality.max === 0
          ? 'Раздел не используется в ГТД (только в КТД).'
          : `Раздел встречается ${count} раз, допускается не более ${cardinality.max}.`
      issues.push(issue('warning', path, spec.tag, message))
    }
  }
  return issues
}

/**
 * Checks the document against the specification catalog: required fields and sections,
 * value types, lengths and repetition limits (GTD column of the specification).
 *
 * Errors: values that cannot be read as their declared type (number, date) and sections that export
 * refuses when repeated beyond the limit (config/export-limits.ts).
 * Length, presence and unknown-tag findings are warnings: declarations accepted by customs
 * (docs/examples/gtd) deviate from the catalog in exactly these ways (P98T1 length,
 * missing P18T1, P200T9 absent from the specification). Export is blocked only by lib/export-gtd.ts.
 */
export const checkSpec = (root: GtdBlock): GtdIssue[] => checkBlock(root, [], true)

/**
 * Checks a single field value before it enters the document: characters XML cannot represent,
 * then type, length and scale from the specification entry (if the tag has one).
 */
export const checkFieldValue = (tag: string, value: string): GtdIssue[] => {
  const invalid = findInvalidXmlChar(value)
  if (invalid)
    return [issue('error', [], tag, `Значение содержит символ ${invalid}, недопустимый в XML.`)]
  const spec = getSpec(tag)
  return spec?.kind === 'field' ? checkValue(spec, value, []) : []
}
