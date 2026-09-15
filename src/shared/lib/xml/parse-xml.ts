import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { hasContentAfterRoot } from './content-after-root'
import { decodeReferences } from './decode-references'
import type { XmlElement } from './xml-element'
import { assertXmlChars, isXmlName, isXmlWhitespace, XmlContentError } from './xml-syntax'

export type XmlSyntaxError = {
  code: 'syntax' | 'doctype' | 'empty' | 'multiple-roots'
  message: string
  line: number | null
  column: number | null
}

export type XmlParseResult = { ok: true; root: XmlElement } | { ok: false; error: XmlSyntaxError }

type OrderedNode = { [key: string]: OrderedNode[] | Record<string, string> | string }

const ATTRIBUTES_KEY = ':@'
const TEXT_KEY = '#text'
const CDATA_KEY = '#cdata'

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  ignoreDeclaration: true,
  ignorePiTags: true,
  // References are resolved by decodeReferences; CDATA is kept apart so its content is never decoded.
  processEntities: false,
  htmlEntities: false,
  cdataPropName: CDATA_KEY,
  // The library renames names such as "toString" to "__toString"; refuse them instead of changing data.
  onDangerousProperty: (name) => {
    throw new XmlContentError(`Name "${name}" is not supported`)
  },
})

const failure = (code: XmlSyntaxError['code'], message: string): XmlParseResult => ({
  ok: false,
  error: { code, message, line: null, column: null },
})

const textOf = (nodes: OrderedNode[]): string =>
  nodes.map((node) => (typeof node[TEXT_KEY] === 'string' ? node[TEXT_KEY] : '')).join('')

const checkName = (name: string): string => {
  if (!isXmlName(name)) throw new XmlContentError(`"${name}" is not a valid XML name`)
  return name
}

const toElement = (node: OrderedNode): XmlElement | null => {
  const name = Object.keys(node).find((key) => key !== ATTRIBUTES_KEY)
  if (!name || name === TEXT_KEY || name === CDATA_KEY) return null
  const content = node[name]
  const attributes = node[ATTRIBUTES_KEY]
  const element: XmlElement = {
    name: checkName(name),
    attributes:
      attributes && typeof attributes === 'object' && !Array.isArray(attributes)
        ? Object.fromEntries(
            // Attribute-value normalization (XML §3.3.3): literal whitespace characters become
            // spaces before references are resolved, so "&#10;" still yields a line break.
            Object.entries(attributes).map(([key, value]) => [
              checkName(key),
              decodeReferences(value.replace(/[\t\n\r]/g, ' ')),
            ]),
          )
        : {},
    children: [],
    text: '',
  }
  for (const child of Array.isArray(content) ? content : []) {
    const text = child[TEXT_KEY]
    if (typeof text === 'string') {
      element.text += decodeReferences(text)
      continue
    }
    const cdata = child[CDATA_KEY]
    if (Array.isArray(cdata)) {
      element.text += textOf(cdata)
      continue
    }
    const nested = toElement(child)
    if (nested) element.children.push(nested)
  }
  for (const value of Object.values(element.attributes))
    assertXmlChars(value, `Attribute of <${name}>`)
  assertXmlChars(element.text, `Text of <${name}>`)
  // Whitespace between child elements is indentation, not data.
  if (element.children.length > 0 && isXmlWhitespace(element.text)) element.text = ''
  return element
}

/**
 * Parses XML text into an order-preserving element tree.
 * Character data is kept verbatim (no trimming, no number coercion) so that
 * values such as "0003728" survive a round trip unchanged.
 * Comments and processing instructions are not part of the tree.
 */
export const parseXml = (source: string): XmlParseResult => {
  if (source.trim() === '') return failure('empty', 'Document is empty')
  // Deliberately over-broad: "<!DOCTYPE" inside a comment or CDATA is refused too. Stripping those with a
  // regex would let processing instructions or attribute values hide a real declaration.
  if (/<!DOCTYPE/i.test(source)) return failure('doctype', 'DOCTYPE declarations are not allowed')

  const validation = XMLValidator.validate(source)
  if (validation !== true) {
    const { msg, line, col } = validation.err
    return { ok: false, error: { code: 'syntax', message: msg, line, column: col } }
  }

  let nodes: OrderedNode[]
  try {
    nodes = parser.parse(source) as OrderedNode[]
  } catch (error) {
    // fast-xml-parser throws plain errors for input it refuses (nesting limit, reserved names).
    if (!(error instanceof Error)) throw error
    return failure('syntax', error.message)
  }
  if (hasContentAfterRoot(source)) {
    return failure('syntax', 'Text outside the root element is not allowed')
  }

  let roots: XmlElement[]
  try {
    roots = nodes.map(toElement).filter((element): element is XmlElement => element !== null)
  } catch (error) {
    if (!(error instanceof XmlContentError)) throw error
    return failure('syntax', error.message)
  }

  const [root, ...rest] = roots
  if (!root) return failure('empty', 'Document has no root element')
  if (rest.length > 0) return failure('multiple-roots', 'Document has more than one root element')
  return { ok: true, root }
}
