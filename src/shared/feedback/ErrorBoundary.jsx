import { Component } from 'react'
import ErrorScreen from './ErrorScreen.jsx'

/**
 * 렌더링 중 에러를 잡아 ErrorScreen을 보여준다. 다시 시도를 누르면 에러 상태를 풀고 다시 그린다.
 * (이벤트 핸들러나 비동기 호출의 에러는 잡지 못한다. API 호출 에러는 호출한 쪽에서 처리한다.)
 * @param {({ error, reset }) => import('react').ReactNode} [fallback] 기본 ErrorScreen 대신 쓸 화면
 * @param {unknown} [resetKey] 이 값이 바뀌면 에러 상태를 푼다(예: 현재 경로). 자식을 새로 만들지는 않아서,
 *   key로 경계를 새로 만드는 것과 달리 그 아래 레이아웃·Provider의 상태가 유지된다.
 */
class ErrorBoundary extends Component {
  state = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error) {
    return { error }
  }

  // resetKey가 바뀌면 에러 상태를 풀고 자식을 다시 그린다.
  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey }
    return null
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset })
    return <ErrorScreen onRetry={this.reset} />
  }
}

export default ErrorBoundary
