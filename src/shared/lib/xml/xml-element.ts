/** Order-preserving, library-independent representation of an XML element. */
export type XmlElement = {
  name: string
  attributes: Record<string, string>
  children: XmlElement[]
  /**
   * Concatenated character data (CDATA included), untrimmed.
   * Whitespace-only text of elements with child elements is treated as indentation and dropped.
   */
  text: string
}
