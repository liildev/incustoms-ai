/**
 * Printable representation of a GTD, laid out after the paper form of Instruction No. 2773
 * (Приложение № 1 — основной лист ТД1, Приложение № 2 — добавочный лист ТД2).
 * Every value is a verbatim string from the document or a composition the instruction prescribes;
 * nothing is recalculated except per-good payment totals. See docs/gtd-print-research.md.
 */

/** Lines of one graph or graph subsection; empty when the document has no value. */
export type GraphLines = readonly string[]

/**
 * Content that may not fit its box. When `overflow` is set, the box prints «см. дополнение»
 * and the lines appear on a supplement sheet (Instruction No. 2773, п. 18).
 */
export type BoxText = { lines: GraphLines; overflow: boolean }

/** A person graph: text block plus the value after the «№» sign. */
export type PartyGraph = { text: BoxText; number: string }

/** One row of graph 47: Вид платежа, Основа начисления, Ставка, Сумма, СП. */
export type PaymentRow = {
  code: string
  base: GraphLines
  rate: GraphLines
  amount: string
  method: string
}

export type PaymentGraph = {
  rows: readonly PaymentRow[]
  /** Sum of the row amounts; empty when rows are in different currencies or not decimals. */
  total: string
  overflow: boolean
}

/** Graphs 31–47 of one good. */
export type PrintGood = {
  /** 32 */ number: string
  /** 31 */ description: BoxText
  /** 31, lower left: ИНН/ПИНФЛ of the consumer / district code. */ consumer: string
  /** 31, lower right: quantity in the supplementary unit. */ extraQuantity: string
  /** 33 */ code: string
  /** 34 */ origin: string
  /** 35 */ gross: string
  /** 37 */ procedure: string
  /** 38 */ net: string
  /** 39 */ quota: string
  /** 40 */ previous: BoxText
  /** 41 */ extraUnit: string
  /** 42 */ invoiceValue: string
  /** 43 */ ownUse: string
  /** 44 */ documents: BoxText
  /** 45 */ customsValue: string
  /** 46 */ statisticalValue: string
  /** 47 */ payments: PaymentGraph
  /**
   * Graph 31 detail (T7 positions with IMEI) for the supplement; null when the good has a single position
   * without IMEI, which the P4T2 text already covers.
   */
  detail: readonly DescriptionPosition[] | null
}

/** Declaration-level graphs of the main sheet. Graphs 4, 6, 10, 15, 16, 17, 36, A, B, D stay empty. */
export type PrintHeader = {
  /** 1: direction, regime, third subsection. */ declarationType: readonly [string, string, string]
  /** 2 */ exporter: PartyGraph
  /** 5 */ itemCount: string
  /** 7 */ registration: string
  /** 8 */ importer: PartyGraph
  /** 9 */ financialParty: PartyGraph
  /** 11: country code, offshore flag. */ tradingCountry: readonly [string, string]
  /** 12 */ customsValue: string
  /** 13 */ usdRate: string
  /** 14 */ declarant: PartyGraph
  /** 15а */ dispatchCountryCode: string
  /** 17а */ destinationCountryCode: string
  /** 18 */ departureTransport: { text: BoxText; country: string }
  /** 19 */ container: string
  /** 20: numeric code, letter code with place, payment form / dispatch form. */
  delivery: readonly [string, string, string]
  /** 21 */ borderTransport: { text: BoxText; country: string }
  /** 22: currency code, total invoice value. */ currency: readonly [string, string]
  /** 23 */ exchangeRate: string
  /** 24: transaction code, settlement currency. */ transaction: readonly [string, string]
  /** 25 */ borderTransportKind: string
  /** 26 */ inlandTransportKind: string
  /** 27 */ loadingPlace: BoxText
  /** 28 */ finance: GraphLines
  /** 29 */ borderPost: string
  /** 30 */ goodsLocation: BoxText
  /** 48 */ deferral: BoxText
  /** 49 */ warehouse: BoxText
  /** 50 */ principal: BoxText
  /** 51 */ transitCustoms: string
  /** 52 */ guarantee: string
  /** 53 */ destinationCustoms: BoxText
  /** 54 */ placeAndDate: BoxText
  /** С */ extra: GraphLines
}

export type DocumentRow = {
  code: string
  kind: string
  number: string
  date: string
  validUntil: string
  amount: string
  note: string
}

export type ImeiRow = { device: string; slot: string; code: string }

/** A T7 position of graph 31 with its IMEI records (T21). */
export type DescriptionPosition = {
  number: string
  name: string
  netWeight: string
  extraQuantity: string
  vin: string
  engine: string
  imei: readonly ImeiRow[]
}

export type SupplementContent =
  | { kind: 'lines'; lines: GraphLines }
  | { kind: 'documents'; rows: readonly DocumentRow[] }
  | { kind: 'payments'; rows: readonly PaymentRow[] }
  | { kind: 'positions'; positions: readonly DescriptionPosition[] }

/** One graph continued on a supplement sheet; `good` is null for declaration-level graphs. */
export type Supplement = { graph: string; good: string | null; content: SupplementContent }

export type LabelledValue = { tag: string; label: string; value: string }

/** ГУПТП (T53 with its T54): no printable form is defined for it, so it is shown as a separate section. */
export type PrintSchedule = {
  header: readonly LabelledValue[]
  rows: readonly (readonly LabelledValue[])[]
}

export type PrintForm = {
  header: PrintHeader
  /** Total number of TD1 and TD2 sheets (graph 3). */
  sheetCount: number
  /** The first good, printed on the main sheet; null when the declaration has no goods. */
  mainGood: PrintGood | null
  /** Remaining goods in groups of three, one group per additional sheet. */
  additionalSheets: readonly (readonly PrintGood[])[]
  supplements: readonly Supplement[]
  schedule: PrintSchedule | null
}
