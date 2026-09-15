// beui.dev lib/ease — shared motion tokens used across BeUI components.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 } as const

/** Shared-layout glides: pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = { type: 'spring', stiffness: 360, damping: 32, mass: 0.6 } as const

/** Short cross-fade for content that appears or disappears in place. */
export const FADE = { duration: 0.18, ease: EASE_OUT } as const
