import type { PrintForm } from '../model/print-form'
import { SchedulePage } from './schedule-page'
import { SupplementPage } from './supplement-page'
import { Td1Sheet } from './td1-sheet'
import { Td2Sheet } from './td2-sheet'

/** All printed sheets in order: ТД1, ТД2 sheets, supplement, ГУПТП. */
export const PrintDocument = ({ form }: { form: PrintForm }) => (
  <div className="flex flex-col gap-6 print:block">
    <Td1Sheet form={form} />
    {form.additionalSheets.map((goods, index) => (
      <Td2Sheet
        key={index}
        header={form.header}
        goods={goods}
        sheet={index + 2}
        sheetCount={form.sheetCount}
      />
    ))}
    {form.supplements.length > 0 ? (
      <SupplementPage supplements={form.supplements} registration={form.header.registration} />
    ) : null}
    {form.schedule ? <SchedulePage schedule={form.schedule} /> : null}
  </div>
)
