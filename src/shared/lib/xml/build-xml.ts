import { XMLBuilder } from 'fast-xml-parser'
import type { XmlElement } from './xml-element'
import { assertXmlChars, isXmlName, isXmlWhitespace } from './xml-syntax'

type OrderedNode = { [key: string]: OrderedNode[] | Record<string, string> | string }

export type BuildXmlOptions = {
  /** Line terminator of the output. */
  newline?: '\n' | '\r\n'
}

const DECLARATION = '<?xml version="1.0" encoding="utf-8"?>'

const builder = new XMLBuilder({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
  // Escaping is done in toOrderedNode: quotes in text stay literal, as in the source documents.
  processEntities: false,
})

// A literal CR would be read back as LF, and literal tabs or line breaks in attribute values as
// spaces (XML end-of-line and attribute-value normalization), so they are written as references.
const escapeText = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#13;')

const escapeAttribute = (value: string): string =>
  escapeText(value).replace(/"/g, '&quot;').replace(/\t/g, '&#9;').replace(/\n/g, '&#10;')

const checkName = (name: string): string => {
  if (!isXmlName(name)) throw new TypeError(`Cannot write "${name}" as an XML name`)
  return name
}

const toOrderedNode = (element: XmlElement): OrderedNode => {
  if (element.children.length > 0 && !isXmlWhitespace(element.text)) {
    throw new TypeError(
      `<${element.name}> has both child elements and text; mixed content is not supported`,
    )
  }
  assertXmlChars(element.text, `Text of <${element.name}>`)
  const content: OrderedNode[] =
    element.children.length > 0
      ? element.children.map(toOrderedNode)
      : element.text === ''
        ? []
        : [{ '#text': escapeText(element.text) }]
  const node: OrderedNode = { [checkName(element.name)]: content }
  const attributes = Object.entries(element.attributes)
  if (attributes.length > 0) {
    node[':@'] = Object.fromEntries(
      attributes.map(([name, value]) => {
        assertXmlChars(value, `Attribute ${name} of <${element.name}>`)
        return [checkName(name), escapeAttribute(value)]
      }),
    )
  }
  return node
}

/**
 * Serializes an element tree to indented UTF-8 XML with a declaration.
 * Throws instead of writing a document that would not be well-formed or would read back differently.
 */
export const buildXml = (root: XmlElement, { newline = '\n' }: BuildXmlOptions = {}): string => {
  const body = String(builder.build([toOrderedNode(root)])).trim()
  const xml = `${DECLARATION}\n${body}\n`
  return newline === '\n' ? xml : xml.replace(/\r?\n/g, newline)
}
