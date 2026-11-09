import { Component } from 'react'
import ErrorScreen from './ErrorScreen.jsx'

/**
 * 렌더링 중 에러를 잡아 ErrorScreen을 보여준다. 다시 시도를 누르면 에러 상태를 풀고 다시 그린다.
 * (이벤트 핸들러나 비동기 호출의 에러는 잡지 못한다. API 호출 에러는 호출한 쪽에서 처리한다.)
 * @param {({ error, reset }) => import('react').ReactNode} [fallback] 기본 ErrorScreen 대신 쓸 화면
 */
class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
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
