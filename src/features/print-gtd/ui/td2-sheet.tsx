import { TD2_BOXES, TD2_FRAME, TD2_PAYMENT_TABLES, td2GoodLayout } from '../config/td2-layout'
import type { PrintGood, PrintHeader } from '../model/print-form'
import { BoxValues } from './box-values'
import { FormBox } from './form-box'
import { FormTitle } from './form-title'
import { GoodBoxes } from './good-boxes'
import { PaymentTable } from './payment-table'
import { PrintPage } from './print-page'
import { Td2Summary } from './td2-summary'

type Td2SheetProps = {
  header: PrintHeader
  goods: readonly PrintGood[]
  /** Position of the sheet among all sheets, for graph 3. */
  sheet: number
  sheetCount: number
}

const SLOTS = [0, 1, 2] as const

/**
 * Additional sheet (ТД2, Приложение № 2) with up to three goods. Graphs 2 and 8 are not filled on
 * additional sheets; graph A is filled by the customs authority on paper only.
 */
export const Td2Sheet = ({ header, goods, sheet, sheetCount }: Td2SheetProps) => (
  <PrintPage label={`Добавочный лист ТД2, лист ${sheet}`}>
    <FormTitle frame={TD2_FRAME} rect={TD2_BOXES.title} subtitle="ДОБАВОЧНЫЙ ЛИСТ" code="ТД 2" />
    <FormBox frame={TD2_FRAME} rect={TD2_BOXES.a} number="A" frameStyle="bare" />
    <FormBox
      frame={TD2_FRAME}
      rect={TD2_BOXES.parties}
      className="flex-row gap-[22mm] text-[5.5pt] leading-[1.15]"
    >
      <p>
        <span className="font-semibold">2</span> Экспортер/грузоотправитель
      </p>
      <p>
        <span className="font-semibold">8</span> Импортер/грузополучатель №
      </p>
    </FormBox>
    <FormBox
      frame={TD2_FRAME}
      rect={TD2_BOXES.g1}
      number="1"
      label="Тип декларации"
      frameStyle="bold"
    >
      <BoxValues values={header.declarationType} />
    </FormBox>
    <FormBox frame={TD2_FRAME} rect={TD2_BOXES.g3} number="3" label="Доб. листы">
      <BoxValues values={[`${sheet}/${sheetCount}`]} />
    </FormBox>
    <FormBox frame={TD2_FRAME} rect={TD2_BOXES.sheetMark} frameStyle="bold" />
    {SLOTS.map((slot) => (
      <GoodBoxes
        key={slot}
        frame={TD2_FRAME}
        layout={td2GoodLayout(slot)}
        good={goods[slot] ?? null}
        sheet="additional"
      />
    ))}
    <FormBox
      frame={TD2_FRAME}
      rect={TD2_BOXES.label47}
      number="47"
      label="Исчисле-ние таможенных платежей"
    />
    {TD2_PAYMENT_TABLES.map((table, slot) => (
      <PaymentTable
        key={table.total}
        frame={TD2_FRAME}
        rect={table.rect}
        columns={table.columns}
        payments={goods[slot]?.payments ?? null}
        totalLabel={table.total}
      />
    ))}
    <Td2Summary />
  </PrintPage>
)
