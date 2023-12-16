"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTableChecksum = void 0;
function calculateTableChecksum(binaryReader, offset, numberOfBytesInTable) {
    const previousPosition = binaryReader.seek(offset);
    let sum = 0;
    let nlongs = ((numberOfBytesInTable + 3) / 4) | 0;
    while (nlongs--) {
        sum = ((sum + binaryReader.getUint32()) & 0xffffffff) >>> 0;
    }
    binaryReader.seek(previousPosition);
    return sum;
}
exports.calculateTableChecksum = calculateTableChecksum;
//# sourceMappingURL=calculate-table-checksum.js.map