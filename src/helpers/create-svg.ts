import createCircle from './create-circle'
import drawCurves from './draw-curves'
import { CreateSvgOptions, Glyph, Point } from '../types'
import { TrueTypeFont } from '../modules'
import transform from './transform'

export function createSVG(
  font: TrueTypeFont,
  glyph: Glyph,
  { fontSize = 64, useBB = true, showPoints = false, showLines = false }: CreateSvgOptions
) {
  const createGlyph = (
    glyph: Partial<Glyph> = { points: [], endPtsOfContours: [0] },
    height = 0,
    scale = 1
  ) => {
    const points = glyph.points ?? []
    const docFrag = document.createDocumentFragment()
    const lengthPoints = points.length
    const refPoints: SVGCircleElement[] = []

    let isFirstContourPoint = true
    let pointIndex = 0
    let contourNumber = 0
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    let d = ''
    let ctrlPoints: Point[] = []
    let firstContourPoint: Point | null = null

    /**
     * If the first point in a contour is not on a curve, the drawing of the glyph does not work correctly.
     * Therefor the next point ont he curve is used as the first point.
     */

    glyph.endPtsOfContours?.forEach((endPtOfContour, i) => {
      const firstPointIndex = i === 0 ? 0 : glyph.endPtsOfContours![i - 1] + 1
      const firstPoint = points[firstPointIndex]

      if (!firstPoint.onCurve) {
        const [lastPoint] = points.splice(endPtOfContour, 1)

        points.splice(firstPointIndex, 1, lastPoint, firstPoint)
      }
    })

    while (pointIndex < lengthPoints) {
      const point = points[pointIndex]
      const x = point.x * scale
      const y = height - point.y * scale

      if (isFirstContourPoint) {
        firstContourPoint = point

        d += `M ${x} ${y}`

        path.setAttribute('d', d)
        path.setAttribute('fill-rule', 'evenodd')

        if (showPoints) {
          path.setAttribute('fill', 'grey')

          refPoints.push(createCircle(x, y, 'orange', scale))
        }

        isFirstContourPoint = false
      } else {
        if (point.onCurve) {
          if (ctrlPoints.length) d += drawCurves(ctrlPoints, point, height, scale)
          else d += ` L ${x} ${y}`

          path.setAttribute('d', d)

          if (showPoints) refPoints.push(createCircle(x, y, 'blue', scale))
        } else {
          ctrlPoints.push(point)

          if (showPoints) refPoints.push(createCircle(x, y, 'red', scale))
        }
      }

      if (pointIndex === glyph.endPtsOfContours![contourNumber]) {
        contourNumber += 1

        isFirstContourPoint = true

        if (!point.onCurve) d += drawCurves(ctrlPoints, firstContourPoint!, height, scale)

        path.setAttribute('d', d)

        docFrag.appendChild(path)

        if (showPoints) {
          refPoints.push(
            createCircle(
              point.x * scale,
              height - point.y * scale,
              point.onCurve ? 'black' : 'purple',
              scale
            )
          )
        }

        firstContourPoint = null

        ctrlPoints = []
      }

      pointIndex += 1
    }

    while (refPoints.length) docFrag.appendChild(refPoints.pop() as Node)

    return docFrag
  }

  // Default lineHeight = ascender - descender + LineGap

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const type = glyph.type
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

  // if (type === 'compound') {
  //   glyph.components!.forEach(
  //     (component) => (component.glyph = this.readGlyph(component.glyphIndex))
  //   )
  // }
  const { xMax, xMin, yMax, yMin } = useBB ? font : glyph

  let width = xMax - xMin
  const height = yMax - yMin

  const fontWidth = glyph.xMax - glyph.xMin

  // const fontHeight = glyph.yMax - glyph.yMin;
  // Well that is stupid, this does not preserve aspect ratio viewbox and svg dimensions

  const fontScale = fontSize / font.unitsPerEm
  const viewBoxScale = fontSize / font.unitsPerEm
  const ratio = useBB ? fontSize / height : 1

  // Position center on x axis of BB
  const minX = useBB
    ? -(((width - fontWidth - glyph.xMin) / 2) * viewBoxScale)
    : xMin * viewBoxScale
  const minY = Math.abs(yMin) * viewBoxScale
  const xHeight = font.xHeight

  const viewBoxWidth = (width < 0 ? 0 : width) * viewBoxScale
  const viewBoxHeight = (height < 0 ? 0 : height) * viewBoxScale

  if (useBB) {
    svg.setAttribute('height', fontSize.toString(10))
    svg.setAttribute('width', (ratio * width).toString(10))
  } else {
    svg.setAttribute('width', (width * fontScale).toString(10))
  }

  svg.setAttribute('viewBox', `${minX}, ${minY}, ${viewBoxWidth}, ${viewBoxHeight}`)

  // Insert lines
  if (showLines) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const xHeightLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    const descenderLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    const accendererLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    descenderLine.setAttribute(
      'd',
      `M ${minX} ${viewBoxHeight + minY - 10 * viewBoxScale} H ${viewBoxWidth + minX}`
    )
    descenderLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
    descenderLine.setAttribute('stroke', 'grey')

    accendererLine.setAttribute(
      'd',
      `M ${minX} ${minY + 10 * viewBoxScale} H ${viewBoxWidth + minX}`
    )
    accendererLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
    accendererLine.setAttribute('stroke', 'grey')

    baseLine.setAttribute('d', `M ${minX} ${viewBoxHeight} H ${viewBoxWidth + minX}`)
    baseLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
    baseLine.setAttribute('stroke', 'grey')

    xHeightLine.setAttribute(
      'd',
      `M ${minX} ${viewBoxHeight - xHeight * viewBoxScale} H ${viewBoxWidth + minX}`
    )

    xHeightLine.setAttribute('stroke-width', (10 * viewBoxScale).toString(10))
    xHeightLine.setAttribute('stroke', 'grey')

    g.appendChild(baseLine)
    g.appendChild(xHeightLine)
    g.appendChild(descenderLine)
    g.appendChild(accendererLine)

    svg.appendChild(g)
  }

  if (type === 'compound') {
    glyph.components!.forEach(component => {
      const { a, b, c, d, e, f } = component.matrix

      const componentGlyph = font.readGlyph(component.glyphIndex)

      if (componentGlyph) {
        componentGlyph.points =
          componentGlyph.points?.map(point => transform([a, b, c, d, e, f], point)) ?? []

        group.appendChild(createGlyph(componentGlyph, viewBoxHeight, viewBoxScale))
      }
    })
  } else {
    group.appendChild(createGlyph(glyph, viewBoxHeight, viewBoxScale))
  }

  svg.appendChild(group)

  return svg
}
