export declare const getBitCount: (number: number) => number;
declare class BinaryReader {
    view: DataView;
    private pos;
    private bit_pos;
    private chunk;
    private bit_count;
    private littleEndian;
    constructor(arrayBuffer: ArrayBuffer);
    setLittleEndian(littleEndian: boolean): void;
    tell(): number;
    seek(pos: number): number;
    goTo(pos: number): this;
    peak(index?: number): number | null;
    peakBit(): number | null;
    getPadSize(): number;
    getBitPos(): number;
    getBit(): number | null;
    getData(type?: string): any;
    getUint8(): any;
    getInt8(): any;
    getUint16(): number;
    getUint32(): number;
    getInt16(): number;
    getInt32(): number;
    getString(length: number): string;
    getFword(): number;
    getuFword(): number;
    get2Dot14(): number;
    getFixed(): number;
    getLongDateTime(): Date;
}
export default BinaryReader;
//# sourceMappingURL=binary-reader.d.ts.map