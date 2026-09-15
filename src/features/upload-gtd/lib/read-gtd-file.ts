import { parseGtd, type GtdParseResult } from '@/entities/gtd'
import { decodeXml } from '@/shared/lib/xml'

/**
 * Upper bound for a single declaration file. Official examples are about 10 KB and a declaration
 * holds at most 99 goods; the limit only protects the tab from files that are clearly not a GTD.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024

const failure = (message: string): GtdParseResult => ({ ok: false, errors: [message] })

export const readGtdFile = async (file: File): Promise<GtdParseResult> => {
  if (!/\.xml$/i.test(file.name) && file.type !== 'text/xml' && file.type !== 'application/xml') {
    return failure(
      `Файл «${file.name}» не является XML. Выберите файл электронной копии ГТД (*.xml).`,
    )
  }
  if (file.size > MAX_FILE_SIZE) {
    return failure(
      'Размер файла превышает 10 МБ. Электронная копия ГТД без вложений значительно меньше.',
    )
  }

  let buffer: ArrayBuffer
  try {
    buffer = await file.arrayBuffer()
  } catch {
    // NotReadableError and similar: the file was moved, deleted or access was revoked.
    return failure('Не удалось прочитать файл. Проверьте, что он доступен, и повторите попытку.')
  }

  const decoded = decodeXml(buffer)
  if (!decoded.ok) {
    return failure(
      decoded.reason === 'unsupported-encoding'
        ? `Кодировка «${decoded.encoding}» не поддерживается. Сохраните файл в UTF-8 или windows-1251.`
        : `Содержимое файла не соответствует кодировке ${decoded.encoding}. Если файл сохранён в windows-1251, укажите encoding="windows-1251" в XML-декларации.`,
    )
  }
  return parseGtd(decoded.text)
}
