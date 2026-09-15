import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export const SectionHeader = ({ title, description, actions }: SectionHeaderProps) => (
  <header className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
    <div className="min-w-0">
      <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
      {description ? (
        <p className="mt-0.5 max-w-3xl text-dense text-muted-foreground">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
  </header>
)
