import { describe, expect, it } from 'vitest'
import {
  deferralLine,
  documentLine,
  placeAndDateLines,
  previousDocumentLine,
  transportLine,
} from './graph-lines'
import { paymentGraph } from './payment-rows'

describe('graph compositions of Instruction No. 2773', () => {
  it('graph 18/21: one vehicle kind is named once, mixed kinds per vehicle', () => {
    expect(
      transportLine(
        '2',
        [
          { P4T5: 'АВТО', P3T5: 'A987SA' },
          { P4T5: 'АВТО', P3T5: 'S654DA' },
        ],
        'P4T5',
        'P3T5',
      ),
    ).toBe('2 АВТО: A987SA; S654DA')
    expect(
      transportLine(
        '2',
        [
          { P4T5: 'АВТО', P3T5: 'A987SA' },
          { P4T5: 'ЖД', P3T5: '51233518' },
        ],
        'P4T5',
        'P3T5',
      ),
    ).toBe('2: АВТО A987SA; ЖД 51233518')
    expect(transportLine('', [], 'P4T5', 'P3T5')).toBe('')
  })

  it('graph 40: previous declaration with quantity in the supplementary unit', () => {
    expect(
      previousDocumentLine({
        P200T8: 'ГТД',
        P6T8: '14010',
        P7T8: '2012-03-31',
        P8T8: '0353761',
        P4T8: '2',
        P11T8: '5980',
        P12T8: '5900',
        P9T8: '250.2',
        P10T8: '113',
      }),
    ).toBe('ГТД 14010/31.03.2012/0353761 — 2 — 5980 кг — 5900 кг — 250.2 113')
  })

  it('graph 44: validity, amount and other information follow the document', () => {
    expect(
      documentLine({
        P4T9: '101',
        P6T9: 'ЛИЦЕНЗИЯ',
        P7T9: '998344400002',
        P8T9: '2015-11-26',
        P11T9: '2015-12-31',
        P9T9: '1000.50',
        P10T9: '840',
        P12T9: 'часть',
      }),
    ).toBe(
      '101 ЛИЦЕНЗИЯ № 998344400002 от 26.11.2015, срок действия — 31.12.2015, сумма — 1000.50 840, часть',
    )
  })

  it('graph 48: deferral and instalment schemes', () => {
    expect(deferralLine({ P1T42: '20', P2T42: '2025-06-01' })).toBe('20.01.06.2025')
    expect(deferralLine({ P4T42: '1', P1T42: '20', P2T42: '2025-06-01', P3T42: '100000000' })).toBe(
      '1. 20 01.06.2025, 100000000',
    )
  })

  it('graph 54: numbered items, missing ones left out', () => {
    expect(
      placeAndDateLines({
        P84T1: 'Ташкент',
        P209T1: 'Иванов И. И.',
        P86T1: '42901790240020',
        P85T1: '2026-04-14',
        P210T1: '000142',
      }),
    ).toEqual(['1 — Ташкент', '2 — Иванов И. И.', '5 — 42901790240020/14.04.2026/000142'])
  })

  it('graph 47: both rate kinds are printed, and overflow counts printed lines', () => {
    const both = {
      P3T4: '27',
      P4T4: '1000',
      P5T4: '50',
      P6T4: '5',
      P7T4: '0.8',
      P8T4: '840',
      P9T4: '90',
    }
    const graph = paymentGraph([both], 11)
    expect(graph.rows[0]).toMatchObject({ base: ['1000', '50'], rate: ['5 %', '0.8 (840)'] })
    expect(
      paymentGraph(
        Array.from({ length: 5 }, () => both),
        11,
      ).overflow,
    ).toBe(false)
    expect(
      paymentGraph(
        Array.from({ length: 6 }, () => both),
        11,
      ).overflow,
    ).toBe(true)
  })
})
