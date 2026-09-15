import { cn } from '@/shared/lib/cn'
import { DEFECTS_LEAD, LOCAL_DEFECTS } from '../model/defects'
import { appendixLabel } from '../model/slides'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

export const DefectsSlide = () => (
  <SlideLayout
    title="Другие подтверждённые дефекты"
    lead={DEFECTS_LEAD}
    notice={{ tone: 'appendix', text: appendixLabel('defects') }}
  >
    <ul className="grid stage:grid-flow-col stage:grid-cols-2 stage:grid-rows-5 stage:gap-x-[88px]">
      {LOCAL_DEFECTS.map((defect) => (
        <li
          key={defect.source}
          className="flex items-baseline justify-between gap-4 border-t border-border py-3 stage:gap-8 stage:py-[22px]"
        >
          <span className={cn(TYPE.note, 'text-foreground')}>
            <RichText text={defect.text} />
          </span>
          <span className={cn(TYPE.ref, 'shrink-0')}>{defect.source}</span>
        </li>
      ))}
    </ul>
  </SlideLayout>
)
