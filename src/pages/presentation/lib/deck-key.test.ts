import { describe, expect, it } from 'vitest'
import { resolveDeckKey } from './deck-key'

const paged = { shiftKey: false, onControl: false, paged: true }

describe('resolveDeckKey', () => {
  it('maps arrows, paging and Home/End on the scaled canvas', () => {
    expect(resolveDeckKey('ArrowRight', { ...paged, onControl: true })).toBe('next')
    expect(resolveDeckKey('PageDown', paged)).toBe('next')
    expect(resolveDeckKey('ArrowLeft', { ...paged, onControl: true })).toBe('previous')
    expect(resolveDeckKey('PageUp', paged)).toBe('previous')
    expect(resolveDeckKey('Home', paged)).toBe('first')
    expect(resolveDeckKey('End', paged)).toBe('last')
  })

  it('leaves Space to a keyboard-focused control and advances otherwise', () => {
    expect(resolveDeckKey(' ', { ...paged, onControl: true })).toBeNull()
    expect(resolveDeckKey(' ', paged)).toBe('next')
    expect(resolveDeckKey(' ', { ...paged, shiftKey: true })).toBe('previous')
  })

  it('keeps scrolling keys native in the reflow layout; arrows still change slides', () => {
    const reflow = { ...paged, paged: false }
    for (const key of [' ', 'PageDown', 'PageUp', 'Home', 'End']) {
      expect(resolveDeckKey(key, reflow)).toBeNull()
    }
    expect(resolveDeckKey('ArrowRight', reflow)).toBe('next')
  })

  it('toggles fullscreen with F on Latin and Russian layouts and leaves it with Escape', () => {
    expect(resolveDeckKey('f', paged)).toBe('fullscreen')
    expect(resolveDeckKey('а', paged)).toBe('fullscreen')
    expect(resolveDeckKey('Escape', { ...paged, onControl: true })).toBe('exit-fullscreen')
    expect(resolveDeckKey('Enter', paged)).toBeNull()
  })
})
