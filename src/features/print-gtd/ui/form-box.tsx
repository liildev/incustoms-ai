import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import type { Frame, Rect } from '../config/form-geometry'

type FormBoxProps = {
  frame: Frame
  rect: Rect
  /** Graph number as printed on the form: «1», «15а», «B». */
  number?: string
  /** Graph the box belongs to, for the clipping check; defaults to `number`. */
  graph?: string
  label?: string
  /** `bold` — the heavy frames of the form; `dashed` — graph C; `bare` — text without a frame. */
  frameStyle?: 'thin' | 'bold' | 'dashed' | 'bare'
  className?: string
  children?: ReactNode
}

const percent = (value: number, total: number) => `${(value / total) * 100}%`

/**
 * A box of the paper form, positioned in percent of the measured image on each axis. The outline is
 * centred on the box edge, so neighbouring boxes share one line instead of doubling it.
 */
export const FormBox = ({
  frame,
  rect: [left, top, right, bottom],
  number,
  graph = number,
  label,
  frameStyle = 'thin',
  className,
  children,
}: FormBoxProps) => (
  <div
    data-graph={graph}
    className={cn(
      'absolute flex flex-col overflow-hidden px-[0.6mm] py-[0.3mm]',
      frameStyle === 'thin' && 'outline-[0.2mm] -outline-offset-[0.1mm] outline-foreground',
      frameStyle === 'bold' && 'outline-[0.6mm] -outline-offset-[0.3mm] outline-foreground',
      frameStyle === 'dashed' &&
        'outline-[0.2mm] -outline-offset-[0.1mm] outline-foreground outline-dashed',
      className,
    )}
    style={{
      left: percent(left, frame.width),
      top: percent(top, frame.height),
      width: percent(right - left, frame.width),
      height: percent(bottom - top, frame.height),
    }}
  >
    {number || label ? (
      <p className="shrink-0 text-[5pt] leading-[1.1] text-foreground">
        {number ? <span className="font-semibold">{number} </span> : null}
        {label}
      </p>
    ) : null}
    {children}
  </div>
)
