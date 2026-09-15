import { TD1_BOXES as B, TD1_FRAME as F } from '../config/td1-layout'
import type { PrintHeader } from '../model/print-form'
import { BoxLines } from './box-lines'
import { BoxValues } from './box-values'
import { FormBox } from './form-box'
import { TransportBox } from './transport-box'

/**
 * Graphs 15–30 of the main sheet. Graphs 15, 16 and 17 carry country names that the electronic format
 * does not contain (only codes, in 15а and 17а), so they are printed empty.
 */
export const Td1Shipment = ({ header }: { header: PrintHeader }) => (
  <>
    <FormBox frame={F} rect={B.g15} number="15" label="Страна отправления" />
    <FormBox frame={F} rect={B.g15a} number="15а" label="Код страны отправл.">
      <BoxValues values={[header.dispatchCountryCode]} />
    </FormBox>
    <FormBox frame={F} rect={B.g17a} number="17а" label="Код страны назнач.">
      <BoxValues values={[header.destinationCountryCode]} />
    </FormBox>
    <FormBox frame={F} rect={B.g16} number="16" label="Страна происхождения" />
    <FormBox frame={F} rect={B.g17} number="17" label="Страна назначения" />
    <TransportBox
      frame={F}
      rect={B.g18}
      number="18"
      label="Транспортное средство при отправлении/прибытии"
      transport={header.departureTransport}
    />
    <FormBox frame={F} rect={B.g19} number="19" label="Конт.">
      <BoxValues values={[header.container]} />
    </FormBox>
    <FormBox frame={F} rect={B.g20} number="20" label="Условия поставки">
      <BoxValues values={header.delivery} />
    </FormBox>
    <TransportBox
      frame={F}
      rect={B.g21}
      number="21"
      label="Транспортное средство на границе"
      transport={header.borderTransport}
    />
    <FormBox frame={F} rect={B.g22} number="22" label="Валюта и общая фактур. стоим. товаров">
      <BoxValues values={header.currency} />
    </FormBox>
    <FormBox frame={F} rect={B.g23} number="23" label="Курс валюты">
      <BoxValues values={[header.exchangeRate]} />
    </FormBox>
    <FormBox frame={F} rect={B.g24} number="24" label="Характер сделки">
      <BoxValues values={header.transaction} />
    </FormBox>
    <FormBox frame={F} rect={B.g25} number="25" label="Вид транспорта на границе">
      <BoxValues values={[header.borderTransportKind]} />
    </FormBox>
    <FormBox frame={F} rect={B.g26} number="26" label="Вид транспорта внутри страны">
      <BoxValues values={[header.inlandTransportKind]} />
    </FormBox>
    <FormBox frame={F} rect={B.g27} number="27" label="Место погрузки/разгрузки">
      <BoxLines
        lines={header.loadingPlace.lines}
        overflow={header.loadingPlace.overflow}
        small
        className="mt-[0.2mm]"
      />
    </FormBox>
    <FormBox frame={F} rect={B.g28} number="28" label="Финансовые и банковские сведения">
      <BoxLines lines={header.finance} className="mt-[0.4mm]" />
    </FormBox>
    <FormBox frame={F} rect={B.g29} number="29" label="Таможня на границе">
      <BoxValues values={[header.borderPost]} />
    </FormBox>
    <FormBox frame={F} rect={B.g30} number="30" label="Местонахождение товаров">
      <BoxLines
        lines={header.goodsLocation.lines}
        overflow={header.goodsLocation.overflow}
        small
        className="mt-[0.2mm]"
      />
    </FormBox>
  </>
)
