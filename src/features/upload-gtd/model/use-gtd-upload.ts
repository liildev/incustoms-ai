import { useRef, useState } from 'react'
import { useGtdSession } from '@/entities/gtd'
import { readGtdFile } from '../lib/read-gtd-file'

export type UploadFailure = { fileName: string; errors: string[] }

/**
 * Reads a GTD file into the session; keeps the current document if the file cannot be read.
 * Only the most recently selected file is applied, so a slow earlier read cannot replace it.
 */
export const useGtdUpload = () => {
  const { load } = useGtdSession()
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<UploadFailure | null>(null)
  const latest = useRef(0)

  const upload = async (file: File): Promise<void> => {
    const request = ++latest.current
    setPending(true)
    try {
      const result = await readGtdFile(file)
      if (request !== latest.current) return
      if (!result.ok) {
        setFailure({ fileName: file.name, errors: result.errors })
        return
      }
      setFailure(null)
      load(file.name, result.document, result.notices)
    } catch (error) {
      // A defect in reading or parsing, not a problem with the file: keep it visible for diagnosis.
      console.error(error)
      if (request !== latest.current) return
      setFailure({
        fileName: file.name,
        errors: [
          'Внутренняя ошибка приложения при разборе файла. Подробности записаны в консоль браузера.',
        ],
      })
    } finally {
      if (request === latest.current) setPending(false)
    }
  }

  return { upload, pending, failure, dismissFailure: () => setFailure(null) }
}
