import { describe, expect, it } from 'vitest'
import { parseXml, type XmlElement } from '@/shared/lib/xml'
import { childBlocks, updateBlockAt } from '../model/block'
import { checkSpec } from '../model/check-spec'
import { getMainBlock, listGoods } from '../model/goods'
import type { GtdDocument } from '../model/gtd'
import { writeImeiRecords } from '../model/imei'
import { readSchedule, writeSchedule } from '../model/schedule'
import { descriptionXml, gtdXml } from '../test/gtd-fixture'
import { exportGtd } from './export-gtd'
import { parseGtd } from './parse-gtd'

const load = (xml: string): GtdDocument => {
  const result = parseGtd(xml)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

const exportOk = (document: GtdDocument): XmlElement => {
  const result = exportGtd(document)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  const xml = parseXml(result.xml)
  if (!xml.ok) throw new Error(xml.error.message)
  return xml.root
}

const child = (element: XmlElement | undefined, name: string): XmlElement[] =>
  element?.children.filter((node) => node.name === name) ?? []

const row = (index: string) =>
  `<T54><P2T54>${index}</P2T54><P4T54>2026-05-01</P4T54><P8T54>10.5</P8T54></T54>`

describe('exportGtd — T21 hierarchy', () => {
  it('writes IMEI records as T1 > T2 > T7 > T21 and never directly under T2', () => {
    const document = load(gtdXml({ goods: [descriptionXml()] }))
    const [good] = listGoods(document)
    const [description] = good ? childBlocks(good, 'T7') : []
    if (!description) throw new Error('T7 expected')
    const root = updateBlockAt(document.root, description.path, (block) =>
      writeImeiRecords(block, [
        { device: '1', slot: '1', code: '356938035643809' },
        { device: '1', slot: '2', code: '356938035643817' },
      ]),
    )

    const [main] = child(exportOk({ root }), 'T1')
    const [exportedGood] = child(main, 'T2')
    const [exportedDescription] = child(exportedGood, 'T7')
    expect(child(exportedGood, 'T21')).toEqual([])
    expect(child(exportedDescription, 'T21').map((imei) => child(imei, 'P5T21')[0]?.text)).toEqual([
      '356938035643809',
      '356938035643817',
    ])
  })
})

describe('exportGtd — T54 multiplicity', () => {
  it('exports a schedule with one T54 including P8T54', () => {
    const [main] = child(
      exportOk(load(gtdXml({ main: `<T53><P6T53>1</P6T53>${row('1')}</T53>` }))),
      'T1',
    )
    const [schedule] = child(main, 'T53')
    expect(child(schedule, 'T54')).toHaveLength(1)
    expect(child(child(schedule, 'T54')[0], 'P8T54')[0]?.text).toBe('10.5')
  })

  it('reads repeated T54 without data loss but reports it against the specification', () => {
    const document = load(gtdXml({ main: `<T53>${row('1')}${row('2')}</T53>` }))
    const [schedule] = childBlocks(getMainBlock(document), 'T53')
    expect(schedule && readSchedule(schedule.block).rows).toHaveLength(2)
    expect(checkSpec(document.root)).toContainEqual(
      expect.objectContaining({
        tag: 'T54',
        severity: 'error',
        message:
          'Раздел встречается 2 раз, допускается не более 1. Экспорт невозможен, пока лишние разделы не удалены.',
      }),
    )
  })

  it('refuses to export repeated T54 and allows export once the extra section is removed', () => {
    const document = load(gtdXml({ main: `<T53>${row('1')}${row('2')}</T53>` }))
    const blocked = exportGtd(document)
    expect(blocked).toMatchObject({
      ok: false,
      errors: [expect.stringContaining('содержит 2 раздела T54')],
    })

    const [schedule] = childBlocks(getMainBlock(document), 'T53')
    if (!schedule) throw new Error('T53 expected')
    const { header, rows } = readSchedule(schedule.block)
    const root = updateBlockAt(document.root, schedule.path, (block) =>
      writeSchedule(block, { header, rows: rows.slice(1) }),
    )
    const [main] = child(exportOk({ root }), 'T1')
    expect(
      child(child(main, 'T53')[0], 'T54').map((section) => child(section, 'P2T54')[0]?.text),
    ).toEqual(['2'])
  })

  it('blocks export only for sections the ГУПТП section can repair, not for a misplaced T53', () => {
    const document = load(gtdXml({ goods: [`<T53>${row('1')}${row('2')}</T53>`] }))
    expect(exportGtd(document).ok).toBe(true)
    const errors = checkSpec(document.root).filter((issue) => issue.severity === 'error')
    expect(errors).toEqual([])
    expect(checkSpec(document.root)).toContainEqual(
      expect.objectContaining({ tag: 'T53', severity: 'warning' }),
    )
  })
})
