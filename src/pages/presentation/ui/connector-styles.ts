import type { LinkState } from '../model/chain'

/** `expected` draws the chain the product describes; `optional` a reference that may be empty. */
export type ConnectorTone = LinkState | 'expected' | 'optional'

/** `flow` is vertical in the narrow reflow layout and horizontal on the canvas. */
export type ConnectorOrientation = 'flow' | 'horizontal' | 'vertical'

const TONE_BORDER: Record<ConnectorTone, string> = {
  expected: 'border-input',
  linked: 'border-primary',
  optional: 'border-dashed border-primary',
  partial: 'border-dashed border-warning',
  missing: 'border-destructive',
  unverified: 'border-dashed border-input-strong',
}

const SIDE: Record<ConnectorOrientation, string> = {
  flow: 'border-l-2 stage:border-l-0 stage:border-t-[3px]',
  horizontal: 'border-t-2 stage:border-t-[3px]',
  vertical: 'border-l-2 stage:border-l-[3px]',
}

const BOX: Record<ConnectorOrientation, string> = {
  flow: 'h-12 w-6 flex-col stage:h-8 stage:w-full stage:flex-row',
  horizontal: 'h-6 w-full flex-row',
  vertical: 'h-12 w-6 flex-col stage:h-full stage:w-8',
}

export const connectorLineClass = (tone: ConnectorTone, orientation: ConnectorOrientation) =>
  `min-h-0 min-w-0 flex-1 ${SIDE[orientation]} ${TONE_BORDER[tone]}`

export const connectorBoxClass = (orientation: ConnectorOrientation) => BOX[orientation]
