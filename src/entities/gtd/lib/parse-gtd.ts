import { isXmlWhitespace, parseXml, type XmlElement, type XmlSyntaxError } from '@/shared/lib/xml'
import {
  BLOCK_TAG_PATTERN,
  FIELD_TAG_PATTERN,
  GTD_ROOT_TAG,
  gtdDocumentSchema,
  type BlockPath,
  type GtdBlock,
  type GtdDocument,
} from '../model/gtd'
import type { GtdIssue } from '../model/issue'

export type GtdParseResult =
  | { ok: true; document: GtdDocument; notices: GtdIssue[] }
  | { ok: false; errors: string[] }

const KNOWN_FOREIGN_ROOTS: Record<string, string> = {
  Documents:
    'Файл является описью электронных документов (edoc.xml), а не ГТД. Загрузите файл ГТД с корневым элементом GTD_eCopy_DefEdFormat.',
}

const describeSyntaxError = (error: XmlSyntaxError): string => {
  if (error.code === 'empty') return 'Файл пуст или не содержит XML-элементов.'
  if (error.code === 'doctype')
    return 'Файл содержит объявление DOCTYPE. Электронная копия ГТД не должна его содержать.'
  if (error.code === 'multiple-roots')
    return 'Файл содержит несколько корневых элементов. Ожидается один элемент GTD_eCopy_DefEdFormat.'
  const location = error.line === null ? '' : ` (строка ${error.line}, позиция ${error.column})`
  return `Файл не является корректным XML${location}: ${error.message}`
}

/** The specification itself mixes Cyrillic "Т" into tag names; XML tags are read as Latin. */
const CYRILLIC_T = /Т/g

const normalizeTag = (name: string): string => {
  const latin = name.replace(CYRILLIC_T, 'T')
  return latin !== name && (BLOCK_TAG_PATTERN.test(latin) || FIELD_TAG_PATTERN.test(latin))
    ? latin
    : name
}

type Context = { errors: string[]; notices: GtdIssue[] }

const isField = (element: XmlElement, tag: string): boolean =>
  FIELD_TAG_PATTERN.test(tag) || (!BLOCK_TAG_PATTERN.test(tag) && element.children.length === 0)

const toBlock = (element: XmlElement, tag: string, path: BlockPath, context: Context): GtdBlock => {
  const block: GtdBlock = { tag, attributes: element.attributes, fields: {}, blocks: [] }
  let reorderedField: string | null = null

  if (!isXmlWhitespace(element.text)) {
    context.errors.push(
      element.children.length > 0
        ? `Элемент ${tag} содержит текст вперемешку с вложенными элементами.`
        : `Раздел ${tag} содержит текст, хотя по формату состоит только из полей и разделов.`,
    )
  }

  for (const child of element.children) {
    const childTag = normalizeTag(child.name)
    if (childTag !== child.name) {
      context.notices.push({
        source: 'import',
        severity: 'warning',
        path,
        tag: childTag,
        message: `Тег «${child.name}» записан с кириллической буквой «Т». Он прочитан как ${childTag} и будет экспортирован латиницей.`,
      })
    }

    if (!isField(child, childTag)) {
      block.blocks.push(toBlock(child, childTag, [...path, block.blocks.length], context))
      continue
    }
    if (child.children.length > 0) {
      context.errors.push(`Поле ${childTag} в разделе ${tag} содержит вложенные элементы.`)
      continue
    }
    if (Object.keys(child.attributes).length > 0) {
      context.errors.push(
        `Поле ${childTag} в разделе ${tag} содержит атрибуты, которые формат ГТД не предусматривает.`,
      )
      continue
    }
    if (Object.hasOwn(block.fields, childTag)) {
      context.errors.push(`Раздел ${tag} содержит поле ${childTag} более одного раза.`)
      continue
    }
    if (block.blocks.length > 0) reorderedField ??= childTag
    block.fields[childTag] = child.text
  }

  // The model keeps fields and nested sections apart, so their interleaving cannot be reproduced.
  if (reorderedField !== null) {
    context.notices.push({
      source: 'import',
      severity: 'warning',
      path,
      tag: reorderedField,
      message: `Поле записано после вложенных разделов ${tag}. Данные сохраняются, но при экспорте поля раздела будут записаны перед вложенными разделами.`,
    })
  }
  return block
}

/** Parses GTD XML text into the normalized document model. */
export const parseGtd = (source: string): GtdParseResult => {
  const xml = parseXml(source)
  if (!xml.ok) return { ok: false, errors: [describeSyntaxError(xml.error)] }

  const rootName = xml.root.name
  if (rootName !== GTD_ROOT_TAG) {
    return {
      ok: false,
      errors: [
        KNOWN_FOREIGN_ROOTS[rootName] ??
          `Файл не содержит корневой элемент ${GTD_ROOT_TAG}. Найден элемент «${rootName}».`,
      ],
    }
  }

  const context: Context = { errors: [], notices: [] }
  const root = toBlock(xml.root, rootName, [], context)
  if (context.errors.length > 0) return { ok: false, errors: context.errors }

  const validated = gtdDocumentSchema.safeParse({ root })
  if (!validated.success)
    return { ok: false, errors: validated.error.issues.map((issue) => issue.message) }

  return { ok: true, document: validated.data, notices: context.notices }
}
