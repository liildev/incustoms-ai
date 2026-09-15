import { cn } from '@/shared/lib/cn'
import { CASE_LEAD, CASE_NOTE, CASE_RECORD, CASE_STEPS, CASE_TITLE } from '../model/case'
import { CaseFact } from './case-fact'
import { ChainConnector } from './chain-connector'
import { ChainNode } from './chain-node'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

/** One business case traced record by record: the slide-5 pattern shown on real values. */
export const CaseSlide = () => (
  <SlideLayout title={CASE_TITLE} lead={CASE_LEAD} className="flex flex-col justify-between gap-10">
    <ol className="flex flex-col gap-6 stage:grid stage:grid-cols-5 stage:gap-x-10">
      {CASE_STEPS.map((step, position) => (
        <li key={step.name} className="relative flex flex-col gap-3 stage:gap-6">
          {position > 0 ? (
            <ChainConnector
              tone="expected"
              className="hidden stage:absolute stage:top-0 stage:right-full stage:flex stage:h-[112px] stage:w-10"
            />
          ) : null}
          <ChainNode name={step.name} compact className="stage:h-[112px]">
            <span className="font-mono text-2xs text-subtle-foreground stage:text-[20px] stage:leading-[1.4]">
              {step.record}
            </span>
          </ChainNode>
          <ul className="flex flex-col gap-2 stage:gap-4">
            {step.facts.map((fact) => (
              <CaseFact key={fact.text} fact={fact} />
            ))}
          </ul>
        </li>
      ))}
    </ol>
    <div className="flex flex-col gap-3 border-t border-border pt-4 stage:gap-4 stage:pt-6">
      <p className={TYPE.note}>
        <RichText text={CASE_RECORD.label} />
      </p>
      <code className="font-mono text-dense wrap-break-word text-foreground stage:text-[24px] stage:leading-[1.4]">
        {CASE_RECORD.code}
      </code>
      <p className={cn(TYPE.note, 'text-subtle-foreground')}>{CASE_NOTE}</p>
    </div>
  </SlideLayout>
)
