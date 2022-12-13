import assert from '../lib/assert'

export const getBitCount = (number: number) => {
  let bit_count = 0

  while (number) {
    number >>= 1
    bit_count++
  }

  return bit_count
}

class BinaryReader {
  public view: DataView
  public pos: number
  private bit_pos: number
  private chunk: any
  private bit_count: number
  private littleEndian: boolean

  constructor(arrayBuffer: ArrayBuffer) {
    this.view = new DataView(arrayBuffer)
    this.pos = 0
    this.bit_pos = -1
    this.chunk = null
    this.bit_count = 0
    this.littleEndian = false
  }

  setLittleEndian(littleEndian: boolean) {
    this.littleEndian = littleEndian
  }

  tell() {
    return this.pos
  }

  seek(pos: number) {
    assert(pos >= 0 && pos <= this.view.byteLength)

    const oldPos = this.pos

    this.pos = pos

    return oldPos
  }

  peak(index = this.pos + 1) {
    if (this.view.byteLength > index && index > -1) return this.view.getUint8(index)

    return null
  }

  peakBit() {
    const chunk = this.chunk
    const pos = this.pos
    const bit_pos = this.bit_pos
    const bit_count = this.bit_count
    const bit = this.getBit()

    this.bit_pos = bit_pos
    this.chunk = chunk
    this.pos = pos
    this.bit_count = bit_count

    return bit
  }

  getPadSize() {
    if (this.chunk === null) {
      return 0
    } else {
      const bit_count = getBitCount(this.chunk)

      return 8 - bit_count
    }
  }

  getBitPos() {
    return getBitCount(this.chunk) - 1 + this.getPadSize()
  }

  getBit() {
    if (this.bit_pos === -1) {
      this.chunk = this.getData()

      this.bit_pos = this.getBitPos()
      this.bit_count = getBitCount(this.chunk)
    }

    if (this.chunk === null) return null

    const bit_count = this.bit_count
    const bit = this.bit_pos >= bit_count ? 0 : (this.chunk >> this.bit_pos) & 1

    this.bit_pos--

    return bit
  }

  getData(type: string = 'Uint8') {
    if (this.view.byteLength > this.pos) {
      this.bit_pos = -1

      // @ts-ignore
      return this.view[`get${type}`](this.pos++)
    }

    return null
  }

  getUint8() {
    return this.getData()
  }

  getInt8() {
    return this.getData('Int8')
  }

  getUint16() {
    if (this.littleEndian) {
      const hi = this.getData()
      const lo = this.getData()

      return (lo << 8) | hi
    }

    return ((this.getUint8() << 8) | this.getUint8()) >>> 0
  }

  getUint32() {
    if (this.littleEndian) {
      const a = this.getData()
      const b = this.getData()
      const c = this.getData()
      const d = this.getData()

      return (d << 24) | (c << 16) | (b << 8) | a
    }

    return this.getInt32() >>> 0
  }

  getInt16() {
    let result = this.getUint16()

    if (result & 0x8000) result -= 1 << 16

    return result
  }

  getInt32() {
    return (
      (this.getUint8() << 24) |
      (this.getUint8() << 16) |
      (this.getUint8() << 8) |
      this.getUint8()
    )
  }

  getFword() {
    return this.getInt16()
  }

  getuFword() {
    return this.getUint16()
  }

  get2Dot14() {
    return this.getInt16() / (1 << 14)
  }

  getFixed() {
    return this.getInt32() / (1 << 16)
  }

  getString(length: number) {
    let result = ''

    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(this.getUint8())
    }

    return result
  }

  getLongDateTime() {
    const macTime = this.getUint32() * 0x100000000 + this.getUint32()
    const utcTime = macTime * 1000 + Date.UTC(1904, 1, 1)

    return new Date(utcTime)
  }
}

export default BinaryReader
