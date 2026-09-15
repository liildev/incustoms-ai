import { describe, expect, it } from 'vitest'
import april14 from '/docs/examples/gtd/gtd-2026-04-14.xml?raw'
import { exportGtd, type GtdDocument, parseGtd } from '@/entities/gtd'
import { preparePrint } from './prepare-print'
import type { PrintForm } from './print-form'

const load = (xml: string): GtdDocument => {
  const result = parseGtd(xml)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.document
}

/** Synthetic declaration; values are illustrative, not taken from real declarations. */
const declaration = ({ main = '', goods = [''] }: { main?: string; goods?: string[] }) =>
  [
    '<GTD_eCopy_DefEdFormat>',
    '<T1><P3T1>ИМ</P3T1><P4T1>40</P4T1>',
    main,
    ...goods.map((inner, index) => `<T2><P8T2>${index + 1}</P8T2>${inner}</T2>`),
    '</T1>',
    '</GTD_eCopy_DefEdFormat>',
  ].join('')

const form = (xml: string): PrintForm => {
  const result = preparePrint(load(xml))
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.form
}

describe('preparePrint — official example 2026-04-14', () => {
  const printed = form(april14)

  it('maps the main sheet graphs in the forms the instruction prescribes', () => {
    const { header } = printed
    expect(header.declarationType).toEqual(['ИМ', '40', ''])
    expect(header.registration).toBe('33007/14.04.2026/0003728')
    expect(header.importer.number).toBe('310770730/1726273')
    expect(header.tradingCountry).toEqual(['643', '2'])
    expect(header.delivery).toEqual(['07', 'CPT Кигаш', '50/02'])
    expect(header.departureTransport.text.lines).toEqual([
      '4 ЖД: 51233518; 51301414; 51345619; 51300614',
    ])
    expect(header.exchangeRate).toBe('1/159.11')
    expect(header.placeAndDate.lines).toContain('5 — 42901790240020/14.04.2026/000142')
    expect(header.goodsLocation).toEqual({
      lines: ['Хоразм вилояти,УРГЕНЧСКИЙ р-н,ул. Истиклол, д. 7'],
      overflow: false,
    })
    expect(header.extra).toEqual(['2 — 06.04.2026'])
    expect(printed.sheetCount).toBe(1)
    expect(printed.additionalSheets).toEqual([])
    expect(printed.schedule).toBeNull()
  })

  it('maps the first good to graphs 31–47 without recalculating amounts', () => {
    const good = printed.mainGood
    expect(good?.code).toBe('2713200000')
    expect(good?.procedure).toBe('4000000')
    expect(good?.description.lines[0]).toMatch(/^1\. Битум нефтяной/)
    expect(good?.previous.lines[0]).toBe('ТД 35010/06.04.2026/1492964 — 1 — 63468 кг — 63468 кг')
    expect(good?.payments.rows).toEqual([
      { code: '10', base: ['412000'], rate: ['7 (860)'], amount: '2884000', method: 'БН' },
      { code: '29', base: ['888035230.08'], rate: ['12 %'], amount: '106564227.61', method: 'БН' },
    ])
    expect(good?.payments.total).toBe('109448227.61')
  })

  it('moves the 16 supporting documents of graph 44 to a supplement', () => {
    expect(printed.mainGood?.documents.overflow).toBe(true)
    const supplement = printed.supplements.find((entry) => entry.graph === '44')
    expect(supplement?.good).toBe('1')
    expect(supplement?.content.kind === 'documents' && supplement.content.rows).toHaveLength(16)
    expect(printed.mainGood?.documents.lines).toContain('220 ИНВ № 25 от 03.03.2026, часть')
  })
})

describe('preparePrint — goods, IMEI and ГУПТП', () => {
  it('puts the first good on the main sheet and the rest on additional sheets of three', () => {
    const printed = form(declaration({ goods: ['', '', '', '', ''] }))
    expect(printed.sheetCount).toBe(3)
    expect(printed.mainGood?.number).toBe('1')
    expect(printed.additionalSheets.map((sheet) => sheet.map((good) => good.number))).toEqual([
      ['2', '3', '4'],
      ['5'],
    ])
  })

  it('keeps IMEI records with their good and position, sequence numbers as written', () => {
    const imei = (device: string, slot: string, code: string) =>
      `<T21><P3T21>${device}</P3T21><P4T21>${slot}</P4T21><P5T21>${code}</P5T21></T21>`
    const printed = form(
      declaration({
        goods: [
          '<T7><P4T7>1</P4T7><P5T7>Кабель</P5T7></T7>',
          `<T7><P4T7>1</P4T7><P5T7>Смартфон</P5T7>${imei('0001', '01', '356938035643809')}${imei('0001', '02', '356938035643817')}${imei('0002', '01', '490154203237518')}</T7>`,
        ],
      }),
    )
    expect(printed.mainGood?.detail).toBeNull()
    expect(printed.additionalSheets[0]?.[0]?.detail).toHaveLength(1)
    expect(printed.supplements).toEqual([
      {
        graph: '31',
        good: '2',
        content: {
          kind: 'positions',
          positions: [
            {
              number: '1',
              name: 'Смартфон',
              netWeight: '',
              extraQuantity: '',
              vin: '',
              engine: '',
              imei: [
                { device: '0001', slot: '01', code: '356938035643809' },
                { device: '0001', slot: '02', code: '356938035643817' },
                { device: '0002', slot: '01', code: '490154203237518' },
              ],
            },
          ],
        },
      },
    ])
  })

  it('lists ГУПТП fields with specification labels, including P8T54', () => {
    const printed = form(
      declaration({
        main: '<T53><P3T53>26003</P3T53><P4T53>2026-04-01</P4T53><T54><P2T54>01</P2T54><P8T54>150.125</P8T54></T54></T53>',
      }),
    )
    expect(printed.schedule?.header.slice(0, 2)).toEqual([
      { tag: 'P3T53', label: 'Код поста предыдущий ГУПТП', value: '26003' },
      { tag: 'P4T53', label: 'Дата регистрации предыдущий ГУПТП', value: '01.04.2026' },
    ])
    expect(printed.schedule?.rows[0]?.at(0)).toMatchObject({ tag: 'P2T54', value: '01' })
    expect(printed.schedule?.rows[0]?.at(-1)).toEqual({
      tag: 'P8T54',
      label: 'Дополнительная таможенная пошлина (21)',
      value: '150.125',
    })
  })
})

describe('preparePrint — data integrity', () => {
  it('keeps long amounts exact and leaves absent optional graphs empty', () => {
    const printed = form(
      declaration({
        goods: [
          '<T4><P3T4>20</P3T4><P9T4>123456789012345678.125</P9T4></T4><T4><P3T4>29</P3T4><P9T4>0.005</P9T4></T4>',
        ],
      }),
    )
    const good = printed.mainGood
    expect(good?.payments.rows.map((row) => row.amount)).toEqual([
      '123456789012345678.125',
      '0.005',
    ])
    expect(good?.payments.total).toBe('123456789012345678.130')
    expect(printed.header.exporter).toEqual({ text: { lines: [], overflow: false }, number: '' })
    expect(printed.header.registration).toBe('')
    expect(good?.procedure).toBe('')
    expect(good?.documents).toEqual({ lines: [], overflow: false })
  })

  it('moves a graph that does not fit its box to the supplement, marked with the graph number', () => {
    const address =
      'г. Ташкент, Мирабадский район, улица Тараса Шевченко, дом 23, склад временного хранения № 4'
    const printed = form(declaration({ main: `<P111T1>${address}</P111T1>` }))
    expect(printed.header.goodsLocation.overflow).toBe(true)
    expect(printed.supplements).toContainEqual({
      graph: '30',
      good: null,
      content: { kind: 'lines', lines: [address] },
    })
  })

  it('moves a description in capitals to the supplement before it outgrows graph 31', () => {
    // Nine lines of 60 capitals: within the character count of the box, too wide once capitals are measured.
    const line = 'СМАРТФОН МОБИЛЬНЫЙ ТЕЛЕФОН SAMSUNG GALAXY A55 5G ЧЕРНЫЙ 256GB'
    const printed = form(
      declaration({ goods: [`<P4T2>${Array.from({ length: 9 }, () => line).join('\n')}</P4T2>`] }),
    )
    expect(printed.mainGood?.description.overflow).toBe(true)
    expect(printed.supplements.map(({ graph, good }) => [graph, good])).toEqual([['31', '1']])
  })

  it('names supplement sections of goods without a number (P8T2) by their place', () => {
    const documents = Array.from({ length: 8 }, (_, index) => `<T9><P7T9>${index}</P7T9></T9>`)
    const good = `<T2>${documents.join('')}</T2>`
    const printed = form(
      `<GTD_eCopy_DefEdFormat><T1><P3T1>ИМ</P3T1>${good}${good}</T1></GTD_eCopy_DefEdFormat>`,
    )
    expect(printed.supplements.map(({ graph, good }) => [graph, good])).toEqual([
      ['44', '1 (по порядку в файле)'],
      ['44', '2 (по порядку в файле)'],
    ])
  })

  it('does not total amounts in a foreign currency', () => {
    const printed = form(
      declaration({
        goods: ['<T4><P9T4>10</P9T4><P202T4>USD</P202T4></T4><T4><P9T4>5</P9T4></T4>'],
      }),
    )
    expect(printed.mainGood?.payments.total).toBe('')
  })

  it('reads the document without changing it, unknown sections and fields included', () => {
    const document = load(
      declaration({ goods: ['<P999T2>0042</P999T2><T999 a="1"><P1T999>x</P1T999></T999>'] }),
    )
    const before = structuredClone(document)
    const xmlBefore = exportGtd(document)
    preparePrint(document)
    expect(document).toEqual(before)
    expect(exportGtd(document)).toEqual(xmlBefore)
    expect(JSON.stringify(preparePrint(document))).not.toContain('0042')
  })

  it('refuses a document that export refuses: repeated T53 or T54', () => {
    const repeated = load(declaration({ main: '<T53><T54/><T54/></T53><T53/>' }))
    const result = preparePrint(repeated)
    expect(result.ok).toBe(false)
    expect(result.ok ? [] : result.errors).toHaveLength(2)
  })
})
