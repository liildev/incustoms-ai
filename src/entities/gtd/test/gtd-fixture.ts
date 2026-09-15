/**
 * Synthetic GTD XML for tests. Values are illustrative only and are not taken from real declarations.
 */
export const gtdXml = ({
  goods = [''],
  main = '',
}: { goods?: string[]; main?: string } = {}): string =>
  [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<GTD_eCopy_DefEdFormat xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    '  <T1>',
    '    <P3T1>ИМ</P3T1>',
    `    <P17T1>${goods.length}</P17T1>`,
    ...goods.map((inner, index) => `    <T2><P8T2>${index + 1}</P8T2>${inner}</T2>`),
    main,
    '  </T1>',
    '</GTD_eCopy_DefEdFormat>',
  ].join('\n')

export const imeiXml = (device: number, slot: number, code: string): string =>
  `<T21><P3T21>${device}</P3T21><P4T21>${slot}</P4T21><P5T21>${code}</P5T21></T21>`

export const descriptionXml = (inner = ''): string =>
  `<T7><P4T7>1</P4T7><P5T7>Смартфон</P5T7>${inner}</T7>`
