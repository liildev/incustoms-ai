import { LINK_STATE_LABEL, type LinkState } from '../model/chain'
import { ChainConnector } from './chain-connector'
import { TYPE } from './slide-type'

/** The states drawn on the observed chain; `linked` is not among them. */
const STATES: readonly LinkState[] = ['partial', 'missing', 'unverified']

/** Key for the connector styles of the observed chain. */
export const LinkLegend = () => (
  <ul aria-label="Обозначения" className="flex flex-wrap gap-x-6 gap-y-2 stage:gap-x-12">
    {STATES.map((state) => (
      <li key={state} className="flex items-center gap-3">
        <ChainConnector tone={state} orientation="horizontal" className="w-16 stage:w-28" />
        <span className={TYPE.note}>{LINK_STATE_LABEL[state]}</span>
      </li>
    ))}
  </ul>
)
