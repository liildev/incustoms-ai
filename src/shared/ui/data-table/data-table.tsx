// beui.dev/components/motion/table — adapted as a read-only, sortable, virtualized data table:
// compact rows, viewport height shrinks to content, numeric-aware sorting. Editing, selection,
// column resize/reorder and row menus of the BeUI table are not used in this application.
import { useVirtualizer } from '@tanstack/react-virtual'
import { type ReactNode, useRef } from 'react'
import { cn } from '../../lib/cn'
import type { DataTableColumn } from './data-table-types'
import { DataTableHeader } from './data-table-header'
import { alignText, readCell } from './data-table-utils'
import { useColumnSort } from './use-column-sort'

type DataTableProps<T> = {
  label: string
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId?: (row: T, index: number) => string
  rowHeight?: number
  headerHeight?: number
  /** Viewport height cap in px; shorter tables shrink to their content. */
  maxHeight?: number
  minColumnWidth?: number
  emptyState?: ReactNode
  className?: string
}

export const DataTable = <T,>({
  label,
  data,
  columns,
  getRowId,
  rowHeight = 36,
  headerHeight = rowHeight,
  maxHeight = 440,
  minColumnWidth = 96,
  emptyState = 'Нет данных',
  className,
}: DataTableProps<T>) => {
  // TanStack Virtual mutates one virtualizer instance; compiler memoization would hide its updates.
  'use no memo'
  const scrollRef = useRef<HTMLDivElement>(null)
  const rows = data.map((row, index) => ({
    row,
    id: getRowId ? getRowId(row, index) : String(index),
  }))
  const { sort, sortedRows, toggleSort } = useColumnSort(rows, columns)

  // Memoization is opted out above ('use no memo'), which is what this rule asks for.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })
  const items = virtualizer.getVirtualItems()
  const paddingTop = items[0]?.start ?? 0
  const paddingBottom = items.length > 0 ? virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0) : 0

  const bodyHeight = Math.max(sortedRows.length, 1) * rowHeight
  const minTableWidth = columns.reduce(
    (sum, column) => sum + (Number.parseFloat(column.width ?? '') || minColumnWidth),
    0,
  )

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg border border-border bg-surface text-dense',
        className,
      )}
    >
      <div
        ref={scrollRef}
        className="relative overflow-auto"
        style={{ maxHeight, height: Math.min(maxHeight, headerHeight + bodyHeight + 1) }}
      >
        <table
          aria-label={label}
          className="border-collapse"
          style={{ tableLayout: 'fixed', minWidth: `max(100%, ${minTableWidth}px)` }}
        >
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={column.width ? { width: column.width } : undefined} />
            ))}
            <col />
          </colgroup>
          <DataTableHeader
            columns={columns}
            height={headerHeight}
            sort={sort}
            onToggleSort={toggleSort}
          />
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 text-subtle-foreground"
                  style={{ height: rowHeight }}
                >
                  {emptyState}
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden style={{ height: paddingTop }}>
                    <td colSpan={columns.length + 1} />
                  </tr>
                ) : null}
                {items.map((item) => {
                  const entry = sortedRows[item.index]
                  if (!entry) return null
                  return (
                    <tr
                      key={entry.id}
                      style={{ height: rowHeight }}
                      className="border-b border-border/60 transition-colors hover:bg-muted/50"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn('truncate px-3 text-foreground', alignText(column.align))}
                        >
                          {readCell(entry.row, column)}
                        </td>
                      ))}
                      <td aria-hidden />
                    </tr>
                  )
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden style={{ height: paddingBottom }}>
                    <td colSpan={columns.length + 1} />
                  </tr>
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
