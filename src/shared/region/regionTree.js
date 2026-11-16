// 서버 지역 트리(GET /api/regions/)를 지역 선택기(RegionPicker)가 쓰는 모양으로 바꾼다.
//
// 선택값은 { province, district, id }이다.
//   - province: 시·도 줄임말(서울, 충남 …), district: 시·군·구 줄임말(천안, 성북 …). 광역시를 통째로 고르면 ''이다.
//   - id: 서버 지역 id. 가입·지역 수정 요청에 이 값을 보낸다. 광역시를 통째로 고르면 시·도 id이다.
// 화면에는 지금처럼 줄임말을 보여 준다(서버 이름: 천안시, 성북구, 충청남도 → 천안, 성북, 충남).

const DISPLAY_ALL = '세종 전체' // 시·군·구가 없는 시·도(세종)를 고르는 칩 이름. regionLabel이 시·도 이름만 보여 준다.

/**
 * 서버 시·군·구 이름을 화면 이름으로 줄인다.
 * - 광역시의 구는 "구"를 뗀다(성북구 → 성북). 군은 그대로 둔다(기장군, 울주군). 두 글자 구는 그대로 둔다(중구, 동구).
 * - 도의 시·군은 "시"·"군"을 뗀다(천안시 → 천안, 연천군 → 연천). 떼고 남는 글자가 한 글자면 그대로 둔다.
 */
export function shortDistrictName(name, isMetropolitan) {
  const pattern = isMetropolitan ? /구$/ : /[시군]$/
  const stripped = name.replace(pattern, '')
  return stripped.length >= 2 ? stripped : name
}

/**
 * @param {Array} regions fetchRegions()의 응답
 * @returns {{
 *   provinces: string[],
 *   metropolitan: string[],
 *   provinceById: Map<number, string>,
 *   byProvince: Record<string, {
 *     id: number, isMetropolitan: boolean, hometownDirect: boolean, residenceDirect: boolean,
 *     hometowns: Array<{ district: string, id: number }>, residences: Array<{ district: string, id: number }>,
 *   }>,
 * }}
 *   hometownDirect: 시·도를 통째로 본가로 고를 수 있다(광역시, 세종).
 *   residenceDirect: 시·도를 통째로 거주 지역으로 고를 수 있다(시·군·구가 없는 세종).
 *   hometowns / residences: 본가·거주 지역으로 고를 수 있는 시·군·구
 */
export function buildRegionTree(regions) {
  const alphabetical = (a, b) => a.district.localeCompare(b.district, 'ko')
  const byProvince = {}
  const provinceById = new Map()

  for (const region of regions) {
    const province = region.short_name
    const district = (child) => ({ district: shortDistrictName(child.name, region.is_metropolitan), id: child.id })
    provinceById.set(region.id, province)
    byProvince[province] = {
      id: region.id,
      isMetropolitan: region.is_metropolitan,
      hometownDirect: region.can_be_hometown,
      residenceDirect: region.can_be_residence && region.children.length === 0,
      hometowns: region.children.filter((child) => child.can_be_hometown).map(district).sort(alphabetical),
      residences: region.children.filter((child) => child.can_be_residence).map(district).sort(alphabetical),
    }
    if (region.children.length === 0 && region.can_be_residence) {
      byProvince[province].residences = [{ district: DISPLAY_ALL, id: region.id }]
    }
  }

  const provinces = regions.map((region) => region.short_name).sort((a, b) => a.localeCompare(b, 'ko'))
  const metropolitan = regions.filter((region) => region.is_metropolitan).map((region) => region.short_name)
  return { provinces, metropolitan, provinceById, byProvince }
}
