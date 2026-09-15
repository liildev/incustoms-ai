import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { CONTROLS_IDLE_MS, STAGE_QUERY } from '../config/stage'
import type { DeckCommand } from '../lib/deck-key'
import { useFullscreen } from '../lib/use-fullscreen'
import { useIdle } from '../lib/use-idle'
import { useMediaQuery } from '../lib/use-media-query'
import { MAIN_COUNT, SLIDE_COUNT, SLIDES, isAppendix, slidePosition } from '../model/slides'
import { useDeckKeys } from '../model/use-deck-keys'
import { DeckControls } from './deck-controls'
import { Stage } from './stage'

type DeckProps = { index: number; go: (index: number) => void }

export const Deck = ({ index, go }: DeckProps) => {
  const {
    attach: attachFullscreen,
    active: fullscreenActive,
    supported: fullscreenSupported,
    toggle: toggleFullscreen,
    exit: exitFullscreen,
  } = useFullscreen<HTMLDivElement>()
  const fitted = useMediaQuery(STAGE_QUERY)
  const controlsHidden = useIdle(fullscreenActive, CONTROLS_IDLE_MS)

  const [shown, setShown] = useState({ index, direction: 1 })
  if (shown.index !== index) setShown({ index, direction: index > shown.index ? 1 : -1 })

  const run = (command: DeckCommand) => {
    if (command === 'next') go(index + 1)
    else if (command === 'previous') go(index - 1)
    else if (command === 'first') go(0)
    // From the main story End stops at its last slide; the appendix is reached by stepping past it.
    else if (command === 'last') go(isAppendix(index) ? SLIDE_COUNT - 1 : MAIN_COUNT - 1)
    else if (command === 'fullscreen') toggleFullscreen()
    else exitFullscreen()
  }
  useDeckKeys(run, fitted)

  return (
    <div
      ref={attachFullscreen}
      className={cn('relative flex h-dvh flex-col bg-background', controlsHidden && 'cursor-none')}
    >
      <h1 className="sr-only">Аудит продукта InCustoms.AI</h1>
      <Stage index={index} direction={shown.direction} fitted={fitted} />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {slidePosition(index)}: {SLIDES[index]?.label}
      </p>
      <DeckControls
        index={index}
        onSelect={go}
        fullscreenSupported={fullscreenSupported}
        fullscreenActive={fullscreenActive}
        onToggleFullscreen={toggleFullscreen}
        hidden={controlsHidden}
      />
    </div>
  )
}
