import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: ReactNode
  action?: ReactNode
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-input bg-surface-muted px-5 py-6">
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description ? (
      <div className="max-w-prose text-dense text-muted-foreground">{description}</div>
    ) : null}
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
)
