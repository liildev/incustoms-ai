import { ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { EVIDENCE } from '../model/evidence'
import { appendixLabel } from '../model/slides'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

const ROW =
  'stage:grid stage:grid-cols-[176px_minmax(0,1fr)_56px_minmax(0,0.62fr)] stage:items-start'

export const EvidenceSlide = () => (
  <SlideLayout
    title="Подтверждённые находки за главным выводом"
    notice={{ tone: 'appendix', text: appendixLabel('evidence') }}
  >
    <div aria-hidden className={cn(ROW, 'hidden pb-3 stage:grid')}>
      <span className={TYPE.note}>Находка</span>
      <span className={TYPE.note}>Наблюдалось</span>
      <span />
      <span className={TYPE.note}>Почему важно</span>
    </div>
    <ol className="flex flex-col">
      {EVIDENCE.map((item) => (
        <li
          key={item.source}
          className={cn(
            ROW,
            'flex flex-col gap-2 border-t border-border py-4 stage:gap-0 stage:py-5.5',
          )}
        >
          <span className={cn(TYPE.ref, 'stage:pt-0.5')}>
            <span className="sr-only">Находка </span>
            {item.source}
          </span>
          <p className={TYPE.note}>
            <span className="sr-only">Наблюдалось: </span>
            <span className="text-foreground">
              <RichText text={item.observed} />
            </span>
          </p>
          <ArrowRight
            aria-hidden
            className="hidden text-subtle-foreground stage:mx-auto stage:mt-1 stage:block stage:size-6"
          />
          <p className={TYPE.note}>
            <span className="sr-only">Почему важно: </span>
            {item.impact}
          </p>
        </li>
      ))}
    </ol>
  </SlideLayout>
)
