import { TD2_BOXES, TD2_FRAME, TD2_SUMMARY_TABLE } from '../config/td2-layout'
import { FormBox } from './form-box'

/**
 * «Общая сумма» table and graph C of the additional sheet. The instruction does not describe how the
 * table is filled, so it is printed as an empty form.
 */
export const Td2Summary = () => {
  const [left, top, right, bottom] = TD2_SUMMARY_TABLE.rect
  const columns = TD2_SUMMARY_TABLE.columns
  return (
    <>
      <FormBox
        frame={TD2_FRAME}
        rect={TD2_BOXES.totalLabel}
        label="← Общая сумма"
        frameStyle="bare"
      />
      <FormBox frame={TD2_FRAME} rect={[left, top, right, top + 35]} className="p-0" />
      {columns.slice(1).map((edge, index) => (
        <FormBox
          key={edge}
          frame={TD2_FRAME}
          rect={[columns[index] ?? left, top, edge, bottom]}
          label={index === 0 ? 'Вид платежа' : index === 1 ? 'Сумма' : 'СП'}
          className="items-center"
        />
      ))}
      <FormBox frame={TD2_FRAME} rect={[left, bottom - 25, right, bottom]} label="Итого:" />
      <FormBox frame={TD2_FRAME} rect={TD2_BOXES.c} number="C" frameStyle="dashed" />
    </>
  )
}
