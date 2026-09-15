import { describe, expect, it } from 'vitest'
import { buildXml } from './build-xml'
import { decodeXml } from './decode-xml'
import { parseXml } from './parse-xml'
import type { XmlElement } from './xml-element'

const control = String.fromCharCode(1)
const element = (patch: Partial<XmlElement>): XmlElement => ({
  name: 'r',
  attributes: {},
  children: [],
  text: '',
  ...patch,
})

const expectSyntaxError = (source: string, message: RegExp) => {
  const result = parseXml(source)
  expect(result).toMatchObject({ ok: false, error: { code: 'syntax' } })
  if (!result.ok) expect(result.error.message).toMatch(message)
}

describe('parseXml — input that must not be accepted silently', () => {
  it('rejects markup declarations inside elements instead of reading them as elements', () => {
    expectSyntaxError('<r><!ENTITY x "y"></r>', /not a valid XML name/)
    expectSyntaxError('<r><!foo></r>', /not a valid XML name/)
  })

  it.each([
    ['text', '<r/>tail'],
    ['text ending with ">"', '<r/>tail>'],
    ['text after a comment', '<r/><!-- c -->tail'],
    ['text looking like a closed PI', '<r/><?pi a="?>"?>'],
    ['a non-breaking space', `<r/>${String.fromCharCode(0xa0)}`],
    ['CDATA', '<r/><![CDATA[tail]]>'],
    ['a reference', '<r/>&amp;'],
  ])('rejects %s after the root element instead of dropping it', (_, source) => {
    expectSyntaxError(source, /outside the root element/)
  })

  it('rejects characters XML 1.0 does not allow, literal or referenced', () => {
    expectSyntaxError(`<r><a>x${control}</a></r>`, /U\+0001/)
    expectSyntaxError(`<r a="${control}"/>`, /U\+0001/)
    expectSyntaxError('<r><a>&#1;</a></r>', /Invalid character reference/)
    expectSyntaxError('<r><a>&#xD800;</a></r>', /Invalid character reference/)
    expectSyntaxError('<r><a>&#x110000;</a></r>', /Invalid character reference/)
  })

  it('refuses names the parser library would rename, instead of changing them', () => {
    expectSyntaxError('<r><toString>1</toString></r>', /toString/)
    expectSyntaxError('<r valueOf="1"/>', /valueOf/)
    expectSyntaxError('<r><__proto__>1</__proto__></r>', /__proto__/)
  })

  it('reports excessive nesting as an error instead of throwing', () => {
    expectSyntaxError(`${'<a>'.repeat(500)}${'</a>'.repeat(500)}`, /nested/i)
  })
})

describe('parseXml — accepted input', () => {
  it('accepts comments, processing instructions and whitespace after the root element', () => {
    expect(parseXml('<r a=">"><b>></b></r>\r\n<!-- end -->\n<?pi x?>\n').ok).toBe(true)
  })

  it('normalizes literal whitespace in attribute values but keeps character references', () => {
    const result = parseXml('<r a="x\ty\nz&#10;w"/>')
    expect(result.ok && result.root.attributes.a).toBe('x y z\nw')
  })

  it('keeps namespace prefixes and namespace declarations verbatim', () => {
    const result = parseXml('<x:r xmlns:x="urn:a"><x:a x:b="1">t</x:a></x:r>')
    expect(result).toEqual({
      ok: true,
      root: element({
        name: 'x:r',
        attributes: { 'xmlns:x': 'urn:a' },
        children: [element({ name: 'x:a', attributes: { 'x:b': '1' }, text: 't' })],
      }),
    })
  })

  it('does not keep comments or processing instructions, but keeps the text around them', () => {
    const result = parseXml('<?xml version="1.0"?><!-- c --><r><a>ab<!-- c -->cd<?pi x?>ef</a></r>')
    expect(result.ok && result.root.children[0]?.text).toBe('abcdef')
  })
})

describe('buildXml — output reads back to the same tree', () => {
  it('writes carriage returns, tabs and line breaks so XML normalization cannot change them', () => {
    const tree = element({
      attributes: { a: 'x\ty\nz\r' },
      children: [element({ name: 'b', text: 'line\r\nnext\rlast' })],
    })
    const reparsed = parseXml(buildXml(tree, { newline: '\r\n' }))
    expect(reparsed).toEqual({ ok: true, root: tree })
  })

  it('refuses trees it cannot write faithfully', () => {
    expect(() => buildXml(element({ text: 'x', children: [element({ name: 'a' })] }))).toThrow(
      /mixed content/,
    )
    expect(() => buildXml(element({ text: `x${control}` }))).toThrow(/U\+0001/)
    expect(() => buildXml(element({ name: '!ENTITY' }))).toThrow(/XML name/)
  })
})

describe('decodeXml — encoding detection', () => {
  const bytes = (...parts: Array<string | number[]>) =>
    new Uint8Array(
      parts.flatMap((part) =>
        typeof part === 'string' ? [...new TextEncoder().encode(part)] : part,
      ),
    ).buffer

  it('lets a UTF-8 byte order mark win over the declaration', () => {
    expect(
      decodeXml(bytes([0xef, 0xbb, 0xbf], '<?xml version="1.0" encoding="windows-1251"?><a>Т</a>')),
    ).toEqual({
      ok: true,
      text: '<?xml version="1.0" encoding="windows-1251"?><a>Т</a>',
    })
  })

  it('reads the declaration with spaces around "=" and encoding aliases', () => {
    expect(
      decodeXml(bytes('<?xml version="1.0" encoding = \'CP1251\'?><a>', [0xc8, 0xcc], '</a>')),
    ).toEqual({
      ok: true,
      text: '<?xml version="1.0" encoding = \'CP1251\'?><a>ИМ</a>',
    })
  })

  it('decodes a declaration preceded by whitespace, leaving its position to the parser', () => {
    const decoded = decodeXml(
      bytes('\n<?xml version="1.0" encoding="windows-1251"?><a>', [0xc8, 0xcc], '</a>'),
    )
    expect(decoded).toMatchObject({ ok: true, text: expect.stringContaining('<a>ИМ</a>') })
    if (decoded.ok) {
      expect(parseXml(decoded.text)).toMatchObject({
        ok: false,
        error: { message: expect.stringContaining('only at the start') },
      })
    }
  })

  it('ignores an encoding whose quotes do not match', () => {
    expect(decodeXml(bytes('<?xml version="1.0" encoding="windows-1251\'?><a/>'))).toMatchObject({
      ok: true,
    })
  })

  it('reports UTF-16 files as unsupported instead of as broken bytes', () => {
    expect(decodeXml(bytes([0xff, 0xfe], [0x3c, 0x00]))).toEqual({
      ok: false,
      reason: 'unsupported-encoding',
      encoding: 'utf-16',
    })
  })
})
