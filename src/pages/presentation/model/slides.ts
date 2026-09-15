/**
 * Deck order. `label` names the slide in navigation and screen-reader announcements. The main story
 * ends at the last `main` slide; `appendix` slides hold the detailed evidence for questions.
 */
export const SLIDES = [
  { id: 'title', label: 'Титульный слайд', section: 'main' },
  { id: 'summary', label: 'Коротко', section: 'main' },
  { id: 'promise', label: 'Что обещает продукт', section: 'main' },
  { id: 'strengths', label: 'Что уже работает', section: 'main' },
  { id: 'finding', label: 'Главный вывод', section: 'main' },
  { id: 'case', label: 'Где теряются данные', section: 'main' },
  { id: 'impact', label: 'Последствия', section: 'main' },
  { id: 'target', label: 'Целевая модель', section: 'main' },
  { id: 'next', label: 'С чего начать', section: 'main' },
  { id: 'method', label: 'Метод и охват', section: 'appendix' },
  { id: 'evidence', label: 'Подтверждённые находки', section: 'appendix' },
  { id: 'defects', label: 'Локальные дефекты', section: 'appendix' },
  { id: 'limits', label: 'Границы данных', section: 'appendix' },
] as const

export type SlideId = (typeof SLIDES)[number]['id']

export const SLIDE_COUNT = SLIDES.length

export const MAIN_COUNT = SLIDES.filter((slide) => slide.section === 'main').length

export const APPENDIX_COUNT = SLIDE_COUNT - MAIN_COUNT

/** Reads `section`; the numbering below assumes the appendix follows every main slide (slides.test.ts). */
export const isAppendix = (index: number): boolean => SLIDES[index]?.section === 'appendix'

/** Position within the slide's own section: `05` in the main story, `П2` in the appendix. */
export const slideNumber = (index: number): string =>
  isAppendix(index) ? `П${index - MAIN_COUNT + 1}` : String(index + 1).padStart(2, '0')

/** Status line of an appendix slide, e.g. «Приложение П1». */
export const appendixLabel = (id: SlideId): string =>
  `Приложение ${slideNumber(SLIDES.findIndex((slide) => slide.id === id))}`

/** Last number of the slide's section, for the counter: `09` or `П4`. */
export const sectionEnd = (index: number): string =>
  slideNumber(isAppendix(index) ? SLIDE_COUNT - 1 : MAIN_COUNT - 1)

/** Spoken position: «Слайд 5 из 9» in the main story, «Приложение 2 из 4» after it. */
export const slidePosition = (index: number): string =>
  isAppendix(index)
    ? `Приложение ${index - MAIN_COUNT + 1} из ${APPENDIX_COUNT}`
    : `Слайд ${index + 1} из ${MAIN_COUNT}`

/** Slide 1 lives at the bare base path, slide n at `<base>/<n>`. */
export const slidePath = (base: string, index: number): string =>
  index === 0 ? base : `${base}/${index + 1}`

/** Zero-based slide index for the optional URL segment, or null when it names no slide. */
export const parseSlideParam = (param: string | undefined): number | null => {
  if (param === undefined) return 0
  if (!/^[1-9]\d*$/.test(param)) return null
  const index = Number(param) - 1
  return index < SLIDE_COUNT ? index : null
}
