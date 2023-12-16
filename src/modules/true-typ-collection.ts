import { readFontDirectory } from '../helpers'
import { FontDirectory } from '../types'
import BinaryReader from './binary-reader'
import { TrueTypeFont } from './true-type-font'

export class TrueTypeCollection {
  private binaryReader: BinaryReader

  fontDirectories: FontDirectory[]
  tag: string
  majorVersion: number
  minorVersion: number
  numFonts: number
  dsigTag?: number
  dsigLength?: number
  dsigOffset?: number
  tableDirectoryOffsets: number[]
  fonts: TrueTypeFont[]

  constructor(arrayBuffer: ArrayBuffer) {
    this.binaryReader = new BinaryReader(arrayBuffer)

    this.tag = this.binaryReader.getString(4)
    this.majorVersion = this.binaryReader.getUint16()
    this.minorVersion = this.binaryReader.getUint16()
    this.numFonts = this.binaryReader.getUint32()
    this.tableDirectoryOffsets = this.readTableDirectoryOffsets()

    if (this.majorVersion === 2) {
      this.dsigTag = this.binaryReader.getUint32()
      this.dsigLength = this.binaryReader.getUint32()
      this.dsigOffset = this.binaryReader.getUint32()
    }

    this.fonts = []
    this.fontDirectories = this.readFontDirectories()
  }

  private readTableDirectoryOffsets() {
    const { numFonts, binaryReader } = this
    const tableDirectoryOffsets: number[] = []

    for (let i = 0; i < numFonts; i++) {
      const offset = binaryReader.getUint32()

      tableDirectoryOffsets.push(offset)
    }

    return tableDirectoryOffsets
  }

  private getFont() {
    const { binaryReader } = this

    const scalarType = binaryReader.getUint32()
    const numTables = binaryReader.getUint16()
    const searchRange = binaryReader.getUint16()
    const entrySelector = binaryReader.getUint16()
    const rangeShift = binaryReader.getUint16()

    const tables: { tag: number; checksum: number; offset: number; length: number }[] = []
    const offsetToEndOfFontDirectory = 12 + numTables * 16

    let byteLength = offsetToEndOfFontDirectory

    for (let i = 0; i < numTables; i++) {
      const table = {
        tag: binaryReader.getUint32(),
        checksum: binaryReader.getUint32(),
        offset: binaryReader.getUint32(),
        length: binaryReader.getUint32(),
      }

      byteLength += table.length

      tables.push(table)
    }

    const dataView = new DataView(new ArrayBuffer(byteLength))

    dataView.setUint32(0, scalarType)
    dataView.setUint16(4, numTables)
    dataView.setUint16(6, searchRange)
    dataView.setUint16(8, entrySelector)
    dataView.setUint16(10, rangeShift)

    const position = 12

    let tableOffset = offsetToEndOfFontDirectory

    tables.forEach((table, i) => {
      dataView.setUint32(position + i * 16, table.tag)
      dataView.setUint32(position + 4 + i * 16, table.checksum)
      dataView.setUint32(position + 8 + i * 16, tableOffset)
      dataView.setUint32(position + 12 + i * 16, table.length)

      binaryReader.seek(table.offset)

      for (let i = 0; i < table.length; i++)
        dataView.setUint8(tableOffset + i, binaryReader.getUint8())

      tableOffset += table.length
    })

    return new TrueTypeFont(dataView.buffer)
  }

  private readFontDirectories() {
    const { binaryReader } = this
    const fontDirectories: FontDirectory[] = []

    const currentPosition = binaryReader.tell()

    this.tableDirectoryOffsets.forEach(offset => {
      binaryReader.seek(offset)

      this.fonts.push(this.getFont())

      binaryReader.seek(offset)

      fontDirectories.push(readFontDirectory(binaryReader))
    })

    binaryReader.seek(currentPosition)

    return fontDirectories
  }
}
