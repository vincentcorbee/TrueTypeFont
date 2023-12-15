import { TrueTypeCollection } from './modules/TrueTypeCollection'
import TrueTypeFont from './modules/TrueTypeFont'

const inputFile: any = document.getElementById('file')
const overview: any = document.querySelector('.overview')
const fontsContainer: any = document.getElementById('fontsContainer')
const input: any = document.getElementById('input')
const unicode: any = document.getElementById('unicode')
const name: any = document.getElementById('name')
const unicodeButton: any = document.getElementById('unicodeButton')
const nameButton: any = document.getElementById('nameButton')
const fontContainer: any = document.getElementById('fontContainer')
const fontsOverview = document.getElementById('fontsOverview') as HTMLDivElement

let font: TrueTypeFont
let ttc: TrueTypeCollection

const showGlyph = (
  code: number | string,
  element: HTMLElement,
  font: TrueTypeFont,
  name?: boolean
): void => {
  const glyph =
    typeof code === 'string'
      ? name
        ? font.getGlyphByName(code)
        : font.getGlyphByChar(code)
      : font.getGlyphByUnicode(code)
  const options = { fontSize: 200, showPoints: false, showLines: true, useBB: true }

  element.innerHTML = ''

  element.appendChild(createGlyph(font, glyph, options))
}
const createGlyph = (font: TrueTypeFont, glyph: any, options = {}): HTMLDivElement => {
  const wrapper = document.createElement('div')
  const details = document.createElement('div')

  details.className = 'details'

  details.innerHTML = `<div class='flex'><span class='label'>Unicode:</span> <span>${
    glyph.unicode
  }</span></div>
  <div class='flex'><span class='label'>Name:</span><span>${glyph.name}</span></div>
  <div class='flex'><span class='label'>AdvanceWidth:</span><span>${
    glyph.advanceWidth
  }</span></div>
  <div class='flex'><span class='label'>LeftSideBearing:</span><span>${
    glyph.leftSideBearing
  }</span></div>
  <div class='flex'><span class='label'>xMax:</span><span>${glyph.xMax || 0}</span></div>
  <div class='flex'><span class='label'>xMin:</span><span>${glyph.xMin || 0}</span></div>
  <div class='flex'><span class='label'>yMax:</span><span>${glyph.yMax || 0}</span></div>
  <div class='flex'><span class='label'>yMin:</span><span>${glyph.yMin || 0}</span></div>`

  wrapper.className = 'fontWrapper'

  wrapper.appendChild(font.createSVG(glyph, options))

  wrapper.appendChild(details)

  return wrapper
}

const showOverview = (font: TrueTypeFont) => {
  fontContainer.innerHTML = ''

  fontsContainer.innerHTML =
    '<div style="display: flex; align-items: center; justify-content: center; width: 100%"><span style="font-size: 2rem; font-weight: bold;">Loading</span></div>'

  input.value = ''

  overview.innerHTML = `
  <div class='flex row'>
    <span class='label'>Postscript name</span><span>${font.postScriptName}</span>
  </div>
  <div class='flex row'>
    <span class='label'>Fullname</span><span>${font.fullName}</span>
  </div>
  <div class='flex row'>
    <span class='label'>Family</span><span>${font.fontFamily}</span>
  </div>
  <div class='flex row'>
    <span class='label'>Style</span><span>${font.fontSubfamily}</span>
  </div>
  <div class='flex row'><span class='label'>Glyph count</span><span>${font.numGlyphs}</span></div>
  <div class='flex row'><span class='label'>xMax</span><span>${font.xMax}</span></div>
  <div class='flex row'><span class='label'>xMin</span><span>${font.xMin}</span></div>
  <div class='flex row'><span class='label'>yMax</span><span>${font.yMax}</span></div>
  <div class='flex row'><span class='label'>yMin</span><span>${font.yMin}</span></div>`

  // 78 bedrijfsaansprakelijkheid
  // 22 euro

  const docFrag = document.createDocumentFragment()

  // const blob = new Blob([font.buffer])

  // const url = URL.createObjectURL(blob)

  // const a = document.createElement('a')

  // a.href = url
  // a.download = `${font.fontFamily}-${font.fontSubfamily}.ttf`

  // a.click()

  // URL.revokeObjectURL(url)

  setTimeout(() => {
    font.readGlyphs((glyph, i) => {
      if (glyph) {
        const icon: any = document.createElement('div')
        const details: any = document.createElement('div')

        details.innerHTML = `<div class='flex'><span class='label'>Unicode:</span> <span>${glyph.unicode}</span></div><div class='flex'><span class='label'>Code:</span> <span>${glyph.characterCode}</span></div><div class='flex'><span class='label'>Name:</span><span>${glyph.name}</span></div>`
        details.className = 'details'
        icon.className = 'icon'

        icon.setAttribute('data-index', i)
        icon.appendChild(font.createSVG(glyph, { showLines: true }))
        icon.appendChild(details)

        icon.addEventListener('click', () => {
          const glyph = font.readGlyph(parseInt(icon.getAttribute('data-index')))
          const options = {
            fontSize: 400,
            showPoints: true,
            showLines: true,
            useBB: true,
          }

          fontContainer.innerHTML = ''

          fontContainer.appendChild(createGlyph(font, glyph, options))
        })

        docFrag.appendChild(icon)
      }
    })

    fontsContainer.innerHTML = ''

    fontsContainer.appendChild(docFrag)
  })
}

fontsOverview.addEventListener('click', e => {
  const target = e.target as HTMLElement

  if (ttc) showOverview(ttc.fonts[parseInt(target.dataset.index ?? '', 10) || 0])
})

inputFile.addEventListener('change', (e: any) => {
  const file = e.target.files[0]

  if (file) {
    const fr = new FileReader()

    fr.readAsArrayBuffer(file)

    fr.addEventListener('loadend', () => {
      fontsOverview.innerHTML = ''

      if (file.name.split('.')[1] === 'ttc') {
        ttc = new TrueTypeCollection(fr.result as ArrayBuffer)

        const { fonts } = ttc

        fontsOverview.innerHTML = fonts.reduce((html, font, i) => {
          return (html += `<button data-index=${i}>${font.fontFamily} ${font.fontSubfamily}</button>`)
        }, '')

        console.log(ttc)

        font = ttc.fonts[0]
      } else {
        font = new TrueTypeFont(fr.result as ArrayBuffer)
      }

      console.log(font)

      unicodeButton.addEventListener('click', () => {
        showGlyph(parseInt(unicode.value.replace(/\\u/, ''), 16), fontContainer, font)
      })

      nameButton.addEventListener('click', () => {
        showGlyph(name.value, fontContainer, font, true)
      })

      input.addEventListener('input', (e: any) => {
        if (!e.target.value) return

        showGlyph(e.target.value, fontContainer, font)
      })

      showOverview(font)
    })
  }
})
