import { cn } from '@/shared/lib/cn'
import type { Frame, Rect } from '../config/form-geometry'
import type { PartyGraph } from '../model/print-form'
import { BoxLines } from './box-lines'
import { FormBox } from './form-box'

type PartyBoxProps = {
  frame: Frame
  rect: Rect
  number: string
  label: string
  party: PartyGraph
  /** Where the instruction puts the value after «№»: the top of graph 14, the bottom of graphs 2, 8 and 9. */
  numberAt: 'top' | 'bottom'
}

/** Graphs 2, 8, 9 and 14: the text block, and the value the instruction places after the «№» sign. */
export const PartyBox = ({ frame, rect, number, label, party, numberAt }: PartyBoxProps) => {
  const numberLine = party.number ? (
    <p
      className={cn(
        'text-right text-[7pt] leading-[1.2] text-foreground',
        numberAt === 'bottom' && 'mt-auto',
      )}
    >
      № {party.number}
    </p>
  ) : null
  return (
    <FormBox frame={frame} rect={rect} number={number} label={label}>
      {numberAt === 'top' ? numberLine : null}
      <BoxLines lines={party.text.lines} overflow={party.text.overflow} className="mt-[0.4mm]" />
      {numberAt === 'bottom' ? numberLine : null}
    </FormBox>
  )
}
