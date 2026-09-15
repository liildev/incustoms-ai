import { cn } from '@/shared/lib/cn'
import type { GraphLines } from '../model/print-form'

type BoxLinesProps = {
  lines: GraphLines
  /** The content moved to a supplement sheet: the box keeps only the reference to it. */
  overflow?: boolean
  /** Smaller text for the low boxes of the form (graphs 27, 30, 40 and 53). */
  small?: boolean
  className?: string
}

/** Values of a box, one source line per printed line; long lines wrap instead of being cut. */
export const BoxLines = ({ lines, overflow = false, small = false, className }: BoxLinesProps) => (
  <div
    className={cn(
      'min-h-0 wrap-break-word text-foreground',
      small ? 'text-[6pt] leading-[1.1]' : 'text-[7pt] leading-[1.2]',
      className,
    )}
  >
    {overflow ? (
      <p>см. дополнение</p>
    ) : (
      lines.map((line, position) => (
        <p key={position} className="whitespace-pre-wrap">
          {line}
        </p>
      ))
    )}
  </div>
)
