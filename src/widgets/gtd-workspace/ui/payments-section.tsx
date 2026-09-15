import {
  collectFromGoods,
  getPaymentName,
  PAYMENT_TAG,
  totalPaymentsByCode,
  type ReadySession,
} from '@/entities/gtd'
import { EmptyState } from '@/shared/ui'
import { BlockTable } from './block-table'
import { PaymentTotalsTable } from './payment-totals-table'
import { SectionHeader } from './section-header'

export const PaymentsSection = ({ session }: { session: ReadySession }) => {
  const totals = totalPaymentsByCode(session.document)
  const payments = collectFromGoods(session.document, PAYMENT_TAG)

  return (
    <>
      <SectionHeader
        title="Платежи"
        description="Суммы разделов T4 всех товаров по видам платежей; суммы в разных валютах (P202T4) не складываются. Наименования — по классификатору таможенных платежей (Инструкция № 2773, приложение 13)."
      />
      {payments.length === 0 ? (
        <EmptyState title="Платежи не указаны" description="Ни один товар не содержит раздел T4." />
      ) : (
        <div className="flex flex-col gap-6">
          <PaymentTotalsTable totals={totals} />
          <section>
            <h3 className="mb-2 text-dense font-semibold text-foreground">По товарам</h3>
            <BlockTable
              label="Платежи по товарам"
              blocks={payments.map(({ block }) => block)}
              lead={{
                title: 'Товар, вид платежа',
                render: (block, index) =>
                  `№ ${payments[index]?.good.number ?? ''}, ${getPaymentName(block.fields.P3T4 ?? '') ?? '—'}`,
              }}
            />
          </section>
        </div>
      )}
    </>
  )
}
