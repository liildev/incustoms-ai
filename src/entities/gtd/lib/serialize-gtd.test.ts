import { describe, expect, it } from 'vitest'
import april14 from '/docs/examples/gtd/gtd-2026-04-14.xml?raw'
import april15 from '/docs/examples/gtd/gtd-2026-04-15.xml.xml?raw'
import { patchFields, updateBlockAt } from '../model/block'
import { getMainBlock } from '../model/goods'
import { descriptionXml, gtdXml, imeiXml } from '../test/gtd-fixture'
import { parseGtd } from './parse-gtd'
import { serializeGtd } from './serialize-gtd'

const parseOk = (xml: string) => {
  const result = parseGtd(xml)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

describe('serializeGtd', () => {
  it.each([
    ['2026-04-14', april14],
    ['2026-04-15', april15],
    [
      'synthetic with IMEI and schedule',
      gtdXml({
        goods: [
          descriptionXml(imeiXml(1, 1, '356938035643809') + imeiXml(1, 2, '356938035643817')),
        ],
        main: '<T53><P6T53>1</P6T53><T54><P2T54>1</P2T54><P8T54>1.5</P8T54></T54></T53>',
      }),
    ],
  ])('parse → serialize → parse preserves the %s document', (_, xml) => {
    const document = parseOk(xml)
    expect(parseOk(serializeGtd(document))).toEqual(document)
  })

  it.each([
    ['2026-04-14', april14],
    ['2026-04-15', april15],
  ])('reproduces the unmodified %s example exactly, apart from the final line break', (_, xml) => {
    expect(serializeGtd(parseOk(xml)).trimEnd()).toBe(xml.trimEnd())
  })

  it('matches the layout of the official examples', () => {
    const xml = serializeGtd(parseOk(april14))
    expect(
      xml.startsWith(
        '<?xml version="1.0" encoding="utf-8"?>\r\n<GTD_eCopy_DefEdFormat xmlns="" xmlns:xsi=',
      ),
    ).toBe(true)
    expect(xml).toContain('\r\n  <T1>\r\n    <P2T1>ED</P2T1>\r\n')
  })

  it('writes edited fields in specification order', () => {
    const document = parseOk(april14)
    const main = getMainBlock(document)
    const root = updateBlockAt(document.root, main.path, (block) =>
      patchFields(block, { P18T1: '4', P2T1: 'ED2' }),
    )
    const edited = getMainBlock(parseOk(serializeGtd({ root }))).block
    const tags = Object.keys(edited.fields)
    expect(edited.fields.P2T1).toBe('ED2')
    expect(tags.indexOf('P18T1')).toBe(tags.indexOf('P17T1') + 1)
  })
})
