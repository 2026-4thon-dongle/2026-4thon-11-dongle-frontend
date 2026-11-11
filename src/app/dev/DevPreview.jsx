// 개발 전용 확인 화면 (/preview) — 공용 컴포넌트·토큰을 눈으로 확인하는 용도
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import { MOCK_STAMPS } from '../../shared/mocks/stamps.js'
import Chip from '../../shared/ui/Chip.jsx'
import Header from '../../shared/ui/Header.jsx'
import TabBar from '../../shared/ui/TabBar.jsx'
import Input from '../../shared/ui/Input.jsx'
import Dropdown from '../../shared/ui/Dropdown.jsx'
import RegionChip from '../../shared/ui/RegionChip.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'

const COLORS = [
  'bg-cream', 'bg-surface', 'bg-butter', 'bg-peach',
  'brand-orange', 'brand-orange-deep', 'brand-sage', 'brand-sky', 'brand-berry', 'brand-blush',
  'text-brown', 'text-sub', 'text-hint', 'line-soft', 'white',
]

const TEXTS = [
  ['text-display-32', 'Display/32 Jua 동네에서 온 글'],
  ['text-title-24', 'Title/24 Jua 동네에서 온 글'],
  ['text-title-20', 'Title/20 Jua 동네에서 온 글'],
  ['text-title-17', 'Title/17 Jua 동네에서 온 글'],
  ['text-label-15', 'Label/15 Jua 동네에서 온 글'],
  ['text-body-15', 'Body/15 Gowun Dodum 동네에서 온 글 일기를 남겨요'],
  ['text-body-13', 'Body/13 Gowun Dodum 동네에서 온 글 일기를 남겨요'],
  ['text-caption-11', 'Caption/11 Gowun Dodum 동네에서 온 글 일기를 남겨요'],
  ['text-letter-22', 'Letter/22 Nanum Pen 사랑하는 고향 친구에게, 잘 지내니?'],
]

function Title({ children }) {
  return <h2 className="text-title-20" style={{ margin: '32px 0 12px' }}>{children}</h2>
}

function DevPreview() {
  const { openSheet, openDialog, showToast } = useOverlay()
  const [chip, setChip] = useState('selected')

  return (
    <main style={{ padding: '20px 20px calc(var(--tabbar-height) + 20px)' }}>
      <h1 className="text-display-32" style={{ margin: 0 }}>공용 요소 확인</h1>

      <Title>칩 · 지역 칩</Title>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip>기본</Chip>
        <Chip variant="selected">선택</Chip>
        <Chip variant="light">연한</Chip>
        <Chip variant={chip} onClick={() => setChip(chip === 'selected' ? 'default' : 'selected')}>누르면 바뀜</Chip>
        <RegionChip region="서울" />
      </div>

      <Title>헤더 · 입력 · 드롭다운</Title>
      <div style={{ display: 'grid', gap: 12 }}>
        {/* 헤더는 화면 양 끝까지 붙는다. main의 좌우 패딩(20px)을 상쇄한다. */}
        <div style={{ margin: '0 -20px' }}>
          <Header title="제목" />
        </div>
        <Input placeholder="입력하세요" />
        <Input placeholder="오류 상태" invalid />
        <Dropdown label="글씨체" value="나눔손글씨 펜" />
      </div>

      <Title>바텀시트 · 다이얼로그 · 토스트</Title>
      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        {/* 시트·다이얼로그 안의 내용은 쓰는 화면에서 만든다. 아래는 틀만 확인하는 예시. */}
        <Button
          variant="secondary"
          onClick={() =>
            openSheet({
              title: '바텀시트 제목',
              content: ({ close }) => (
                <div style={{ marginTop: 16 }}>
                  <Button variant="ghost" onClick={close}>닫기</Button>
                </div>
              ),
            })
          }
        >
          바텀시트 열기
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            openDialog({
              label: '다이얼로그 예시',
              content: ({ close }) => (
                <>
                  <p className="text-title-20" style={{ margin: '0 0 16px', textAlign: 'center' }}>다이얼로그</p>
                  <Button onClick={close}>확인</Button>
                </>
              ),
            })
          }
        >
          다이얼로그 열기
        </Button>
        <Button variant="secondary" onClick={() => showToast('저장했어요')}>토스트 띄우기</Button>
      </div>

      <Title>공통 상태 화면</Title>
      <ul className="text-body-15" style={{ margin: 0, paddingLeft: 20 }}>
        <li><Link to="/preview/loading">8-1 로딩 (스켈레톤)</Link></li>
        <li><Link to="/preview/error">8-2 네트워크 에러</Link></li>
        <li><Link to="/preview/boundary">렌더링 에러 → ErrorBoundary</Link></li>
      </ul>

      <Title>발송 연출</Title>
      <ul className="text-body-15" style={{ margin: 0, paddingLeft: 20 }}>
        <li><Link to="/preview/diary-reply">4-8, 4-9 임시저장과 이어 쓰기 (일기에서 답장)</Link></li>
        <li><Link to="/preview/stamp-sheet">4-6, 4-7 우표 선택 시트</Link></li>
        <li><Link to="/preview/stamping">4-10 도장 찍기 애니메이션</Link></li>
      </ul>

      <Title>편지 쓰기 단계 틀</Title>
      <ul className="text-body-15" style={{ margin: 0, paddingLeft: 20 }}>
        <li><Link to="/letter-write?diaryId=12&nickname=하늘빛&region=충남 천안">일기에서 답장으로 들어오기 (쿼리 전달)</Link></li>
      </ul>

      {/* 탭바는 화면 맨 아래에 고정된다 */}
      <TabBar />

      <Title>버튼</Title>
      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <Title>마스코트</Title>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {['face', 'smile', 'sleepy', 'letter', 'greeting'].map((pose) => (
          <figure key={pose} style={{ margin: 0, textAlign: 'center' }}>
            <Mascot pose={pose} size={100} />
            <figcaption className="text-caption-11">{pose}</figcaption>
          </figure>
        ))}
      </div>

      <Title>우표</Title>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {MOCK_STAMPS.map((stamp) => (
          <figure key={stamp.id} style={{ margin: 0, textAlign: 'center', opacity: stamp.owned ? 1 : 0.4 }}>
            <Stamp id={stamp.id} size={72} alt={stamp.name} />
            <figcaption className="text-caption-11">{stamp.name}</figcaption>
          </figure>
        ))}
      </div>

      <Title>색상</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
        {COLORS.map((name) => (
          <div key={name}>
            <div style={{ height: 48, borderRadius: 12, background: `var(--${name})`, border: '1px solid var(--line-soft)' }} />
            <div className="text-caption-11">--{name}</div>
          </div>
        ))}
      </div>

      <Title>폰트</Title>
      <div style={{ display: 'grid', gap: 10 }}>
        {TEXTS.map(([cls, sample]) => (
          <div key={cls} className={cls}>{sample}</div>
        ))}
      </div>
    </main>
  )
}

export default DevPreview
