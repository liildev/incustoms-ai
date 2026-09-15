import { cn } from '@/shared/lib/cn'
import { TITLE } from '../model/title'
import { ChainPreview } from './chain-preview'
import { TYPE } from './slide-type'

export const TitleSlide = () => (
  <div className="flex min-h-full flex-col justify-between gap-12 px-5 pt-12 pb-10 stage:h-full stage:px-[128px] stage:pt-[168px] stage:pb-[84px]">
    <div className="flex flex-col gap-5 stage:gap-9">
      <h2 className={TYPE.display}>{TITLE.product}</h2>
      <p className="text-2xl font-medium tracking-[-0.02em] text-foreground stage:text-[64px] stage:leading-[1.1]">
        {TITLE.subject}
      </p>
      <p className={cn(TYPE.lead, 'max-w-[44ch] stage:mt-2')}>{TITLE.thesis}</p>
    </div>
    <div className="flex flex-col gap-8 stage:gap-14">
      <ChainPreview />
      <div className="flex flex-col gap-1 border-t border-border pt-5 stage:flex-row stage:justify-between stage:pt-8">
        <p className={TYPE.body}>{TITLE.author}</p>
        <p className={cn(TYPE.body, 'text-muted-foreground')}>{TITLE.date}</p>
      </div>
    </div>
  </div>
)
