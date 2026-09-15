import { Check, Minus, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { CaseFact as CaseFactData } from '../model/case'
import { RichText } from './rich-text'

const MARK_LABEL = { kept: 'сохранилось', lost: 'потерялось', context: 'контекст' } as const

/** One value read from a record, marked by what happened to it on the way to the next module. */
export const CaseFact = ({ fact }: { fact: CaseFactData }) => {
  const Icon = fact.mark === 'kept' ? Check : fact.mark === 'lost' ? X : Minus
  return (
    <li className="grid grid-cols-[1.25rem_1fr] gap-x-2 stage:grid-cols-[34px_1fr]">
      <Icon
        aria-hidden
        strokeWidth={fact.mark === 'context' ? 2 : 2.75}
        className={cn(
          'mt-0.5 size-4 stage:mt-[5px] stage:size-6',
          fact.mark === 'kept' && 'text-success',
          fact.mark === 'lost' && 'text-destructive',
          fact.mark === 'context' && 'text-subtle-foreground',
        )}
      />
      <span
        className={cn(
          'text-[15px] leading-relaxed stage:text-[24px] stage:leading-[1.4]',
          fact.mark === 'context' ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        <span className="sr-only">{MARK_LABEL[fact.mark]}: </span>
        <RichText text={fact.text} />
      </span>
    </li>
  )
}
