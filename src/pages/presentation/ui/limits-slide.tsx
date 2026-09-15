import { cn } from '@/shared/lib/cn'
import { EVIDENCE_LIMITS, LIMITS_LEAD } from '../model/limits'
import { appendixLabel } from '../model/slides'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

/** Keeps the audit's boundaries at hand for questions: each row names its evidence class. */
export const LimitsSlide = () => (
  <SlideLayout
    title="Открытые вопросы и границы данных"
    lead={LIMITS_LEAD}
    notice={{ tone: 'appendix', text: appendixLabel('limits') }}
  >
    <dl className="flex flex-col">
      {EVIDENCE_LIMITS.map((limit) => (
        <div
          key={limit.subject}
          className="grid gap-1 border-t border-border py-3 stage:grid-cols-[560px_320px_minmax(0,1fr)] stage:items-baseline stage:gap-x-10 stage:py-[20px]"
        >
          <dt className={cn(TYPE.note, 'font-medium text-foreground')}>
            <RichText text={limit.subject} />
          </dt>
          <dd className={cn(TYPE.note, 'font-medium text-warning')}>{limit.status}</dd>
          <dd className={TYPE.note}>{limit.detail}</dd>
        </div>
      ))}
    </dl>
  </SlideLayout>
)
