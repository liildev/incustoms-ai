import { findInvalidXmlChar, XmlContentError } from './xml-syntax'

const PREDEFINED: Readonly<Record<string, string>> = {
  lt: '<',
  gt: '>',
  amp: '&',
  quot: '"',
  apos: "'",
}

const REFERENCE = /&(#x[0-9a-fA-F]+|#\d+|[A-Za-z_][\w.-]*);/g

/**
 * Resolves the five predefined XML entities and numeric character references in a single pass,
 * so "&amp;#65;" stays the literal text "&#65;". Undefined entities and references to characters
 * XML 1.0 does not allow (e.g. "&#1;", surrogates) are rejected.
 */
export const decodeReferences = (value: string): string =>
  value.includes('&')
    ? value.replace(REFERENCE, (reference, body: string) => {
        if (!body.startsWith('#')) {
          const character = PREDEFINED[body]
          if (character === undefined) throw new XmlContentError(`Undefined entity ${reference}`)
          return character
        }
        const codePoint =
          body[1] === 'x' ? Number.parseInt(body.slice(2), 16) : Number(body.slice(1))
        const character = codePoint > 0x10ffff ? null : String.fromCodePoint(codePoint)
        if (character === null || findInvalidXmlChar(character)) {
          throw new XmlContentError(`Invalid character reference ${reference}`)
        }
        return character
      })
    : value
