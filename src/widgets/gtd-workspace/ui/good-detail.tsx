import {
  childBlocks,
  getSpec,
  IMEI_TAG,
  PAYMENT_TAG,
  DESCRIPTION_TAG,
  DOCUMENT_TAG,
  getPaymentName,
  type GoodSummary,
} from '@/entities/gtd'
import { FieldsForm, withRemainingFields } from '@/features/edit-fields'
import { GOOD_GROUPS } from '../config/good-groups'
import { BlockTable } from './block-table'

const FEATURED_TAGS = [PAYMENT_TAG, DESCRIPTION_TAG, DOCUMENT_TAG]

export const GoodDetail = ({ good, formId }: { good: GoodSummary; formId: string }) => {
  const payments = childBlocks(good, PAYMENT_TAG)
  const descriptions = childBlocks(good, DESCRIPTION_TAG)
  const otherTags = [...new Set(good.block.blocks.map((block) => block.tag))].filter(
    (tag) => !FEATURED_TAGS.includes(tag),
  )

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <FieldsForm
        id={formId}
        section={good}
        groups={withRemainingFields(good.block, GOOD_GROUPS, 'Прочие поля раздела T2')}
      />

      <section>
        <h3 className="mb-2 text-dense font-semibold text-foreground">Платежи (T4)</h3>
        <BlockTable
          label="Платежи товара"
          blocks={payments.map(({ block }) => block)}
          lead={{
            title: 'Вид платежа',
            render: (block) => getPaymentName(block.fields.P3T4 ?? '') ?? '—',
          }}
        />
      </section>

      <section>
        <h3 className="mb-2 text-dense font-semibold text-foreground">Описание по графе 31 (T7)</h3>
        <BlockTable
          label="Описание по графе 31"
          blocks={descriptions.map(({ block }) => block)}
          lead={{
            title: 'IMEI',
            render: (block) =>
              String(block.blocks.filter((child) => child.tag === IMEI_TAG).length),
          }}
        />
      </section>

      <section>
        <h3 className="mb-2 text-dense font-semibold text-foreground">
          Документы по графе 44 (T9)
        </h3>
        <BlockTable
          label="Документы по графе 44"
          blocks={childBlocks(good, DOCUMENT_TAG).map(({ block }) => block)}
        />
      </section>

      {otherTags.map((tag) => (
        <section key={tag}>
          <h3 className="mb-2 text-dense font-semibold text-foreground">
            {getSpec(tag)?.label ?? 'Раздел вне спецификации'} ({tag})
          </h3>
          <BlockTable
            label={getSpec(tag)?.label ?? tag}
            blocks={childBlocks(good, tag).map(({ block }) => block)}
          />
        </section>
      ))}
    </div>
  )
}
