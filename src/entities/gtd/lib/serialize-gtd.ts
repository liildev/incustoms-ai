import { buildXml, type XmlElement } from '@/shared/lib/xml'
import type { GtdBlock, GtdDocument } from '../model/gtd'

const toElement = (block: GtdBlock): XmlElement => ({
  name: block.tag,
  attributes: block.attributes,
  text: '',
  children: [
    ...Object.entries(block.fields).map(([name, text]) => ({
      name,
      attributes: {},
      children: [],
      text,
    })),
    ...block.blocks.map(toElement),
  ],
})

/**
 * Serializes the document to GTD XML: UTF-8, two-space indentation and CRLF line endings,
 * matching the official examples in docs/examples/gtd.
 */
export const serializeGtd = (document: GtdDocument): string =>
  buildXml(toElement(document.root), { newline: '\r\n' })
