import { DOCUMENT_COLUMNS, PAYMENT_HEADINGS } from '../config/supplement-columns'
import type { SupplementContent as Content } from '../model/print-form'
import { BoxLines } from './box-lines'
import { PaperTable } from './paper-table'
import { PositionsDetail } from './positions-detail'

/** The continued content of one graph: its lines, documents, payments or goods positions. */
export const SupplementContent = ({ content }: { content: Content }) => {
  if (content.kind === 'lines')
    return <BoxLines lines={content.lines} className="text-[7.5pt] leading-[1.3]" />
  if (content.kind === 'positions') return <PositionsDetail positions={content.positions} />
  if (content.kind === 'payments') {
    return (
      <PaperTable
        headings={PAYMENT_HEADINGS}
        rows={content.rows.map((row) => [
          row.code,
          row.base.join('\n'),
          row.rate.join('\n'),
          row.amount,
          row.method,
        ])}
      />
    )
  }
  const columns = DOCUMENT_COLUMNS.filter(
    (column) => !column.optional || content.rows.some((row) => row[column.key]),
  )
  return (
    <PaperTable
      headings={columns.map((column) => column.heading)}
      rows={content.rows.map((row) => columns.map((column) => row[column.key]))}
    />
  )
}
