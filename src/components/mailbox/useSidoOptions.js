// 우체통 지역 필터(5-1)의 시·도 목록. 서버(GET /api/regions/)의 최상위 시·도 17개를 서버 순서(서울, 부산, …)대로 쓴다.
// 각 항목의 id가 새 편지 목록의 sido 파라미터(api/mailbox.md GET /api/mailbox/new/)로 간다.
// 받는 중에는 loading, 못 받으면 error와 retry를 준다. 서버가 실패해도 고정 목록으로 채우지 않는다.
// VITE_API_MOCK=true(개발 전용)일 때만 shared/region/regions.js의 시·도 이름을 쓴다. 이때 id는 시·도 짧은 이름이고, mailboxDemo가 같은 값으로 거른다.
import { useMemo } from 'react'
import { isApiDemo } from '../../shared/api/client.js'
import { PROVINCES } from '../../shared/region/regions.js'
import useRegions from '../../shared/region/useRegions.js'

const DEMO_OPTIONS = PROVINCES.map((name) => ({ id: name, label: name }))
const DEMO_RESULT = { options: DEMO_OPTIONS, loading: false, error: null, retry: () => {} }

function useServerSidoOptions() {
  const { tree, error, retry } = useRegions()
  const options = useMemo(() => (tree ? [...tree.provinceById].map(([id, label]) => ({ id, label })) : []), [tree])
  return { options, loading: !tree && !error, error, retry }
}

// 개발 모드 여부는 앱이 떠 있는 동안 바뀌지 않아 훅 호출 순서는 항상 같다.
const useSidoOptions = isApiDemo ? () => DEMO_RESULT : useServerSidoOptions

export default useSidoOptions
