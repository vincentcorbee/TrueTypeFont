"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFontDirectory = void 0;
const calculate_table_checksum_1 = require("./calculate-table-checksum");
function readFontDirectory(binaryReader) {
    const table = {};
    const scalarType = binaryReader.getUint32();
    const numTables = binaryReader.getUint16();
    const searchRange = binaryReader.getUint16();
    const entrySelector = binaryReader.getUint16();
    const rangeShift = binaryReader.getUint16();
    const offset = {
        scalarType,
        numTables,
        searchRange,
        entrySelector,
        rangeShift,
    };
    for (let i = 0; i < numTables; i++) {
        /* Tag is 4 bytes */
        const tag = binaryReader.getString(4);
        const checksum = binaryReader.getUint32();
        const offset = binaryReader.getUint32();
        const length = binaryReader.getUint32();
        table[tag] = {
            tag,
            checksum,
            offset,
            length,
        };
        const calculatedChecksum = (0, calculate_table_checksum_1.calculateTableChecksum)(binaryReader, offset, length);
        // if (!['head', 'meta', 'post', 'prep', 'fpgm', 'cvt ', 'hmtx'].includes(tag)) {
        try {
            // assert(calculatedChecksum === checksum)
        }
        catch {
            console.log(`Checksum failed for: "${tag}" Given: ${checksum}, calculated: ${calculatedChecksum}`);
        }
        // }
    }
    return {
        offset,
        table,
    };
}
exports.readFontDirectory = readFontDirectory;
//# sourceMappingURL=read-font-directory.js.map