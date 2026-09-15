import type { Frame, Rect } from '../config/form-geometry'
import type { PrintHeader } from '../model/print-form'
import { BoxLines } from './box-lines'
import { BoxValues } from './box-values'
import { FormBox } from './form-box'

type TransportBoxProps = {
  frame: Frame
  rect: Rect
  number: string
  label: string
  transport: PrintHeader['departureTransport']
}

/** Graphs 18 and 21: vehicles in the left subsection, country code of the vehicles in the right one. */
export const TransportBox = ({ frame, rect, number, label, transport }: TransportBoxProps) => (
  <FormBox frame={frame} rect={rect} number={number} label={label}>
    <div className="mt-auto flex min-h-0 items-end justify-between gap-[2mm]">
      <BoxLines lines={transport.text.lines} overflow={transport.text.overflow} />
      <BoxValues values={[transport.country]} className="shrink-0" />
    </div>
  </FormBox>
)
