import { cn } from '@/shared/lib/cn'
import { POSITIONING, PROMISE_NOTE } from '../model/promise'
import { PromiseDiagram } from './promise-diagram'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

/** What the product sets out to be, before any criticism: public positioning, then the in-app chain. */
export const PromiseSlide = () => (
  <SlideLayout
    title="Продукт обещает одну сквозную поставку"
    className="flex flex-col justify-between gap-10"
  >
    <figure className="flex flex-col gap-2 border-l-[3px] border-input pl-5 stage:gap-4 stage:pl-10">
      <blockquote className="flex flex-col gap-2 stage:gap-3">
        <p className="text-lg leading-snug font-medium text-foreground stage:text-[44px] stage:leading-[1.2]">
          «{POSITIONING.claim}»
        </p>
        <p className={cn(TYPE.body, 'text-muted-foreground stage:max-w-[80ch]')}>
          «{POSITIONING.detail}»
        </p>
      </blockquote>
      <figcaption className={cn(TYPE.note, 'text-subtle-foreground')}>
        Публичное позиционирование: {POSITIONING.attribution}
      </figcaption>
    </figure>
    <PromiseDiagram />
    <p className={TYPE.note}>{PROMISE_NOTE}</p>
  </SlideLayout>
)
