import { Fragment } from 'react'
import { cn } from '@/shared/lib/cn'
import {
  CHAIN_LINKS,
  CHAIN_NODES,
  LINK_STATE_LABEL,
  REPORT_FROM,
  REPORT_LINK,
} from '../model/chain'
import { ChainConnector } from './chain-connector'
import { ChainNode } from './chain-node'
import { LinkLegend } from './link-legend'
import { RichText } from './rich-text'
import { TYPE } from './slide-type'

/** Canvas grid shared by both rows, so expected and observed nodes line up column for column. */
const GRID = 'stage:grid stage:grid-cols-[repeat(5,188px_minmax(0,1fr))_188px]'
const BREAK_DELAY = 0.3
const BREAK_STAGGER = 0.09

const column = (nodeIndex: number) => ({ gridColumnStart: nodeIndex * 2 + 1 })

/** Expected chain above the observed one: the same entities, with the links as they were found. */
export const ChainDiagram = () => (
  <figure className="flex flex-col gap-3 stage:gap-0">
    <figcaption className="sr-only">
      Ожидается цепочка: {CHAIN_NODES.join(', ')}. Ниже — связи, найденные при проверке.
    </figcaption>
    <p aria-hidden className={cn(TYPE.note, 'hidden stage:mb-3 stage:block')}>
      Ожидается по описанию продукта
    </p>
    <div aria-hidden className={`hidden stage:items-center ${GRID}`}>
      {CHAIN_NODES.map((name, position) => (
        <Fragment key={name}>
          {position > 0 ? <ChainConnector tone="expected" className="stage:px-3" /> : null}
          <ChainNode name={name} tone="quiet" />
        </Fragment>
      ))}
    </div>
    <div className="flex flex-col gap-2 stage:mt-14 stage:mb-4 stage:flex-row stage:items-end stage:justify-between">
      <p className={TYPE.note}>Наблюдалось в проверенном сценарии</p>
      <LinkLegend />
    </div>
    <div
      className={`flex flex-col stage:grid-rows-[96px_auto_112px_auto] stage:items-center ${GRID}`}
    >
      {CHAIN_NODES.map((name, position) => {
        const link = CHAIN_LINKS[position]
        return (
          <Fragment key={name}>
            <ChainNode name={name} className="stage:row-start-1" style={column(position)} />
            {link ? (
              <div className="flex items-center gap-3 stage:contents">
                <ChainConnector
                  tone={link.state}
                  delay={BREAK_DELAY + position * BREAK_STAGGER}
                  className="ml-4 stage:row-start-1 stage:ml-0 stage:px-2"
                  style={{ gridColumnStart: position * 2 + 2 }}
                />
                <p
                  className={cn(
                    TYPE.note,
                    'stage:row-start-2 stage:w-[280px] stage:justify-self-center stage:self-start stage:pt-4 stage:text-center',
                  )}
                  style={{ gridColumnStart: position * 2 + 2 }}
                >
                  <span className="sr-only">{LINK_STATE_LABEL[link.state]}: </span>
                  <RichText text={link.note} />
                </p>
              </div>
            ) : null}
          </Fragment>
        )
      })}
      <div
        className="mt-6 flex items-center gap-3 stage:row-start-2 stage:row-end-4 stage:mt-0 stage:h-full stage:items-end stage:self-stretch"
        style={column(REPORT_FROM)}
      >
        <ChainConnector
          tone={REPORT_LINK.state}
          orientation="vertical"
          delay={BREAK_DELAY + CHAIN_LINKS.length * BREAK_STAGGER}
          className="ml-4 stage:ml-[78px]"
        />
        <p className={cn(TYPE.note, 'stage:w-[560px] stage:shrink-0 stage:pb-3')}>
          <span className="stage:sr-only">
            {CHAIN_NODES[REPORT_FROM]} → {REPORT_LINK.node}:{' '}
          </span>
          <span className="sr-only">{LINK_STATE_LABEL[REPORT_LINK.state]}: </span>
          <RichText text={REPORT_LINK.note} />
        </p>
      </div>
      <ChainNode
        name={REPORT_LINK.node}
        className="stage:row-start-4 stage:w-[360px] stage:justify-self-start"
        style={column(REPORT_FROM)}
      />
    </div>
  </figure>
)
