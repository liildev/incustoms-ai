import type { LabelledValue, PrintSchedule } from '../model/print-form'
import { PaperTable } from './paper-table'
import { PrintFlow } from './print-flow'

const pairs = (values: readonly LabelledValue[]) =>
  values.map((entry) => [`${entry.label} (${entry.tag})`, entry.value])

/**
 * ГУПТП (T53, T54). Instruction No. 2773 defines no paper form for it, so it is a separate section after the
 * declaration sheets rather than part of ТД1 or ТД2. Labels are the specification's.
 */
export const SchedulePage = ({ schedule }: { schedule: PrintSchedule }) => (
  <PrintFlow
    label="ГУПТП"
    heading={
      <div className="flex flex-col gap-[1mm]">
        <h3 className="text-[9pt] font-semibold">ГУПТП: общие данные и детализация</h3>
        <p className="text-[7.5pt] leading-[1.3]">
          Разделы T53 и T54 электронной копии ГТД. Печатная форма для них в Инструкции № 2773 не
          установлена, поэтому сведения приведены отдельно от листов ТД1 и ТД2.
        </p>
      </div>
    }
  >
    <PaperTable
      caption="Общие данные по ГУПТП (T53)"
      headings={['Поле', 'Значение']}
      rows={pairs(schedule.header)}
    />
    {schedule.rows.length === 0 ? (
      <p className="text-[7.5pt]">Детализация по ГУПТП (T54) в декларации отсутствует.</p>
    ) : (
      schedule.rows.map((row, index) => (
        <PaperTable
          key={index}
          caption="Детализация по ГУПТП (T54)"
          headings={['Поле', 'Значение']}
          rows={pairs(row)}
        />
      ))
    )}
  </PrintFlow>
)
