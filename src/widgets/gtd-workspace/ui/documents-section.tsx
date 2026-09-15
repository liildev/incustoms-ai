import { listSupportingDocuments, type ReadySession, type SupportingDocument } from '@/entities/gtd'
import { formatDate } from '@/shared/lib/format'
import { DataTable, type DataTableColumn, EmptyState } from '@/shared/ui'
import { SectionHeader } from './section-header'

const header = (title: string, tag: string) => (
  <span className="flex flex-col leading-4">
    <span>{title}</span>
    <span className="font-mono text-[10px] font-normal text-subtle-foreground">{tag}</span>
  </span>
)

const COLUMNS: DataTableColumn<SupportingDocument>[] = [
  {
    key: 'goodNumber',
    header: header('Товар', 'P8T2'),
    headerLabel: 'Товар',
    width: '96px',
    sortable: true,
    cell: (row) => `№ ${row.goodNumber}`,
  },
  {
    key: 'code',
    header: header('Код', 'P4T9'),
    headerLabel: 'Код',
    width: '96px',
    sortable: true,
    cell: (row) => <span className="font-mono text-[12px]">{row.code}</span>,
  },
  {
    key: 'kind',
    header: header('Вид', 'P6T9'),
    headerLabel: 'Вид',
    width: '128px',
    sortable: true,
  },
  {
    key: 'number',
    header: header('Номер', 'P7T9'),
    headerLabel: 'Номер',
    width: '240px',
    sortable: true,
    cell: (row) => <span title={row.number}>{row.number}</span>,
  },
  {
    key: 'date',
    header: header('Дата', 'P8T9'),
    headerLabel: 'Дата',
    width: '112px',
    sortable: true,
    cell: (row) => formatDate(row.date),
  },
  {
    key: 'note',
    header: header('Дополнительно', 'P12T9'),
    headerLabel: 'Дополнительно',
    sortable: true,
    cell: (row) => (
      <span className="text-muted-foreground" title={row.note}>
        {row.note}
      </span>
    ),
  },
]

export const DocumentsSection = ({ session }: { session: ReadySession }) => {
  const documents = listSupportingDocuments(session.document)

  return (
    <>
      <SectionHeader
        title="Документы"
        description="Сопутствующие документы по графе 44 (разделы T9) всех товаров."
      />
      {documents.length === 0 ? (
        <EmptyState
          title="Документы не указаны"
          description="Ни один товар не содержит раздел T9."
        />
      ) : (
        <DataTable
          label="Сопутствующие документы"
          data={documents}
          columns={COLUMNS}
          headerHeight={48}
          maxHeight={560}
        />
      )}
    </>
  )
}
