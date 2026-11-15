// 우체통 목록 요청. mock, 문서 레포 API 확정 전, Notion 초안 참고.
// 지금은 shared/mocks/mailbox.js를 돌려주고, API가 확정되면 이 함수 안에서 서버를 호출한다.
// 반환값은 항상 mailboxMapper의 화면용 데이터({ items, nextCursor, hasNext })이다.
import { getMockMailboxResponse } from '../../shared/mocks/mailbox.js'
import { MOCK_LETTER_DETAILS } from '../../shared/mocks/letterDetail.js'
import { toMailboxPage, listProvinces } from './mailboxMapper.js'
import { readIds, repliedIds, passedAt, friendIdOf } from './mailboxMockStore.js'

// ─── mock 전용: 읽음·답장·넘김 상태를 목록 mock에 합친다 ───────────────────────────
// 서버가 있으면 이 블록(buildMockResponse와 아래 함수들)은 필요 없다. 서버가 상태를 반영한 목록을 준다.
//   새 편지 탭: 읽은 편지는 빨간 점만 사라지고 탭에 남는다. 답장·넘긴 편지는 빠진다.
//   대화 중 탭: 답장한 편지가 "배송 중" 대화로 들어온다.
//   보관 탭: 넘긴 편지가 "넘긴 편지"로 들어온다.
//   배송 중 탭: 도착 임박순(남은 시간이 짧은 순)으로 고정한다. 서버가 정렬해 주면 걸러내기를 지운다.

// 새 편지 탭의 정렬 칩. shared/mocks/mailbox.js의 sortLetters와 같은 규칙이다(읽음 상태를 합친 뒤 다시 정렬해야 해서 따로 둔다).
function sortNewLetters(letters, sort) {
  const byLatest = (a, b) => new Date(b.arrived_at) - new Date(a.arrived_at)
  const copied = [...letters]
  if (sort === 'oldest') return copied.sort((a, b) => -byLatest(a, b))
  if (sort === 'unread') return copied.sort((a, b) => Number(a.is_read) - Number(b.is_read) || byLatest(a, b))
  return copied.sort(byLatest)
}

function repliedChats() {
  // 가장 최근에 답장한 편지가 맨 위로 오게 뒤집는다
  return [...repliedIds]
    .reverse()
    .map((id) => MOCK_LETTER_DETAILS[id])
    .filter(Boolean)
    .map((detail) => ({
      id: detail.id,
      sender_nickname: detail.sender_nickname,
      sender_region: detail.sender_region,
      friend_id: friendIdOf(detail.sender_nickname),
      status: 'in_transit',
      remaining_minutes: detail.travel_minutes,
      round_trip_count: 1,
    }))
}

function passedStored() {
  return [...passedAt]
    .reverse()
    .map(([id, storedAt]) => ({ detail: MOCK_LETTER_DETAILS[id], storedAt }))
    .filter(({ detail }) => detail)
    .map(({ detail, storedAt }) => ({
      id: detail.id,
      kind: 'passed_letter',
      sender_nickname: detail.sender_nickname,
      sender_region: detail.sender_region,
      stamp: { ...detail.stamp, image_url: null },
      stored_at: storedAt,
    }))
}

function buildMockResponse(tab, { sort, empty }) {
  const base = getMockMailboxResponse(tab, { sort, empty })
  if (empty) return base

  if (tab === 'new') {
    const letters = base.results
      .filter((letter) => !repliedIds.has(letter.id) && !passedAt.has(letter.id))
      .map((letter) => ({ ...letter, is_read: letter.is_read || readIds.has(letter.id) }))
    return { ...base, results: sortNewLetters(letters, sort) }
  }

  if (tab === 'chatting') {
    const added = repliedChats()
    const addedFriendIds = new Set(added.map((chat) => chat.friend_id))
    // 같은 상대와의 대화는 하나이므로 기존 카드는 새 카드로 바꾼다
    const existing = base.results
      .map((chat) => ({ ...chat, friend_id: friendIdOf(chat.sender_nickname) }))
      .filter((chat) => !addedFriendIds.has(chat.friend_id))
    return { ...base, results: [...added, ...existing] }
  }

  if (tab === 'stored') return { ...base, results: [...passedStored(), ...base.results] }

  if (tab === 'shipping') {
    return { ...base, results: [...base.results].sort((a, b) => a.remaining_minutes - b.remaining_minutes) }
  }

  return base
}

/**
 * @param {'new'|'chatting'|'shipping'|'stored'} tab
 * @param {{ sort?: 'latest'|'oldest'|'unread', region?: string|null, empty?: boolean }} [options]
 *   region: 보낸 사람 시·도("전북"). 새 편지 탭에서만 쓰고, 없으면 전체이다.
 *   배송 중 탭은 정렬 옵션 없이 도착 임박순으로 고정이다.
 * @returns 새 편지 탭은 { items, nextCursor, hasNext, regions, hasUnread }를 돌려준다.
 *   - regions: 필터를 걸기 전 전체 목록에 있는 시·도(드롭다운 목록)
 *   - hasUnread: 필터와 상관없이 읽지 않은 편지가 있는지(탭 옆 빨간 점)
 */
export async function fetchMailboxLetters(tab, options = {}) {
  const { region = null, ...mockOptions } = options
  const page = toMailboxPage(tab, buildMockResponse(tab, mockOptions))
  if (tab !== 'new') return page

  // mock 전용: 서버가 지역 필터를 받으면 이 걸러내기는 서버 파라미터로 바꾸고,
  // regions·hasUnread는 서버가 따로 주는 값을 쓴다(필터가 걸린 결과로는 계산할 수 없다).
  const all = page.items
  return {
    ...page,
    items: region ? all.filter((item) => item.province === region) : all,
    regions: listProvinces(all),
    hasUnread: all.some((item) => !item.isRead),
  }
}
