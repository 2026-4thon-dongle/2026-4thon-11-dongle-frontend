/**
 * @param {{ title: string }} props
 */
function RoutePlaceholder({ title }) {
  return (
    <main className="route-placeholder">
      <h1>{title}</h1>
      <p>담당 화면을 이 위치에 구현합니다.</p>
    </main>
  )
}

export default RoutePlaceholder
