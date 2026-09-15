import { cn } from '@/shared/lib/cn'

type BoxValuesProps = { values: readonly string[]; className?: string }

/** Subsections of one graph (e.g. graph 1: direction, regime, third subsection), left to right. */
export const BoxValues = ({ values, className }: BoxValuesProps) => (
  <div
    className={cn(
      'mt-auto flex items-end gap-x-[2.5mm] text-[7pt] leading-[1.2] text-foreground',
      className,
    )}
  >
    {values.map((value, position) => (
      <span key={position} className="min-w-0 wrap-break-word">
        {value}
      </span>
    ))}
  </div>
)
