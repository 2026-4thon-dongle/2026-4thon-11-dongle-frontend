// 우체통 목록 mock 모드(VITE_API_MOCK=true, 개발 전용). 서버 호출은 mailboxApi.js가 한다.
// shared/mocks/mailbox.js의 옛 mock 모양을 서버 응답 모양(api/mailbox.md)으로 바꿔 mailboxMapper에 넘긴다.
// 읽음·답장·넘김 상태는 mailboxMockStore.js(메모리)에 두고 letterReceiveDemo.js가 같이 쓴다.
//   새 편지 탭: 읽은 편지는 빨간 점만 사라지고 탭에 남는다. 답장·넘긴 편지는 빠진다.
//   대화 중 탭: 답장한 편지가 "배송 중" 대화로 들어온다.
//   보관 탭: 넘긴 편지가 "넘긴 편지"로 들어온다.
//   배송 중 탭: 도착 임박순(남은 시간이 짧은 순)으로 고정한다.
import { getMockMailboxResponse } from '../../shared/mocks/mailbox.js'
import { MOCK_LETTER_DETAILS } from '../../shared/mocks/letterDetail.js'
import { PROVINCES, CITIES } from '../../shared/region/regions.js'
import { toMailboxPage } from './mailboxMapper.js'
import { readIds, repliedIds, passedAt, friendIdOf } from './mailboxMockStore.js'

const MINUTE = 60000

/**
 * 옛 mock의 지역 표기("전주시", "충남 천안") → 시·도 짧은 이름("전북", "충남"). 못 찾으면 null.
 * 서버는 from_region.sido를 짧은 이름으로 주므로(api/mailbox.md) mock도 같은 값을 만든다.
 */
export function toProvince(regionText) {
  if (!regionText) return null
  const first = regionText.trim().split(/\s+/)[0]
  if (PROVINCES.includes(first)) return first
  const name = first.replace(/(시|군)$/, '')
  if (PROVINCES.includes(name)) return name
  return PROVINCES.find((province) => CITIES[province]?.includes(name)) ?? null
}

export const regionOf = (text) => (text ? { full_name: text, name: text, sido: toProvince(text) ?? text } : null)

// ─── 옛 mock → 서버 응답 모양 ────────────────────────────────────────────────

function newLetterToServer(letter) {
  return {
    id: letter.id,
    sender: { nickname: letter.sender_nickname },
    from_region: regionOf(letter.sender_region),
    stamp: letter.stamp,
    duration_minutes: letter.travel_minutes,
    arrived_at: letter.arrived_at,
    is_read: letter.is_read,
  }
}

function chatToServer(chat, now) {
  const status = chat.status === 'waiting_reply' ? 'waiting' : chat.status === 'ended' ? 'closed' : chat.status
  const iso = (time) => new Date(time).toISOString()
  let lastLetter = null
  if (status === 'my_turn') {
    lastLetter = { direction: 'received', preview: chat.last_message_preview ?? null, arrived_at: iso(now), arrives_at: iso(now) }
  } else if (status === 'waiting') {
    lastLetter = { direction: 'sent', preview: null, arrived_at: chat.arrived_at, arrives_at: chat.arrived_at }
  } else if (status === 'in_transit') {
    lastLetter = { direction: 'sent', preview: null, arrived_at: null, arrives_at: iso(now + (chat.remaining_minutes ?? 0) * MINUTE) }
  }
  // mock에서는 대화 id를 친구 id와 같게 둔다(penPalDemo의 /pen-pal/:id와 이어지게)
  const id = chat.friend_id ?? chat.id
  return {
    id,
    partner: { id, nickname: chat.sender_nickname, avatar: null, region: regionOf(chat.sender_region) },
    status,
    round_trips: chat.round_trip_count ?? 0,
    is_penpal: false,
    last_letter: lastLetter,
    closed_at: null,
  }
}

function shippingToServer(item, now) {
  const elapsed = (item.travel_minutes ?? 0) - (item.remaining_minutes ?? 0)
  return {
    id: item.id,
    direction: item.direction === 'received' ? 'incoming' : 'sent',
    partner: { nickname: item.counterpart_nickname },
    from_region: { sido: item.from_region },
    to_region: { sido: item.to_region },
    sent_at: new Date(now - elapsed * MINUTE).toISOString(),
    arrives_at: new Date(now + (item.remaining_minutes ?? 0) * MINUTE).toISOString(),
    stamp: item.stamp,
  }
}

function storedToServer(item) {
  const isConversation = item.kind === 'ended_chat'
  return {
    kind: isConversation ? 'closed_conversation' : 'passed_letter',
    letter_id: isConversation ? null : item.id,
    conversation_id: isConversation ? (friendIdOf(item.sender_nickname) ?? item.id) : null,
    partner: { nickname: item.sender_nickname, region: regionOf(item.sender_region) },
    stamp: item.stamp,
    archived_at: item.stored_at,
  }
}

// ─── mock 상태(읽음·답장·넘김)를 목록에 합치기 ──────────────────────────────

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

function buildServerResponse(tab, { sort, sido = null, empty }, now) {
  const base = getMockMailboxResponse(tab, { sort, empty })
  let results = base.results

  if (!empty) {
    if (tab === 'new') {
      results = sortNewLetters(
        results
          .filter((letter) => !repliedIds.has(letter.id) && !passedAt.has(letter.id))
          .map((letter) => ({ ...letter, is_read: letter.is_read || readIds.has(letter.id) })),
        sort,
      )
    } else if (tab === 'chatting') {
      const added = repliedChats()
      const addedFriendIds = new Set(added.map((chat) => chat.friend_id))
      // 같은 상대와의 대화는 하나이므로 기존 카드는 새 카드로 바꾼다
      const existing = results
        .map((chat) => ({ ...chat, friend_id: friendIdOf(chat.sender_nickname) }))
        .filter((chat) => !addedFriendIds.has(chat.friend_id))
      results = [...added, ...existing]
    } else if (tab === 'stored') {
      results = [...passedStored(), ...results]
    } else if (tab === 'shipping') {
      results = [...results].sort((a, b) => a.remaining_minutes - b.remaining_minutes)
    }
  }

  const convert = { new: newLetterToServer, chatting: (chat) => chatToServer(chat, now), shipping: (item) => shippingToServer(item, now), stored: storedToServer }[tab]
  const converted = results.map(convert)
  // mock의 sido는 시·도 짧은 이름이다(서버는 시·도 id). 새 편지 탭만 거른다.
  const filtered = tab === 'new' && sido ? converted.filter((letter) => letter.from_region?.sido === sido) : converted
  return { count: filtered.length, next: null, previous: null, results: filtered }
}

/** mock 목록. 한 번에 다 주므로 다음 페이지는 없다. 반환은 mailboxApi.fetchMailboxLetters와 같다. */
export async function fetchDemoMailboxLetters(tab, { sort = 'latest', sido = null, empty = false } = {}) {
  const now = Date.now()
  return toMailboxPage(tab, buildServerResponse(tab, { sort, sido, empty }, now), now)
}

/** mock 탭 점: 읽지 않은 새 편지가 있는지 */
export async function fetchDemoMailboxSummary({ empty = false } = {}) {
  const { results } = buildServerResponse('new', { sort: 'latest', empty }, Date.now())
  const unread = results.filter((letter) => !letter.is_read).length
  return { hasUnread: unread > 0, newCount: results.length, myTurnCount: 0, inTransitCount: 0 }
}
