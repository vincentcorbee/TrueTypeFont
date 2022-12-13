import BinaryReader from './BinaryReader'
import assert from '../lib/assert'
import uniString from './uniString'
import transform from './transform'
import mapLanguageId from '../lib/mapLanguageId'
import mapNameId from '../lib/mapNameId'
import mapPlatformId from '../lib/mapPlatformId'
import mapPlatformSpecificId from '../lib/mapPlatformSpecificId'
import GLYPHS from '../lib/glyphs'
import createCircle from '../lib/createCircle'
import drawCurves from '../lib/drawCurves'

type TableName =
  | 'post'
  | 'cmap'
  | 'name'
  | 'GSUB'
  | 'glyf'
  | 'head'
  | 'hhea'
  | 'hmtx'
  | 'loca'
  | 'maxp'
  | 'OS/2'
  | 'cvt'
  | 'fpgm'
  | 'hdmx'
  | 'kern'
  | 'prep'

type RequiredTableName = Extract<
  TableName,
  'cmap' | 'glyf' | 'head' | 'hhea' | 'hmtx' | 'loca' | 'maxp' | 'name' | 'post'
>

type OptionalTableName = Extract<
  TableName,
  'OS/2' | 'cvt' | 'pfgm' | 'hdmx' | 'kern' | 'prep' | 'GSUB'
>

type OptionalTables = {
  [key in OptionalTableName]?: any
}

type RequiredTables = {
  [key in RequiredTableName]: any
}

type Tables = OptionalTables & RequiredTables

type FontDirectory = {
  offset: FontDirectoryOffset
  table: FontDirectoryTable
}

type FontDirectoryOffset = {
  scalarType: number
  numTables: number
  searchRange: number
  entrySelector: number
  rangeShift: number
}
type FontDirectoryTableEntry = {
  checksum: number
  length: number
  offset: number
  tag: TableName
}

type FontDirectoryTable = {
  [key in TableName]: FontDirectoryTableEntry
}

type HeadTable = {
  version: number
  fontRevision: number
  checkSumAdjustment: number
  magicNumber: number
  flags: number
  unitsPerEm: number
  created: Date
  modified: Date
  xMin: number
  yMin: number
  xMax: number
  yMax: number
  macStyle: number
  lowestRecPPEM: number
  fontDirectionHint: number
  indexToLocFormat: number
  glyphDataFormat: number
}

type LongHorMetric = {
  advanceWidth: number
  leftSideBearing: number
}

type HmtxTable = {
  hMetrics: LongHorMetric[]
  leftSideBearing: number[]
}

type PostTable = {
  format: number
  italicAngle: number
  underlinePosition: number
  underlineThickness: number
  isFixedPitch: number
  minMemType42: number
  maxMemType42: number
  minMemType1: number
  maxMemType1: number
  numberOfGlyphs?: number
  glyphNameIndex?: number[]
  names?: PostTableName[]
}

type PostTableName = {
  name: string
  index: number
}

type CreateSvgOptions = {
  fontSize?: number
  useBB?: boolean
  showPoints?: boolean
  showLines?: boolean
}

type Glyph = {
  advanceWidth: number
  leftSideBearing: number
  unicode: string
  numberOfContours: number
  type?: 'compound' | 'simple'
  components?: Component[]
  instructions?: number[]
  endPtsOfContours?: number[]
  points?: { onCurve: boolean }[]
  name: string
  xMax: number
  xMin: number
  yMax: number
  yMin: number
}

type Component = {
  glyphIndex: number
  overlap: number
  destPointIndex?: number
  srcPointIndex?: number
  matrix: {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
  }
}

class TrueTypeFont {
  numGlyphs: number
  fontDirectory: FontDirectory
  tables: Tables

  // private platformID: number
  // private platformSpecificID: number
  // private languageID: number
  private reader: BinaryReader

  constructor(arrayBuffer: ArrayBuffer) {
    this.reader = new BinaryReader(arrayBuffer)

    this.fontDirectory = this.readFontDirectory()

    this.tables = this.readTables()

    this.numGlyphs = this.getNumGlyphs()

    // Platform settings
    // this.platformID = 3 // Microsoft
    // this.platformSpecificID = 10 // Unicode
    // this.languageID = 0x0409 // English United States
  }

  get buffer() {
    return this.reader.view.buffer
  }

  get fontFamily() {
    return this.tables.name.nameRecords.find(
      (record: any) => record.nameID.name === 'FontFamily'
    ).nameID.value
  }

  get postScriptName() {
    return this.tables.name.nameRecords.find(
      (record: any) => record.nameID.name === 'PostScriptName'
    ).nameID.value
  }

  get version() {
    return (this.tables.head as HeadTable).version ?? 0
  }

  get fontRevision() {
    return (this.tables.head as HeadTable).fontRevision ?? 0
  }

  get checkSumAdjustment() {
    return (this.tables.head as HeadTable).checkSumAdjustment ?? 0
  }
  get magicNumber() {
    return (this.tables.head as HeadTable).checkSumAdjustment ?? 0
  }
  get flags() {
    return (this.tables.head as HeadTable).flags ?? 0
  }
  get italicAngle() {
    return (this.tables.post as PostTable).italicAngle ?? 0
  }
  get isFixedPitch() {
    return (this.tables.post as PostTable).isFixedPitch ?? 0
  }
  get unitsPerEm() {
    return (this.tables.head as HeadTable).unitsPerEm ?? 0
  }
  get created() {
    return (this.tables.head as HeadTable).created
  }
  get modified() {
    return (this.tables.head as HeadTable).modified
  }
  get xMin() {
    return (this.tables.head as HeadTable).xMin ?? 0
  }
  get yMin() {
    return (this.tables.head as HeadTable).yMin ?? 0
  }
  get xMax() {
    return (this.tables.head as HeadTable).xMax ?? 0
  }
  get yMax() {
    return (this.tables.head as HeadTable).yMax ?? 0
  }
  get BBox() {
    return [this.xMin, this.yMin, this.xMax, this.yMax]
  }
  get ascent() {
    return (this.tables.hhea as any).ascent ?? 0
  }
  get descent() {
    return (this.tables.hhea as any).descent ?? 0
  }
  get xHeight() {
    return (this.tables['OS/2'] as any).sxHeight ?? 0
  }
  get capHeight() {
    return (this.tables['OS/2'] as any).sCapHeight ?? 0
  }
  get macStyle() {
    return (this.tables.head as HeadTable).macStyle ?? 0
  }
  get lowestRecPPEM() {
    return (this.tables.head as HeadTable).lowestRecPPEM ?? 0
  }
  get fontDirectionHint() {
    return (this.tables.head as HeadTable).fontDirectionHint ?? 0
  }
  get indexToLocFormat() {
    return (this.tables.head as HeadTable).indexToLocFormat ?? 0
  }
  get glyphDataFormat() {
    return (this.tables.head as HeadTable).glyphDataFormat ?? 0
  }

  private getNumGlyphs() {
    assert(this.fontDirectory.table.maxp)

    const table = this.fontDirectory.table.maxp
    const reader = this.reader

    const oldPos = reader.seek(table.offset + 4)
    const numGlyphs = reader.getUint16()

    reader.seek(oldPos)

    return numGlyphs
  }

  private readHheaTable(table: FontDirectoryTableEntry) {
    const reader = this.reader

    reader.seek(table.offset)

    return {
      version: reader.getFixed(),
      ascent: reader.getFword(),
      descent: reader.getFword(),
      lineGap: reader.getFword(),
      advanceWidthMax: reader.getuFword(),
      minLeftSideBearing: reader.getFword(),
      minRightSideBearing: reader.getFword(),
      xMaxExtent: reader.getFword(),
      caretSlopeRise: reader.getInt16(),
      caretSlopeRun: reader.getInt16(),
      caretOffset: reader.getFword(),
      // reserved int16
      // reserved int16
      // reserved int16
      // reserved int16
      metricDataFormat: reader.seek(reader.tell() + 8) && reader.getInt16(),
      numOfLongHorMetrics: reader.getUint16(),
    }
  }

  private readHmtxTable(table: FontDirectoryTableEntry, tables: Tables) {
    const reader: any = this.reader
    const numOfLongHorMetrics = tables.hhea.numOfLongHorMetrics
    const hmtxTable: HmtxTable = {
      hMetrics: [],
      leftSideBearing: [],
    }

    reader.seek(table.offset)

    for (let i = 0; i < numOfLongHorMetrics; i += 1) {
      // 0: advanceWidth (aw)
      // 1: leftSideBearing (lsb)
      hmtxTable.hMetrics.push({
        advanceWidth: reader.getUint16(),
        leftSideBearing: reader.getInt16(),
      })
    }

    if (hmtxTable.hMetrics.length < this.numGlyphs) {
      for (let i = 0, l = this.numGlyphs - numOfLongHorMetrics; i < l; i += 1) {
        hmtxTable.leftSideBearing.push(reader.getFword())
      }
    }

    return hmtxTable
  }

  private readPostTable(table: FontDirectoryTableEntry) {
    const reader = this.reader

    reader.seek(table.offset)

    const postTable: PostTable = {
      format: reader.getFixed(),
      italicAngle: reader.getFixed(),
      underlinePosition: reader.getFword(),
      underlineThickness: reader.getFword(),
      isFixedPitch: reader.getUint32(),
      minMemType42: reader.getUint32(),
      maxMemType42: reader.getUint32(),
      minMemType1: reader.getUint32(),
      maxMemType1: reader.getUint32(),
    }

    if (postTable.format === 1) {
    } else if (postTable.format === 2) {
      const numberOfGlyphs = reader.getUint16()
      const glyphNameIndex = []
      const names = []
      // assert(numberOfGlyphs === this.numGlyphs);

      for (let i = 0; i < numberOfGlyphs; i += 1) {
        glyphNameIndex.push(reader.getUint16())
      }

      for (let index of glyphNameIndex) {
        if (index >= 258 && index <= 32767) {
          index -= 258

          const old = reader.tell()

          for (let i = 0; i < index; i += 1) {
            const length = reader.getUint8()

            reader.seek(reader.tell() + length)
          }

          const length = reader.getUint8()

          names.push({
            name: reader.getString(length),
            index: index + 258,
          })

          reader.seek(old)
        } else {
          names.push({
            name: GLYPHS[index],
            index,
          })
        }
      }

      postTable.numberOfGlyphs = numberOfGlyphs
      postTable.glyphNameIndex = glyphNameIndex
      postTable.names = names
    }

    return postTable
  }

  private readNameTable(table: FontDirectoryTableEntry) {
    const reader = this.reader

    reader.seek(table.offset)

    const format = reader.getUint16()
    const count = reader.getUint16()
    const stringOffset = reader.getUint16()
    const nameRecords = []

    for (let i = 0; i < count; i += 1) {
      const platformId = mapPlatformId(reader.getUint16())
      const platformSpecificID = mapPlatformSpecificId(
        platformId.platform,
        reader.getUint16()
      )

      const languageID = mapLanguageId(platformId.platform, reader.getUint16())
      const nameID = mapNameId(reader.getUint16())
      const length = reader.getUint16()
      const offset = reader.getUint16()

      const previousPosition = reader.pos

      reader.seek(table.offset + stringOffset + offset)

      nameID.value = reader.getString(length)

      nameRecords.push({
        platformId,
        platformSpecificID,
        languageID,
        nameID,
        length,
        offset,
      })

      reader.seek(previousPosition)
    }

    return {
      format,
      count,
      stringOffset,
      nameRecords,
    }
  }

  private readOS2Table(table: FontDirectoryTableEntry) {
    const reader = this.reader

    reader.seek(table.offset)

    const getPanose = (num: number, i: number) => {
      const bFamilyType = {
        0: 'Any',
        1: 'No Fit',
        2: 'Text and Display',
        3: 'Script',
        4: 'Decorative',
        5: 'Pictorial',
      }

      return num
    }

    const OS2Table: any = {
      version: reader.getUint16(),
      xAvgCharWidth: reader.getInt16(),
      usWeightClass: reader.getUint16(),
      usWidthClass: reader.getUint16(),
      fsType: reader.getInt16(),
      ySubscriptXSize: reader.getInt16(),
      ySubscriptYSize: reader.getInt16(),
      ySubscriptXOffset: reader.getInt16(),
      ySubscriptYOffset: reader.getInt16(),
      ySuperscriptXSize: reader.getInt16(),
      ySuperscriptYSize: reader.getInt16(),
      ySuperscriptXOffset: reader.getInt16(),
      ySuperscriptYOffset: reader.getInt16(),
      yStrikeoutSize: reader.getInt16(),
      yStrikeoutPosition: reader.getInt16(),
      sFamilyClass: reader.getInt16(),
    }

    const panose = []

    for (let i = 0; i < 10; i += 1) {
      panose.push(getPanose(reader.getUint8(), i))
    }

    OS2Table.panose = panose
    OS2Table.ulCharRange = []

    for (let i = 0; i < 4; i += 1) {
      OS2Table.ulCharRange.push(reader.getUint32())
    }

    OS2Table.achVendID = reader.getString(4)
    OS2Table.fsSelection = reader.getUint16()
    OS2Table.fsFirstCharIndex = reader.getUint16()
    OS2Table.fsLastCharIndex = reader.getUint16()

    if (OS2Table.version > 0) {
      OS2Table.sTypoAscender = reader.getInt16()
      OS2Table.sTypoDescender = reader.getInt16()
      OS2Table.sTypoLineGap = reader.getInt16()
      OS2Table.usWinAscent = reader.getUint16()
      OS2Table.usWinDescent = reader.getUint16()
      OS2Table.ulCodePageRange1 = reader.getUint32()
      OS2Table.ulCodePageRange2 = reader.getUint32()
      OS2Table.sxHeight = reader.getInt16()
      OS2Table.sCapHeight = reader.getInt16()
      OS2Table.usDefaultChar = reader.getUint16()
      OS2Table.usBreakChar = reader.getUint16()
      OS2Table.usMaxContext = reader.getUint16()
      OS2Table.usLowerPointSize = reader.getUint16()
      OS2Table.usUpperPointSize = reader.getUint16()
    }

    return OS2Table
  }

  private readCmapTable(table: FontDirectoryTableEntry) {
    const reader = this.reader

    reader.seek(table.offset)

    const version = reader.getUint16()
    const numberSubtables = reader.getUint16()

    const encodingRecords = []

    const header = {
      version,
      numberSubtables,
    }

    // Currently only format 0 and 12 are implemented

    for (let i = 0; i < numberSubtables; i += 1) {
      const platformID = mapPlatformId(reader.getUint16())
      const platformSpecificID = mapPlatformSpecificId(
        platformID.platform,
        reader.getUint16()
      )
      const offset = reader.getUint32()

      const old = reader.seek(table.offset + offset)

      const glyphIndexMap: any = {}
      const format = reader.getUint16()
      const record: any = {
        platformID,
        platformSpecificID,
        offset,
        format,
        glyphIndexMap,
      }

      if (format === 0) {
        record.length = reader.getUint16()
        record.language = reader.getUint16()

        const glyphIndexArray = []

        for (let i = 0; i < 256; i += 1) {
          glyphIndexArray.push(reader.getUint8())
        }

        record.glyphIndexArray = glyphIndexArray
      }

      if (format === 4) {
        record.length = reader.getUint16()
        record.language = reader.getUint16()

        const segments = []
        const segCountX2 = reader.getUint16()
        const searchRange = reader.getUint16()
        const entrySelector = reader.getUint16()
        const rangeShift = reader.getUint16()

        record.segCount = segCountX2 / 2

        for (let i = 0; i < record.segCount; i += 1) {
          segments.push({
            endCode: reader.getUint16(),
          })
        }

        reader.seek(reader.tell() + 2)

        for (let i = 0; i < record.segCount; i += 1) {
          ;(segments[i] as any).startCode = reader.getUint16()
        }

        for (let i = 0; i < record.segCount; i += 1) {
          ;(segments[i] as any).idDelta = reader.getUint16()
        }

        for (let i = 0; i < record.segCount; i += 1) {
          ;(segments[i] as any).idRangeOffset = reader.getUint16()
        }

        record.segments = segments

        record.segments.forEach((segment: any) => {
          let c = segment.startCode
          let e = segment.endCode

          do {
            if (segment.idRangeOffset === 0) {
              glyphIndexMap[c] = (segment.idDelta + c) % 65536
            } else {
              //
            }
            c += 1
          } while (c <= e)
        })
      }

      if (format === 12) {
        record.reserved = reader.getUint16()
        record.length = reader.getUint32()
        record.language = reader.getUint32()
        record.numGroups = reader.getUint32()

        const groups = []

        for (let i = 0; i < record.numGroups; i += 1) {
          groups.push({
            startCharCode: reader.getUint32(),
            endCharCode: reader.getUint32(),
            startGlyphID: reader.getUint32(),
          })

          groups.sort((a, b) => a.startCharCode - b.startCharCode)
        }

        groups.forEach(group => {
          let c = group.startCharCode
          let e = group.endCharCode
          let id = group.startGlyphID

          do {
            glyphIndexMap[c] = id

            id += 1
            c += 1
          } while (c <= e)
        })

        record.groups = groups
      }

      encodingRecords.push(record)

      reader.seek(old)
    }

    encodingRecords.sort(
      (a, b) =>
        a.platformID.id - b.platformID.id || a.platformSpecificID - b.platformSpecificID
    )

    const cmapTable = {
      header,
      encodingRecords,
    }

    return cmapTable
  }

  private readGSUBTable(table: FontDirectoryTableEntry) {
    const reader = this.reader

    reader.seek(table.offset)

    const GSUBTable: any = {
      majorVersion: reader.getUint16(),
      minorVersion: reader.getUint16(),
      scriptListOffset: reader.getUint16(),
      featureListOffset: reader.getUint16(),
      lookupListOffset: reader.getUint16(),
      scriptList: {},
      featureList: {},
    }

    if (GSUBTable.minorVersion === 1) {
      GSUBTable.featureVariationsOffset = reader.getUint32()
    }

    // ScriptList

    let offset = reader.seek(table.offset + GSUBTable.scriptListOffset)

    const scriptList: any = {
      scriptCount: reader.getUint16(),
      scriptRecords: [],
    }

    for (let i = 0, l = scriptList.scriptCount; i < l; i += 1) {
      const tagName = reader.getString(4)
      const scriptOffset = reader.getUint16()

      const old = reader.seek(offset + scriptOffset)

      const defaultLangSysOffset = reader.getUint16()
      const langSysCount = reader.getUint16()
      const langSysRecords = []

      for (let i = 0; i < langSysCount; i += 1) {
        const langSysTag = reader.getString(4)
        const langSysOffset = reader.getUint16()

        const old = reader.seek(offset + scriptOffset + langSysOffset)

        const lookupOrder = reader.getUint16()
        const requiredFeatureIndex = reader.getUint16() !== 0xffff
        const featureIndexCount = reader.getUint16()
        const featureIndices = []

        for (let i = 0; i < featureIndexCount; i += 1) {
          featureIndices.push(reader.getUint16())
        }

        const LangSysRecord: any = {
          langSysTag,
          langSysOffset,
          lookupOrder,
          requiredFeatureIndex,
          featureIndexCount,
          featureIndices,
        }

        langSysRecords.push(LangSysRecord)

        reader.seek(old)
      }

      const record: any = {
        tagName,
        scriptOffset,
        defaultLangSysOffset,
        langSysRecords,
      }

      scriptList.scriptRecords.push(record)

      reader.seek(old)
    }

    GSUBTable.scriptList = scriptList

    // FeatureList

    offset = reader.seek(table.offset + GSUBTable.featureListOffset)

    const featureList: any = {
      featureListCount: reader.getUint16(),
      featureRecords: [],
    }

    for (let i = 0, l = featureList.featureListCount; i < l; i += 1) {
      const featureTag = reader.getString(4)
      const featureOffset = reader.getUint16()

      const old = reader.seek(table.offset + GSUBTable.featureListOffset + featureOffset)

      const featureParams = reader.getUint16()
      const lookupIndexCount = reader.getUint16()
      const lookupListIndices = []

      for (let i = 0, l = lookupIndexCount; i < l; i += 1) {
        lookupListIndices.push(reader.getUint16())
      }

      const featureRecord: any = {
        featureTag,
        featureOffset,
        featureParams,
        lookupIndexCount,
        lookupListIndices,
      }

      featureList.featureRecords.push(featureRecord)

      reader.seek(old)
    }

    GSUBTable.featureList = featureList

    // LookupList

    // Flags
    const rightToLeft = 0x0001
    const ignoreBaseGlyphs = 0x0002
    const ignoreLigatures = 0x0004
    const ignoreMarks = 0x0008
    const useMarkFilteringSet = 0x0010
    // reserved = 0x00E0
    const markAttachmentType = 0xff00

    offset = reader.seek(table.offset + GSUBTable.lookupListOffset)

    const lookupCount = reader.getUint16()
    const lookups = []

    for (let i = 0; i < lookupCount; i += 1) {
      const offset = reader.getUint16()
      const pos = table.offset + GSUBTable.lookupListOffset + offset
      const old = reader.seek(pos)

      const lookupType = reader.getUint16()
      const lookupFlag = reader.getUint16()
      const subTableCount = reader.getUint16()
      const subtableOffsets = []
      const subTables = []

      for (let i = 0; i < subTableCount; i += 1) {
        subtableOffsets.push(reader.getUint16())
      }

      reader.seek(pos + subtableOffsets[0])

      const substFormat = reader.getUint16()
      const coverageOffset = reader.getUint16()

      const inter = reader.seek(pos + subtableOffsets[0] + coverageOffset)

      const coverageFormat = reader.getUint16()

      const coverageTable: any = {
        coverageFormat,
      }

      if (coverageFormat === 1) {
        const glyphCount = reader.getUint16()
        const glyphArray = []

        for (let i = 0; i < glyphCount; i += 1) {
          glyphArray.push(reader.getUint16())
        }

        coverageTable.glyphCount = glyphCount
        coverageTable.glyphArray = glyphArray
      } else if (coverageFormat === 2) {
        const rangeCount = reader.getUint16()
        const rangeRecords = []

        for (let i = 0; i < rangeCount; i += 1) {
          rangeRecords.push({
            startGlyphID: reader.getUint16(),
            endGlyphID: reader.getUint16(),
            startCoverageIndex: reader.getUint16(),
          })
        }

        coverageTable.rangeCount = rangeCount
        coverageTable.rangeRecords = rangeRecords
      }

      reader.seek(inter)

      const subTable: any = {
        substFormat,
        coverageOffset,
        coverageTable,
      }

      if (lookupType === 1) {
        if (substFormat === 1) {
          subTable.deltaGlyphID = reader.getInt16()
        } else if (substFormat === 2) {
          const glyphCount = reader.getUint16()
          const substituteGlyphIDs = []

          for (let i = 0; i < glyphCount; i += 1) {
            substituteGlyphIDs.push(reader.getUint16())
          }
        }
      } else if (lookupType === 2) {
      } else if (lookupType === 3) {
      } else if (lookupType === 4) {
        const ligatureSetCount = reader.getUint16()
        const ligatureSets = []

        for (let i = 0; i < ligatureSetCount; i += 1) {
          const ligatureSetOffset = reader.getUint16()
          const old = reader.seek(pos + subtableOffsets[0] + ligatureSetOffset)

          const ligatureCount = reader.getUint16()
          const ligatures = []

          for (let i = 0; i < ligatureCount; i += 1) {
            const ligatureOffset = reader.getUint16()

            const old = reader.seek(
              pos + subtableOffsets[0] + ligatureSetOffset + ligatureOffset
            )

            const ligatureGlyph = reader.getUint16()
            const componentCount = reader.getUint16()
            const componentGlyphIDs = []

            for (let i = 0; i < componentCount - 1; i += 1) {
              componentGlyphIDs.push(reader.getUint16())
            }

            ligatures.push({
              ligatureGlyph,
              ligatureOffset,
              componentCount,
              componentGlyphIDs,
            })

            reader.seek(old)
          }

          ligatureSets.push({
            ligatureCount,
            ligatures,
          })

          reader.seek(old)
        }

        subTable.ligatureSetCount = ligatureSetCount
        subTable.ligatureSets = ligatureSets
      } else if (lookupType === 5) {
      } else if (lookupType === 6) {
      }

      subTables.push(subTable)

      const lookup: any = {
        lookupType,
        lookupFlag,
        subTableCount,
        subtableOffsets,
        subTables,
      }

      if (lookupFlag & useMarkFilteringSet) {
        lookup.markFilteringSet = reader.getUint16()
      }

      lookups.push(lookup)

      reader.seek(old)
    }

    const lookupList = {
      lookupCount,
      lookups,
    }

    GSUBTable.lookupList = lookupList

    return GSUBTable
  }

  private readFontDirectory() {
    const reader = this.reader
    const table = {} as unknown as FontDirectoryTable
    const scalarType = reader.getUint32()
    const numTables = reader.getUint16()
    const searchRange = reader.getUint16()
    const entrySelector = reader.getUint16()
    const rangeShift = reader.getUint16()

    const offset: FontDirectoryOffset = {
      scalarType,
      numTables,
      searchRange,
      entrySelector,
      rangeShift,
    }

    for (let i = 0; i < numTables; i++) {
      const tag = reader.getString(4) as TableName

      table[tag] = {
        tag,
        checksum: reader.getUint32(),
        offset: reader.getUint32(),
        length: reader.getUint32(),
      } as FontDirectoryTableEntry

      if (tag !== 'head') {
        assert(
          this.calculateTableChecksum(table[tag].offset, table[tag].length) ===
            table[tag].checksum
        )
      }
    }

    return {
      offset,
      table,
    } as FontDirectory
  }

  private readTables() {
    const { table } = this.fontDirectory

    const tables = {} as Tables

    for (const name in table) {
      const tableEntry = table[name as TableName]

      switch (name) {
        case 'head':
          tables[name] = this.readHeadTable(tableEntry)
          break
        case 'hhea':
          tables[name] = this.readHheaTable(tableEntry)
          break
        case 'hmtx':
          tables[name] = this.readHmtxTable(tableEntry, tables)
          break
        case 'post':
          tables[name] = this.readPostTable(tableEntry)
          break
        case 'name':
          tables[name] = this.readNameTable(tableEntry)
          break
        case 'OS/2':
          tables[name] = this.readOS2Table(tableEntry)
          break
        case 'cmap':
          tables[name] = this.readCmapTable(tableEntry)
          break
        case 'GSUB':
          tables[name] = this.readGSUBTable(tableEntry)
          break
        default:
          break
      }
    }

    return tables
  }

  private readHeadTable(table: FontDirectoryTableEntry) {
    const reader = this.reader

    reader.seek(table.offset)

    const headTable = {
      version: reader.getFixed(),
      fontRevision: reader.getFixed(),
      checkSumAdjustment: reader.getUint32(),
      magicNumber: reader.getUint32(),
      flags: reader.getUint16(),
      unitsPerEm: reader.getUint16(),
      created: reader.getLongDateTime(),
      modified: reader.getLongDateTime(),
      xMin: reader.getFword(),
      yMin: reader.getFword(),
      xMax: reader.getFword(),
      yMax: reader.getFword(),
      macStyle: reader.getUint16(),
      lowestRecPPEM: reader.getUint16(),
      fontDirectionHint: reader.getInt16(),
      indexToLocFormat: reader.getInt16(),
      glyphDataFormat: reader.getInt16(),
    } as HeadTable

    assert(headTable.magicNumber === 0x5f0f3cf5)

    return headTable
  }

  private readCoords(
    points: any[],
    numPoints: number,
    name: string,
    flags: any[],
    byteFlag: any,
    deltaFlag: any
  ) {
    let value = 0

    const reader = this.reader

    for (let i = 0; i < numPoints; i++) {
      const flag = flags[i]

      if (flag & byteFlag) {
        if (flag & deltaFlag) {
          value += reader.getUint8()
        } else {
          value -= reader.getUint8()
        }
      } else if (~flag & deltaFlag) {
        value += reader.getInt16()
      }

      points[i][name] = value
    }
  }

  private readCompoundGlyph(glyph: Glyph) {
    const ARG_1_AND_2_ARE_WORDS = 1
    const ARGS_ARE_XY_VALUES = 2
    const ROUND_XY_TO_GRID = 4
    const WE_HAVE_A_SCALE = 8
    // reserverd 16
    const MORE_COMPONENTS = 32
    const WE_HAVE_AN_X_AND_Y_SCALE = 64
    const WE_HAVE_A_TWO_BY_TWO = 128
    const WE_HAVE_INSTRUCTIONS = 256
    const USE_MY_METRICS = 512
    const OVERLAP_COMPOUND = 1024

    const reader = this.reader
    let flags

    glyph.type = 'compound'
    glyph.components = []

    do {
      let arg1
      let arg2

      flags = reader.getUint16()

      // a: xScale
      // b:
      // c:
      // d: yScale
      // e: xOffset
      // f: yOffset

      const component: Component = {
        glyphIndex: reader.getUint16(),
        overlap: flags & OVERLAP_COMPOUND,
        matrix: {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0,
        },
      }

      if (flags & ARG_1_AND_2_ARE_WORDS) {
        arg1 = reader.getFword()
        arg2 = reader.getFword()
      } else {
        arg1 = reader.getInt8()
        arg2 = reader.getInt8()
      }

      if (flags & WE_HAVE_A_SCALE) {
        component.matrix.a = reader.get2Dot14()
        component.matrix.d = component.matrix.a
      } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
        component.matrix.a = reader.get2Dot14()
        component.matrix.d = reader.get2Dot14()
      } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
        component.matrix.a = reader.get2Dot14()
        component.matrix.b = reader.get2Dot14()
        component.matrix.c = reader.get2Dot14()
        component.matrix.d = reader.get2Dot14()
      }

      if (flags & ARGS_ARE_XY_VALUES) {
        component.matrix.e = arg1
        component.matrix.f = arg2
      } else {
        component.destPointIndex = arg1
        component.srcPointIndex = arg2
      }

      glyph.components.push(component)
    } while (flags & MORE_COMPONENTS)

    if (flags & WE_HAVE_INSTRUCTIONS) {
      glyph.instructions = []

      const numInstr = reader.getUint16()

      for (let i = 0; i < numInstr; i += 1) {
        glyph.instructions.push(reader.getUint8())
      }
    }
  }

  private readSimpleGlyph(glyph: Glyph) {
    const reader = this.reader

    const ON_CURVE = 1
    const X_IS_BYTE = 2
    const Y_IS_BYTE = 4
    const REPEAT = 8
    const X_DELTA = 16
    const Y_DELTA = 32

    const flags = []

    glyph.type = 'simple'
    glyph.endPtsOfContours = []
    glyph.points = []

    for (let i = 0; i < glyph.numberOfContours; i += 1) {
      glyph.endPtsOfContours.push(reader.getUint16())
    }

    const instructionLength = reader.getUint16()
    const instructions = []

    for (let i = 0; i < instructionLength; i += 1) {
      instructions.push(reader.getUint8())
    }

    const numPoints = Math.max(...glyph.endPtsOfContours) + 1

    for (let i = 0; i < numPoints; i += 1) {
      const flag = reader.getUint8()

      flags.push(flag)

      glyph.points.push({
        onCurve: (flag & ON_CURVE) > 0,
      })

      if (flag & REPEAT) {
        let repeatCount = reader.getUint8()

        assert(repeatCount > 0)

        i += repeatCount

        while (repeatCount--) {
          flags.push(flag)
          glyph.points.push({
            onCurve: (flag & ON_CURVE) > 0,
          })
        }
      }
    }

    this.readCoords(glyph.points, numPoints, 'x', flags, X_IS_BYTE, X_DELTA)
    this.readCoords(glyph.points, numPoints, 'y', flags, Y_IS_BYTE, Y_DELTA)
  }

  private getUnicode(codes: any, i: number) {
    for (let code in codes) {
      if (codes[code] === i) {
        if (parseInt(code, 10) === 0xffff) {
          return 'none'
        }

        code = parseInt(code).toString(16).toUpperCase()

        while (code.length < 4) {
          code = '0' + code
        }

        return 'U+' + code
      }
    }

    return 'none'
  }

  private getGlyphName(index: number) {
    if (this.tables.post.names) {
      return this.tables.post.names[index].name || ''
    }

    return ''
  }

  private getCmap() {
    return this.tables.cmap.encodingRecords[this.tables.cmap.encodingRecords.length - 1]
      .glyphIndexMap // .find(record => record.platformID.id === this.platformID && record.platformSpecificID.id === this.platformSpecificID).glyphIndexMap
  }

  private getGlyphOffset(index: number) {
    if (index > this.numGlyphs) {
      return { offset: null, length: 0 }
    }

    assert(this.fontDirectory.table.loca)

    const table = this.fontDirectory.table.loca
    const reader = this.reader
    const offsetLoca = table.offset

    let offset = 0
    let length = 0

    if (this.indexToLocFormat === 1) {
      reader.seek(offsetLoca + index * 4)
      offset = reader.getUint32()
      length = reader.getUint32() - (index === this.numGlyphs ? 0 : offset)
    } else {
      reader.seek(offsetLoca + index * 2)
      offset = reader.getUint16() * 2
      length = reader.getUint16() * 2 - (index === this.numGlyphs ? 0 : offset)
    }

    assert(this.fontDirectory.table.glyf)

    return { offset: offset + this.fontDirectory.table.glyf.offset, length }
  }

  private calculateTableChecksum(offset: any, numberOfBytesInTable: number) {
    const reader = this.reader
    const old = reader.seek(offset)
    let sum = 0
    let nlongs = ((numberOfBytesInTable + 3) / 4) | 0

    while (nlongs--) {
      sum = ((sum + reader.getUint32()) & 0xffffffff) >>> 0
    }

    reader.seek(old)

    return sum
  }

  getGlyphByChar(char: string) {
    assert(this.fontDirectory.table.cmap)

    const us = uniString(char)
    const cmap = this.getCmap()

    return this.readGlyph(cmap[us.codePointAt(us.length - 1)])
  }

  getGlyphByUnicode(code: number) {
    assert(this.fontDirectory.table.cmap)

    const cmap = this.getCmap()

    return this.readGlyph(cmap[code])
  }

  readGlyph(index: number): Glyph | null {
    assert(this.fontDirectory.table.glyf)

    const table = this.fontDirectory.table.glyf
    const cmap = this.getCmap()
    const { offset, length } = this.getGlyphOffset(index)

    if (offset === null) return null

    const {
      reader,
      tables: { hmtx },
    } = this

    const { advanceWidth, leftSideBearing } = (hmtx.hMetrics[index] ?? {
      advanceWidth: 0,
      leftSideBearing: 0,
    }) as LongHorMetric

    if (offset >= table.offset + table.length) return null

    const glyph: Glyph = {
      advanceWidth,
      leftSideBearing,
      unicode: this.getUnicode(cmap, index),
      name: this.getGlyphName(index),
      numberOfContours: 0,
      xMax: 0,
      xMin: 0,
      yMax: 0,
      yMin: 0,
    }

    if (length > 0) {
      reader.seek(offset)

      const numberOfContours = reader.getInt16()

      glyph.numberOfContours = numberOfContours
      glyph.xMin = reader.getFword()
      glyph.yMin = reader.getFword()
      glyph.xMax = reader.getFword()
      glyph.yMax = reader.getFword()

      assert(numberOfContours >= -1)

      if (numberOfContours >= 0) {
        this.readSimpleGlyph(glyph)
      } else {
        this.readCompoundGlyph(glyph)
      }
    }

    return glyph
  }

  readGlyphs(cb: (glyph: Glyph | null, index: number) => void) {
    const { numGlyphs } = this

    for (let i = 0; i <= numGlyphs; i += 1) {
      cb(this.readGlyph(i), i)
    }
  }

  createSVG(
    glyph: Glyph,
    {
      fontSize = 64,
      useBB = true,
      showPoints = false,
      showLines = false,
    }: CreateSvgOptions
  ) {
    const createGlyph = (
      glyph: Partial<Glyph> = { points: [], endPtsOfContours: [] },
      height = 0,
      scale = 1
    ) => {
      const points = glyph.points || []
      const length = points.length
      const docFrag = document.createDocumentFragment()

      let first = true
      let p = 0
      let c = 0
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      let d = ''
      let refPoints: any[] = []
      let ctrlPoints: any[] = []
      let p0 = null

      while (p < length) {
        const point: any = points[p]
        const x = point.x * scale
        const y = height - point.y * scale

        if (first) {
          p0 = point
          d += `M ${x} ${y}`

          path.setAttribute('d', d)
          path.setAttribute('fill-rule', 'evenodd')

          if (showPoints) {
            path.setAttribute('fill', 'grey')

            refPoints.push(createCircle(x, y, 'orange', scale))
          }

          first = false
        } else {
          if (point.onCurve) {
            if (ctrlPoints.length) {
              //@ts-ignore
              d += drawCurves(ctrlPoints, point, height, scale)
            } else {
              d += ` L ${x} ${y}`
            }

            path.setAttribute('d', d)

            if (showPoints) {
              refPoints.push(createCircle(x, y, 'blue', scale))
            }
          } else {
            ctrlPoints.push(point)

            if (showPoints) {
              refPoints.push(createCircle(x, y, 'red', scale))
            }
          }
        }

        if (p === glyph.endPtsOfContours![c]) {
          c += 1

          first = true

          if (!point.onCurve) {
            //@ts-ignore
            d += drawCurves(ctrlPoints, p0, height, scale)
          }

          path.setAttribute('d', d)

          docFrag.appendChild(path)

          if (showPoints) {
            refPoints.push(
              createCircle(
                point.x * scale,
                height - point.y * scale,
                point.onCurve ? 'black' : 'purple',
                scale
              )
            )
          }

          p0 = null

          ctrlPoints = []
        }

        p += 1
      }

      while (refPoints.length) {
        docFrag.appendChild(refPoints.pop())
      }

      return docFrag
    }

    // Default lineHeight = ascender - descender + LineGap

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const type = glyph.type
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // if (type === 'compound') {
    //   glyph.components!.forEach(
    //     (component) => (component.glyph = this.readGlyph(component.glyphIndex))
    //   )
    // }
    const { xMax, xMin, yMax, yMin } = useBB ? this : glyph

    let width = xMax - xMin
    const height = yMax - yMin

    const fontWidth = glyph.xMax - glyph.xMin

    // const fontHeight = glyph.yMax - glyph.yMin;
    // Well that is stupid, this does not preserve aspect ratio viewbox and svg dimensions

    const fontScale = fontSize / this.unitsPerEm
    const viewBoxScale = fontSize / this.unitsPerEm
    const ratio = useBB ? fontSize / height : 1

    // Position center on x axis of BB
    const minX = useBB
      ? -(((width - fontWidth - glyph.xMin) / 2) * viewBoxScale)
      : xMin * viewBoxScale
    const minY = Math.abs(yMin) * viewBoxScale
    const xHeight = this.tables['OS/2'].sxHeight

    const viewBoxWidth = (width < 0 ? 0 : width) * viewBoxScale
    const viewBoxHeight = (height < 0 ? 0 : height) * viewBoxScale

    if (useBB) {
      svg.setAttribute('height', fontSize.toString(10))
      svg.setAttribute('width', (ratio * width).toString(10))
    } else {
      svg.setAttribute('width', (width * fontScale).toString(10))
    }

    svg.setAttribute('viewBox', `${minX}, ${minY}, ${viewBoxWidth}, ${viewBoxHeight}`)

    // Insert lines
    if (showLines) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const xHeightLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')

      const descenderLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')

      const accendererLine = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      )

      descenderLine.setAttribute(
        'd',
        `M ${minX} ${viewBoxHeight + minY - 10 * viewBoxScale} H ${viewBoxWidth + minX}`
      )
      descenderLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
      descenderLine.setAttribute('stroke', 'grey')

      accendererLine.setAttribute(
        'd',
        `M ${minX} ${minY + 10 * viewBoxScale} H ${viewBoxWidth + minX}`
      )
      accendererLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
      accendererLine.setAttribute('stroke', 'grey')

      baseLine.setAttribute('d', `M ${minX} ${viewBoxHeight} H ${viewBoxWidth + minX}`)
      baseLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
      baseLine.setAttribute('stroke', 'grey')

      xHeightLine.setAttribute(
        'd',
        `M ${minX} ${viewBoxHeight - xHeight * viewBoxScale} H ${viewBoxWidth + minX}`
      )

      xHeightLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
      xHeightLine.setAttribute('stroke', 'grey')

      g.appendChild(baseLine)
      g.appendChild(xHeightLine)
      g.appendChild(descenderLine)
      g.appendChild(accendererLine)

      svg.appendChild(g)
    }

    if (type === 'compound') {
      glyph.components!.forEach(component => {
        const { a, b, c, d, e, f } = component.matrix

        const componentGlyph = this.readGlyph(component.glyphIndex)

        if (componentGlyph) {
          componentGlyph.points =
            componentGlyph.points?.map(point => transform([a, b, c, d, e, f], point)) ??
            []

          group.appendChild(createGlyph(componentGlyph, viewBoxHeight, viewBoxScale))
        }
      })
    } else {
      group.appendChild(createGlyph(glyph, viewBoxHeight, viewBoxScale))
    }

    svg.appendChild(group)

    return svg
  }
}

export default TrueTypeFont
