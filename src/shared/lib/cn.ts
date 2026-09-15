// beui.dev lib/utils — clsx + tailwind-merge
import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Teaches tailwind-merge the project font sizes and shadows, so `text-dense` is not mistaken for a text
 * color and `shadow-popover` for a shadow color.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs', 'dense'],
      shadow: ['popover'],
      'drop-shadow': ['dialog'],
    },
  },
})

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
