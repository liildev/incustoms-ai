import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/shared/lib/cn'
import { FADE } from '@/shared/lib/ease'
import { Button } from '@/shared/ui'
import { SLIDE_COUNT, sectionEnd, slideNumber } from '../model/slides'
import { DeckProgress } from './deck-progress'

type DeckControlsProps = {
  index: number
  onSelect: (index: number) => void
  fullscreenSupported: boolean
  fullscreenActive: boolean
  onToggleFullscreen: () => void
  /** Faded out over the slide in fullscreen after pointer inactivity. */
  hidden: boolean
}

/**
 * Prev/next stay focusable at the ends (`aria-disabled` instead of `disabled`), so keyboard focus
 * is never dropped to the page when the first or last slide is reached.
 */
export const DeckControls = ({
  index,
  onSelect,
  fullscreenSupported,
  fullscreenActive,
  onToggleFullscreen,
  hidden,
}: DeckControlsProps) => {
  const atStart = index === 0
  const atEnd = index === SLIDE_COUNT - 1

  return (
    <motion.nav
      aria-label="Навигация по слайдам"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={FADE}
      className={cn(
        'flex h-14 shrink-0 items-center gap-2 border-t border-border bg-surface px-2 sm:gap-4 sm:px-4',
        fullscreenActive && 'absolute inset-x-0 bottom-0',
        // The tap that reveals hidden controls must not also press the control under it.
        hidden && 'pointer-events-none',
      )}
    >
      <p className="hidden w-52 shrink-0 truncate text-dense text-muted-foreground lg:block">
        Аудит продукта InCustoms.AI
      </p>
      <DeckProgress index={index} onSelect={onSelect} />
      <p className="shrink-0 text-dense text-muted-foreground tabular-nums">
        <span className="font-medium text-foreground">{slideNumber(index)}</span> /{' '}
        {sectionEnd(index)}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Предыдущий слайд"
          aria-disabled={atStart}
          onClick={() => onSelect(index - 1)}
          className="aria-disabled:opacity-40"
        >
          <ChevronLeft aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Следующий слайд"
          aria-disabled={atEnd}
          onClick={() => onSelect(index + 1)}
          className="aria-disabled:opacity-40"
        >
          <ChevronRight aria-hidden />
        </Button>
        {fullscreenSupported ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={fullscreenActive ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
            title={
              fullscreenActive
                ? 'Выйти из полноэкранного режима (F или Esc)'
                : 'Полноэкранный режим (F)'
            }
            onClick={onToggleFullscreen}
          >
            {fullscreenActive ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
          </Button>
        ) : null}
      </div>
    </motion.nav>
  )
}
