// beui.dev/components/motion/table — column sort (asc → desc → none)
import { useState } from 'react'
import type { DataTableColumn, DataTableRow, SortState } from './data-table-types'
import { compareSortValues, readSortValue } from './data-table-utils'

export const useColumnSort = <T>(rows: DataTableRow<T>[], columns: DataTableColumn<T>[]) => {
  const [sort, setSort] = useState<SortState | null>(null)

  const toggleSort = (key: string) => {
    if (!sort || sort.key !== key) setSort({ key, direction: 'asc' })
    else if (sort.direction === 'asc') setSort({ key, direction: 'desc' })
    else setSort(null)
  }

  const column = sort ? columns.find((candidate) => candidate.key === sort.key) : undefined
  const sortedRows =
    sort && column
      ? [...rows].sort((a, b) => {
          const result = compareSortValues(
            readSortValue(a.row, column),
            readSortValue(b.row, column),
          )
          return sort.direction === 'asc' ? result : -result
        })
      : rows

  return { sort, sortedRows, toggleSort }
}
