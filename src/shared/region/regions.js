// 시·도 이름 목록과 regionLabel. 지역 선택기(RegionPicker)는 이 목록을 쓰지 않고 서버(GET /api/regions/)에서 받는다(useRegions).
// 이 목록은 우체통의 지역 이름 맞춤(mailboxMapper 등)과 마이페이지 mock이 아직 쓰고 있어 남겨 둔다. 서버 id는 없다.
const words = (value) => value.split(' ')
export const PROVINCES = words('서울 부산 대구 인천 광주 대전 울산 세종 경기 강원 충북 충남 전북 전남 경북 경남 제주')
export const METROPOLITAN = words('서울 부산 대구 인천 광주 대전 울산 세종')
export const CITIES = {
  경기: words('수원 성남 의정부 안양 부천 광명 평택 동두천 안산 고양 과천 구리 남양주 오산 시흥 군포 의왕 하남 용인 파주 이천 안성 김포 화성 광주 양주 포천 여주 연천 가평 양평'),
  강원: words('춘천 원주 강릉 동해 태백 속초 삼척 홍천 횡성 영월 평창 정선 철원 화천 양구 인제 고성 양양'),
  충북: words('청주 충주 제천 보은 옥천 영동 증평 진천 괴산 음성 단양'),
  충남: words('천안 아산 공주 보령 서산 논산 계룡 당진 금산 부여 서천 청양 홍성 예산 태안'),
  전북: words('전주 군산 익산 정읍 남원 김제 완주 진안 무주 장수 임실 순창 고창 부안'),
  전남: words('목포 여수 순천 나주 광양 담양 곡성 구례 고흥 보성 화순 장흥 강진 해남 영암 무안 함평 영광 장성 완도 진도 신안'),
  경북: words('포항 경주 김천 안동 구미 영주 영천 상주 문경 경산 의성 청송 영양 영덕 청도 고령 성주 칠곡 예천 봉화 울진 울릉'),
  경남: words('창원 진주 통영 사천 김해 밀양 거제 양산 의령 함안 창녕 고성 남해 하동 산청 함양 거창 합천'),
  제주: words('제주 서귀포'),
}
export const DISTRICTS = {
  서울: words('강남 관악 동대문 마포 서대문 성북 송파 종로 강동 강북 강서 광진 구로 금천 노원 도봉 동작 서초 성동 양천 영등포 용산 은평 중구 중랑'),
  부산: words('강서 금정 기장군 남구 동구 동래 부산진 북구 사상 사하 서구 수영 연제 영도 중구 해운대'),
  대구: words('남구 달서 달성군 동구 북구 서구 수성 중구 군위군'),
  인천: words('강화군 계양 남동 동구 미추홀 부평 서구 연수 옹진군 중구'),
  광주: words('광산 남구 동구 북구 서구'),
  대전: words('대덕 동구 서구 유성 중구'),
  울산: words('남구 동구 북구 울주군 중구'),
  세종: ['세종 전체'],
  ...CITIES,
}

const alphabetical = (a, b) => a.localeCompare(b, 'ko')
PROVINCES.sort(alphabetical)
for (const regions of Object.values(DISTRICTS)) {
  regions.sort(alphabetical)
}

export function regionLabel(region) {
  return region.district && region.district !== '세종 전체' ? `${region.province} ${region.district}` : region.province
}
