// beui.dev/components/motion/loader — spinner variant (the only variant used here)
import { motion, useReducedMotion } from 'motion/react'
import { EASE_IN_OUT } from '../lib/ease'
import { cn } from '../lib/cn'

type LoaderProps = {
  /** Square size in px. */
  size?: number
  /** Seconds per rotation. */
  speed?: number
  /** Accessible label; omit when a visible label is next to the loader. */
  label?: string
  className?: string
}

/** Reduced motion keeps a calm opacity pulse and drops the rotation. */
const REDUCED_PULSE = { opacity: [1, 0.4, 1] }

export const Loader = ({ size = 16, speed = 1, label, className }: LoaderProps) => {
  const reduce = useReducedMotion()
  const stroke = Math.max(2, size * 0.09)
  const radius = (size - stroke) / 2
  const center = size / 2

  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('inline-flex items-center justify-center text-primary', className)}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={reduce ? REDUCED_PULSE : { rotate: 360 }}
        transition={
          reduce
            ? { duration: 1.4, ease: EASE_IN_OUT, repeat: Infinity }
            : { duration: speed, ease: 'linear', repeat: Infinity }
        }
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={stroke}
        />
        <path
          d={`M ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </motion.svg>
    </span>
  )
}
