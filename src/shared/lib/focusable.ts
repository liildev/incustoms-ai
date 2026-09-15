const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Elements inside `root` that Tab reaches, in document order. */
export const focusableIn = (root: HTMLElement | null): HTMLElement[] =>
  root
    ? [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (element) => element.tabIndex >= 0,
      )
    : []
