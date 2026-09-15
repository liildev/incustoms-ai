import { describe, expect, it } from 'vitest'
import april14 from '/docs/examples/gtd/gtd-2026-04-14.xml?raw'
import april15 from '/docs/examples/gtd/gtd-2026-04-15.xml.xml?raw'
import { childBlocks, patchFields, replaceChildBlocks, updateBlockAt } from '../model/block'
import { getMainBlock, listGoods } from '../model/goods'
import type { GtdDocument } from '../model/gtd'
import { writeImeiRecords } from '../model/imei'
import { createScheduleBlock, writeSchedule } from '../model/schedule'
import { descriptionXml, gtdXml } from '../test/gtd-fixture'
import { exportGtd } from './export-gtd'
import { parseGtd } from './parse-gtd'

const load = (xml: string): GtdDocument => {
  const result = parseGtd(xml)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

/** Export, then read the file back the way the editor would. */
const reload = (document: GtdDocument): GtdDocument => {
  const exported = exportGtd(document)
  if (!exported.ok) throw new Error(exported.errors.join('\n'))
  return load(exported.xml)
}

const examples = [
  ['2026-04-14', april14],
  ['2026-04-15', april15],
] as const

describe('round trip — official examples, one supported change', () => {
  it.each(examples)('editing one T1 field of %s changes nothing else', (_, xml) => {
    const document = load(xml)
    const main = getMainBlock(document)
    const edited = updateBlockAt(document.root, main.path, (block) =>
      patchFields(block, { P22T1: 'ООО "Тест" & <Ко>' }),
    )
    const expected = structuredClone(document)
    const expectedMain = expected.root.blocks[main.path[0] ?? 0]
    if (!expectedMain) throw new Error('T1 expected')
    expectedMain.fields.P22T1 = 'ООО "Тест" & <Ко>'
    expect(reload({ root: edited })).toEqual(expected)
  })

  it.each(examples)('adding IMEI to a T7 of %s changes nothing outside that T7', (_, xml) => {
    const document = load(xml)
    const [good] = listGoods(document)
    const [description] = good ? childBlocks(good, 'T7') : []
    if (!description) throw new Error('T7 expected')
    const root = updateBlockAt(document.root, description.path, (block) =>
      writeImeiRecords(block, [{ device: '1', slot: '1', code: '356938035643809' }]),
    )
    const reloaded = reload({ root })
    const reloadedDescription = updateBlockAt(reloaded.root, description.path, (block) => ({
      ...block,
      blocks: block.blocks.filter((child) => child.tag !== 'T21'),
    }))
    expect(reloadedDescription).toEqual(document.root)
  })

  it.each(examples)('adding a schedule to %s appends T53 after existing T1 sections', (_, xml) => {
    const document = load(xml)
    const main = getMainBlock(document)
    const root = updateBlockAt(document.root, main.path, (block) =>
      replaceChildBlocks(block, 'T53', [
        writeSchedule(createScheduleBlock(), {
          header: { previousPost: '', previousDate: '', previousNumber: '', paymentTerms: '1' },
          rows: [],
        }),
      ]),
    )
    const reloadedMain = getMainBlock(reload({ root })).block
    expect(reloadedMain.blocks.at(-1)).toEqual({
      tag: 'T53',
      attributes: {},
      fields: { P6T53: '1' },
      blocks: [],
    })
    expect(reloadedMain.blocks.slice(0, -1)).toEqual(main.block.blocks)
  })
})

describe('round trip — synthetic edge cases', () => {
  const edgeCases = gtdXml({
    goods: [
      [
        '<P4T2>  Товар\n  «с отступом» &amp; &lt;тег&gt; &#1058;</P4T2>',
        '<P9T2>0027132000</P9T2>',
        '<P10T2></P10T2>',
        '<P99T2><![CDATA[<b>как есть</b>]]></P99T2>',
        descriptionXml(
          '<T21 id="1"><P3T21>01</P3T21><P9T21>unknown</P9T21><X q="1"><W>deep</W></X></T21>',
        ),
        '<Unknown attr="a &quot;b&quot;"><Inner>1</Inner></Unknown>',
      ].join(''),
    ],
    main: '<Т53><P3Т53>00270</P3Т53><T54><P8T54>0.000</P8T54></T54></Т53>',
  })

  it('keeps leading zeros, empty fields, whitespace, references, CDATA and unknown data', () => {
    const document = load(edgeCases)
    const [good] = listGoods(document)
    expect(good?.block.fields).toMatchObject({
      P4T2: '  Товар\n  «с отступом» & <тег> Т',
      P9T2: '0027132000',
      P10T2: '',
      P99T2: '<b>как есть</b>',
    })
    expect(reload(document)).toEqual(document)
  })

  it('is stable: a second export is identical to the first', () => {
    const first = exportGtd(load(edgeCases))
    if (!first.ok) throw new Error(first.errors.join('\n'))
    expect(exportGtd(load(first.xml))).toEqual(first)
  })

  it('reports fields written after nested sections, which export places before them', () => {
    const result = parseGtd(gtdXml({ goods: ['<T8><P4T8>1</P4T8></T8><P9T2>1234</P9T2>'] }))
    if (!result.ok) throw new Error(result.errors.join('\n'))
    expect(result.notices).toEqual([
      expect.objectContaining({ tag: 'P9T2', severity: 'warning', source: 'import' }),
    ])
    expect(reload(result.document)).toEqual(result.document)
  })
})

describe('lossless reading — refusals', () => {
  it.each(['<X z="1"/>', '<X z="1">text</X>', '<P9T2 z="1">text</P9T2>'])(
    'refuses attributes on a leaf element (%s), which a field cannot hold',
    (element) => {
      const result = parseGtd(gtdXml({ goods: [element] }))
      expect(result).toMatchObject({
        ok: false,
        errors: [expect.stringContaining('содержит атрибуты')],
      })
    },
  )

  it('refuses non-breaking spaces between elements instead of treating them as indentation', () => {
    const nbsp = String.fromCharCode(0xa0)
    expect(parseGtd(gtdXml({ goods: [`${nbsp}<P9T2>1</P9T2>`] }))).toMatchObject({
      ok: false,
      errors: [expect.stringContaining('вперемешку')],
    })
  })
})

describe('export guards', () => {
  it('refuses values XML cannot represent instead of writing a broken file', () => {
    const document = load(gtdXml())
    const main = getMainBlock(document)
    const root = updateBlockAt(document.root, main.path, (block) =>
      patchFields(block, { P22T1: `a${String.fromCharCode(2)}` }),
    )
    expect(exportGtd({ root })).toEqual({
      ok: false,
      errors: ['T1/P22T1 содержит символ U+0002, недопустимый в XML.'],
    })
  })
})
