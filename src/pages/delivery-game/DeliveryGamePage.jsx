import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import LoadingPill from '../../shared/feedback/LoadingPill.jsx'
import GameCanvas from '../../components/delivery-game/GameCanvas.jsx'
import GameIntro from '../../components/delivery-game/GameIntro.jsx'
import GameResult from '../../components/delivery-game/GameResult.jsx'
import { fetchGameHome, fetchLetterGame, finishRun, startRun } from '../../components/delivery-game/gameApi.js'
import './DeliveryGamePage.css'

// 서버는 시작 25초 뒤부터 결과를 받는다. 카운트다운 3초 + 30초라 보통은 기다리지 않는다.
const MIN_RUN_MS = 25_500

/**
 * 9-1·9-2 직접 배달 게임. 주소: /delivery-game?letterId=123 (없으면 배송 중 편지에서 고르거나 연습한다)
 * 흐름: 들어가기(편지·규칙·우표 목표) → 플레이(30초) → 결과(별, 단축 시간, 받은 우표).
 * 명세: 문서 레포 api/game.md
 */
function DeliveryGamePage() {
  const navigate = useNavigate()
  const { showToast } = useOverlay()
  const [params, setParams] = useSearchParams()
  const letterId = params.get('letterId')
  const [home, setHome] = useState(null)
  const [extraLetter, setExtraLetter] = useState(null)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('intro') // intro | starting | playing | submitting | result
  const [run, setRun] = useState(null)
  const [result, setResult] = useState(null)

  const [reload, setReload] = useState(0)
  const load = useCallback(() => setReload((value) => value + 1), [])

  useEffect(() => {
    const request = { cancelled: false }
    fetchGameHome()
      .then(async (data) => {
        // 배송 중 목록에 없는 편지(이미 도착 등)는 따로 물어 이유를 보여 준다.
        const missing = letterId && !data.letters.some((item) => String(item.id) === letterId)
        const extra = missing ? await fetchLetterGame(letterId).catch(() => null) : null
        if (request.cancelled) return
        setHome(data)
        setExtraLetter(extra)
        setError(null)
      })
      .catch((loadError) => !request.cancelled && setError(loadError))
    return () => {
      request.cancelled = true
    }
  }, [letterId, reload])

  const selectLetter = (id) => setParams(id ? { letterId: String(id) } : {}, { replace: true })

  const start = async (targetId) => {
    setPhase('starting')
    try {
      const started = await startRun(targetId)
      setRun({ ...started, startedAt: Date.now() })
      setResult(null)
      setPhase('playing')
    } catch (startError) {
      showToast(startError.message)
      setPhase('intro')
      load()
    }
  }

  const submit = useCallback(
    async (score) => {
      setPhase('submitting')
      const wait = MIN_RUN_MS - (Date.now() - run.startedAt)
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
      try {
        setResult(await finishRun(run.id, score))
        setPhase('result')
      } catch (finishError) {
        showToast(finishError.message)
        setPhase('intro')
      }
      load()
    },
    [run, showToast, load],
  )

  if (error) return <ErrorScreen title="배달 게임을 불러오지 못했어요" description={error.message} hint="" onRetry={load} />
  if (!home) return <LoadingPill fullScreen />

  if (phase === 'playing' && run) {
    return (
      <main className="delivery-game-page delivery-game-page--playing">
        <GameCanvas key={run.id} run={run} starRules={home.rules.stars} onEnd={submit} />
      </main>
    )
  }
  if (phase === 'submitting') return <LoadingPill fullScreen />

  if (phase === 'result' && result) {
    const practice = !run?.letter_id
    const primary = practice
      ? { label: '우체통으로', onClick: () => navigate('/mailbox') }
      : { label: '배송 지도 보기', onClick: () => navigate(`/delivery/${run.letter_id}/map`) }
    return (
      <main className="delivery-game-page">
        <GameResult result={result} practice={practice} onAgain={() => start(run?.letter_id ?? null)} primary={primary} />
      </main>
    )
  }

  const letter = letterId ? (home.letters.find((item) => String(item.id) === letterId) ?? extraLetter) : null
  return (
    <main className="delivery-game-page">
      <Header title="직접 배달하기" />
      <GameIntro home={home} letter={letter} busy={phase === 'starting'} onStart={start} onSelect={selectLetter} />
    </main>
  )
}

export default DeliveryGamePage
