import { FontDirectory } from '../types';
import { TrueTypeFont } from './true-type-font';
export declare class TrueTypeCollection {
    private binaryReader;
    fontDirectories: FontDirectory[];
    tag: string;
    majorVersion: number;
    minorVersion: number;
    numFonts: number;
    dsigTag?: number;
    dsigLength?: number;
    dsigOffset?: number;
    tableDirectoryOffsets: number[];
    fonts: TrueTypeFont[];
    constructor(arrayBuffer: ArrayBuffer);
    private readTableDirectoryOffsets;
    private getFont;
    private readFontDirectories;
}
//# sourceMappingURL=true-typ-collection.d.ts.map