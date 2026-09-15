import { isXmlWhitespace } from './xml-syntax'

/** Index right after `terminator`, searching from `from`; the source length if it never occurs. */
const skipPast = (source: string, from: number, terminator: string): number => {
  const index = source.indexOf(terminator, from)
  return index === -1 ? source.length : index + terminator.length
}

/** Index right after the `>` closing a start or end tag at `from`, ignoring `>` inside quoted values. */
const skipTag = (source: string, from: number): { end: number; selfClosing: boolean } => {
  let quote: string | null = null
  for (let index = from; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (char === quote) quote = null
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '>') {
      return { end: index + 1, selfClosing: source[index - 1] === '/' }
    }
  }
  return { end: source.length, selfClosing: false }
}

/**
 * Whether anything other than whitespace, comments and processing instructions follows the root
 * element. fast-xml-parser's validator and parser both accept and silently drop such content
 * ("<r/>tail"). Expects a document that already passed well-formedness validation.
 */
export const hasContentAfterRoot = (source: string): boolean => {
  let depth = 0
  let index = 0
  let rootEnd = -1
  while (index < source.length && rootEnd === -1) {
    const start = source.indexOf('<', index)
    if (start === -1) return false
    if (source.startsWith('<!--', start)) index = skipPast(source, start, '-->')
    else if (source.startsWith('<?', start)) index = skipPast(source, start, '?>')
    else if (source.startsWith('<![CDATA[', start)) index = skipPast(source, start, ']]>')
    else {
      const closing = source[start + 1] === '/'
      const { end, selfClosing } = skipTag(source, start)
      depth += closing ? -1 : selfClosing ? 0 : 1
      index = end
      if (depth === 0) rootEnd = end
    }
  }
  if (rootEnd === -1) return false
  index = rootEnd
  while (index < source.length) {
    const next = source.indexOf('<', index)
    if (!isXmlWhitespace(source.slice(index, next === -1 ? source.length : next))) return true
    if (next === -1) return false
    if (source.startsWith('<!--', next)) index = skipPast(source, next, '-->')
    else if (source.startsWith('<?', next)) index = skipPast(source, next, '?>')
    else return true
  }
  return false
}
