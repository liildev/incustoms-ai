import { Fragment } from 'react'
import { cn } from '@/shared/lib/cn'
import { MODEL_CHAIN, OCR_FEEDS, OCR_SESSION, OPTIONAL_LINK_TO } from '../model/target-model'
import { ChainConnector } from './chain-connector'
import { ModelNode } from './model-node'
import { TYPE } from './slide-type'

const column = (nodeIndex: number) => ({ gridColumnStart: nodeIndex * 2 + 1 })

/**
 * Proposed entity graph: every record keeps a stable ID and points to its neighbours by ID. The OCR session
 * hangs under the ГТД it creates; in the reflow layout it follows the chain without a connector.
 */
export const TargetDiagram = () => (
  <figure
    aria-label="Предлагаемая модель сущностей"
    className="flex flex-col stage:grid stage:grid-cols-[repeat(5,230px_minmax(0,1fr))_230px] stage:grid-rows-[auto_52px_auto] stage:items-stretch"
  >
    {MODEL_CHAIN.map((entity, position) => (
      <Fragment key={entity.key}>
        {position > 0 ? (
          <ChainConnector
            tone={position === OPTIONAL_LINK_TO ? 'optional' : 'linked'}
            className="ml-4 stage:row-start-1 stage:ml-0 stage:self-center stage:px-2"
            style={{ gridColumnStart: position * 2 }}
          />
        ) : null}
        <ModelNode entity={entity} className="stage:row-start-1" style={column(position)} />
      </Fragment>
    ))}
    <ChainConnector
      tone="linked"
      orientation="vertical"
      className="hidden stage:row-start-2 stage:flex stage:justify-self-center"
      style={column(OCR_FEEDS)}
    />
    <ModelNode
      entity={OCR_SESSION}
      className="mt-8 stage:row-start-3 stage:mt-0"
      style={column(OCR_FEEDS)}
    />
    <p
      className={cn(TYPE.note, 'mt-2 stage:row-start-3 stage:mt-0 stage:self-center stage:pl-8')}
      style={{ gridColumn: `${OCR_FEEDS * 2 + 2} / -1` }}
    >
      {OCR_SESSION.note}
    </p>
  </figure>
)
