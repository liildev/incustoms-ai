// beui.dev/components/motion/table — cell helpers
import type { ReactNode } from 'react'
import type { DataTableColumn } from './data-table-types'

export const alignFlex = (align: DataTableColumn<unknown>['align']): string =>
  align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'

export const alignText = (align: DataTableColumn<unknown>['align']): string =>
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

export const readCell = <T>(row: T, column: DataTableColumn<T>): ReactNode =>
  column.cell ? column.cell(row) : (row as Record<string, ReactNode>)[column.key]

export const readSortValue = <T>(row: T, column: DataTableColumn<T>): string | number =>
  column.sortValue
    ? column.sortValue(row)
    : ((row as Record<string, string | number>)[column.key] ?? '')

/** Numeric-aware comparison, so "10" sorts after "9" and decimal strings compare by value. */
export const compareSortValues = (a: string | number, b: string | number): number => {
  const left = typeof a === 'number' ? a : Number(a)
  const right = typeof b === 'number' ? b : Number(b)
  if (String(a) !== '' && String(b) !== '' && Number.isFinite(left) && Number.isFinite(right))
    return left - right
  return String(a).localeCompare(String(b), 'ru')
}
