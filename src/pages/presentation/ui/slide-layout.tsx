import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { TYPE } from './slide-type'

type SlideLayoutProps = {
  title: string
  lead?: string
  /**
   * Status line above the title: `recommendation` marks a proposal, `appendix` a backup slide that
   * is shown only on request.
   */
  notice?: { tone: 'recommendation' | 'appendix'; text: string }
  className?: string
  children: ReactNode
}

/** Common slide frame: left-aligned heading block over a content area that fills the canvas. */
export const SlideLayout = ({ title, lead, notice, className, children }: SlideLayoutProps) => (
  <div className="flex min-h-full flex-col gap-6 px-5 pt-8 pb-10 stage:h-full stage:gap-[48px] stage:px-[128px] stage:pt-[84px] stage:pb-[72px]">
    <header className="flex max-w-[1500px] flex-col gap-3 stage:gap-4">
      {notice ? (
        <p
          className={cn(
            'text-dense font-medium stage:text-[24px] stage:leading-[1.3]',
            notice.tone === 'recommendation' ? 'text-accent-foreground' : 'text-subtle-foreground',
          )}
        >
          {notice.text}
        </p>
      ) : null}
      <h2 className={TYPE.heading}>{title}</h2>
      {lead ? <p className={cn(TYPE.lead, 'max-w-[64ch]')}>{lead}</p> : null}
    </header>
    <div className={cn('min-h-0 flex-1', className)}>{children}</div>
  </div>
)
