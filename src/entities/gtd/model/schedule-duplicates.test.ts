import { describe, expect, it } from 'vitest'
import { exportGtd } from '../lib/export-gtd'
import { parseGtd } from '../lib/parse-gtd'
import { gtdXml } from '../test/gtd-fixture'
import { childBlocks, updateBlockAt } from './block'
import { checkSpec } from './check-spec'
import type { GtdBlock, GtdDocument } from './gtd'
import { getMainBlock } from './goods'
import { keepSchedule, readSchedule } from './schedule'

const load = (xml: string): GtdDocument => {
  const result = parseGtd(xml)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

const first = '<T53><P3T53>27009</P3T53><T54><P2T54>1</P2T54><P8T54>10.5</P8T54></T54></T53>'
const second = [
  '<T53 source="second">',
  '<P3T53>26003</P3T53><P6T53>1</P6T53><P99T53>unknown field</P99T53>',
  '<T54><P2T54>1</P2T54><P8T54>150.125</P8T54><P9T54>unknown row field</P9T54></T54>',
  '<X q="1"><Y>unknown section</Y></X>',
  '</T53>',
].join('')

const scheduleIssues = (document: GtdDocument) =>
  checkSpec(document.root).filter((issue) => issue.tag === 'T53')

const keep = (document: GtdDocument, position: number): GtdDocument => ({
  root: updateBlockAt(document.root, getMainBlock(document).path, (main) =>
    keepSchedule(main, position),
  ),
})

const schedules = (document: GtdDocument): GtdBlock[] =>
  childBlocks(getMainBlock(document), 'T53').map(({ block }) => block)

describe('repeated T53 (specification [0..1])', () => {
  it('accepts a single T53 without findings and exports it', () => {
    const document = load(gtdXml({ main: first }))
    expect(scheduleIssues(document)).toEqual([])
    expect(exportGtd(document).ok).toBe(true)
  })

  it('reads two T53 without data loss and reports them as an error', () => {
    const document = load(gtdXml({ main: first + second }))
    expect(schedules(document)).toHaveLength(2)
    expect(scheduleIssues(document)).toEqual([
      expect.objectContaining({
        severity: 'error',
        path: getMainBlock(document).path,
        message: expect.stringContaining('встречается 2 раз, допускается не более 1'),
      }),
    ])
  })

  it('refuses to export two T53', () => {
    expect(exportGtd(load(gtdXml({ main: first + second })))).toEqual({
      ok: false,
      errors: [expect.stringContaining('Раздел T1 содержит 2 раздела T53')],
    })
  })

  it.each([
    ['the second', 1],
    ['the first', 0],
  ])('exports after keeping %s T53', (_, position) => {
    const document = load(gtdXml({ main: first + second }))
    const repaired = keep(document, position)
    expect(scheduleIssues(repaired)).toEqual([])
    const exported = exportGtd(repaired)
    if (!exported.ok) throw new Error(exported.errors.join('\n'))
    expect(schedules(load(exported.xml))).toEqual([schedules(document)[position]])
  })

  it('keeps unknown fields, attributes, nested sections and T54/P8T54 of the surviving T53', () => {
    const document = load(gtdXml({ main: first + second }))
    const exported = exportGtd(keep(document, 1))
    if (!exported.ok) throw new Error(exported.errors.join('\n'))
    const [survivor] = schedules(load(exported.xml))
    if (!survivor) throw new Error('T53 expected')

    expect(survivor).toEqual({
      tag: 'T53',
      attributes: { source: 'second' },
      fields: { P3T53: '26003', P6T53: '1', P99T53: 'unknown field' },
      blocks: [
        {
          tag: 'T54',
          attributes: {},
          fields: { P2T54: '1', P8T54: '150.125', P9T54: 'unknown row field' },
          blocks: [],
        },
        { tag: 'X', attributes: { q: '1' }, fields: { Y: 'unknown section' }, blocks: [] },
      ],
    })
    expect(readSchedule(survivor).rows.map((row) => row.additionalDuty)).toEqual(['150.125'])
  })

  it('keeps the surviving T53 in its place among the other T1 sections', () => {
    const document = load(gtdXml({ main: `${first}<T5><P4T5>1</P4T5></T5>${second}` }))
    const tags = getMainBlock(keep(document, 1)).block.blocks.map((block) => block.tag)
    expect(tags).toEqual(['T2', 'T5', 'T53'])
  })

  it('refuses a position that does not exist instead of removing every T53', () => {
    const main = getMainBlock(load(gtdXml({ main: first + second }))).block
    expect(() => keepSchedule(main, 2)).toThrow(RangeError)
  })
})
