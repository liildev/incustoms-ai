import { X } from 'lucide-react'
import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'
import { EASE_OUT } from '@/shared/lib/ease'
import {
  type ConnectorOrientation,
  type ConnectorTone,
  connectorBoxClass,
  connectorLineClass,
} from './connector-styles'

type ChainConnectorProps = {
  tone: ConnectorTone
  orientation?: ConnectorOrientation
  /** Delay of the break mark on a missing link, so breaks land after the slide has entered. */
  delay?: number
  className?: string
  /** Grid placement when the connector sits in a diagram grid. */
  style?: CSSProperties
}

/** Link between two diagram nodes. A missing link is drawn broken, with a mark in the gap. */
export const ChainConnector = ({
  tone,
  orientation = 'flow',
  delay = 0,
  className,
  style,
}: ChainConnectorProps) => {
  const line = connectorLineClass(tone, orientation)
  const across = orientation === 'horizontal' || orientation === 'flow'

  return (
    <span
      aria-hidden
      style={style}
      className={cn('flex shrink-0 items-center', connectorBoxClass(orientation), className)}
    >
      <span className={line} />
      {tone === 'missing' ? (
        <>
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.26, ease: EASE_OUT }}
            className={cn(
              'm-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive stage:size-8',
              across && 'stage:mx-3',
            )}
          >
            <X className="size-3 stage:size-5" strokeWidth={2.75} />
          </motion.span>
          <span className={line} />
        </>
      ) : null}
    </span>
  )
}
