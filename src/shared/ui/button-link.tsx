// beui.dev/components/motion/button (ButtonLink)
import { type HTMLMotionProps, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { SPRING_PRESS } from '../lib/ease'
import { useHoverCapable } from '../lib/hooks/use-hover-capable'
import { type ButtonSize, type ButtonVariant, buttonClassName } from './button-styles'

type ButtonLinkProps = Omit<HTMLMotionProps<'a'>, 'children'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  pressScale?: number
  children?: ReactNode
}

/** An anchor with the Button appearance and press feedback. */
export const ButtonLink = ({
  variant = 'secondary',
  size = 'md',
  pressScale = 0.96,
  className,
  children,
  ...props
}: ButtonLinkProps) => {
  const reduce = useReducedMotion()
  const canHover = useHoverCapable()

  return (
    <motion.a
      whileTap={reduce ? undefined : { scale: pressScale }}
      whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
      transition={SPRING_PRESS}
      className={buttonClassName(variant, size, className)}
      {...props}
    >
      {children}
    </motion.a>
  )
}
