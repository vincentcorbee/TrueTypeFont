import { TrueTypeFont } from '../src'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { HelveticaRegular } from './Helvetica-Regular'

// const file = atob(
//   readFileSync(path.resolve(process.cwd(), 'src/Helvetica-Regular.ttf'), {
//     encoding: 'base64',
//   })
// )

// console.log(HelveticaRegular)

const uint8 = new Uint8Array(HelveticaRegular.length)

for (let i = 0; i < HelveticaRegular.length; i++)
  uint8[i] = HelveticaRegular[i].charCodeAt(0)

const font = new TrueTypeFont(uint8.buffer)

console.log(font.getGlyphByChar('A'))
