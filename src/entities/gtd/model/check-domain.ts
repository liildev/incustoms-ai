import { childBlocks } from './block'
import type { GtdDocument } from './gtd'
import { DESCRIPTION_TAG, getMainBlock, listGoods } from './goods'
import { findDuplicateSlots, isStandardImei, readImeiRecords } from './imei'
import type { GtdIssue } from './issue'

/** Consistency checks between related values of the declaration. Never blocks export. */
export const checkDomain = (document: GtdDocument): GtdIssue[] => {
  const issues: GtdIssue[] = []
  const main = getMainBlock(document)
  const goods = listGoods(document)

  const declaredCount = main.block.fields.P17T1
  if (
    declaredCount !== undefined &&
    /^\d+$/.test(declaredCount.trim()) &&
    Number(declaredCount) !== goods.length
  ) {
    issues.push({
      source: 'domain',
      severity: 'warning',
      path: main.path,
      tag: 'P17T1',
      message: `Указано товаров: ${declaredCount}, в декларации разделов T2: ${goods.length}.`,
    })
  }

  for (const good of goods) {
    for (const description of childBlocks(good, DESCRIPTION_TAG)) {
      const records = readImeiRecords(description.block)
      for (const key of findDuplicateSlots(records)) {
        const [device, slot] = key.split(':')
        issues.push({
          source: 'domain',
          severity: 'error',
          path: description.path,
          tag: 'T21',
          message: `Устройство ${device}, слот ${slot} указан более одного раза.`,
        })
      }
      for (const { code, device, slot } of records) {
        if (code !== '' && !isStandardImei(code)) {
          issues.push({
            source: 'domain',
            severity: 'warning',
            path: description.path,
            tag: 'P5T21',
            message: `IMEI «${code}» (устройство ${device}, слот ${slot}) не состоит из 15 цифр.`,
          })
        }
      }
    }
  }
  return issues
}
