import TrueTypeFont from "./models/TrueTypeFont"

let font: TrueTypeFont

const inputFile: any = document.getElementById("file");

const showGlyph = (code: number | string, element: HTMLElement, font: TrueTypeFont): void => {
  const glyph = typeof code === 'string' ? font.getGlyphByChar(code) : font.getGlyphByUnicode(code)
  const options = { fontSize: 200, showPoints: false, showLines: true, useBB: true }

  element.innerHTML = ''

  element.appendChild(createGlyph(font, glyph, options));
}
const createGlyph = (font: TrueTypeFont, glyph: any, options = {}): HTMLDivElement => {
  const wrapper = document.createElement("div");
  const details = document.createElement("div");

  details.className = "details";

  details.innerHTML = `<div class='flex'><span class='label'>Unicode:</span> <span>${
    glyph.unicode
  }</span></div>
  <div class='flex'><span class='label'>Name:</span><span>${
    glyph.name
  }</span></div>
  <div class='flex'><span class='label'>AdvanceWidth:</span><span>${
    glyph.advanceWidth
  }</span></div>
  <div class='flex'><span class='label'>LeftSideBearing:</span><span>${
    glyph.leftSideBearing
  }</span></div>
  <div class='flex'><span class='label'>xMax:</span><span>${glyph.xMax ||
    0}</span></div>
  <div class='flex'><span class='label'>xMin:</span><span>${glyph.xMin ||
    0}</span></div>
  <div class='flex'><span class='label'>yMax:</span><span>${glyph.yMax ||
    0}</span></div>
  <div class='flex'><span class='label'>yMin:</span><span>${glyph.yMin ||
    0}</span></div>`;

  wrapper.className = "fontWrapper";


  wrapper.appendChild(
    font.createSVG(
      glyph, options
    )
  );

  wrapper.appendChild(details);

  return wrapper
}

inputFile.addEventListener("change", (e: any) => {
  const file = e.target.files[0];

  if (file) {
    const fr = new FileReader();

    fr.readAsArrayBuffer(file);

    fr.addEventListener("loadend", () => {
      font = new TrueTypeFont((fr.result) as ArrayBuffer);

      console.log(font)

      const overview: any = document.querySelector('.overview')
      const container: any = document.getElementById("fontsContainer");
      const input: any = document.getElementById('input')
      const unicode: any = document.getElementById('unicode')
      const unicodeButton: any = document.getElementById('unicodeButton')
      const target: any = document.getElementById("fontContainer");

      target.innerHTML = ''

      container.innerHTML = "";

      unicodeButton.addEventListener('click', () => {
        showGlyph(parseInt(unicode.value.replace(/\\u/, ''), 16), target, font)
      })

      input.addEventListener('input', (e: any) => {
        if (!e.target.value) return
        showGlyph(e.target.value, target, font)
      })

      overview.innerHTML = `<div class='flex'>
        <span class='label'>FontFamily</span><span>${font.name.nameRecords.find((record: any) => record.nameID.name === 'FontFamily').nameID.value}</span>
      </div>
      <div class='flex'><span class='label'>xMax</span><span>${font.xMax}</span></div>
      <div class='flex'><span class='label'>xMin</span><span>${font.xMin}</span></div>
      <div class='flex'><span class='label'>yMax</span><span>${font.yMax}</span></div>
      <div class='flex'><span class='label'>yMin</span><span>${font.yMin}</span></div>`

      // 78 bedrijfsaansprakelijkheid
      // 22 euro
      let i = 0;

      font.readGlyphs((glyph: any, i: number) => {
        if (glyph) {
          const icon: any = document.createElement("div");
          const details: any = document.createElement("div");

          details.innerHTML = `<div class='flex'><span class='label'>Unicode:</span> <span>${
            glyph.unicode
          }</span></div><div class='flex'><span class='label'>Name:</span><span>${
            glyph.name
          }</span></div>`;
          details.className = "details";
          icon.className = "icon";
          icon.setAttribute("data-index", i);
          icon.appendChild(font.createSVG(glyph, { showLines: true}));
          icon.appendChild(details);

          icon.addEventListener("click", () => {
            const glyph = font.readGlyph(parseInt(icon.getAttribute("data-index")))
            const options = { fontSize: 200, showPoints: false, showLines: true, useBB: true }

            target.innerHTML = ''

            target.appendChild(createGlyph(font, glyph, options));
          });

          container.appendChild(icon);
        }
      });
    });
  }
});

