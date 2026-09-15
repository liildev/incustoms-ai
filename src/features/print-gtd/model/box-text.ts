import { type BoxCapacity, fitsBox } from '../lib/text-box'
import type { BoxText } from './print-form'

/** Graph content with its overflow decision for the given box. */
export const boxText = (lines: readonly string[], capacity: BoxCapacity): BoxText => ({
  lines,
  overflow: !fitsBox(lines, capacity),
})
