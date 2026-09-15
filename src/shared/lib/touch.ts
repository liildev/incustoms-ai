// beui.dev lib/touch (the part used by tooltip gestures)

/**
 * True when the pointer is resting on the surface rather than pressing it.
 * A pen or finger in contact reports `buttons`, a hovering mouse or pen does not.
 */
export const isHoveringPointer = (event: { pointerType: string; buttons: number }): boolean =>
  event.pointerType !== 'touch' && event.buttons === 0
