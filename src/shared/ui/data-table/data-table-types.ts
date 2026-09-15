// beui.dev/components/motion/table — types (read-only subset)
import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

export type SortState = { key: string; direction: SortDirection }

export type DataTableColumn<T> = {
  /** Stable key; also the default property read for the cell and sort value. */
  key: string
  header: ReactNode
  /** Plain-text header name for sort button labels. */
  headerLabel?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  /** Column width as a CSS length, e.g. "120px". Omit to share remaining space. */
  width?: string
  /** Custom cell renderer; falls back to `row[key]`. */
  cell?: (row: T) => ReactNode
  /** Value used for sorting; falls back to `row[key]`. */
  sortValue?: (row: T) => string | number
}

export type DataTableRow<T> = { row: T; id: string }
