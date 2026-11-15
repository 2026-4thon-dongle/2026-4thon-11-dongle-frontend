// 글상자가 안에서 스크롤되지 않고 같이 길어지는 편지 쓰기(4-2)에서, 글을 쓰는 위치(커서)가 화면 밖으로 나가지 않게 화면을 따라 내린다.
// 글상자 자체는 스크롤되지 않으므로 브라우저가 커서를 보여 주도록 맡길 수 없어 직접 계산한다.

const MARGIN = 16 // 커서와 화면 가장자리(또는 아래 버튼 영역) 사이에 남길 여백(px)
const FOOTER_SELECTOR = '.step-layout__footer' // 화면 아래에 붙어 있는 버튼 영역(StepLayout)

// 커서가 있는 줄의 위·아래(글상자 위쪽 기준 px)를 잰다. 같은 모양의 보이지 않는 요소에 커서 앞까지의 글을 넣고 끝을 재는 방식이다.
function measureCaretLine(textarea) {
  const style = getComputedStyle(textarea)
  const mirror = document.createElement('div')
  Object.assign(mirror.style, {
    position: 'absolute',
    visibility: 'hidden',
    top: '0',
    left: '-9999px',
    boxSizing: 'border-box',
    width: `${textarea.clientWidth}px`,
    padding: style.padding,
    border: '0',
    font: style.font,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  })
  mirror.textContent = textarea.value.slice(0, textarea.selectionEnd)
  const marker = document.createElement('span')
  marker.textContent = '​' // 줄 끝에서도 높이가 생기게 하는 보이지 않는 글자
  mirror.appendChild(marker)
  document.body.appendChild(mirror)

  const lineHeight = Number.parseFloat(style.lineHeight) || 30
  const top = marker.offsetTop
  document.body.removeChild(mirror)
  return { top, bottom: top + lineHeight }
}

/**
 * 글상자의 커서가 보이도록 화면(window)을 필요한 만큼만 스크롤한다. 이미 보이면 아무것도 하지 않는다.
 * 보이는 영역은 모바일 키보드가 올라온 만큼 줄어든 화면(visualViewport)에서, 아래 버튼 영역을 뺀 부분이다.
 * @param {HTMLTextAreaElement} textarea
 */
export default function scrollCaretIntoView(textarea) {
  const line = measureCaretLine(textarea)
  const textareaTop = textarea.getBoundingClientRect().top // 지금 화면 위에서 글상자까지

  const viewport = window.visualViewport
  const viewTop = viewport?.offsetTop ?? 0
  const viewBottom = viewTop + (viewport?.height ?? window.innerHeight)
  const footerHeight = textarea.closest('.step-layout')?.querySelector(FOOTER_SELECTOR)?.offsetHeight ?? 0

  const caretTop = textareaTop + line.top
  const caretBottom = textareaTop + line.bottom
  const visibleBottom = viewBottom - footerHeight - MARGIN
  const visibleTop = viewTop + MARGIN

  if (caretBottom > visibleBottom) window.scrollBy(0, caretBottom - visibleBottom)
  else if (caretTop < visibleTop) window.scrollBy(0, caretTop - visibleTop)
}
