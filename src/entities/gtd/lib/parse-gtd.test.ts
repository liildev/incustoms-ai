import { describe, expect, it } from 'vitest'
import april14 from '/docs/examples/gtd/gtd-2026-04-14.xml?raw'
import april15 from '/docs/examples/gtd/gtd-2026-04-15.xml.xml?raw'
import edoc from '/docs/examples/edoc/edoc-2026-04-15.xml?raw'
import { childBlocks } from '../model/block'
import { getMainBlock, listGoods } from '../model/goods'
import { descriptionXml, gtdXml } from '../test/gtd-fixture'
import { parseGtd } from './parse-gtd'

const parseOk = (xml: string) => {
  const result = parseGtd(xml)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result
}

describe('parseGtd — official examples', () => {
  it.each([
    ['2026-04-14', april14, '253863'],
    ['2026-04-15', april15, '24720'],
  ])('loads the %s declaration', (_, xml, netWeight) => {
    const { document } = parseOk(xml)
    const [good] = listGoods(document)
    expect(good?.block.fields.P18T2).toBe(netWeight)
    expect(getMainBlock(document).block.fields.P3T1).toBe('ИМ')
  })

  it('keeps leading zeros and multi-line values verbatim', () => {
    const { document } = parseOk(april15)
    const main = getMainBlock(document).block
    expect(main.fields.P21T1).toBe('0000671')
    expect(listGoods(document)[0]?.block.fields.P4T2).toContain('наливом. \nПроизводитель')
  })

  it('accepts declarations without T21 and T53/T54', () => {
    const { document } = parseOk(april14)
    const tags = JSON.stringify(document)
    expect(tags).not.toContain('"T21"')
    expect(tags).not.toContain('"T53"')
  })
})

describe('parseGtd — errors', () => {
  it('describes malformed XML with its location', () => {
    const result = parseGtd('<GTD_eCopy_DefEdFormat><T1></T2></GTD_eCopy_DefEdFormat>')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors[0]).toMatch(/^Файл не является корректным XML \(строка 1, позиция \d+\)/)
  })

  it('names the missing root element', () => {
    expect(parseGtd('<Declaration><T1/></Declaration>')).toEqual({
      ok: false,
      errors: [
        'Файл не содержит корневой элемент GTD_eCopy_DefEdFormat. Найден элемент «Declaration».',
      ],
    })
  })

  it('recognizes an electronic document inventory', () => {
    const result = parseGtd(edoc)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors[0]).toContain('описью электронных документов')
  })

  it('requires exactly one T1 section', () => {
    const result = parseGtd('<GTD_eCopy_DefEdFormat><T1/><T1/></GTD_eCopy_DefEdFormat>')
    expect(result).toMatchObject({
      ok: false,
      errors: [expect.stringContaining('ровно один раздел T1')],
    })
  })

  it('refuses duplicate fields instead of silently dropping data', () => {
    const result = parseGtd(gtdXml({ goods: ['<P9T2>1</P9T2><P9T2>2</P9T2>'] }))
    expect(result).toEqual({
      ok: false,
      errors: ['Раздел T2 содержит поле P9T2 более одного раза.'],
    })
  })
})

describe('parseGtd — lossless reading', () => {
  it('refuses text inside a section element instead of dropping it', () => {
    const result = parseGtd(gtdXml({ main: '<T99>lost text</T99>' }))
    expect(result).toMatchObject({
      ok: false,
      errors: [expect.stringContaining('Раздел T99 содержит текст')],
    })
  })

  it('keeps character references as characters through a round trip', () => {
    const result = parseGtd(gtdXml({ goods: ['<P4T2>&#1058;овар &amp;#65;</P4T2>'] }))
    if (!result.ok) throw new Error(result.errors.join('\n'))
    expect(listGoods(result.document)[0]?.block.fields.P4T2).toBe('Товар &#65;')
  })
})

describe('parseGtd — normalization', () => {
  it('stores a single repeated section as an array', () => {
    const { document } = parseOk(gtdXml({ goods: ['<T8><P4T8>1</P4T8></T8>'] }))
    const [good] = listGoods(document)
    if (!good) throw new Error('good expected')
    expect(childBlocks(good, 'T8')).toHaveLength(1)
  })

  it('keeps multiple repeated sections in document order', () => {
    const { document } = parseOk(
      gtdXml({ goods: ['<T9><P7T9>A</P7T9></T9><T9><P7T9>B</P7T9></T9><T9><P7T9>C</P7T9></T9>'] }),
    )
    const [good] = listGoods(document)
    if (!good) throw new Error('good expected')
    expect(childBlocks(good, 'T9').map(({ block }) => block.fields.P7T9)).toEqual(['A', 'B', 'C'])
  })

  it('reads Cyrillic "Т" in tag names as Latin and reports it', () => {
    const result = parseOk(gtdXml({ main: '<Т53><P3Т53>27009</P3Т53></Т53>' }))
    const [schedule] = childBlocks(getMainBlock(result.document), 'T53')
    expect(schedule?.block.fields).toEqual({ P3T53: '27009' })
    expect(result.notices.map((notice) => notice.tag)).toEqual(['T53', 'P3T53'])
  })

  it('keeps sections and fields unknown to the specification', () => {
    const { document } = parseOk(
      gtdXml({ goods: [descriptionXml('<X1><Y>1</Y></X1><P99T7>v</P99T7>')] }),
    )
    const [description] = childBlocks(listGoods(document)[0]!, 'T7')
    expect(description?.block.fields.P99T7).toBe('v')
    expect(description?.block.blocks[0]).toEqual({
      tag: 'X1',
      attributes: {},
      fields: { Y: '1' },
      blocks: [],
    })
  })
})
