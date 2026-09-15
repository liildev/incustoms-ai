import { cn } from '@/shared/lib/cn'
import { AUDIT_FACTS, SUMMARY, SUMMARY_TITLE } from '../model/summary'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

/** The result within the first two slides: three conclusions, then one line on how they were reached. */
export const SummarySlide = () => (
  <SlideLayout title={SUMMARY_TITLE} className="flex flex-col justify-between gap-10">
    <ol className="flex flex-col">
      {SUMMARY.map((point, position) => (
        <li
          key={point.title}
          className="grid grid-cols-[2rem_1fr] gap-x-3 border-t border-border py-5 stage:grid-cols-[88px_1fr] stage:gap-x-0 stage:py-9"
        >
          <span className="font-semibold text-primary tabular-nums stage:text-[40px] stage:leading-[1.2]">
            {position + 1}
          </span>
          <div className="flex flex-col gap-1 stage:gap-3">
            <p className="text-lg leading-snug font-semibold tracking-[-0.01em] text-foreground stage:text-[40px] stage:leading-[1.2]">
              {point.title}
            </p>
            <p className={cn(TYPE.body, 'text-muted-foreground')}>{point.detail}</p>
          </div>
        </li>
      ))}
    </ol>
    <section
      aria-labelledby="summary-method"
      className="flex flex-col gap-1 border-t border-border pt-4 stage:gap-2 stage:pt-6"
    >
      <h3 id="summary-method" className={cn(TYPE.note, 'font-medium text-foreground')}>
        Как проверял
      </h3>
      <p className={TYPE.note}>{AUDIT_FACTS.join(' · ')}</p>
    </section>
  </SlideLayout>
)
