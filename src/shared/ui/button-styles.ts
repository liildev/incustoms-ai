// beui.dev/components/motion/button — variant and size classes, adapted to the dense tool UI
// (compact heights, project radius and color tokens) and extended with a destructive variant.
import { cn } from '../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'icon'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary:
    'border border-input/70 bg-secondary text-secondary-foreground hover:border-input hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-7 gap-1.5 rounded-md px-2.5 text-dense [&_svg]:size-3.5',
  md: 'h-8 gap-2 rounded-md px-3 text-dense [&_svg]:size-4',
  icon: 'size-8 rounded-md [&_svg]:size-4',
}

export const buttonClassName = (
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
): string =>
  cn(
    'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap select-none',
    'transition-colors disabled:pointer-events-none disabled:opacity-50',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    className,
  )
