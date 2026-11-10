// 4-12 배송 지도: 편지가 지나가는 길. 좌표는 시안(360×470 지도) 기준이다.
// 길은 시안의 점선 경로(출발 → 도착)에서 뽑은 점들이고, 점들을 이은 선 위에서 진행률로 위치를 구한다.
export const ROUTE_POINTS = [
  [60.0, 139.98], [70.12, 139.49], [81.14, 139.58], [92.04, 140.56], [102.86, 142.87],
  [112.96, 147.08], [121.55, 153.91], [127.38, 163.18], [130.35, 173.76], [131.37, 184.72],
  [131.35, 195.74], [130.92, 206.76], [130.57, 217.77], [130.8, 228.8], [132.16, 239.73],
  [135.32, 250.26], [140.81, 259.76], [148.61, 267.51], [157.94, 273.19], [168.22, 277.16],
  [178.96, 279.79], [189.8, 282.03], [200.48, 285.0], [210.8, 288.88], [220.55, 293.91],
  [229.45, 300.36], [237.03, 308.33], [242.93, 317.61], [247.2, 327.75], [250.27, 338.33],
  [252.69, 349.08], [255.03, 359.85], [257.82, 370.5], [261.54, 380.86], [266.54, 390.66],
  [272.98, 399.58], [280.75, 407.39], [289.51, 413.98], [300.0, 419.98],
]

// 점마다 출발점에서 거기까지의 길이
const LENGTHS = ROUTE_POINTS.reduce((lengths, point, index) => {
  if (index === 0) return [0]
  const [x0, y0] = ROUTE_POINTS[index - 1]
  return [...lengths, lengths[index - 1] + Math.hypot(point[0] - x0, point[1] - y0)]
}, [])
const TOTAL = LENGTHS[LENGTHS.length - 1]

const clamp = (value) => Math.min(Math.max(value, 0), 1)

/** 진행률(0~1)에 해당하는 길 위의 점 [x, y] */
export function pointAt(progress) {
  const target = clamp(progress) * TOTAL
  const index = LENGTHS.findIndex((length) => length >= target)
  if (index <= 0) return ROUTE_POINTS[0]
  const ratio = (target - LENGTHS[index - 1]) / (LENGTHS[index] - LENGTHS[index - 1])
  const [x0, y0] = ROUTE_POINTS[index - 1]
  const [x1, y1] = ROUTE_POINTS[index]
  return [x0 + (x1 - x0) * ratio, y0 + (y1 - y0) * ratio]
}

/** 출발점부터 진행률까지 지나온 길의 점들 */
export function traveledPoints(progress) {
  const target = clamp(progress) * TOTAL
  const passed = ROUTE_POINTS.filter((_, index) => LENGTHS[index] < target)
  return [...passed, pointAt(progress)]
}

/** 점들을 SVG polyline의 points 값으로 */
export const toPolyline = (points) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
