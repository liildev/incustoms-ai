// Multi-line counterpart of the BeUI-based Input (BeUI has no textarea); same shell, label and messages.
import { type ComponentProps, type ReactNode, useId, useRef } from 'react'
import { cn } from '../lib/cn'
import { useErrorShake } from '../lib/hooks/use-error-shake'
import { FieldLabel } from './field-label'
import { FieldMessage } from './field-message'
import { fieldControlClassName, fieldShellClassName } from './field-styles'

type TextareaProps = Omit<ComponentProps<'textarea'>, 'className'> & {
  label?: string
  labelAside?: ReactNode
  hint?: string | null
  markRequired?: boolean
  error?: string | boolean
  warnings?: readonly string[]
  className?: string
}

export const Textarea = ({
  label,
  labelAside,
  hint,
  markRequired,
  error,
  warnings,
  className,
  id: idProp,
  ...props
}: TextareaProps) => {
  const reactId = useId()
  const id = idProp ?? reactId
  const shellRef = useRef<HTMLDivElement>(null)
  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : undefined
  const showMessage = Boolean(errorMessage) || (warnings?.length ?? 0) > 0
  useErrorShake(shellRef, hasError)

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {label ? (
        <FieldLabel
          htmlFor={id}
          label={label}
          aside={labelAside}
          hint={hint}
          markRequired={markRequired}
        />
      ) : null}
      <div ref={shellRef} className={fieldShellClassName(hasError)}>
        <textarea
          id={id}
          aria-invalid={hasError || undefined}
          aria-describedby={showMessage ? `${id}-message` : undefined}
          className={cn(fieldControlClassName, 'block min-h-16 resize-y px-2 py-1.5')}
          {...props}
        />
      </div>
      {label || showMessage ? (
        <FieldMessage id={`${id}-message`} error={errorMessage} warnings={warnings} />
      ) : null}
    </div>
  )
}
