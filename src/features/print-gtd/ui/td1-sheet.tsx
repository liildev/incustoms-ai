import { TD1_BOXES, TD1_FRAME, TD1_GOOD, TD1_PAYMENT_COLUMNS } from '../config/td1-layout'
import type { PrintForm } from '../model/print-form'
import { FormBox } from './form-box'
import { GoodBoxes } from './good-boxes'
import { PaymentTable } from './payment-table'
import { PrintPage } from './print-page'
import { Td1Closing } from './td1-closing'
import { Td1Parties } from './td1-parties'
import { Td1Shipment } from './td1-shipment'

/** Main sheet (ТД1, Приложение № 1): declaration graphs and the first good. */
export const Td1Sheet = ({ form }: { form: PrintForm }) => (
  <PrintPage label="Основной лист ТД1">
    <Td1Parties header={form.header} sheetCount={form.sheetCount} />
    <Td1Shipment header={form.header} />
    <GoodBoxes frame={TD1_FRAME} layout={TD1_GOOD} good={form.mainGood} sheet="main" />
    <FormBox
      frame={TD1_FRAME}
      rect={TD1_BOXES.label47}
      number="47"
      label="Исчисле-ние таможенных платежей"
    />
    <PaymentTable
      frame={TD1_FRAME}
      rect={TD1_BOXES.g47}
      columns={TD1_PAYMENT_COLUMNS}
      payments={form.mainGood?.payments ?? null}
      totalLabel="Всего:"
    />
    <Td1Closing header={form.header} />
  </PrintPage>
)
