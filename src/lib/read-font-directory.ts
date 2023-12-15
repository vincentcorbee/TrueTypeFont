import BinaryReader from '../modules/binary-reader'
import {
  FontDirectoryTable,
  FontDirectoryOffset,
  TableName,
  FontDirectoryTableEntry,
  FontDirectory,
} from '../types'
import assert from './assert'
import { calculateTableChecksum } from './calculate-table-checksum'

export function readFontDirectory(binaryReader: BinaryReader) {
  const table = {} as unknown as FontDirectoryTable
  const scalarType = binaryReader.getUint32()
  const numTables = binaryReader.getUint16()
  const searchRange = binaryReader.getUint16()
  const entrySelector = binaryReader.getUint16()
  const rangeShift = binaryReader.getUint16()

  const offset: FontDirectoryOffset = {
    scalarType,
    numTables,
    searchRange,
    entrySelector,
    rangeShift,
  }

  for (let i = 0; i < numTables; i++) {
    /* Tag is 4 bytes */
    const tag = binaryReader.getString(4) as TableName
    const checksum = binaryReader.getUint32()
    const offset = binaryReader.getUint32()
    const length = binaryReader.getUint32()

    table[tag] = {
      tag,
      checksum,
      offset,
      length,
    } as FontDirectoryTableEntry

    // console.log({ tag, length })

    const calculatedChecksum = calculateTableChecksum(binaryReader, offset, length)

    // if (!['head', 'meta', 'post', 'prep', 'fpgm', 'cvt ', 'hmtx'].includes(tag)) {
    try {
      assert(calculatedChecksum === checksum)
    } catch {
      console.log(
        `Checksum failed for: "${tag}" Given: ${checksum}, calculated: ${calculatedChecksum}`
      )
    }
    // }
  }

  return {
    offset,
    table,
  } as FontDirectory
}
