import { describe, expect, it } from 'vitest'
import {
  APPENDIX_COUNT,
  MAIN_COUNT,
  SLIDES,
  SLIDE_COUNT,
  appendixLabel,
  isAppendix,
  parseSlideParam,
  sectionEnd,
  slideNumber,
  slidePosition,
  slidePath,
} from './slides'

describe('slide URLs', () => {
  it('puts slide 1 on the bare path and slide n on /n', () => {
    expect(slidePath('/presentation', 0)).toBe('/presentation')
    expect(slidePath('/presentation', 4)).toBe('/presentation/5')
  })

  it('parses a slide number into a zero-based index', () => {
    expect(parseSlideParam(undefined)).toBe(0)
    expect(parseSlideParam('1')).toBe(0)
    expect(parseSlideParam(String(SLIDE_COUNT))).toBe(SLIDE_COUNT - 1)
  })

  it('rejects numbers outside the deck and non-canonical forms', () => {
    for (const param of ['0', String(SLIDE_COUNT + 1), '05', '2x', '', '-1']) {
      expect(parseSlideParam(param)).toBeNull()
    }
  })
})

describe('main story and appendix', () => {
  it('keeps the appendix after the main slides', () => {
    expect(MAIN_COUNT + APPENDIX_COUNT).toBe(SLIDE_COUNT)
    SLIDES.forEach((slide, index) => {
      expect(slide.section === 'appendix').toBe(index >= MAIN_COUNT)
    })
    expect(isAppendix(MAIN_COUNT - 1)).toBe(false)
    expect(isAppendix(MAIN_COUNT)).toBe(true)
  })

  it('numbers slides within their own section', () => {
    expect(slideNumber(0)).toBe('01')
    expect(slideNumber(MAIN_COUNT - 1)).toBe(String(MAIN_COUNT).padStart(2, '0'))
    expect(slideNumber(MAIN_COUNT)).toBe('П1')
    expect(slideNumber(SLIDE_COUNT - 1)).toBe(`П${APPENDIX_COUNT}`)
    expect(sectionEnd(0)).toBe(slideNumber(MAIN_COUNT - 1))
    expect(sectionEnd(MAIN_COUNT)).toBe(`П${APPENDIX_COUNT}`)
    expect(appendixLabel(SLIDES[MAIN_COUNT]?.id ?? 'method')).toBe('Приложение П1')
  })

  it('announces the position within the section', () => {
    expect(slidePosition(4)).toBe(`Слайд 5 из ${MAIN_COUNT}`)
    expect(slidePosition(MAIN_COUNT + 1)).toBe(`Приложение 2 из ${APPENDIX_COUNT}`)
  })
})
