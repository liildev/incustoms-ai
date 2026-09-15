import { readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

const END_OF_CENTRAL_DIRECTORY = 0x06054b50
const CENTRAL_FILE_HEADER = 0x02014b50
const LOCAL_FILE_HEADER = 0x04034b50

/**
 * Reads one file from a ZIP archive (a .docx is one) without an external `unzip`.
 * Supports stored and deflated entries of a non-ZIP64 archive, which covers Office documents.
 */
export const readZipEntry = (archivePath: string, entryName: string): string => {
  const zip = readFileSync(archivePath)
  let end = zip.length - 22
  while (end >= 0 && zip.readUInt32LE(end) !== END_OF_CENTRAL_DIRECTORY) end -= 1
  if (end < 0) throw new Error(`${archivePath} is not a ZIP archive`)

  const count = zip.readUInt16LE(end + 10)
  let offset = zip.readUInt32LE(end + 16)
  for (let entry = 0; entry < count; entry += 1) {
    if (zip.readUInt32LE(offset) !== CENTRAL_FILE_HEADER) break
    const method = zip.readUInt16LE(offset + 10)
    const compressedSize = zip.readUInt32LE(offset + 20)
    const nameLength = zip.readUInt16LE(offset + 28)
    const headerLength =
      46 + nameLength + zip.readUInt16LE(offset + 30) + zip.readUInt16LE(offset + 32)
    const name = zip.toString('utf8', offset + 46, offset + 46 + nameLength)
    if (name === entryName) {
      const local = zip.readUInt32LE(offset + 42)
      if (zip.readUInt32LE(local) !== LOCAL_FILE_HEADER) break
      const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28)
      const data = zip.subarray(start, start + compressedSize)
      if (method === 0) return data.toString('utf8')
      if (method === 8) return inflateRawSync(data).toString('utf8')
      throw new Error(`${entryName} uses unsupported ZIP compression method ${method}`)
    }
    offset += headerLength
  }
  throw new Error(`${entryName} not found in ${archivePath}`)
}
