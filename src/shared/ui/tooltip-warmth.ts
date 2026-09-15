// beui.dev/components/motion/tooltip — once a tooltip has just closed, neighbours open without delay
const WARM_WINDOW_MS = 300
let lastHiddenAt = 0

export const markTooltipHidden = (): void => {
  lastHiddenAt = Date.now()
}

export const isTooltipWarm = (): boolean => Date.now() - lastHiddenAt < WARM_WINDOW_MS
