import { Fragment } from 'react'
import { CHAIN_NODES } from '../model/chain'
import { TITLE } from '../model/title'
import { ChainConnector } from './chain-connector'

/** Title-slide hint at the finding: the product chain in one line, with one link drawn broken. */
export const ChainPreview = () => (
  <p
    aria-hidden
    className="flex flex-wrap items-center gap-x-2 gap-y-1 text-dense text-muted-foreground stage:flex-nowrap stage:gap-x-4 stage:text-[26px]"
  >
    {CHAIN_NODES.map((name, position) => (
      <Fragment key={name}>
        {position > 0 ? (
          <ChainConnector
            tone={position - 1 === TITLE.breakAfter ? 'missing' : 'expected'}
            orientation="horizontal"
            delay={0.4}
            className={position - 1 === TITLE.breakAfter ? 'w-14 stage:w-32' : 'w-6 stage:w-14'}
          />
        ) : null}
        <span className="shrink-0">{name}</span>
      </Fragment>
    ))}
  </p>
)
