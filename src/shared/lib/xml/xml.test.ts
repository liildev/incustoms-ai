import { describe, expect, it } from 'vitest'
import { buildXml } from './build-xml'
import { decodeXml } from './decode-xml'
import { parseXml } from './parse-xml'

describe('parseXml', () => {
  it('reports the location of malformed markup', () => {
    const result = parseXml('<root>\n  <a>1</b>\n</root>')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('syntax')
    expect(result.error.line).toBe(2)
  })

  it('rejects empty input and DOCTYPE declarations', () => {
    expect(parseXml('  ')).toMatchObject({ ok: false, error: { code: 'empty' } })
    expect(parseXml('<!DOCTYPE x [<!ENTITY a "b">]><x>&a;</x>')).toMatchObject({
      ok: false,
      error: { code: 'doctype' },
    })
  })

  it('refuses "<!DOCTYPE" even where comment-like text could hide a declaration', () => {
    const hidden = '<?x <!-- ?><!DOCTYPE r [<!ENTITY e "boom">]><?y --> ?><r>a</r>'
    expect(parseXml(hidden)).toMatchObject({ ok: false, error: { code: 'doctype' } })
  })

  it('keeps character data verbatim', () => {
    const result = parseXml('<r><a>0003728</a><b> x &amp; "y"\r\nz </b><c/></r>')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.root.children.map((child) => child.text)).toEqual(['0003728', ' x & "y"\nz ', ''])
  })
})

describe('parseXml — references', () => {
  it('resolves character references once and keeps escaped references literal', () => {
    const result = parseXml(
      '<r a="&#65;&amp;#66;&quot;"><a>&#1058;&#x41;|&amp;#65;|&lt;&apos;</a></r>',
    )
    if (!result.ok) throw new Error('fixture must parse')
    expect(result.root.attributes.a).toBe('A&#66;"')
    expect(result.root.children[0]?.text).toBe("ТA|&#65;|<'")
  })

  it('keeps CDATA content undecoded', () => {
    const result = parseXml('<r><![CDATA[&amp; <x>]]>tail&amp;</r>')
    if (!result.ok) throw new Error('fixture must parse')
    expect(result.root.text).toBe('&amp; <x>tail&')
  })

  it('rejects undefined entities', () => {
    expect(parseXml('<r>x&unknown;y</r>')).toMatchObject({ ok: false, error: { code: 'syntax' } })
  })

  it('round-trips references through buildXml without double escaping', () => {
    const parsed = parseXml('<r><a>&#1058;&amp;#65;</a></r>')
    if (!parsed.ok) throw new Error('fixture must parse')
    expect(parseXml(buildXml(parsed.root))).toEqual(parsed)
  })
})

describe('buildXml', () => {
  it('round-trips text, attributes and empty elements', () => {
    const source =
      '<r xmlns="" a="1 &amp; 2"><a>  0012 </a><b>&lt;tag&gt; &amp; "q"\nline</b><c></c></r>'
    const parsed = parseXml(source)
    if (!parsed.ok) throw new Error('fixture must parse')
    const rebuilt = parseXml(buildXml(parsed.root, { newline: '\r\n' }))
    expect(rebuilt).toEqual(parseXml(buildXml(parsed.root)))
    if (!rebuilt.ok) throw new Error('output must parse')
    expect(rebuilt.root).toEqual(parsed.root)
  })

  it('escapes markup characters but keeps quotes in text literal', () => {
    const xml = buildXml({
      name: 'r',
      attributes: { a: 'x "y" & <z>' },
      text: '',
      children: [{ name: 'b', attributes: {}, children: [], text: 'ООО "Ромашка" & <Ко>' }],
    })
    expect(xml).toContain('<r a="x &quot;y&quot; &amp; &lt;z&gt;">')
    expect(xml).toContain('<b>ООО "Ромашка" &amp; &lt;Ко&gt;</b>')
  })

  it('writes the declaration and the requested line endings', () => {
    const xml = buildXml({ name: 'r', attributes: {}, text: '', children: [] }, { newline: '\r\n' })
    expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>\r\n')).toBe(true)
    expect(xml.replace(/\r\n/g, '')).not.toContain('\n')
  })
})

describe('decodeXml', () => {
  it('decodes windows-1251 when declared', () => {
    const bytes = new Uint8Array([
      ...new TextEncoder().encode('<?xml version="1.0" encoding="windows-1251"?><a>'),
      0xc8,
      0xcc,
      ...new TextEncoder().encode('</a>'),
    ])
    expect(decodeXml(bytes.buffer)).toEqual({
      ok: true,
      text: '<?xml version="1.0" encoding="windows-1251"?><a>ИМ</a>',
    })
  })

  it('refuses encodings it cannot decode faithfully', () => {
    const bytes = new TextEncoder().encode('<?xml version="1.0" encoding="koi8-u"?><a/>')
    expect(decodeXml(bytes.buffer)).toEqual({
      ok: false,
      reason: 'unsupported-encoding',
      encoding: 'koi8-u',
    })
  })

  it('reports bytes that are invalid in the effective encoding instead of replacing them', () => {
    const bytes = new Uint8Array([
      ...new TextEncoder().encode('<a>'),
      0xc8,
      0xcc,
      ...new TextEncoder().encode('</a>'),
    ])
    expect(decodeXml(bytes.buffer)).toEqual({
      ok: false,
      reason: 'invalid-bytes',
      encoding: 'utf-8',
    })
  })
})
