import type { ReactNode } from 'react'
import { Tooltip } from './tooltip'

type FieldLabelProps = {
  htmlFor: string
  label: string
  /** Secondary reference aligned right, e.g. the XML tag. */
  aside?: ReactNode
  /** Longer explanation shown in a tooltip over the label. */
  hint?: string | null
  markRequired?: boolean
}

export const FieldLabel = ({ htmlFor, label, aside, hint, markRequired }: FieldLabelProps) => {
  const text = (
    <span className="truncate">
      {label}
      {markRequired ? <span className="text-destructive"> *</span> : null}
    </span>
  )

  return (
    <label
      htmlFor={htmlFor}
      className="flex min-w-0 items-baseline gap-1.5 text-2xs text-muted-foreground"
    >
      {hint ? (
        <Tooltip content={hint} wrapperClassName="min-w-0">
          {text}
        </Tooltip>
      ) : (
        text
      )}
      {aside ? (
        <span className="ml-auto shrink-0 font-mono text-[10px] text-subtle-foreground">
          {aside}
        </span>
      ) : null}
    </label>
  )
}
