import { request } from './client.js'
let tree
export function getRegions() {
  if (!tree) tree = request('/api/regions/', { auth: false }).catch((error) => { tree = null; throw error })
  return tree
}
export async function resolveRegion(region, mode) {
  if (Number.isInteger(region?.id)) return region.id
  const parents = await getRegions()
  const parent = parents.find((item) => item.short_name === region.province || item.name === region.province)
  const normalize = (name) => name.replace(/[시군구]$/, '')
  const selected = !region.district || region.district === '세종 전체' ? parent : parent?.children.find((item) => normalize(item.name) === normalize(region.district))
  if (!selected?.[`can_be_${mode}`]) throw new Error('지역 목록에서 지역을 다시 선택해주세요')
  return selected.id
}
