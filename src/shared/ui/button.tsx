// beui.dev/components/motion/button (Button)
import { type HTMLMotionProps, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { SPRING_PRESS } from '../lib/ease'
import { useHoverCapable } from '../lib/hooks/use-hover-capable'
import { type ButtonSize, type ButtonVariant, buttonClassName } from './button-styles'

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Scale while pressed. */
  pressScale?: number
  children?: ReactNode
}

/** Spring-pressed button; hover lift only on devices with a real hover. */
export const Button = ({
  variant = 'secondary',
  size = 'md',
  pressScale = 0.96,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) => {
  const reduce = useReducedMotion()
  const canHover = useHoverCapable()

  return (
    <motion.button
      type={type}
      whileTap={reduce ? undefined : { scale: pressScale }}
      whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
      transition={SPRING_PRESS}
      className={buttonClassName(variant, size, className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}
