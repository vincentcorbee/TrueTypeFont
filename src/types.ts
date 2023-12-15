export type TableName =
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

export type RequiredTableName = Extract<
  TableName,
  'cmap' | 'glyf' | 'head' | 'hhea' | 'hmtx' | 'loca' | 'maxp' | 'name' | 'post'
>

export type OptionalTableName = Extract<
  TableName,
  'OS/2' | 'cvt' | 'pfgm' | 'hdmx' | 'kern' | 'prep' | 'GSUB'
>

export type OptionalTables = {
  [key in OptionalTableName]?: any
}

export type RequiredTables = {
  [key in RequiredTableName]: any
}

export type Tables = OptionalTables & RequiredTables

export type FontDirectory = {
  offset: FontDirectoryOffset
  table: FontDirectoryTable
}

export type FontDirectoryOffset = {
  scalarType: number
  numTables: number
  searchRange: number
  entrySelector: number
  rangeShift: number
}
export type FontDirectoryTableEntry = {
  checksum: number
  length: number
  offset: number
  tag: TableName
}

export type FontDirectoryTable = {
  [key in TableName]: FontDirectoryTableEntry
}

export type HeadTable = {
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

export type CmapTable = {
  header: {
    version: number
    numberSubtables: number
  }
  encodingRecords: EncodingRecords
}

type CmapSubtable<T> = {
  format: T
  length: number
  language: number
}

export type CmapSubtable0 = CmapSubtable<0> & {
  glyphIndexArray: number[]
}

export type CmapSubtable4 = CmapSubtable<4> & {
  segCountX2: number
  searchRange: number
  entrySelector: number
  glyphIndexArray: number[]
  glyphIndexMap: GlyphIndexMap
  segments: CmapSubtable4Segment[]
}

export type CmapSubtable4Segment = {
  endCode: number
  startCode: number
  idDelta: number
  idRangeOffset: number
}

export type GlyphIndexMap = Record<number, number>

export type EncodingRecord = {
  platformID: PlatformId
  platformSpecificID: PlatformSpecificID
  offset: number
}

export type EncodingRecord0 = EncodingRecord & CmapSubtable0

export type EncodingRecord4 = EncodingRecord & CmapSubtable4

export type EncodingRecords = (EncodingRecord0 | EncodingRecord4)[]

export type PlatformSpecificID = {
  encoding: string
  id: number
}

export type PlatformId = {
  id: number
  platform: Platform
  desc: string
}

export type platformSpecificID = {
  encoding: platformSpecificEncoding
}

export type platformSpecificEncoding =
  | 'Roman'
  | 'Japanese'
  | 'Traditional Chinese'
  | 'Korean'
  | 'Arabic'
  | 'Hebrew'
  | 'Greek'
  | 'Symbol'
  | 'Unicode BMP'
  | 'Unicode full repertoire'
  | 'Unicode 1.0 semantics'
  | "Unicode 2.0 and onwards semantics, Unicode BMP only ('cmap' subtable formats 0, 4, 6)"

export type Platform = 'Microsoft' | 'Macintosh' | 'Unicode'

export type HmtxTable = {
  hMetrics: LongHorMetric[]
  leftSideBearing: number[]
}

export type PostTable = {
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

export type NameTable = {
  format: number
  count: number
  stringOffset: number
  nameRecords: NameRecord[]
}

export type PostTableName = {
  name: string
  index: number
}

export type LongHorMetric = {
  advanceWidth: number
  leftSideBearing: number
}

export type NameRecord = {
  platformId: any
  platformSpecificID: any
  languageID: any
  nameID: any
  length: number
  offset: number
}

export type CreateSvgOptions = {
  fontSize?: number
  useBB?: boolean
  showPoints?: boolean
  showLines?: boolean
}

export type Glyph = {
  advanceWidth: number
  leftSideBearing: number
  unicode: string
  numberOfContours: number
  type?: 'compound' | 'simple'
  components?: Component[]
  instructions?: number[]
  endPtsOfContours?: number[]
  points?: Point[]
  glyphIndex: number
  characterCode: number
  name: string
  xMax: number
  xMin: number
  yMax: number
  yMin: number
}

export type Component = {
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

export type Point = {
  onCurve: boolean
  x: number
  y: number
}
