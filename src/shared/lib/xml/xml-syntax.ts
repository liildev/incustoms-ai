/** Input that violates XML well-formedness rules not enforced by fast-xml-parser. */
export class XmlContentError extends Error {}

// XML 1.0 (Fifth Edition) §2.2 Char and §2.3 NameStartChar / NameChar.
const INVALID_CHAR = new RegExp(
  '[^\\t\\n\\r\\u0020-\\uD7FF\\uE000-\\uFFFD\\u{10000}-\\u{10FFFF}]',
  'u',
)
const NAME_START =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D' +
  '\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}'
const NAME = new RegExp(
  `^[${NAME_START}][${NAME_START}\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`,
  'u',
)

/** The first character XML 1.0 cannot represent (e.g. U+0001 or a lone surrogate), as "U+XXXX". */
export const findInvalidXmlChar = (value: string): string | null => {
  const codePoint = INVALID_CHAR.exec(value)?.[0].codePointAt(0)
  return codePoint === undefined
    ? null
    : `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
}

export const isXmlName = (value: string): boolean => NAME.test(value)

/** Throws XmlContentError when `value` contains a character XML 1.0 does not allow. */
export const assertXmlChars = (value: string, where: string): void => {
  const invalid = findInvalidXmlChar(value)
  if (invalid) {
    throw new XmlContentError(
      `${where} contains character ${invalid}, which XML 1.0 does not allow`,
    )
  }
}

/** XML `S` production: space, tab, CR, LF. Unlike String#trim, NBSP and U+FEFF are content. */
export const isXmlWhitespace = (value: string): boolean => /^[ \t\r\n]*$/.test(value)
