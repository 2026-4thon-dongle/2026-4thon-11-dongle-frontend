// 개발 전용 확인 화면 — 공통 상태(로딩·에러)를 눈으로 확인하는 용도
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loading from '../../shared/feedback/Loading.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import Button from '../../shared/ui/Button.jsx'
import StampSheet from '../../components/letter-write/StampSheet.jsx'
import { clearLetterDraft } from '../../components/letter-write/letterDraftStorage.js'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { MOCK_OWNED_STAMPS } from '../../shared/mocks/stamps.js'
import StampingScene from '../../components/delivery/StampingScene.jsx'

// /preview/loading : 8-1 로딩 화면
export function DevLoading() {
  return <Loading />
}

// /preview/error : 8-2 에러 화면 (다시 시도를 누르면 알림만 띄운다)
export function DevError() {
  const [count, setCount] = useState(0)
  return (
    <ErrorScreen
      hint={count ? `다시 시도를 ${count}번 눌렀어요` : undefined}
      onRetry={() => setCount((value) => value + 1)}
    />
  )
}

// /preview/boundary : 렌더링 중 에러가 나면 ErrorBoundary가 에러 화면을 보여주는지 확인
// 다시 시도를 누르면 에러 상태가 풀리지만, 아래 컴포넌트가 다시 에러를 내므로 에러 화면이 다시 나온다.
export function DevBoundary() {
  throw new Error('ErrorBoundary 확인용 에러')
}

// /preview/stamping : 발송 연출(4-10)의 도장 찍는 애니메이션 확인. 다시 보기를 누르면 처음부터 다시 재생한다.
export function DevStamping() {
  const [round, setRound] = useState(0)
  return (
    <>
      <StampingScene key={round} />
      {/* 화면 위에 떠 있는 다시 보기 버튼 (연출 화면 자체에는 버튼이 없다) */}
      <div style={{ position: 'fixed', right: 0, bottom: 16, left: 0, zIndex: 10, padding: '0 20px', maxWidth: 'var(--app-width)', margin: '0 auto' }}>
        <Button variant="secondary" onClick={() => setRound((value) => value + 1)}>
          다시 보기
        </Button>
      </div>
    </>
  )
}

// /preview/stamp-sheet : 우표 선택 시트(4-6, 4-7)를 우표 개수별로 열어 본다. 시트 안의 동작은 알림으로만 확인한다.
export function DevStampSheet() {
  const { openSheet, showToast, close } = useOverlay()
  const open = (stamps) =>
    openSheet({
      title: '편지를 보낼까요?',
      content: (
        <StampSheet
          stamps={stamps}
          from="서울 성북"
          to="충남 천안"
          arrival="약 6시간"
          lockedStamp={{ id: 'first-roundtrip', art: 'first-roundtrip', name: '첫 왕복', hint: '편지를 주고받으면 받을 수 있어요' }}
          onReview={close}
          onGame={() => showToast('직접 배달하기')}
          onSend={(stampId) => {
            showToast(`보내기: ${stampId}`)
            close()
          }}
        />
      ),
    })
  return (
    <main style={{ display: 'grid', gap: 12, padding: 24 }}>
      <Button onClick={() => open(MOCK_OWNED_STAMPS)}>우표 여러 장 (4-6)</Button>
      <Button variant="secondary" onClick={() => open(MOCK_OWNED_STAMPS.slice(0, 1))}>
        우표 1장 (4-7)
      </Button>
    </main>
  )
}

// /preview/diary-reply : 일기 상세의 "편지로 답장하기"를 흉내 낸 화면. 실제 일기 상세처럼 /letter-write로 들어가면
// 임시저장한 편지가 있을 때 "이어 쓰기" 시트(4-9)가 뜨는지 확인한다.
const MOCK_DIARY = { diaryId: '12', nickname: '하늘빛', region: '충남 천안' }

export function DevDiaryReply() {
  const navigate = useNavigate()
  const { showToast } = useOverlay()
  return (
    <main style={{ display: 'grid', gap: 12, padding: 24 }}>
      <h1 className="text-title-20" style={{ margin: 0 }}>고향 일기 (확인용)</h1>
      <p className="text-body-13" style={{ margin: 0 }}>
        {MOCK_DIARY.nickname}님의 일기에 편지로 답장합니다. 편지를 쓰다 나가면서 임시저장한 뒤 다시 눌러 보세요.
      </p>
      <Button onClick={() => navigate(`/letter-write?${new URLSearchParams(MOCK_DIARY)}`)}>편지로 답장하기</Button>
      <Button
        variant="secondary"
        onClick={async () => {
          await clearLetterDraft(MOCK_DIARY)
          showToast('임시저장을 지웠어요')
        }}
      >
        임시저장 지우기
      </Button>
    </main>
  )
}
