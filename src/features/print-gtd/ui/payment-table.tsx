import type { Frame, Rect } from '../config/form-geometry'
import { PAYMENT_HEADINGS } from '../config/supplement-columns'
import type { PaymentGraph } from '../model/print-form'
import { FormBox } from './form-box'

type PaymentTableProps = {
  frame: Frame
  rect: Rect
  /** Column edges in form pixels: Вид платежа | Основа начисления | Ставка | Сумма | СП. */
  columns: readonly number[]
  payments: PaymentGraph | null
  totalLabel: string
}

const cell =
  'border-r-[0.2mm] border-foreground px-[0.5mm] align-top whitespace-pre-line last:border-r-0'

/**
 * Graph 47 of one good. Rows that do not fit are replaced by the supplement reference; the total of all
 * rows stays on the sheet.
 */
export const PaymentTable = ({ frame, rect, columns, payments, totalLabel }: PaymentTableProps) => {
  const width = (columns.at(-1) ?? 1) - (columns[0] ?? 0)
  const shares = columns
    .slice(1)
    .map((edge, index) => `${((edge - (columns[index] ?? 0)) / width) * 100}%`)
  const rows = payments && !payments.overflow ? payments.rows : []

  return (
    <FormBox frame={frame} rect={rect} graph="47" className="p-0">
      <table className="size-full table-fixed border-collapse text-[6.5pt] leading-[1.15] text-foreground">
        <colgroup>
          {shares.map((share, index) => (
            <col key={index} style={{ width: share }} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-[5.5mm] border-b-[0.2mm] border-foreground text-center text-[5.5pt]">
            {PAYMENT_HEADINGS.map((heading) => (
              <th key={heading} className={`${cell} font-normal`}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments?.overflow ? (
            <tr>
              <td colSpan={5} className="px-[0.5mm] align-top">
                см. дополнение
              </td>
            </tr>
          ) : null}
          {rows.map((row, index) => (
            <tr key={`${row.code}-${index}`}>
              <td className={cell}>{row.code}</td>
              <td className={cell}>{row.base.join('\n')}</td>
              <td className={cell}>{row.rate.join('\n')}</td>
              <td className={`${cell} text-right`}>{row.amount}</td>
              <td className={cell}>{row.method}</td>
            </tr>
          ))}
          <tr className="h-full">
            {PAYMENT_HEADINGS.map((heading) => (
              <td key={heading} className={cell} />
            ))}
          </tr>
          <tr className="h-[4mm] border-t-[0.2mm] border-foreground">
            <td colSpan={3} className={`${cell} text-[5.5pt]`}>
              {totalLabel}
            </td>
            <td className={`${cell} text-right`}>{payments?.total}</td>
            <td className={cell} />
          </tr>
        </tbody>
      </table>
    </FormBox>
  )
}
