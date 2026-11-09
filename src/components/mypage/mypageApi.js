// 마이 요청. mock, 문서 레포 API 확정 전(프론트 연동 전).
// 지금은 shared/mocks/mypage.js를 돌려준다. 실제 API가 연결되면 이 함수 안에서 서버를 호출한다.
//   GET /api/users/me/            → fetchMyPage
//   GET /api/users/me/settings/   → fetchMyPage
//   임시저장 목록·삭제              → fetchDrafts, deleteDraft (mock 전용. 명세 없음, 저장 방식 미정)
//   우표첩(보유·보상)               → fetchStampCollection (mock 전용. 명세에 우표 목록 API가 없다)
// 반환값은 항상 mypageMapper의 화면용 데이터이다.
import { MOCK_ME, MOCK_ME_EXTRA, MOCK_SETTINGS, MOCK_DRAFTS } from '../../shared/mocks/mypage.js'
import { MOCK_STAMPS } from '../../shared/mocks/stamps.js'
import { MOCK_OWNED_STAMP_CODES, MOCK_STAMP_REWARDS } from '../../shared/mocks/stampCollection.js'
import { toMyPage, toDraftCard, toStampCollection } from './mypageMapper.js'

// 삭제가 7-1의 "N통"에도 반영되도록 메모리에 복사해 둔다(새로고침하면 처음 mock으로 돌아간다). mock 전용.
let drafts = [...MOCK_DRAFTS]

export async function fetchMyPage() {
  const me = {
    ...MOCK_ME,
    ...MOCK_ME_EXTRA,
    stats: { ...MOCK_ME.stats, draft_count: drafts.length },
  }
  return toMyPage(me, MOCK_SETTINGS)
}

export async function fetchDrafts() {
  return drafts.map(toDraftCard)
}

export async function deleteDraft(id) {
  drafts = drafts.filter((draft) => draft.id !== id)
}

/**
 * 우표첩. 우표 이름·종류는 shared/mocks/stamps.js를 읽기만 하고, 보유 상태와 보상은 stampCollection.js의 mock이다.
 * @param {{ empty?: boolean }} [options] empty: true면 보유한 우표가 0개인 상태(7-6)를 보여 준다. 개발 확인용.
 */
export async function fetchStampCollection({ empty = false } = {}) {
  return toStampCollection(MOCK_STAMPS, empty ? [] : MOCK_OWNED_STAMP_CODES, MOCK_STAMP_REWARDS)
}
