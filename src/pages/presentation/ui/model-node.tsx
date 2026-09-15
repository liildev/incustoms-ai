import type { CSSProperties } from 'react'
import type { ModelEntity } from '../model/target-model'
import { ChainNode } from './chain-node'

type ModelNodeProps = { entity: ModelEntity; className?: string; style?: CSSProperties }

/** Entity of the proposed model with its own stable ID. */
export const ModelNode = ({ entity, className, style }: ModelNodeProps) => (
  <ChainNode name={entity.name} compact className={className} style={style}>
    <span className="font-mono text-dense text-primary stage:text-[22px] stage:leading-normal">
      {entity.key}
    </span>
  </ChainNode>
)
