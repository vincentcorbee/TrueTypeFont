"use strict";
// const _private = new WeakMap()
Object.defineProperty(exports, "__esModule", { value: true });
// class Matrix {
//   constructor(r = 0, c = 0) {
//     const self = this
//     const m = Array(r).fill(Array(c).fill(0, 0, c), 0, r)
//     _private.set(self, {
//       m
//     })
//   }
// }
// console.log(new Matrix(2, 2))
// const addMatrix = (m1: any[], m2: any[]) => {
//   if (m1.length !== m2.length || m1[0].length !== m2[0].length) {
//     throw new Error(`a and b are not of the same size`)
//   }
//   return m1.map((r, rn) => r.map((c: number, cn: number) => c + m2[rn][cn]))
// }
const mulMatrix = (m1, m2) => {
    if (m1[0].length !== m2.length) {
        throw new Error(`a's columns must equal b's rows.`);
    }
    return m1
        .map((r, i) => m2[0]
        .map((n) => 0))
        .map((r, rn) => r.map((n, cn) => m1[rn].map((n2, cn2) => n2 * m2[cn2][cn]).reduce((a, v) => a += v, 0)));
};
const transform = ([a = 1, b = 0, c = 0, d = 1, e = 0, f = 0], point) => {
    /*
      2D transformation matrices
  
      Skew
      [1,	tan(ax)
      tan(ay),	1]
  
      Rotate
      [cos(a), -sin(a),
        sin(a)	cos(a)]
  
      Scale
      [sx, 0,
      0, sy]
    */
    // x, y, z
    // z is added to incorporate translation into the matrix instead of an additional matrix addition
    // Thus placing object from 2d space into 3d i.e. destination space + 1
    // matrix addition
    const m1 = [
        [a, c, e],
        [b, d, f],
        [0, 0, 1]
    ];
    const m2 = [
        [point.x],
        [point.y],
        [1]
    ];
    // This would add the translation matrix to the matrix
    // const m3 = addMatrix(mulMatrix(m1, m2), [[e], [f]])
    const m3 = mulMatrix(m1, m2);
    point.x = m3[0][0];
    point.y = m3[1][0];
    return point;
};
exports.default = transform;
//# sourceMappingURL=transform.js.map