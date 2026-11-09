import Skeleton from '../ui/Skeleton.jsx'
import Mascot from '../ui/Mascot.jsx'
import './Loading.css'

/**
 * 로딩 화면(시안 8-1). 화면 뼈대 모양의 스켈레톤 위에 "불러오는 중…" 알약을 띄운다.
 * 라우트 Suspense의 fallback으로 쓴다. 화면마다 다른 스켈레톤이 필요하면 Skeleton 블록으로 직접 만든다.
 */
function Loading() {
  return (
    <main className="ui-loading" role="status" aria-live="polite" aria-label="불러오는 중">
      <h1 className="ui-loading__title">동글</h1>

      <Skeleton className="ui-loading__tabs" height={44} radius={22} />
      <Skeleton className="ui-loading__card" height={76} radius={24} />
      <Skeleton className="ui-loading__bar" width={140} height={12} radius={6} />

      <div className="ui-loading__feed">
        <Skeleton className="ui-loading__photo" tone="surface" height={170} radius={20} />
        <Skeleton className="ui-loading__line" width={120} height={14} radius={7} style={{ top: 196 }} />
        <Skeleton className="ui-loading__line" width={280} height={12} radius={6} style={{ top: 220 }} />
        <Skeleton className="ui-loading__line" width={220} height={12} radius={6} style={{ top: 240 }} />

        <div className="ui-loading__pill">
          <Mascot pose="sleepy" size={34} />
          <span>불러오는 중…</span>
        </div>
      </div>

      <Skeleton className="ui-loading__more" height={90} radius={24} />
    </main>
  )
}

export default Loading
