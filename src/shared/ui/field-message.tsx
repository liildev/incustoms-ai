// beui.dev/components/motion/input — animated validation message
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FADE } from '../lib/ease'

type FieldMessageProps = {
  id: string
  error?: string
  /** Non-blocking remarks, shown when there is no error. */
  warnings?: readonly string[]
}

export const FieldMessage = ({ id, error, warnings = [] }: FieldMessageProps) => {
  const reduce = useReducedMotion()
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(4px)' }
  const message = error ?? (warnings.length > 0 ? warnings.join(' ') : null)

  return (
    <AnimatePresence initial={false} mode="wait">
      {message ? (
        <motion.p
          key={error ? 'error' : 'warning'}
          id={id}
          role={error ? 'alert' : undefined}
          initial={hidden}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={hidden}
          transition={FADE}
          className={error ? 'text-2xs text-destructive' : 'text-2xs text-warning'}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}
