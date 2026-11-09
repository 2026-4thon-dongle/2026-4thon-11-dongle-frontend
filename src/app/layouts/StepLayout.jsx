import Header from '../../shared/ui/Header.jsx'
import './StepLayout.css'

/**
 * 여러 단계로 나뉜 화면의 공통 틀. 헤더 + 단계 표시(알약) + 내용 + 아래 고정 버튼 영역.
 * 단계 이동(다음/이전)은 쓰는 쪽에서 정한다. 이 틀은 모양만 담당한다.
 * 헤더는 화면 끝까지 붙고, 단계 표시·내용·버튼은 좌우 20px 안쪽에 놓인다.
 *
 * @param {string} title 헤더 제목 (예: '편지 쓰기')
 * @param {string[]} steps 단계 이름 목록 (예: ['편지지', '내용', '서명', '우표'])
 * @param {number} current 현재 단계. 1부터 시작한다.
 * @param {() => void} [onBack] 헤더 뒤로가기 동작
 * @param {import('react').ReactNode} [footer] 아래에 고정할 버튼 영역(예: <StepFooter />)
 */
function StepLayout({ title, steps, current, onBack, footer, children }) {
  return (
    <div className="step-layout">
      <Header title={title} onBack={onBack} />

      <ol className="step-layout__progress" aria-label="진행 단계">
        {steps.map((label, index) => {
          const number = index + 1
          const state = number === current ? 'current' : number < current ? 'done' : 'todo'
          return (
            <li
              key={label}
              className={`step-layout__pill step-layout__pill--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {number} {label}
            </li>
          )
        })}
      </ol>

      <main className="step-layout__body">{children}</main>

      {footer && <div className="step-layout__footer">{footer}</div>}
    </div>
  )
}

export default StepLayout
