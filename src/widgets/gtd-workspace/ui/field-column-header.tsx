import { getSpec, splitSpecLabel } from '@/entities/gtd'
import { Tooltip } from '@/shared/ui'

/** Two-line column header: short specification title (full label in a tooltip) and the XML tag. */
export const FieldColumnHeader = ({ tag }: { tag: string }) => {
  const spec = getSpec(tag)
  const title = spec ? splitSpecLabel(spec.label).title : tag

  return (
    <span className="flex min-w-0 flex-col items-[inherit] leading-4">
      {spec ? (
        <Tooltip content={spec.label} side="bottom" wrapperClassName="min-w-0 max-w-full">
          <span className="block truncate">{title}</span>
        </Tooltip>
      ) : (
        <span className="block truncate">{title}</span>
      )}
      <span className="font-mono text-[10px] font-normal text-subtle-foreground">{tag}</span>
    </span>
  )
}
