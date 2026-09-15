export type DeckCommand = 'next' | 'previous' | 'first' | 'last' | 'fullscreen' | 'exit-fullscreen'

type KeyContext = {
  shiftKey: boolean
  /** Focus is on a control reached by keyboard, so Space keeps its native meaning (press). */
  onControl: boolean
  /**
   * The canvas is scaled (one screen per slide). In the reflow layout Space, Page keys and Home/End
   * keep scrolling the slide, and only the arrows change slides.
   */
  paged: boolean
}

/** Maps a key press to a deck command, or null when the key keeps its native behaviour. */
export const resolveDeckKey = (
  key: string,
  { shiftKey, onControl, paged }: KeyContext,
): DeckCommand | null => {
  switch (key) {
    case 'ArrowRight':
      return 'next'
    case 'ArrowLeft':
      return 'previous'
    case 'PageDown':
      return paged ? 'next' : null
    case 'PageUp':
      return paged ? 'previous' : null
    case 'Home':
      return paged ? 'first' : null
    case 'End':
      return paged ? 'last' : null
    case ' ':
      if (!paged || onControl) return null
      return shiftKey ? 'previous' : 'next'
    // Usually consumed by the browser to leave fullscreen; handled too for browsers that pass it on.
    case 'Escape':
      return 'exit-fullscreen'
    case 'f':
    case 'F':
    case 'а':
    case 'А':
      return 'fullscreen'
    default:
      return null
  }
}
