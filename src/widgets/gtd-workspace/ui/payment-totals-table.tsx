import type { PaymentTotal } from '@/entities/gtd'
import { formatAmount } from '@/shared/lib/format'
import { DataTable, type DataTableColumn } from '@/shared/ui'

const COLUMNS: DataTableColumn<PaymentTotal>[] = [
  {
    key: 'code',
    header: 'Код',
    headerLabel: 'Код',
    width: '96px',
    sortable: true,
    cell: (total) => <span className="font-mono text-[12px]">{total.code || '—'}</span>,
  },
  {
    key: 'name',
    header: 'Вид платежа',
    headerLabel: 'Вид платежа',
    sortable: true,
    sortValue: (total) => total.name ?? '',
    cell: (total) =>
      total.name ?? <span className="text-warning">Код отсутствует в классификаторе</span>,
  },
  {
    key: 'count',
    header: 'Строк',
    headerLabel: 'Строк',
    width: '96px',
    align: 'right',
    sortable: true,
  },
  {
    key: 'amount',
    header: 'Сумма, P9T4',
    headerLabel: 'Сумма',
    width: '180px',
    align: 'right',
    sortable: true,
    cell: (total) =>
      total.amount ? (
        <span className="font-medium tabular-nums">
          {formatAmount(total.amount)}
          {total.currency ? ` ${total.currency}` : ''}
        </span>
      ) : (
        <span className="text-warning">Не рассчитана: сумма не указана или не число</span>
      ),
  },
]

export const PaymentTotalsTable = ({ totals }: { totals: PaymentTotal[] }) => (
  <DataTable
    label="Суммы платежей по видам"
    data={totals}
    columns={COLUMNS}
    getRowId={(total) => `${total.code}:${total.currency}`}
  />
)
