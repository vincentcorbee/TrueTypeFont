"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrueTypeCollection = void 0;
const helpers_1 = require("../helpers");
const binary_reader_1 = __importDefault(require("./binary-reader"));
const true_type_font_1 = require("./true-type-font");
class TrueTypeCollection {
    binaryReader;
    fontDirectories;
    tag;
    majorVersion;
    minorVersion;
    numFonts;
    dsigTag;
    dsigLength;
    dsigOffset;
    tableDirectoryOffsets;
    fonts;
    constructor(arrayBuffer) {
        this.binaryReader = new binary_reader_1.default(arrayBuffer);
        this.tag = this.binaryReader.getString(4);
        this.majorVersion = this.binaryReader.getUint16();
        this.minorVersion = this.binaryReader.getUint16();
        this.numFonts = this.binaryReader.getUint32();
        this.tableDirectoryOffsets = this.readTableDirectoryOffsets();
        if (this.majorVersion === 2) {
            this.dsigTag = this.binaryReader.getUint32();
            this.dsigLength = this.binaryReader.getUint32();
            this.dsigOffset = this.binaryReader.getUint32();
        }
        this.fonts = [];
        this.fontDirectories = this.readFontDirectories();
    }
    readTableDirectoryOffsets() {
        const { numFonts, binaryReader } = this;
        const tableDirectoryOffsets = [];
        for (let i = 0; i < numFonts; i++) {
            const offset = binaryReader.getUint32();
            tableDirectoryOffsets.push(offset);
        }
        return tableDirectoryOffsets;
    }
    getFont() {
        const { binaryReader } = this;
        const scalarType = binaryReader.getUint32();
        const numTables = binaryReader.getUint16();
        const searchRange = binaryReader.getUint16();
        const entrySelector = binaryReader.getUint16();
        const rangeShift = binaryReader.getUint16();
        const tables = [];
        const offsetToEndOfFontDirectory = 12 + numTables * 16;
        let byteLength = offsetToEndOfFontDirectory;
        for (let i = 0; i < numTables; i++) {
            const table = {
                tag: binaryReader.getUint32(),
                checksum: binaryReader.getUint32(),
                offset: binaryReader.getUint32(),
                length: binaryReader.getUint32(),
            };
            byteLength += table.length;
            tables.push(table);
        }
        const dataView = new DataView(new ArrayBuffer(byteLength));
        dataView.setUint32(0, scalarType);
        dataView.setUint16(4, numTables);
        dataView.setUint16(6, searchRange);
        dataView.setUint16(8, entrySelector);
        dataView.setUint16(10, rangeShift);
        const position = 12;
        let tableOffset = offsetToEndOfFontDirectory;
        tables.forEach((table, i) => {
            dataView.setUint32(position + i * 16, table.tag);
            dataView.setUint32(position + 4 + i * 16, table.checksum);
            dataView.setUint32(position + 8 + i * 16, tableOffset);
            dataView.setUint32(position + 12 + i * 16, table.length);
            binaryReader.seek(table.offset);
            for (let i = 0; i < table.length; i++)
                dataView.setUint8(tableOffset + i, binaryReader.getUint8());
            tableOffset += table.length;
        });
        return new true_type_font_1.TrueTypeFont(dataView.buffer);
    }
    readFontDirectories() {
        const { binaryReader } = this;
        const fontDirectories = [];
        const currentPosition = binaryReader.tell();
        this.tableDirectoryOffsets.forEach(offset => {
            binaryReader.seek(offset);
            this.fonts.push(this.getFont());
            binaryReader.seek(offset);
            fontDirectories.push((0, helpers_1.readFontDirectory)(binaryReader));
        });
        binaryReader.seek(currentPosition);
        return fontDirectories;
    }
}
exports.TrueTypeCollection = TrueTypeCollection;
//# sourceMappingURL=true-typ-collection.js.map