/** Slides are composed on a fixed 1920×1080 canvas and scaled to the window. */
export const STAGE_WIDTH = 1920
export const STAGE_HEIGHT = 1080

/**
 * Where the canvas is scaled; elsewhere slides reflow into a scrolling column.
 * Must match the `stage` variant in app/styles/index.css, which the slide layouts use for canvas styles.
 */
export const STAGE_QUERY = '(width >= 48rem) and (height >= 30rem)'

/** Pointer inactivity after which the fullscreen controls fade out. */
export const CONTROLS_IDLE_MS = 2500
