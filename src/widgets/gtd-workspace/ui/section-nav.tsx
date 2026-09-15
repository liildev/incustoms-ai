import { TabsList, TabsTrigger } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { SectionItem } from '../model/sections'

const COUNT_TONE = {
  danger: 'text-destructive',
  warn: 'text-warning',
} as const

/** Section navigation: BeUI tabs, vertical on wide screens. */
export const SectionNav = ({ sections }: { sections: readonly SectionItem[] }) => (
  <TabsList
    label="Разделы декларации"
    className="overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
  >
    {sections.map((section) => (
      <TabsTrigger
        key={section.id}
        value={section.id}
        wrapperClassName="shrink-0 lg:w-full"
        className="h-8"
      >
        <span>{section.title}</span>
        {section.count !== null ? (
          <span
            className={cn(
              'ml-auto min-w-5 text-right text-2xs font-normal tabular-nums',
              section.tone ? COUNT_TONE[section.tone] : 'text-subtle-foreground',
            )}
          >
            {section.count}
          </span>
        ) : null}
      </TabsTrigger>
    ))}
  </TabsList>
)
