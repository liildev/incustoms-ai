import { Fragment } from 'react'
import { cn } from '@/shared/lib/cn'
import { PROMISE_CHAIN, PROMISE_REPORT } from '../model/promise'
import { ChainConnector } from './chain-connector'
import { ChainNode } from './chain-node'
import { TYPE } from './slide-type'

const column = (nodeIndex: number) => ({ gridColumnStart: nodeIndex * 2 + 1 })

/**
 * The chain as the product's interface describes it, drawn in the neutral "expected" style: nothing on
 * this slide is judged yet. The report band spans the chain because the report claims to read all of it.
 */
export const PromiseDiagram = () => (
  <figure aria-label="Цепочка по описанию продукта" className="flex flex-col gap-4 stage:gap-8">
    <div className="flex flex-col stage:grid stage:grid-cols-[repeat(5,minmax(0,1fr)_56px)_minmax(0,1fr)] stage:gap-y-4">
      {PROMISE_CHAIN.map((node, position) => (
        <Fragment key={node.name}>
          {position > 0 ? (
            <ChainConnector
              tone="expected"
              className="ml-6 stage:row-start-1 stage:ml-0 stage:self-center"
              style={{ gridColumnStart: position * 2 }}
            />
          ) : null}
          <ChainNode name={node.name} className="stage:row-start-1" style={column(position)} />
          <p
            className={cn(TYPE.note, 'mt-1 stage:row-start-2 stage:mt-0')}
            style={column(position)}
          >
            {node.detail}
          </p>
        </Fragment>
      ))}
    </div>
    <p className="flex flex-col gap-1 rounded-lg bg-surface-muted px-4 py-3 stage:flex-row stage:items-baseline stage:gap-6 stage:px-8 stage:py-6">
      <span className={TYPE.title}>{PROMISE_REPORT.name}</span>
      <span className={TYPE.body}>«{PROMISE_REPORT.quote}»</span>
    </p>
  </figure>
)
