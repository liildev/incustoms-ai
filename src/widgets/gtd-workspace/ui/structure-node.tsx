import { ChevronRight } from 'lucide-react'
import { getSpec, type GtdBlock } from '@/entities/gtd'
import { Badge } from '@/shared/ui'

type StructureNodeProps = { block: GtdBlock; index: number; defaultOpen?: boolean }

/** Read-only tree node showing every field and nested section exactly as stored. */
export const StructureNode = ({ block, index, defaultOpen = false }: StructureNodeProps) => {
  const spec = getSpec(block.tag)

  return (
    <details
      open={defaultOpen}
      className="group border-l border-border pl-3 [&[open]>summary_svg]:rotate-90"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md py-1 pr-2 hover:bg-muted">
        <ChevronRight
          aria-hidden
          className="size-3.5 shrink-0 text-subtle-foreground transition-transform"
        />
        <span className="font-mono text-[12px] font-medium text-foreground">{block.tag}</span>
        <span className="text-2xs text-subtle-foreground">#{index + 1}</span>
        <span className="min-w-0 truncate text-2xs text-muted-foreground">{spec?.label}</span>
        {spec ? null : <Badge status="warning">вне спецификации</Badge>}
        <span className="ml-auto shrink-0 text-2xs text-subtle-foreground tabular-nums">
          {Object.keys(block.fields).length} полей, {block.blocks.length} разделов
        </span>
      </summary>
      <div className="flex flex-col gap-1 pt-1 pb-2">
        {Object.keys(block.fields).length > 0 ? (
          <dl className="grid grid-cols-[minmax(4.5rem,auto)_minmax(0,1fr)_minmax(0,2fr)] gap-x-3 gap-y-0.5 pl-5 text-2xs">
            {Object.entries(block.fields).map(([tag, value]) => (
              <div key={tag} className="contents">
                <dt className="font-mono text-muted-foreground">{tag}</dt>
                <dd
                  className={
                    getSpec(tag) ? 'truncate text-subtle-foreground' : 'truncate text-warning'
                  }
                  title={getSpec(tag)?.label}
                >
                  {getSpec(tag)?.label ?? 'вне спецификации'}
                </dd>
                <dd className="wrap-break-word whitespace-pre-line text-foreground">
                  {value === '' ? <span className="text-subtle-foreground">пусто</span> : value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {block.blocks.map((child, childIndex) => (
          <StructureNode
            key={childIndex}
            block={child}
            index={
              block.blocks.slice(0, childIndex).filter((sibling) => sibling.tag === child.tag)
                .length
            }
          />
        ))}
      </div>
    </details>
  )
}
