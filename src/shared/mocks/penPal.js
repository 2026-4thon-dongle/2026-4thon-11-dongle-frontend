// 펜팔 친구(5-14)와 상대별 주고받은 편지(5-15) 목 데이터(mock). 문서 레포 API 확정 전이며 화면 확인용이다.
//
// 문서 레포 `api/`에는 편지·펜팔 API가 없다. `spec/mail.md`의 MAIL-08, MAIL-09 초안을 참고해 모양을 정했다.
//   MAIL-08 펜팔 친구: 같은 상대와 N번 이상 주고받은 사용자. 상대별 지역, 주고받은 편지 수, 최근 편지 시각
//   MAIL-09 주고받은 편지 기록: 상대별로 시작 일기와 편지를 시간순으로 준다
// 필드 이름은 문서 레포 컨벤션(`api/common.md`: snake_case)을 따랐다. 아래는 모두 mock 전용이며 API가 정해지면 바뀔 수 있다.
//
// ※ 펜팔 친구가 되는 기준은 mock에서만 정했다. 문서에서도 정해지지 않았다.
//   spec/mail.md 미정 사항: "3번 이상 주고받음"이 편지 3통인지 왕복 3회인지(기획안 v2는 2번). 시안 5-14 문구는 "편지를 3번 이상 주고받으면".
//   여기서는 "주고받은 편지 3통 이상"으로 두었다. 시안 5-14의 "귤껍질 · 편지 2통"은 이 기준과 맞지 않아 mock에서 3통으로 바꿨다.
//
// 최근 편지 시각(last_letter_at)은 "지금"에서 며칠 전으로 만들어서 "3일 전", "1주 전", "2주 전"이 항상 보이게 했다.

const DAY = 24 * 60 * 60 * 1000
const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString()

// GET 펜팔 친구 목록 응답 모양(가정): { results: [...] }
//   id             친구(상대) id
//   nickname       상대 닉네임
//   region         상대 지역
//   letter_count   주고받은 편지 수
//   last_letter_at 최근 편지 시각 (ISO 8601)
//   reply_letter_id  답장할 편지 id (상대가 마지막으로 보낸 편지). 5-15 "답장 쓰기"가 편지 쓰기로 넘긴다
export const MOCK_PEN_PALS = {
  results: [
    { id: 1, nickname: '하늘빛', region: '충남 천안', letter_count: 6, last_letter_at: daysAgo(3), reply_letter_id: 101 },
    { id: 2, nickname: '갈매기', region: '부산 수영', letter_count: 3, last_letter_at: daysAgo(7), reply_letter_id: 102 },
    { id: 3, nickname: '귤껍질', region: '제주 서귀포', letter_count: 3, last_letter_at: daysAgo(14), reply_letter_id: 103 },
  ],
}

// 상대별 주고받은 편지(5-15). 시간순(오래된 것부터).
//   kind       'diary'(시작 고향 일기) | 'sent'(내가 보냄) | 'received'(내가 받음)
//   at         시각 (ISO 8601, 한국 시간)
//   preview    본문 첫 줄 (화면에서 길면 잘라서 보여 준다)
//   stamp_code 우표 id (shared/mocks/stamps.js와 같다)
// 시안 5-15는 "주고받은 편지 6통"인데 카드가 4개만 보인다. 6통에 맞게 mock에서 편지를 더 넣었다.
const stamp = (code) => code

export const MOCK_PEN_PAL_LETTERS = {
  1: [
    { id: 'd1', kind: 'diary', at: '2026-10-30T09:00:00+09:00', preview: '오늘 학교 앞 호수 색이 달라졌어요', stamp_code: 'steady-letter' },
    { id: 'l1', kind: 'sent', at: '2026-10-30T21:30:00+09:00', preview: '그 호수, 제가 고등학생 때 매일 지나던 곳이에요', stamp_code: stamp('first-diary') },
    { id: 'l2', kind: 'received', at: '2026-10-31T14:20:00+09:00', preview: '일기 잘 읽었어요! 정문 붕어빵 트럭은', stamp_code: stamp('first-letter') },
    { id: 'l3', kind: 'sent', at: '2026-11-02T20:10:00+09:00', preview: '성북천에 첫눈이 왔어요', stamp_code: stamp('first-roundtrip') },
    { id: 'l4', kind: 'received', at: '2026-11-04T11:00:00+09:00', preview: '첫눈이라니 부러워요, 천안은 비만 와요', stamp_code: stamp('first-snow') },
    { id: 'l5', kind: 'sent', at: '2026-11-06T22:40:00+09:00', preview: '붕어빵 슈크림 맛 드셔 보셨어요?', stamp_code: stamp('dawn-letter') },
    { id: 'l6', kind: 'received', at: '2026-11-07T10:15:00+09:00', preview: '다음에 꼭 먹어 볼게요! 감기 조심해요', stamp_code: stamp('long-way') },
  ],
  2: [
    { id: 'd2', kind: 'diary', at: '2026-10-28T08:00:00+09:00', preview: '광안리 새벽 산책 사진을 올렸어요', stamp_code: 'first-diary' },
    { id: 'm1', kind: 'received', at: '2026-10-29T09:05:00+09:00', preview: '새벽 바다가 너무 보고 싶어졌어요', stamp_code: 'first-diary' },
    { id: 'm2', kind: 'sent', at: '2026-11-01T19:00:00+09:00', preview: '성북 골목은 조용하고 따뜻한 냄새가 나요', stamp_code: 'first-letter' },
    { id: 'm3', kind: 'received', at: '2026-11-03T12:00:00+09:00', preview: '부산은 요즘 바람이 많이 불어요', stamp_code: 'first-roundtrip' },
  ],
  3: [
    { id: 'd3', kind: 'diary', at: '2026-10-25T08:00:00+09:00', preview: '서귀포 귤밭 풍경을 일기로 남겼어요', stamp_code: 'tangerine' },
    { id: 'k1', kind: 'received', at: '2026-10-27T18:40:00+09:00', preview: '제주는 지금 귤 수확이 한창이에요', stamp_code: 'first-letter' },
    { id: 'k2', kind: 'sent', at: '2026-10-29T21:00:00+09:00', preview: '귤 한 상자 보내 주고 싶다니 감동이에요', stamp_code: 'first-diary' },
    { id: 'k3', kind: 'received', at: '2026-10-31T10:30:00+09:00', preview: '귤 먹고 힘내요!', stamp_code: 'first-roundtrip' },
  ],
}
