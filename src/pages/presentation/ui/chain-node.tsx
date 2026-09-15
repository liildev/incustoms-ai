import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type ChainNodeProps = {
  name: string
  /** `quiet` for the reference chain drawn behind the observed one. */
  tone?: 'strong' | 'quiet'
  /** Tighter padding and name, for nodes that carry a record ID in a narrow column. */
  compact?: boolean
  className?: string
  /** Grid placement when the node sits in a diagram grid. */
  style?: CSSProperties
  children?: ReactNode
}

/** A business entity in a diagram. */
export const ChainNode = ({
  name,
  tone = 'strong',
  compact = false,
  className,
  style,
  children,
}: ChainNodeProps) => (
  <div
    style={style}
    className={cn(
      'flex min-w-0 flex-col justify-center rounded-md border px-3 py-2 stage:rounded-lg',
      compact ? 'stage:px-4' : 'stage:px-5',
      tone === 'quiet'
        ? 'border-border bg-surface-muted text-muted-foreground stage:h-15'
        : 'border-input bg-surface text-foreground shadow-sm stage:min-h-24 stage:py-3',
      className,
    )}
  >
    <span
      className={cn(
        'font-medium tracking-[-0.01em]',
        tone === 'quiet' && 'stage:text-[22px]',
        tone === 'strong' &&
          (compact ? 'text-base stage:text-[24px]' : 'text-base stage:text-[26px]'),
      )}
    >
      {name}
    </span>
    {children}
  </div>
)
