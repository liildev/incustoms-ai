// beui.dev/components/motion/animated-badge — status colors, adapted to project tokens
import { CircleAlert, Info, TriangleAlert, type LucideIcon, Check, Circle } from 'lucide-react'

export type BadgeStatus = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export const BADGE_STATUS_CLASS: Record<BadgeStatus, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-primary/20 bg-accent text-accent-foreground',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-destructive/25 bg-destructive/10 text-destructive',
}

export const BADGE_ICONS: Record<BadgeStatus, LucideIcon> = {
  neutral: Circle,
  info: Info,
  success: Check,
  warning: TriangleAlert,
  danger: CircleAlert,
}
