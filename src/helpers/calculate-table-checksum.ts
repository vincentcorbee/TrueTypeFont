import BinaryReader from '../modules/binary-reader'

export function calculateTableChecksum(
  binaryReader: BinaryReader,
  offset: any,
  numberOfBytesInTable: number
) {
  const previousPosition = binaryReader.seek(offset)

  let sum = 0
  let nlongs = ((numberOfBytesInTable + 3) / 4) | 0

  while (nlongs--) {
    sum = ((sum + binaryReader.getUint32()) & 0xffffffff) >>> 0
  }

  binaryReader.seek(previousPosition)

  return sum
}
