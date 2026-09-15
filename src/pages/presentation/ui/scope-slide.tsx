import { cn } from '@/shared/lib/cn'
import { COVERAGE, METHOD, SCOPE_LEAD, SCOPE_LIMITS } from '../model/scope'
import { appendixLabel } from '../model/slides'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

export const ScopeSlide = () => (
  <SlideLayout
    title="Метод и охват проверки"
    lead={SCOPE_LEAD}
    notice={{ tone: 'appendix', text: appendixLabel('method') }}
    className="flex flex-col gap-8 stage:gap-10"
  >
    <div className="grid gap-10 stage:flex-1 stage:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] stage:gap-[96px]">
      <section aria-labelledby="scope-method" className="flex flex-col gap-4 stage:gap-6">
        <h3 id="scope-method" className={TYPE.note}>
          Метод
        </h3>
        <ol className="flex flex-col gap-5">
          {METHOD.map((step, position) => (
            <li
              key={step.title}
              className="grid grid-cols-[2rem_1fr] gap-x-3 stage:grid-cols-[48px_1fr]"
            >
              <span className={cn(TYPE.body, 'font-semibold text-primary tabular-nums')}>
                {position + 1}
              </span>
              <div className="flex flex-col gap-1">
                <p className={cn(TYPE.body, 'font-semibold')}>{step.title}</p>
                <p className={TYPE.note}>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="scope-coverage" className="flex flex-col gap-4 stage:gap-6">
        <h3 id="scope-coverage" className={TYPE.note}>
          Охват
        </h3>
        <dl className="flex flex-col">
          {COVERAGE.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 border-t border-border py-3 stage:grid-cols-[150px_1fr] stage:gap-6 stage:py-[10px]"
            >
              <dt className={cn(TYPE.note, 'font-medium text-foreground')}>{row.label}</dt>
              <dd className={cn(TYPE.note, 'text-foreground')}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
    <p className={cn(TYPE.note, 'max-w-[110ch]')}>{SCOPE_LIMITS}</p>
  </SlideLayout>
)
