import { cn } from '@/shared/lib/cn'
import { STRENGTHS, STRENGTHS_LEAD } from '../model/strengths'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

/** Green rule = verified strength. The proof is set quietly under the facts, as a source rather than a card. */
export const StrengthsSlide = () => (
  <SlideLayout
    title="Ключевые модули уже работают"
    lead={STRENGTHS_LEAD}
    className="grid gap-10 stage:grid-cols-3 stage:grid-rows-[auto_auto_auto] stage:content-center stage:gap-x-[72px] stage:gap-y-8"
  >
    {STRENGTHS.map((strength) => (
      <article
        key={strength.title}
        className="flex flex-col gap-4 border-t-[3px] border-success pt-5 stage:row-span-3 stage:grid stage:grid-rows-subgrid stage:gap-y-8 stage:pt-8"
      >
        <h3 className={TYPE.title}>{strength.title}</h3>
        <ul className="flex flex-col gap-3 stage:gap-6">
          {strength.facts.map((fact) => (
            <li key={fact} className={TYPE.body}>
              <RichText text={fact} />
            </li>
          ))}
        </ul>
        <figure className="flex flex-col gap-1 border-t border-border pt-3 stage:gap-2 stage:pt-5">
          <figcaption className={TYPE.note}>{strength.proof.label}</figcaption>
          {strength.proof.kind === 'code' ? (
            <code className="font-mono text-dense wrap-break-word text-foreground stage:text-[22px] stage:leading-[1.45]">
              {strength.proof.text}
            </code>
          ) : (
            <blockquote className={cn(TYPE.note, 'text-foreground')}>
              «{strength.proof.text}»
            </blockquote>
          )}
        </figure>
      </article>
    ))}
  </SlideLayout>
)
