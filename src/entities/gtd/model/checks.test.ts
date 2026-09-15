import { describe, expect, it } from 'vitest'
import april14 from '/docs/examples/gtd/gtd-2026-04-14.xml?raw'
import { parseGtd } from '../lib/parse-gtd'
import { descriptionXml, gtdXml, imeiXml } from '../test/gtd-fixture'
import { checkDomain } from './check-domain'
import { checkSpec } from './check-spec'
import type { GtdDocument } from './gtd'

const load = (xml: string): GtdDocument => {
  const result = parseGtd(xml)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

describe('checkSpec', () => {
  it('reports deviations of the accepted April 14 declaration as warnings only', () => {
    const issues = checkSpec(load(april14).root)
    expect(issues.every((issue) => issue.severity === 'warning')).toBe(true)
    expect(issues).toContainEqual(
      expect.objectContaining({
        tag: 'P18T1',
        message: 'Обязательное по спецификации поле отсутствует.',
      }),
    )
    expect(issues).toContainEqual(expect.objectContaining({ tag: 'P200T9' }))
  })

  it('does not require T21 or T53', () => {
    const tags = checkSpec(load(april14).root).map((issue) => issue.tag)
    expect(tags).not.toContain('T21')
    expect(tags).not.toContain('T53')
  })

  it('rejects dates that do not exist in the calendar', () => {
    const issues = checkSpec(load(gtdXml({ goods: ['<P203T2>2026-02-30</P203T2>'] })).root)
    expect(issues).toContainEqual(expect.objectContaining({ tag: 'P203T2', severity: 'error' }))
  })

  it('warns about required fields that are present but empty', () => {
    const issues = checkSpec(load(gtdXml({ goods: ['<P9T2></P9T2>'] })).root)
    expect(issues).toContainEqual(
      expect.objectContaining({
        tag: 'P9T2',
        message: 'Обязательное по спецификации поле не заполнено.',
      }),
    )
  })

  it('flags values that do not match the declared type as errors', () => {
    const issues = checkSpec(
      load(gtdXml({ goods: ['<P11T2>12a</P11T2><P203T2>01.02.2026</P203T2>'] })).root,
    )
    expect(issues.filter((issue) => issue.severity === 'error').map((issue) => issue.tag)).toEqual([
      'P11T2',
      'P203T2',
    ])
  })
})

describe('checkDomain', () => {
  it('flags a goods count that differs from P17T1', () => {
    const document = load(gtdXml({ goods: [''] }).replace('<P17T1>1</P17T1>', '<P17T1>3</P17T1>'))
    expect(checkDomain(document)).toEqual([
      expect.objectContaining({ tag: 'P17T1', severity: 'warning' }),
    ])
  })

  it('ignores an empty or non-numeric P17T1 (reported by the specification check instead)', () => {
    const document = load(gtdXml({ goods: [''] }).replace('<P17T1>1</P17T1>', '<P17T1></P17T1>'))
    expect(checkDomain(document)).toEqual([])
  })

  it('does not report records without device and slot numbers as repeated slots', () => {
    const xml = '<T21><P5T21>356938035643809</P5T21></T21><T21><P5T21>356938035643817</P5T21></T21>'
    expect(checkDomain(load(gtdXml({ goods: [descriptionXml(xml)] })))).toEqual([])
  })

  it('flags repeated device/slot pairs and malformed IMEI codes', () => {
    const xml =
      imeiXml(1, 1, '356938035643809') + imeiXml(1, 1, '356938035643817') + imeiXml(2, 1, '12345')
    const issues = checkDomain(load(gtdXml({ goods: [descriptionXml(xml)] })))
    expect(issues.map(({ tag, severity }) => [tag, severity])).toEqual([
      ['T21', 'error'],
      ['P5T21', 'warning'],
    ])
  })
})
