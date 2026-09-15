// beui.dev/components/motion/input — field shell states, adapted to compact controls
import { cn } from '../lib/cn'

/** Border and ring of the field shell: idle, focused (via focus-within) and error. */
export const fieldShellClassName = (hasError: boolean, className?: string): string =>
  cn(
    'relative w-full min-w-0 overflow-hidden rounded-md border bg-surface transition-colors duration-200',
    'has-[:read-only]:bg-surface-muted',
    hasError
      ? 'border-destructive ring-2 ring-destructive/25'
      : 'border-input border-b-input-strong hover:border-input-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-focus-ring/25',
    className,
  )

export const fieldControlClassName =
  'w-full bg-transparent text-dense text-foreground caret-foreground outline-none focus-visible:outline-none placeholder:text-subtle-foreground disabled:cursor-not-allowed'
