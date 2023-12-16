// TrueType curves are quadratic
// Postscript curves are cubic

import { Point } from '../types'

const drawCurves = (
  ctrlPoints: Point[] = [],
  endPoint: Point,
  height = 0,
  scale = 1
): string => {
  let d = ''

  if (ctrlPoints.length === 1) {
    const cp1 = ctrlPoints.shift()!

    d += ` Q ${cp1.x * scale} ${height - cp1.y * scale} ${endPoint.x * scale} ${
      height - endPoint.y * scale
    }`
  } else if (ctrlPoints.length === 2) {
    const cp1 = ctrlPoints.shift()!
    const cp2 = ctrlPoints.shift()!
    const x = cp1.x + (cp2.x - cp1.x) / 2
    const y = cp1.y + (cp2.y - cp1.y) / 2

    d += `Q ${cp1.x * scale} ${height - cp1.y * scale} ${x * scale} ${
      height - y * scale
    } Q ${cp2.x * scale} ${height - cp2.y * scale} ${endPoint.x * scale} ${
      height - endPoint.y * scale
    }`
  } else if (ctrlPoints.length > 2) {
    while (ctrlPoints.length) {
      const cp1 = ctrlPoints.shift()!
      const cp2 = ctrlPoints[0]!

      if (cp2) {
        const x = cp1.x + (cp2.x - cp1.x) / 2
        const y = cp1.y + (cp2.y - cp1.y) / 2

        d += ` Q ${cp1.x * scale} ${height - cp1.y * scale} ${x * scale} ${
          height - y * scale
        }`
      } else {
        d += ` Q ${cp1.x * scale} ${height - cp1.y * scale} ${endPoint.x * scale} ${
          height - endPoint.y * scale
        }`
      }
    }
  }

  return d
}

export default drawCurves
