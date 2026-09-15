/** Application paths. Add new pages here first. */
export const ROUTES = {
  root: '/',
  gtd: '/gtd',
  presentation: '/presentation',
  /** Slide 1 is the bare path; slides 2…n add their number. */
  presentationSlide: '/presentation/:slide?',
} as const
