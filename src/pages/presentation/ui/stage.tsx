import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { cn } from '@/shared/lib/cn'
import { STAGE_HEIGHT, STAGE_WIDTH } from '../config/stage'
import { useFitScale } from '../lib/use-fit-scale'
import { SLIDES, slidePosition } from '../model/slides'
import { SLIDE_VARIANTS } from './slide-motion'
import { SlideErrorBoundary } from './slide-error-boundary'
import { SlideView } from './slide-view'

type StageProps = {
  index: number
  /** 1 when moving forward, -1 when moving back. */
  direction: number
  /** Scaled 1920×1080 canvas; otherwise the slide reflows into a scrolling column. */
  fitted: boolean
}

export const Stage = ({ index, direction, fitted }: StageProps) => {
  const { ref, node, scale } = useFitScale(STAGE_WIDTH, STAGE_HEIGHT)
  // Reduced motion skips transform animations, which would make the side offset jump; keep only the fade.
  const offset = useReducedMotion() ? 0 : direction
  const slide = SLIDES[index]

  useEffect(() => {
    node?.scrollTo({ top: 0 })
  }, [node, index])

  return (
    <main
      ref={ref}
      aria-label="Слайды"
      className={cn('relative min-h-0 flex-1', fitted ? 'overflow-hidden' : 'overflow-y-auto')}
    >
      <div
        className={cn(
          'overflow-hidden bg-surface',
          fitted ? 'absolute top-1/2 left-1/2 shadow-popover' : 'relative min-h-full',
        )}
        style={
          fitted
            ? {
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
                visibility: scale === null ? 'hidden' : undefined,
              }
            : undefined
        }
      >
        <AnimatePresence initial={false} mode="wait" custom={offset}>
          {slide ? (
            <motion.section
              key={slide.id}
              custom={offset}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              aria-roledescription="слайд"
              aria-label={`${slidePosition(index)}: ${slide.label}`}
              className={fitted ? 'absolute inset-0' : 'min-h-full'}
            >
              <SlideErrorBoundary>
                <SlideView id={slide.id} />
              </SlideErrorBoundary>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  )
}
