// 아이콘 SVG 원문을 이름(파일명)으로 모아 둔다. 색은 currentColor라 CSS color로 바꾼다.
const modules = import.meta.glob('./*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const icons = {}
for (const [path, raw] of Object.entries(modules)) {
  const name = path.replace('./', '').replace('.svg', '')
  icons[name] = raw
}

export default icons
export const ICON_NAMES = Object.keys(icons)
