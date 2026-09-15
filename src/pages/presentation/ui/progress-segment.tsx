import { cn } from '@/shared/lib/cn'

type ProgressSegmentProps = {
  label: string
  title: string
  state: 'past' | 'current' | 'future'
  /** Appendix segments are paler until visited: backup material, not the story. */
  appendix?: boolean
  onSelect: () => void
}

export const ProgressSegment = ({
  label,
  title,
  state,
  appendix = false,
  onSelect,
}: ProgressSegmentProps) => (
  <li className="flex min-w-0 flex-1">
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-current={state === 'current' ? 'step' : undefined}
      title={title}
      className="group flex h-8 w-full items-center rounded-sm px-0.5"
    >
      <span
        className={cn(
          'h-1 w-full rounded-full transition-colors duration-200',
          state === 'current' && 'h-1.5 bg-primary',
          state === 'past' && 'bg-muted-foreground group-hover:bg-foreground',
          state === 'future' &&
            (appendix ? 'bg-border group-hover:bg-input' : 'bg-input group-hover:bg-input-strong'),
        )}
      />
    </button>
  </li>
)
