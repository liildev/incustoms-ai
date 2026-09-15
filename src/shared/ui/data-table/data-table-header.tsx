// beui.dev/components/motion/table — header (sort only; resize, reorder and menus are not used here)
import { ChevronUp } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import { EASE_OUT } from '../../lib/ease'
import type { DataTableColumn, SortState } from './data-table-types'
import { alignFlex, alignText } from './data-table-utils'

type DataTableHeaderProps<T> = {
  columns: DataTableColumn<T>[]
  height: number
  sort: SortState | null
  onToggleSort: (key: string) => void
}

const HEAD_CELL =
  'sticky top-0 z-10 border-b border-border bg-surface-muted p-0 text-2xs font-medium text-muted-foreground'

export const DataTableHeader = <T,>({
  columns,
  height,
  sort,
  onToggleSort,
}: DataTableHeaderProps<T>) => {
  const reduce = useReducedMotion()

  return (
    <thead>
      <tr style={{ height }}>
        {columns.map((column) => {
          const active = sort?.key === column.key
          return (
            <th
              key={column.key}
              aria-sort={
                active ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined
              }
              className={HEAD_CELL}
            >
              {column.sortable ? (
                <button
                  type="button"
                  onClick={() => onToggleSort(column.key)}
                  aria-label={column.headerLabel ? `Сортировать: ${column.headerLabel}` : undefined}
                  className={cn(
                    'flex size-full min-w-0 items-center gap-1 px-3 transition-colors select-none hover:text-foreground',
                    alignFlex(column.align),
                    active && 'text-foreground',
                  )}
                >
                  <span className={cn('min-w-0', alignText(column.align))}>{column.header}</span>
                  <motion.span
                    aria-hidden
                    className="inline-flex shrink-0"
                    initial={false}
                    animate={{
                      rotate: active && sort?.direction === 'desc' ? 180 : 0,
                      opacity: active ? 1 : 0.35,
                    }}
                    transition={reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
                  >
                    <ChevronUp className="size-3.5" />
                  </motion.span>
                </button>
              ) : (
                <div
                  className={cn(
                    'flex size-full min-w-0 items-center px-3',
                    alignFlex(column.align),
                  )}
                >
                  <span className={cn('min-w-0', alignText(column.align))}>{column.header}</span>
                </div>
              )}
            </th>
          )
        })}
        <th aria-hidden className={HEAD_CELL} />
      </tr>
    </thead>
  )
}
