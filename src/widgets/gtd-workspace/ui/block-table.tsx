import { getSpec, type GtdBlock } from '@/entities/gtd'
import { formatAmount, formatDate } from '@/shared/lib/format'
import { DataTable, type DataTableColumn } from '@/shared/ui'
import { fieldColumnWidth, presentFieldTags } from '../lib/block-columns'
import { FieldColumnHeader } from './field-column-header'

type BlockTableProps = {
  label: string
  blocks: readonly GtdBlock[]
  /** Leading column rendered for each row, e.g. the owning good. */
  lead?: { title: string; render: (block: GtdBlock, index: number) => string }
}

const formatValue = (tag: string, value: string): string => {
  const type = getSpec(tag)?.type
  return type === 'date' ? formatDate(value) : type === 'number' ? formatAmount(value) : value
}

/** Read-only, sortable table of repeated sections with specification labels as headers. */
export const BlockTable = ({ label, blocks, lead }: BlockTableProps) => {
  const rows = blocks.map((block, index) => ({ block, index }))
  type Row = (typeof rows)[number]

  const columns: DataTableColumn<Row>[] = [
    ...(lead
      ? [
          {
            key: '__lead',
            header: lead.title,
            headerLabel: lead.title,
            width: '220px',
            sortable: true,
            sortValue: ({ block, index }: Row) => lead.render(block, index),
            cell: ({ block, index }: Row) => (
              <span className="text-muted-foreground">{lead.render(block, index)}</span>
            ),
          },
        ]
      : []),
    ...presentFieldTags(blocks).map((tag): DataTableColumn<Row> => ({
      key: tag,
      header: <FieldColumnHeader tag={tag} />,
      headerLabel: tag,
      width: fieldColumnWidth(tag),
      align: getSpec(tag)?.type === 'number' ? 'right' : 'left',
      sortable: true,
      sortValue: ({ block }) => block.fields[tag] ?? '',
      cell: ({ block }) => {
        const value = formatValue(tag, block.fields[tag] ?? '')
        return <span title={value.length > 24 ? value : undefined}>{value}</span>
      },
    })),
  ]

  return (
    <DataTable
      label={label}
      data={rows}
      columns={columns}
      headerHeight={48}
      getRowId={({ index }) => String(index)}
    />
  )
}
