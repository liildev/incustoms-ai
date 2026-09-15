import type { AuditSource } from './audit-source'

/** `unverified` — a link the product describes but the scenario never exercised. */
export type LinkState = 'linked' | 'partial' | 'missing' | 'unverified'

export type ChainLink = { state: LinkState; note: string; source: AuditSource }

export const FINDING_TITLE = 'Разрыв — между модулями, а не внутри них'

export const CHAIN_NODES = ['Поставщик', 'Сделка', 'Контракт', 'Заявка', 'ГТД', 'Склад'] as const

/** Observed link between CHAIN_NODES[i] and CHAIN_NODES[i + 1]. */
export const CHAIN_LINKS: readonly ChainLink[] = [
  { state: 'missing', note: 'поставщик — текст, `supplier_id` нет', source: 'Δ D-12' },
  { state: 'missing', note: '`contract_id` и `order_id` пустые', source: 'Δ D-10' },
  { state: 'partial', note: 'ссылка есть, сумма и контрагент не переходят', source: 'V2 W-11' },
  {
    state: 'missing',
    note: 'в прогоне: переход 404, ГТД привязалась к отдельной записи',
    source: 'V2 D-1, D-2',
  },
  {
    state: 'unverified',
    note: 'модуль ведёт остатки по строкам ГТД; в сценарии не проверялось',
    source: 'V2 §8.2, WH-1',
  },
]

/** Index in CHAIN_NODES the report branch starts from. */
export const REPORT_FROM = 3

export const REPORT_LINK: ChainLink & { node: string } = {
  node: 'Логистический отчёт',
  state: 'missing',
  note: 'заявка есть, отчёт показывает «Заказы 0»; причина не установлена',
  source: 'Δ D-13',
}

export const LINK_STATE_LABEL: Record<LinkState, string> = {
  linked: 'связь есть',
  partial: 'связь частичная',
  unverified: 'не проверялось',
  missing: 'связи нет',
}
