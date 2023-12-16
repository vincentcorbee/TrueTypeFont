"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrueTypeFont = void 0;
const binary_reader_1 = __importDefault(require("./binary-reader"));
const assert_1 = __importDefault(require("../helpers/assert"));
const uni_string_1 = __importDefault(require("../helpers/uni-string"));
const map_language_id_1 = __importDefault(require("../helpers/map-language-id"));
const map_name_id_1 = __importDefault(require("../helpers/map-name-id"));
const map_platform_id_1 = __importDefault(require("../helpers/map-platform-id"));
const map_platform_specific_id_1 = __importDefault(require("../helpers/map-platform-specific-id"));
const glyphs_1 = __importDefault(require("../helpers/glyphs"));
const helpers_1 = require("../helpers");
class TrueTypeFont {
    numGlyphs;
    fontDirectory;
    tables;
    platformID;
    platformSpecificID;
    languageID;
    reader;
    constructor(arrayBuffer) {
        this.reader = new binary_reader_1.default(arrayBuffer);
        this.fontDirectory = (0, helpers_1.readFontDirectory)(this.reader);
        this.tables = this.readTables();
        this.numGlyphs = this.getNumGlyphs();
        // Platform settings
        this.platformID = 3; // Microsoft
        this.platformSpecificID = 10; // Unicode
        this.languageID = 0x0409; // English United States
    }
    get buffer() {
        return this.reader.view.buffer;
    }
    get fontFamily() {
        return this.tables.name.nameRecords.find(record => record.nameID.name === 'FontFamily')?.nameID.value;
    }
    get fontSubfamily() {
        return this.tables.name.nameRecords.find(record => record.nameID.name === 'FontSubfamily')?.nameID.value;
    }
    get postScriptName() {
        return this.tables.name.nameRecords.find(record => record.nameID.name === 'PostScriptName')?.nameID.value;
    }
    get fullName() {
        return this.tables.name.nameRecords.find(record => record.nameID.name === 'FullName')?.nameID.value;
    }
    get version() {
        return this.tables.head.version ?? 0;
    }
    get fontRevision() {
        return this.tables.head.fontRevision ?? 0;
    }
    get checkSumAdjustment() {
        return this.tables.head.checkSumAdjustment ?? 0;
    }
    get magicNumber() {
        return this.tables.head.checkSumAdjustment ?? 0;
    }
    get flags() {
        return this.tables.head.flags ?? 0;
    }
    get italicAngle() {
        return this.tables.post.italicAngle ?? 0;
    }
    get isFixedPitch() {
        return this.tables.post.isFixedPitch ?? 0;
    }
    get unitsPerEm() {
        return this.tables.head.unitsPerEm ?? 0;
    }
    get created() {
        return this.tables.head.created;
    }
    get modified() {
        return this.tables.head.modified;
    }
    get xMin() {
        return this.tables.head.xMin ?? 0;
    }
    get yMin() {
        return this.tables.head.yMin ?? 0;
    }
    get xMax() {
        return this.tables.head.xMax ?? 0;
    }
    get yMax() {
        return this.tables.head.yMax ?? 0;
    }
    get BBox() {
        return [this.xMin, this.yMin, this.xMax, this.yMax];
    }
    get ascent() {
        return this.tables.hhea.ascent ?? 0;
    }
    get descent() {
        return this.tables.hhea.descent ?? 0;
    }
    get xHeight() {
        return this.tables['OS/2']?.sxHeight ?? 0;
    }
    get capHeight() {
        return this.tables['OS/2']?.sCapHeight ?? 0;
    }
    get macStyle() {
        return this.tables.head.macStyle ?? 0;
    }
    get lowestRecPPEM() {
        return this.tables.head.lowestRecPPEM ?? 0;
    }
    get fontDirectionHint() {
        return this.tables.head.fontDirectionHint ?? 0;
    }
    get indexToLocFormat() {
        return this.tables.head.indexToLocFormat ?? 0;
    }
    get glyphDataFormat() {
        return this.tables.head.glyphDataFormat ?? 0;
    }
    getNumGlyphs() {
        (0, assert_1.default)(this.fontDirectory.table.maxp);
        const table = this.fontDirectory.table.maxp;
        const reader = this.reader;
        const oldPos = reader.seek(table.offset + 4);
        const numGlyphs = reader.getUint16();
        reader.seek(oldPos);
        return numGlyphs;
    }
    readHheaTable(table) {
        const reader = this.reader;
        reader.seek(table.offset);
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
        };
    }
    readHmtxTable(table, tables) {
        const reader = this.reader;
        const numOfLongHorMetrics = tables.hhea.numOfLongHorMetrics;
        const hmtxTable = {
            hMetrics: [],
            leftSideBearing: [],
        };
        reader.seek(table.offset);
        for (let i = 0; i < numOfLongHorMetrics; i += 1) {
            // 0: advanceWidth (aw)
            // 1: leftSideBearing (lsb)
            hmtxTable.hMetrics.push({
                advanceWidth: reader.getUint16(),
                leftSideBearing: reader.getInt16(),
            });
        }
        if (hmtxTable.hMetrics.length < this.numGlyphs) {
            for (let i = 0, l = this.numGlyphs - numOfLongHorMetrics; i < l; i += 1) {
                hmtxTable.leftSideBearing.push(reader.getFword());
            }
        }
        return hmtxTable;
    }
    readPostTable(table) {
        const reader = this.reader;
        reader.seek(table.offset);
        const postTable = {
            format: reader.getFixed(),
            italicAngle: reader.getFixed(),
            underlinePosition: reader.getFword(),
            underlineThickness: reader.getFword(),
            isFixedPitch: reader.getUint32(),
            minMemType42: reader.getUint32(),
            maxMemType42: reader.getUint32(),
            minMemType1: reader.getUint32(),
            maxMemType1: reader.getUint32(),
        };
        if (postTable.format === 1) {
        }
        if (postTable.format === 2) {
            const numberOfGlyphs = reader.getUint16();
            const glyphNameIndex = [];
            const names = [];
            // assert(numberOfGlyphs === this.numGlyphs);
            for (let i = 0; i < numberOfGlyphs; i += 1) {
                glyphNameIndex.push(reader.getUint16());
            }
            for (let index of glyphNameIndex) {
                if (index >= 258 && index <= 32767) {
                    index -= 258;
                    const old = reader.tell();
                    for (let i = 0; i < index; i += 1) {
                        const length = reader.getUint8();
                        reader.seek(reader.tell() + length);
                    }
                    const length = reader.getUint8();
                    names.push({
                        name: reader.getString(length),
                        index: index + 258,
                    });
                    reader.seek(old);
                }
                else {
                    names.push({
                        name: glyphs_1.default[index],
                        index,
                    });
                }
            }
            postTable.numberOfGlyphs = numberOfGlyphs;
            postTable.glyphNameIndex = glyphNameIndex;
            postTable.names = names;
        }
        return postTable;
    }
    readNameTable(table) {
        const reader = this.reader;
        reader.seek(table.offset);
        const format = reader.getUint16();
        const count = reader.getUint16();
        const stringOffset = reader.getUint16();
        const nameRecords = [];
        for (let i = 0; i < count; i += 1) {
            const platformId = (0, map_platform_id_1.default)(reader.getUint16());
            const platformSpecificID = (0, map_platform_specific_id_1.default)(platformId.platform, reader.getUint16());
            const languageID = (0, map_language_id_1.default)(platformId.platform, reader.getUint16());
            const nameID = (0, map_name_id_1.default)(reader.getUint16());
            const length = reader.getUint16();
            const offset = reader.getUint16();
            const previousPosition = reader.seek(table.offset + stringOffset + offset);
            nameID.value = reader.getString(length);
            nameRecords.push({
                platformId,
                platformSpecificID,
                languageID,
                nameID,
                length,
                offset,
            });
            reader.seek(previousPosition);
        }
        return {
            format,
            count,
            stringOffset,
            nameRecords,
        };
    }
    readOS2Table(table) {
        const reader = this.reader;
        reader.seek(table.offset);
        const getPanose = (num, i) => {
            const bFamilyType = {
                0: 'Any',
                1: 'No Fit',
                2: 'Text and Display',
                3: 'Script',
                4: 'Decorative',
                5: 'Pictorial',
            };
            return num;
        };
        const OS2Table = {
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
        };
        const panose = [];
        for (let i = 0; i < 10; i += 1) {
            panose.push(getPanose(reader.getUint8(), i));
        }
        OS2Table.panose = panose;
        OS2Table.ulCharRange = [];
        for (let i = 0; i < 4; i += 1) {
            OS2Table.ulCharRange.push(reader.getUint32());
        }
        OS2Table.achVendID = reader.getString(4);
        OS2Table.fsSelection = reader.getUint16();
        OS2Table.fsFirstCharIndex = reader.getUint16();
        OS2Table.fsLastCharIndex = reader.getUint16();
        if (OS2Table.version > 0) {
            OS2Table.sTypoAscender = reader.getInt16();
            OS2Table.sTypoDescender = reader.getInt16();
            OS2Table.sTypoLineGap = reader.getInt16();
            OS2Table.usWinAscent = reader.getUint16();
            OS2Table.usWinDescent = reader.getUint16();
            OS2Table.ulCodePageRange1 = reader.getUint32();
            OS2Table.ulCodePageRange2 = reader.getUint32();
            OS2Table.sxHeight = reader.getInt16();
            OS2Table.sCapHeight = reader.getInt16();
            OS2Table.usDefaultChar = reader.getUint16();
            OS2Table.usBreakChar = reader.getUint16();
            OS2Table.usMaxContext = reader.getUint16();
            OS2Table.usLowerPointSize = reader.getUint16();
            OS2Table.usUpperPointSize = reader.getUint16();
        }
        return OS2Table;
    }
    readCmapTable(table) {
        const reader = this.reader;
        reader.seek(table.offset);
        const version = reader.getUint16();
        const numberSubtables = reader.getUint16();
        const encodingRecords = [];
        const header = {
            version,
            numberSubtables,
        };
        // Currently only format 0, 4, 6 and 12 are implemented
        for (let i = 0; i < numberSubtables; i += 1) {
            const platformID = (0, map_platform_id_1.default)(reader.getUint16());
            const platformSpecificID = (0, map_platform_specific_id_1.default)(platformID.platform, reader.getUint16());
            const offset = reader.getUint32();
            const previousPosition = reader.seek(table.offset + offset);
            const format = reader.getUint16();
            const encodingRecord = {
                platformID,
                platformSpecificID,
                offset,
            };
            // console.log({ format, encodingRecord })
            if (format === 0) {
                const glyphIndexArray = [];
                for (let i = 0; i < 256; i += 1) {
                    glyphIndexArray.push(reader.getUint8());
                }
                encodingRecords.push({
                    ...encodingRecord,
                    format,
                    length: reader.getUint16(),
                    language: reader.getUint16(),
                    glyphIndexArray,
                });
            }
            if (format === 4) {
                const length = reader.getUint16();
                const language = reader.getUint16();
                const segCountX2 = reader.getUint16();
                const searchRange = reader.getUint16();
                const entrySelector = reader.getUint16();
                const rangeShift = reader.getUint16();
                const segCount = segCountX2 / 2;
                const glyphIndexMap = {};
                const segments = [];
                const endCodeOffset = reader.tell();
                const startCodeOffset = endCodeOffset + segCountX2 + 2;
                const idDeltaOffset = startCodeOffset + segCountX2;
                const idRangeOffsetPosition = idDeltaOffset + segCountX2;
                for (let i = 0; i < segCount; i += 1) {
                    const segment = {
                        endCode: reader.getUint16(),
                        startCode: reader.goTo(startCodeOffset + i * 2).getUint16(),
                        idDelta: reader.goTo(idDeltaOffset + i * 2).getUint16(),
                        idRangeOffset: reader.goTo(idRangeOffsetPosition + i * 2).getUint16(),
                    };
                    const { endCode, idDelta, startCode, idRangeOffset } = segment;
                    let charCode = startCode;
                    do {
                        if (idRangeOffset === 0) {
                            glyphIndexMap[charCode] = (idDelta + charCode) % 65536;
                        }
                        else {
                            reader.seek(idRangeOffsetPosition +
                                segCountX2 +
                                (i - segCount + idRangeOffset / 2 + (charCode - startCode)) * 2);
                            glyphIndexMap[charCode] = (reader.getUint16() + idDelta) % 65536;
                        }
                        charCode += 1;
                    } while (charCode <= endCode);
                    segments.push(segment);
                    reader.seek(endCodeOffset + 2 + i * 2);
                }
                encodingRecords.push({
                    ...encodingRecord,
                    format,
                    length,
                    language,
                    glyphIndexMap,
                    segments,
                    segCountX2,
                    searchRange,
                    entrySelector,
                    rangeShift,
                    segCount,
                });
            }
            if (format === 6) {
                const length = reader.getUint16();
                const language = reader.getUint16();
                const firstCode = reader.getUint16();
                const entryCode = reader.getUint16();
                const glyphIndexArray = [];
                for (let i = 0; i < entryCode; i++) {
                    glyphIndexArray.push(reader.getUint16());
                }
                encodingRecords.push({
                    ...encodingRecord,
                    format,
                    length,
                    language,
                    firstCode,
                    entryCode,
                    glyphIndexArray,
                });
            }
            if (format === 12) {
                const reserved = reader.getUint16();
                const length = reader.getUint32();
                const language = reader.getUint32();
                const numGroups = reader.getUint32();
                const glyphIndexMap = {};
                const groups = [];
                for (let i = 0; i < numGroups; i += 1) {
                    groups.push({
                        startCharCode: reader.getUint32(),
                        endCharCode: reader.getUint32(),
                        startGlyphID: reader.getUint32(),
                    });
                    groups.sort((recordA, recordB) => recordA.startCharCode - recordB.startCharCode);
                }
                groups.forEach((group) => {
                    let c = group.startCharCode;
                    let e = group.endCharCode;
                    let id = group.startGlyphID;
                    do {
                        glyphIndexMap[c] = id;
                        id += 1;
                        c += 1;
                    } while (c <= e);
                });
                encodingRecords.push({
                    ...encodingRecord,
                    format,
                    reserved,
                    length,
                    language,
                    numGroups,
                    glyphIndexMap,
                    groups,
                });
            }
            reader.seek(previousPosition);
        }
        encodingRecords.sort((recordA, recordB) => recordA.platformID.id - recordB.platformID.id ||
            recordA.platformSpecificID - recordB.platformSpecificID);
        const cmapTable = {
            header,
            encodingRecords,
        };
        return cmapTable;
    }
    readGSUBTable(table) {
        const reader = this.reader;
        reader.seek(table.offset);
        const GSUBTable = {
            majorVersion: reader.getUint16(),
            minorVersion: reader.getUint16(),
            scriptListOffset: reader.getUint16(),
            featureListOffset: reader.getUint16(),
            lookupListOffset: reader.getUint16(),
            scriptList: {},
            featureList: {},
        };
        if (GSUBTable.minorVersion === 1)
            GSUBTable.featureVariationsOffset = reader.getUint32();
        // ScriptList
        let offset = reader.seek(table.offset + GSUBTable.scriptListOffset);
        const scriptList = {
            scriptCount: reader.getUint16(),
            scriptRecords: [],
        };
        for (let i = 0, l = scriptList.scriptCount; i < l; i += 1) {
            const tagName = reader.getString(4);
            const scriptOffset = reader.getUint16();
            const old = reader.seek(offset + scriptOffset);
            const defaultLangSysOffset = reader.getUint16();
            const langSysCount = reader.getUint16();
            const langSysRecords = [];
            for (let i = 0; i < langSysCount; i += 1) {
                const langSysTag = reader.getString(4);
                const langSysOffset = reader.getUint16();
                const old = reader.seek(offset + scriptOffset + langSysOffset);
                const lookupOrder = reader.getUint16();
                const requiredFeatureIndex = reader.getUint16() !== 0xffff;
                const featureIndexCount = reader.getUint16();
                const featureIndices = [];
                for (let i = 0; i < featureIndexCount; i += 1) {
                    featureIndices.push(reader.getUint16());
                }
                const LangSysRecord = {
                    langSysTag,
                    langSysOffset,
                    lookupOrder,
                    requiredFeatureIndex,
                    featureIndexCount,
                    featureIndices,
                };
                langSysRecords.push(LangSysRecord);
                reader.seek(old);
            }
            const record = {
                tagName,
                scriptOffset,
                defaultLangSysOffset,
                langSysRecords,
            };
            scriptList.scriptRecords.push(record);
            reader.seek(old);
        }
        GSUBTable.scriptList = scriptList;
        // FeatureList
        offset = reader.seek(table.offset + GSUBTable.featureListOffset);
        const featureList = {
            featureListCount: reader.getUint16(),
            featureRecords: [],
        };
        for (let i = 0, l = featureList.featureListCount; i < l; i += 1) {
            const featureTag = reader.getString(4);
            const featureOffset = reader.getUint16();
            const old = reader.seek(table.offset + GSUBTable.featureListOffset + featureOffset);
            const featureParams = reader.getUint16();
            const lookupIndexCount = reader.getUint16();
            const lookupListIndices = [];
            for (let i = 0, l = lookupIndexCount; i < l; i += 1) {
                lookupListIndices.push(reader.getUint16());
            }
            const featureRecord = {
                featureTag,
                featureOffset,
                featureParams,
                lookupIndexCount,
                lookupListIndices,
            };
            featureList.featureRecords.push(featureRecord);
            reader.seek(old);
        }
        GSUBTable.featureList = featureList;
        // LookupList
        // Flags
        const rightToLeft = 0x0001;
        const ignoreBaseGlyphs = 0x0002;
        const ignoreLigatures = 0x0004;
        const ignoreMarks = 0x0008;
        const useMarkFilteringSet = 0x0010;
        // reserved = 0x00E0
        const markAttachmentType = 0xff00;
        offset = reader.seek(table.offset + GSUBTable.lookupListOffset);
        const lookupCount = reader.getUint16();
        const lookups = [];
        for (let i = 0; i < lookupCount; i += 1) {
            const offset = reader.getUint16();
            const pos = table.offset + GSUBTable.lookupListOffset + offset;
            const old = reader.seek(pos);
            const lookupType = reader.getUint16();
            const lookupFlag = reader.getUint16();
            const subTableCount = reader.getUint16();
            const subtableOffsets = [];
            const subTables = [];
            for (let i = 0; i < subTableCount; i += 1) {
                subtableOffsets.push(reader.getUint16());
            }
            reader.seek(pos + subtableOffsets[0]);
            const substFormat = reader.getUint16();
            const coverageOffset = reader.getUint16();
            const inter = reader.seek(pos + subtableOffsets[0] + coverageOffset);
            const coverageFormat = reader.getUint16();
            const coverageTable = {
                coverageFormat,
            };
            if (coverageFormat === 1) {
                const glyphCount = reader.getUint16();
                const glyphArray = [];
                for (let i = 0; i < glyphCount; i += 1) {
                    glyphArray.push(reader.getUint16());
                }
                coverageTable.glyphCount = glyphCount;
                coverageTable.glyphArray = glyphArray;
            }
            else if (coverageFormat === 2) {
                const rangeCount = reader.getUint16();
                const rangeRecords = [];
                for (let i = 0; i < rangeCount; i += 1) {
                    rangeRecords.push({
                        startGlyphID: reader.getUint16(),
                        endGlyphID: reader.getUint16(),
                        startCoverageIndex: reader.getUint16(),
                    });
                }
                coverageTable.rangeCount = rangeCount;
                coverageTable.rangeRecords = rangeRecords;
            }
            reader.seek(inter);
            const subTable = {
                substFormat,
                coverageOffset,
                coverageTable,
            };
            if (lookupType === 1) {
                if (substFormat === 1) {
                    subTable.deltaGlyphID = reader.getInt16();
                }
                else if (substFormat === 2) {
                    const glyphCount = reader.getUint16();
                    const substituteGlyphIDs = [];
                    for (let i = 0; i < glyphCount; i += 1) {
                        substituteGlyphIDs.push(reader.getUint16());
                    }
                }
            }
            else if (lookupType === 2) {
            }
            else if (lookupType === 3) {
            }
            else if (lookupType === 4) {
                const ligatureSetCount = reader.getUint16();
                const ligatureSets = [];
                for (let i = 0; i < ligatureSetCount; i += 1) {
                    const ligatureSetOffset = reader.getUint16();
                    const old = reader.seek(pos + subtableOffsets[0] + ligatureSetOffset);
                    const ligatureCount = reader.getUint16();
                    const ligatures = [];
                    for (let i = 0; i < ligatureCount; i += 1) {
                        const ligatureOffset = reader.getUint16();
                        const old = reader.seek(pos + subtableOffsets[0] + ligatureSetOffset + ligatureOffset);
                        const ligatureGlyph = reader.getUint16();
                        const componentCount = reader.getUint16();
                        const componentGlyphIDs = [];
                        for (let i = 0; i < componentCount - 1; i += 1) {
                            componentGlyphIDs.push(reader.getUint16());
                        }
                        ligatures.push({
                            ligatureGlyph,
                            ligatureOffset,
                            componentCount,
                            componentGlyphIDs,
                        });
                        reader.seek(old);
                    }
                    ligatureSets.push({
                        ligatureCount,
                        ligatures,
                    });
                    reader.seek(old);
                }
                subTable.ligatureSetCount = ligatureSetCount;
                subTable.ligatureSets = ligatureSets;
            }
            else if (lookupType === 5) {
            }
            else if (lookupType === 6) {
            }
            subTables.push(subTable);
            const lookup = {
                lookupType,
                lookupFlag,
                subTableCount,
                subtableOffsets,
                subTables,
            };
            if (lookupFlag & useMarkFilteringSet) {
                lookup.markFilteringSet = reader.getUint16();
            }
            lookups.push(lookup);
            reader.seek(old);
        }
        const lookupList = {
            lookupCount,
            lookups,
        };
        GSUBTable.lookupList = lookupList;
        return GSUBTable;
    }
    readTables() {
        const { table } = this.fontDirectory;
        const tables = {};
        for (const name in table) {
            const tableEntry = table[name];
            switch (name) {
                case 'head':
                    tables[name] = this.readHeadTable(tableEntry);
                    break;
                case 'hhea':
                    tables[name] = this.readHheaTable(tableEntry);
                    break;
                case 'hmtx':
                    tables[name] = this.readHmtxTable(tableEntry, tables);
                    break;
                case 'post':
                    tables[name] = this.readPostTable(tableEntry);
                    break;
                case 'name':
                    tables[name] = this.readNameTable(tableEntry);
                    break;
                case 'OS/2':
                    tables[name] = this.readOS2Table(tableEntry);
                    break;
                case 'cmap':
                    tables[name] = this.readCmapTable(tableEntry);
                    break;
                case 'GSUB':
                    tables[name] = this.readGSUBTable(tableEntry);
                    break;
                default:
                    break;
            }
        }
        return tables;
    }
    readHeadTable(table) {
        const reader = this.reader;
        reader.seek(table.offset);
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
        };
        (0, assert_1.default)(headTable.magicNumber === 0x5f0f3cf5);
        return headTable;
    }
    readCoords(points, numPoints, axis, flags, byteFlag, deltaFlag) {
        let value = 0;
        const { reader } = this;
        for (let i = 0; i < numPoints; i++) {
            const flag = flags[i];
            if (flag & byteFlag) {
                if (flag & deltaFlag) {
                    value += reader.getUint8();
                }
                else {
                    value -= reader.getUint8();
                }
            }
            else if (~flag & deltaFlag) {
                value += reader.getInt16();
            }
            points[i][axis] = value;
        }
    }
    readCompoundGlyph(glyph) {
        const ARG_1_AND_2_ARE_WORDS = 1;
        const ARGS_ARE_XY_VALUES = 2;
        const ROUND_XY_TO_GRID = 4;
        const WE_HAVE_A_SCALE = 8;
        // reserverd 16
        const MORE_COMPONENTS = 32;
        const WE_HAVE_AN_X_AND_Y_SCALE = 64;
        const WE_HAVE_A_TWO_BY_TWO = 128;
        const WE_HAVE_INSTRUCTIONS = 256;
        const USE_MY_METRICS = 512;
        const OVERLAP_COMPOUND = 1024;
        const { reader } = this;
        let flags;
        glyph.type = 'compound';
        glyph.components = [];
        do {
            let arg1;
            let arg2;
            flags = reader.getUint16();
            // a: xScale
            // b:
            // c:
            // d: yScale
            // e: xOffset
            // f: yOffset
            const component = {
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
            };
            if (flags & ARG_1_AND_2_ARE_WORDS) {
                arg1 = reader.getFword();
                arg2 = reader.getFword();
            }
            else {
                arg1 = reader.getInt8();
                arg2 = reader.getInt8();
            }
            if (flags & WE_HAVE_A_SCALE) {
                component.matrix.a = reader.get2Dot14();
                component.matrix.d = component.matrix.a;
            }
            else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
                component.matrix.a = reader.get2Dot14();
                component.matrix.d = reader.get2Dot14();
            }
            else if (flags & WE_HAVE_A_TWO_BY_TWO) {
                component.matrix.a = reader.get2Dot14();
                component.matrix.b = reader.get2Dot14();
                component.matrix.c = reader.get2Dot14();
                component.matrix.d = reader.get2Dot14();
            }
            if (flags & ARGS_ARE_XY_VALUES) {
                component.matrix.e = arg1;
                component.matrix.f = arg2;
            }
            else {
                component.destPointIndex = arg1;
                component.srcPointIndex = arg2;
            }
            glyph.components.push(component);
        } while (flags & MORE_COMPONENTS);
        if (flags & WE_HAVE_INSTRUCTIONS) {
            glyph.instructions = [];
            const numInstr = reader.getUint16();
            for (let i = 0; i < numInstr; i += 1) {
                glyph.instructions.push(reader.getUint8());
            }
        }
    }
    readSimpleGlyph(glyph) {
        const reader = this.reader;
        const ON_CURVE = 1;
        const X_IS_BYTE = 2;
        const Y_IS_BYTE = 4;
        const REPEAT = 8;
        const X_DELTA = 16;
        const Y_DELTA = 32;
        const flags = [];
        glyph.type = 'simple';
        glyph.endPtsOfContours = [];
        glyph.points = [];
        glyph.instructions = [];
        for (let i = 0; i < glyph.numberOfContours; i += 1) {
            glyph.endPtsOfContours.push(reader.getUint16());
        }
        const instructionLength = reader.getUint16();
        for (let i = 0; i < instructionLength; i += 1) {
            glyph.instructions.push(reader.getUint8());
        }
        const numPoints = glyph.endPtsOfContours[glyph.numberOfContours - 1] + 1;
        for (let i = 0; i < numPoints; i += 1) {
            const flag = reader.getUint8();
            flags.push(flag);
            glyph.points.push({
                onCurve: (flag & ON_CURVE) > 0,
                x: 0,
                y: 0,
            });
            if (flag & REPEAT) {
                let repeatCount = reader.getUint8();
                (0, assert_1.default)(repeatCount > 0);
                i += repeatCount;
                while (repeatCount--) {
                    flags.push(flag);
                    glyph.points.push({
                        onCurve: (flag & ON_CURVE) > 0,
                        x: 0,
                        y: 0,
                    });
                }
            }
        }
        this.readCoords(glyph.points, numPoints, 'x', flags, X_IS_BYTE, X_DELTA);
        this.readCoords(glyph.points, numPoints, 'y', flags, Y_IS_BYTE, Y_DELTA);
    }
    getUnicode(codes, index) {
        for (let code in codes) {
            if (codes[code] === index) {
                if (parseInt(code, 10) === 0xffff)
                    return 'none';
                code = parseInt(code).toString(16).toUpperCase();
                while (code.length < 4) {
                    code = '0' + code;
                }
                return 'U+' + code;
            }
        }
        return 'none';
    }
    getGlyphIndexMap() {
        return (this.tables.cmap.encodingRecords.find((record) => record.platformID.id === this.platformID &&
            record.platformSpecificID.id === this.platformSpecificID)?.glyphIndexMap ??
            this.tables.cmap.encodingRecords.find((record) => record.platformID.id === 0 && record.platformSpecificID.id === 3)?.glyphIndexMap ??
            this.tables.cmap.encodingRecords[this.tables.cmap.encodingRecords.length - 1]
                .glyphIndexMap);
    }
    getGlyphOffset(index) {
        if (index > this.numGlyphs)
            return { offset: null, length: 0 };
        (0, assert_1.default)(this.fontDirectory.table.loca);
        const { loca: { offset: offsetLoca }, } = this.fontDirectory.table;
        const reader = this.reader;
        let offset = 0;
        let length = 0;
        if (this.indexToLocFormat === 1) {
            reader.seek(offsetLoca + index * 4);
            offset = reader.getUint32();
            length = reader.getUint32() - (index === this.numGlyphs ? 0 : offset);
        }
        else {
            reader.seek(offsetLoca + index * 2);
            offset = reader.getUint16() * 2;
            length = reader.getUint16() * 2 - (index === this.numGlyphs ? 0 : offset);
        }
        (0, assert_1.default)(this.fontDirectory.table.glyf);
        return { offset: offset + this.fontDirectory.table.glyf.offset, length };
    }
    getGlyphName(index) {
        return this.tables.post.names ? this.tables.post?.names[index].name : '';
    }
    getGlyphByChar(char) {
        (0, assert_1.default)(this.fontDirectory.table.cmap);
        const us = (0, uni_string_1.default)(char);
        const glyphIndexMap = this.getGlyphIndexMap();
        try {
            return this.readGlyph(glyphIndexMap[us.codePointAt(us.length - 1)] ?? 0);
        }
        catch {
            return this.readGlyph(0);
        }
    }
    getGlyphByUnicode(code) {
        (0, assert_1.default)(this.fontDirectory.table.cmap);
        const cmap = this.getGlyphIndexMap();
        try {
            return this.readGlyph(cmap[code]);
        }
        catch {
            return this.readGlyph(0);
        }
    }
    getGlyphByName(name) {
        (0, assert_1.default)(this.fontDirectory.table.cmap);
        if (this.tables.post.names) {
            const nameEntry = Object.entries(this.tables.post.names).find((entry) => entry[1].name === name);
            return this.readGlyph(nameEntry ? nameEntry[0] : 0);
        }
        return this.readGlyph(0);
    }
    readGlyph(glyphIndex) {
        (0, assert_1.default)(this.fontDirectory.table.glyf);
        const table = this.fontDirectory.table.glyf;
        const glyphIndexMap = this.getGlyphIndexMap();
        const { offset, length } = this.getGlyphOffset(glyphIndex);
        if (offset === null)
            return null;
        const { reader, tables: { hmtx }, } = this;
        const { advanceWidth, leftSideBearing } = (hmtx.hMetrics[glyphIndex] ?? {
            advanceWidth: 0,
            leftSideBearing: 0,
        });
        if (offset >= table.offset + table.length)
            return null;
        const characterCode = Object.entries(glyphIndexMap).find(entry => entry[1] === glyphIndex);
        const glyph = {
            advanceWidth,
            leftSideBearing,
            characterCode: characterCode ? parseInt(characterCode[0], 10) : 0,
            unicode: this.getUnicode(glyphIndexMap, glyphIndex),
            name: this.getGlyphName(glyphIndex),
            glyphIndex,
            numberOfContours: 0,
            xMax: 0,
            xMin: 0,
            yMax: 0,
            yMin: 0,
        };
        if (length > 0) {
            reader.seek(offset);
            const numberOfContours = reader.getInt16();
            glyph.numberOfContours = numberOfContours;
            glyph.xMin = reader.getFword();
            glyph.yMin = reader.getFword();
            glyph.xMax = reader.getFword();
            glyph.yMax = reader.getFword();
            (0, assert_1.default)(numberOfContours >= -1);
            if (numberOfContours >= 0) {
                this.readSimpleGlyph(glyph);
            }
            else {
                this.readCompoundGlyph(glyph);
            }
        }
        return glyph;
    }
    readGlyphs(cb) {
        const { numGlyphs } = this;
        for (let i = 0; i <= numGlyphs; i += 1) {
            cb(this.readGlyph(i), i);
        }
    }
}
exports.TrueTypeFont = TrueTypeFont;
//# sourceMappingURL=true-type-font.js.map