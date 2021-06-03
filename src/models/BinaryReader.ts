import assert from "../lib/assert"

class BinaryReader {
  public view: DataView
  public pos: number

  constructor(arrayBuffer: ArrayBuffer) {
    this.view = new DataView(arrayBuffer);
    this.pos = 0;
  }
  tell() {
    return this.pos;
  }
  seek(pos: number) {
    assert(pos >= 0 && pos <= this.view.byteLength);

    const oldPos = this.pos;

    this.pos = pos;

    return oldPos;
  }
  getData(type: string = "Uint8") {
    assert(this.pos < this.view.byteLength);

    //@ts-ignore
    return this.view[`get${type}`](this.pos++);
  }
  getUint8() {
    return this.getData();
  }
  getInt8() {
    return this.getData("Int8");
  }
  getUint16() {
    return ((this.getUint8() << 8) | this.getUint8()) >>> 0;
  }
  getUint32() {
    return this.getInt32() >>> 0;
  }
  getInt16() {
    let result = this.getUint16();

    if (result & 0x8000) {
      result -= 1 << 16;
    }

    return result;
  }
  getInt32() {
    return (
      (this.getUint8() << 24) |
      (this.getUint8() << 16) |
      (this.getUint8() << 8) |
      this.getUint8()
    );
  }
  getFword() {
    return this.getInt16();
  }
  getuFword() {
    return this.getUint16();
  }
  get2Dot14() {
    return this.getInt16() / (1 << 14);
  }
  getFixed() {
    return this.getInt32() / (1 << 16);
  }
  getString(length: number) {
    let result = "";

    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(this.getUint8());
    }

    return result;
  }
  getLongDateTime() {
    const macTime = this.getUint32() * 0x100000000 + this.getUint32();
    const utcTime = macTime * 1000 + Date.UTC(1904, 1, 1);

    return new Date(utcTime);
  }
}

export default BinaryReader