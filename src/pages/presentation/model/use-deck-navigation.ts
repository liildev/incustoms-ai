import { useLocation, useParams } from 'wouter'
import { ROUTES } from '@/shared/config/routes'
import { SLIDE_COUNT, parseSlideParam, slidePath } from './slides'

type DeckNavigation =
  | { status: 'redirect'; to: string }
  | { status: 'ready'; index: number; go: (target: number) => void }

/**
 * The current slide comes from the URL, so browser Back/Forward move between slides and a slide
 * can be linked directly. An unknown or non-canonical segment (`/presentation/1`, `/presentation/x`)
 * redirects to the first slide.
 */
export const useDeckNavigation = (): DeckNavigation => {
  const { slide } = useParams<{ slide?: string }>()
  const [, navigate] = useLocation()
  const index = parseSlideParam(slide)

  if (index === null || (index === 0 && slide !== undefined)) {
    return { status: 'redirect', to: ROUTES.presentation }
  }

  const go = (target: number) => {
    if (target === index || target < 0 || target >= SLIDE_COUNT) return
    navigate(slidePath(ROUTES.presentation, target))
  }

  return { status: 'ready', index, go }
}
