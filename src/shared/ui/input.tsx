// beui.dev/components/motion/input — adapted: uncontrolled-friendly (works with register),
// compact height, optional spec label row and non-blocking warnings.
import { type ComponentProps, type ReactNode, useId, useRef } from 'react'
import { cn } from '../lib/cn'
import { useErrorShake } from '../lib/hooks/use-error-shake'
import { FieldLabel } from './field-label'
import { FieldMessage } from './field-message'
import { fieldControlClassName, fieldShellClassName } from './field-styles'

export type InputProps = Omit<ComponentProps<'input'>, 'className'> & {
  label?: string
  labelAside?: ReactNode
  hint?: string | null
  markRequired?: boolean
  /** Truthy error triggers a shake and a red border; a string is also shown as a message. */
  error?: string | boolean
  warnings?: readonly string[]
  className?: string
  inputClassName?: string
}

export const Input = ({
  label,
  labelAside,
  hint,
  markRequired,
  error,
  warnings,
  className,
  inputClassName,
  id: idProp,
  ...props
}: InputProps) => {
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
      <div
        ref={shellRef}
        data-state={hasError ? 'error' : 'idle'}
        className={fieldShellClassName(hasError, 'h-8')}
      >
        <input
          id={id}
          aria-invalid={hasError || undefined}
          aria-describedby={showMessage ? `${id}-message` : undefined}
          className={cn(fieldControlClassName, 'h-full px-2', inputClassName)}
          {...props}
        />
      </div>
      {label || showMessage ? (
        <FieldMessage id={`${id}-message`} error={errorMessage} warnings={warnings} />
      ) : null}
    </div>
  )
}
