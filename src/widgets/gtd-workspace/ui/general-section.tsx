import { getMainBlock, type ReadySession } from '@/entities/gtd'
import { FieldsForm, withRemainingFields } from '@/features/edit-fields'
import { MAIN_GROUPS } from '../config/main-groups'
import { SectionHeader } from './section-header'

export const GeneralSection = ({ session }: { session: ReadySession }) => {
  const main = getMainBlock(session.document)

  return (
    <>
      <SectionHeader
        title="Общие сведения"
        description="Раздел T1: участники сделки, условия поставки, стоимость, транспорт и реквизиты. Пустые поля не попадут в XML."
      />
      <FieldsForm
        id="general"
        section={main}
        groups={withRemainingFields(main.block, MAIN_GROUPS, 'Прочие поля раздела T1')}
      />
    </>
  )
}
