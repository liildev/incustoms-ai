const SUPPORTED_ENCODINGS = new Set(['utf-8', 'windows-1251'])

export type DecodeXmlResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'unsupported-encoding' | 'invalid-bytes'; encoding: string }

const startsWith = (bytes: Uint8Array, prefix: readonly number[]): boolean =>
  prefix.every((byte, index) => bytes[index] === byte)

const UTF8_BOM = [0xef, 0xbb, 0xbf]
const UTF16_BOMS = [
  [0xfe, 0xff],
  [0xff, 0xfe],
]

/** Canonical WHATWG name of an encoding label ("cp1251" → "windows-1251"), or null if unknown. */
const canonicalEncoding = (label: string): string | null => {
  try {
    return new TextDecoder(label).encoding
  } catch {
    return null
  }
}

/**
 * The encoding named by the XML declaration. Leading whitespace is tolerated here so that a misplaced
 * declaration is still decoded correctly and then reported by the parser as misplaced, instead of
 * surfacing as an encoding error.
 */
const declaredEncoding = (bytes: Uint8Array): string | null => {
  const head = String.fromCharCode(...bytes.subarray(0, 200))
  return (
    /^[ \t\r\n]*<\?xml[ \t\r\n][^>]*?\bencoding[ \t\r\n]*=[ \t\r\n]*(["'])([^"']+)\1/.exec(
      head,
    )?.[2] ?? null
  )
}

/**
 * Decodes raw XML bytes. A byte order mark decides the encoding; otherwise the XML declaration does,
 * and UTF-8 is used when neither is present, as the XML standard requires.
 * Bytes that are invalid in that encoding are reported instead of being replaced with U+FFFD.
 */
export const decodeXml = (buffer: ArrayBuffer): DecodeXmlResult => {
  const bytes = new Uint8Array(buffer)
  if (UTF16_BOMS.some((bom) => startsWith(bytes, bom))) {
    return { ok: false, reason: 'unsupported-encoding', encoding: 'utf-16' }
  }
  const bom = startsWith(bytes, UTF8_BOM)
  const declared = bom ? null : declaredEncoding(bytes)
  const encoding = declared === null ? 'utf-8' : canonicalEncoding(declared)
  if (encoding === null || !SUPPORTED_ENCODINGS.has(encoding)) {
    return { ok: false, reason: 'unsupported-encoding', encoding: declared ?? 'utf-8' }
  }
  try {
    return { ok: true, text: new TextDecoder(encoding, { fatal: true }).decode(bytes) }
  } catch {
    return { ok: false, reason: 'invalid-bytes', encoding }
  }
}
