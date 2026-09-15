import { SLIDES, isAppendix, slideNumber } from '../model/slides'
import { ProgressSegment } from './progress-segment'

type DeckProgressProps = { index: number; onSelect: (index: number) => void }

const ENTRIES = SLIDES.map((slide, position) => ({ slide, position }))
const MAIN = ENTRIES.filter(({ position }) => !isAppendix(position))
const APPENDIX = ENTRIES.filter(({ position }) => isAppendix(position))

/**
 * One segment per slide: shows position and jumps straight to a slide. The appendix follows the main
 * story as a separate group of narrower segments, so the deck never reads as 13 equal slides.
 */
export const DeckProgress = ({ index, onSelect }: DeckProgressProps) => (
  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
    <ol aria-label="Основная часть" className="flex min-w-0 flex-9 items-center gap-1 sm:gap-1.5">
      {MAIN.map(({ slide, position }) => (
        <ProgressSegment
          key={slide.id}
          label={`Слайд ${position + 1}: ${slide.label}`}
          title={slide.label}
          state={position === index ? 'current' : position < index ? 'past' : 'future'}
          onSelect={() => onSelect(position)}
        />
      ))}
    </ol>
    <span aria-hidden className="hidden shrink-0 text-2xs text-subtle-foreground md:block">
      Приложение
    </span>
    <ol
      aria-label="Приложение"
      className="flex min-w-0 flex-4 items-center gap-1 sm:flex-2 sm:gap-1.5"
    >
      {APPENDIX.map(({ slide, position }) => (
        <ProgressSegment
          key={slide.id}
          label={`Приложение ${slideNumber(position)}: ${slide.label}`}
          title={slide.label}
          state={position === index ? 'current' : position < index ? 'past' : 'future'}
          appendix
          onSelect={() => onSelect(position)}
        />
      ))}
    </ol>
  </div>
)
