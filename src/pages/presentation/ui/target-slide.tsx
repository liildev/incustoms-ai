import { cn } from '@/shared/lib/cn'
import { PRINCIPLES, TARGET_LEAD, TARGET_NOTICE, TARGET_TITLE } from '../model/target-model'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'
import { TargetDiagram } from './target-diagram'

export const TargetSlide = () => (
  <SlideLayout
    title={TARGET_TITLE}
    lead={TARGET_LEAD}
    notice={{ tone: 'recommendation', text: TARGET_NOTICE }}
    className="flex flex-col justify-between gap-10"
  >
    <TargetDiagram />
    <ul className="grid gap-6 stage:grid-cols-3 stage:gap-[72px]">
      {PRINCIPLES.map((principle) => (
        <li
          key={principle.title}
          className="flex flex-col gap-1 border-t-2 border-primary pt-3 stage:gap-3 stage:pt-6"
        >
          <p className={TYPE.title}>{principle.title}</p>
          <p className={cn(TYPE.body, 'text-muted-foreground')}>
            <RichText text={principle.detail} />
          </p>
        </li>
      ))}
    </ul>
  </SlideLayout>
)
