//================================
// Liner algebra
//================================

export const vec = (x: number, y: number) => {
  return new Vec(x, y)
}

export const vecRad = (theta: number) => {
  return vec(Math.cos(theta), Math.sin(theta))
}

export class Vec {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  copy() {
    return vec(this.x, this.y)
  }

  inplaceAdd(v: Vec) {
    this.x += v.x
    this.y += v.y
    return this
  }

  inplaceSub(v: Vec) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  inplaceMul(a: number) {
    this.x *= a
    this.y *= a
    return this
  }

  inplaceDiv(a: number) {
    this.x /= a
    this.y /= a
    return this
  }

  inplaceMinus() {
    this.x = -this.x
    this.y = -this.y
    return this
  }

  inplaceRotate(theta: number) {
    const x = this.x
    const y = this.y
    const cos = Math.cos(theta)
    const sin = Math.sin(theta)
    this.x = cos * x - sin * y
    this.y = sin * x + cos * y
    return this
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  inplaceNormalize() {
    return this.inplaceDiv(this.length())
  }

  add(v: Vec) {
    return this.copy().inplaceAdd(v)
  }

  sub(v: Vec) {
    return this.copy().inplaceSub(v)
  }

  mul(a: number) {
    return this.copy().inplaceMul(a)
  }

  div(a: number) {
    return this.copy().inplaceDiv(a)
  }

  minus() {
    return this.copy().inplaceMinus()
  }

  normalize() {
    return this.copy().inplaceNormalize()
  }

  rotate(theta: number) {
    return this.copy().inplaceRotate(theta)
  }

  static add(a: Vec, b: Vec) {
    return a.add(b)
  }

  static sub(a: Vec, b: Vec) {
    return a.sub(b)
  }

  static mul(v: Vec, a: number) {
    return v.mul(a)
  }

  static div(v: Vec, a: number) {
    return v.div(a)
  }

  static normalize(v: Vec) {
    return v.normalize()
  }

  static rotate(v: Vec, theta: number) {
    return v.rotate(theta)
  }

  // TODO: toString
}

export const dot = (p: Vec, q: Vec) => {
  return p.x * q.x + p.y * q.y
}

// export const dotAngle = (x1: number, y1: number, x2: number, y2: number) => {
//     const norm1 = Math.sqrt(x1 * x1 + y1 * y1);
//     const norm2 = Math.sqrt(x2 * x2 + y2 * y2);
//     return Math.acos((x1 * x2 + y1 * y2) / (norm1 * norm2));
// };

export const cross = (p: Vec, q: Vec) => {
  return p.x * q.y - q.x * p.y
}

export const crossAngle = (p: Vec, q: Vec) => {
  return Math.asin(cross(p, q) / (p.length() * q.length()))
}

//================================
// Geometry
//================================

export const eps = 1e-9

// ccw
// const ccw = (a: Vec, b: Vec, c: Vec) => {
//     b = b.sub(a)
//     c = c.sub(a)
//     if (cross(b, c) > eps) return +1 // counter clockwise
//     if (cross(b, c) < -eps) return -1 // clockwise
//     if (dot(b, c) < 0) return +2 // cab (back)
//     if (b.length() < c.length()) return -2 // abc (front)
//     return 0                        // acb (on segment)
// }

// const isIntersectedSS = (a1: Vec, a2: Vec, b1: Vec, b2: Vec) => {
//     return ccw(a1, a2, b1) * ccw(a1, a2, b2) <= 0 &&
//         ccw(b1, b2, a1) * ccw(b1, b2, a2) <= 0
// }

const intersectionLL = (s: Vec, v: Vec, a1: Vec, a2: Vec) => {
  const a = a2.sub(a1)
  return s.add(v.mul(cross(a, a1.sub(s))).inplaceDiv(cross(a, v)))
}

export const intersectionLS = (s: Vec, v: Vec, a1: Vec, a2: Vec) => {
  if (cross(v, a1.sub(s)) * cross(v, a2.sub(s)) < 0) {
    return intersectionLL(s, v, a1, a2)
  } else {
    return null
  }
}

export const intersectCC = (c1: Vec, r1: number, c2: Vec, r2: number) => {
  // Swap
  if (r1 < r2) {
    const cTmp = c1.copy()
    c1 = c2
    c2 = cTmp
    const rTmp = r1
    r1 = r2
    r2 = rTmp
  }
  const dc = c2.sub(c1).length()
  // Separated
  if (dc > r1 + r2) {
    return false
  }
  // Connotation
  if (dc + r2 < r1) {
    return false
  }
  return true
}

export const intersectionCC = (c1: Vec, r1: number, c2: Vec, r2: number) => {
  // Swap
  if (r1 < r2) {
    const cTmp = c1.copy()
    c1 = c2
    c2 = cTmp
    const rTmp = r1
    r1 = r2
    r2 = rTmp
  }
  const d = c2.sub(c1).length()
  const n = c2.sub(c1).inplaceNormalize()
  const theta = Math.acos((d * d + r1 * r1 - r2 * r2) / (2.0 * d * r1))
  return [c1.add(n.rotate(theta).inplaceMul(r1)), c1.add(n.rotate(-theta).inplaceMul(r1))]
}

export const intersectionCL = (cx: number, r: number, s: Vec, v: Vec) => {
  const absR = Math.abs(r)
  const n = v.normalize()
  const a = 1
  const b = 2 * ((s.x - cx) * n.x + s.y * n.y)
  const c = (s.x - cx) * (s.x - cx) + s.y * s.y - absR * absR
  const cond = b * b - 4 * a * c
  const res: { p: Vec; d: number }[] = []
  if (cond < 0) {
    return res
  }
  const d1 = (-b - Math.sqrt(cond)) / (2 * a)
  const d2 = (-b + Math.sqrt(cond)) / (2 * a)
  if (d1 >= 0) {
    res.push({ p: s.add(n.mul(d1)), d: d1 })
  }
  if (d2 >= 0) {
    res.push({ p: s.add(n.mul(d2)), d: d2 })
  }
  return res
}

export const intersectionY = (s: Vec, v: Vec, x: number, yMin: number, yMax: number) => {
  v = v.normalize()
  const d = (x - s.x) / v.x
  if (!isFinite(d) || d < 0) {
    return { p: null, d }
  } else {
    const p = s.add(v.inplaceMul(d))
    if (p.y < yMin || p.y > yMax) {
      return { p: null, d }
    } else {
      return { p, d }
    }
  }
}

export const intersectionX = (s: Vec, v: Vec, y: number, xMin: number, xMax: number) => {
  v = v.normalize()
  const d = (y - s.y) / v.y
  if (!isFinite(d) || d < 0) {
    return { p: null, d }
  } else {
    const p = s.add(v.inplaceMul(d))
    if (p.x < xMin || p.x > xMax) {
      return { p: null, d }
    } else {
      return { p, d }
    }
  }
}

export const normalDistribution = () => {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())
}
