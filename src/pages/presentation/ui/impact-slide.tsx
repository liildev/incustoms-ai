import { cn } from '@/shared/lib/cn'
import { IMPACTS, IMPACT_TITLE } from '../model/impact'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

const ROW = 'stage:grid stage:grid-cols-[400px_minmax(0,1fr)_minmax(0,1fr)] stage:gap-x-16'

/** "So what": three systemic consequences, each with one observed example and what it costs. */
export const ImpactSlide = () => (
  <SlideLayout title={IMPACT_TITLE} className="flex flex-col justify-center">
    <div aria-hidden className={cn(ROW, 'hidden pb-5 stage:grid')}>
      <span />
      <span className={TYPE.note}>Что наблюдалось</span>
      <span className={TYPE.note}>Что это значит</span>
    </div>
    <ol className="flex flex-col">
      {IMPACTS.map((impact) => (
        <li
          key={impact.consequence}
          className={cn(ROW, 'flex flex-col gap-2 border-t border-border py-5 stage:py-12')}
        >
          <h3 className={TYPE.title}>{impact.consequence}</h3>
          <p className={cn(TYPE.body, 'text-muted-foreground')}>
            <span className="sr-only">Что наблюдалось: </span>
            <RichText text={impact.example} />
          </p>
          <p className={TYPE.body}>
            <span className="sr-only">Что это значит: </span>
            {impact.meaning}
          </p>
        </li>
      ))}
    </ol>
  </SlideLayout>
)
