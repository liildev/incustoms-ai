import { IMEI_HEADINGS } from '../config/supplement-columns'
import type { DescriptionPosition } from '../model/print-form'
import { PaperTable } from './paper-table'

const detail = (label: string, value: string) => (value ? `${label}: ${value}` : '')

/**
 * Graph 31 detail of the electronic GTD (T7): every position with its quantities and, for mobile
 * devices, the IMEI of each SIM slot (T21) in the order of the file.
 */
export const PositionsDetail = ({ positions }: { positions: readonly DescriptionPosition[] }) => (
  <div className="flex flex-col gap-[3mm]">
    <p className="text-[7pt] leading-[1.25]">
      Разделы T7 и T21 электронной копии ГТД. Форма их печати в Инструкции № 2773 не установлена.
    </p>
    {positions.map((position, index) => {
      const facts = [
        detail('Количество в основной ед. измерения, кг нетто', position.netWeight),
        detail('Количество в доп. ед. измерения', position.extraQuantity),
        detail('VIN', position.vin),
        detail('Номер двигателя', position.engine),
      ].filter(Boolean)
      return (
        <div
          key={`${position.number}-${index}`}
          className="flex flex-col gap-[1mm] text-[7.5pt] leading-[1.25]"
        >
          <p className="break-after-avoid font-semibold">
            Позиция {position.number}
            {position.name ? `. ${position.name}` : ''}
          </p>
          {facts.length > 0 ? <p>{facts.join('; ')}</p> : null}
          {position.imei.length > 0 ? (
            <PaperTable
              headings={IMEI_HEADINGS}
              rows={position.imei.map((record) => [record.device, record.slot, record.code])}
            />
          ) : null}
        </div>
      )
    })}
  </div>
)
