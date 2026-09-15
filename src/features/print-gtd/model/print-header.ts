import type { GtdBlock } from '@/entities/gtd'
import { HEADER_CAPACITY as C } from '../config/box-capacity'
import { boxText } from './box-text'
import {
  deferralLine,
  graphDate,
  graphValue,
  licenceLine,
  placeAndDateLines,
  presentLines,
  registrationNumber,
  slashPair,
  transportLine,
} from './graph-lines'
import type { PrintHeader } from './print-form'

/** Sections of T1 printed in the header graphs. */
const DEPARTURE_TRANSPORT_TAG = 'T5'
const BORDER_TRANSPORT_TAG = 'T6'
const DEFERRAL_TAG = 'T42'

const childFields = (main: GtdBlock, tag: string) =>
  main.blocks.filter((child) => child.tag === tag).map((child) => child.fields)

/**
 * Declaration-level graphs from T1, following Instruction No. 2773, глава 5 (declarant) and
 * глава 20 (graph 7). Graphs the instruction does not fill for any regime (4, 6, 10, 16, 36) and
 * graphs filled by the customs authority (A, B, D) are left out even where a similarly named field exists.
 */
export const printHeader = (main: GtdBlock): PrintHeader => {
  const f = main.fields
  const v = (tag: string) => graphValue(f, tag)
  return {
    declarationType: [v('P3T1'), v('P4T1'), v('P5T1')],
    exporter: {
      text: boxText(presentLines(v('P6T1'), v('P7T1'), v('P201T1'), v('P8T1')), C.exporter),
      number: v('P10T1'),
    },
    itemCount: v('P17T1'),
    registration: registrationNumber(f),
    importer: {
      text: boxText(
        presentLines(
          v('P22T1'),
          v('P23T1'),
          v('P244T1') ? `телефон: ${v('P244T1')}` : '',
          v('P213T1'),
          v('P24T1'),
        ),
        C.importer,
      ),
      number: slashPair(f, 'P27T1', 'P221T1'),
    },
    financialParty: {
      text: boxText(presentLines(v('P31T1'), v('P32T1')), C.financialParty),
      number: slashPair(f, 'P34T1', 'P222T1'),
    },
    tradingCountry: [v('P36T1'), v('P240T1')],
    customsValue: v('P37T1'),
    usdRate: v('P38T1'),
    declarant: {
      text: boxText(presentLines(v('P39T1'), v('P40T1')), C.declarant),
      number: v('P41T1'),
    },
    dispatchCountryCode: v('P44T1'),
    destinationCountryCode: v('P46T1'),
    departureTransport: {
      text: boxText(
        presentLines(
          transportLine(v('P47T1'), childFields(main, DEPARTURE_TRANSPORT_TAG), 'P4T5', 'P3T5'),
        ),
        C.transport,
      ),
      country: v('P48T1'),
    },
    container: v('P49T1'),
    delivery: [
      v('P50T1'),
      presentLines(v('P51T1'), v('P54T1')).join(' '),
      presentLines(v('P53T1'), v('P241T1')).join('/'),
    ],
    borderTransport: {
      text: boxText(
        presentLines(
          transportLine(v('P55T1'), childFields(main, BORDER_TRANSPORT_TAG), 'P4T6', 'P3T6'),
        ),
        C.transport,
      ),
      country: v('P56T1'),
    },
    currency: [v('P57T1'), v('P58T1')],
    exchangeRate: presentLines(v('P60T1'), v('P59T1')).join('/'),
    transaction: [v('P61T1'), v('P62T1')],
    borderTransportKind: v('P63T1'),
    inlandTransportKind: v('P64T1'),
    loadingPlace: boxText(presentLines(v('P110T1')), C.loadingPlace),
    finance: presentLines(v('P67T1')),
    borderPost: v('P74T1'),
    goodsLocation: boxText(
      presentLines(v('P111T1'), licenceLine(f, 'P216T1', 'P217T1')),
      C.goodsLocation,
    ),
    deferral: boxText(childFields(main, DEFERRAL_TAG).map(deferralLine), C.deferral),
    warehouse: boxText(presentLines(licenceLine(f, 'P76T1', 'P77T1')), C.warehouse),
    principal: boxText(presentLines(v('P78T1'), v('P242T1'), v('P208T1')), C.principal),
    transitCustoms: v('P112T1'),
    guarantee: v('P113T1'),
    destinationCustoms: boxText(presentLines(v('P80T1'), v('P81T1')), C.destinationCustoms),
    placeAndDate: boxText(placeAndDateLines(f), C.placeAndDate),
    extra: presentLines(v('P104T1') ? `2 — ${graphDate(f, 'P104T1')}` : ''),
  }
}
