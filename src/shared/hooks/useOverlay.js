import { useContext } from 'react'
import { OverlayContext } from '../ui/overlayContext.js'

/**
 * 바텀시트·다이얼로그·토스트를 여는 훅. OverlayProvider 안에서만 쓸 수 있다.
 *
 * const { openSheet, openDialog, showToast, close } = useOverlay()
 *
 * openSheet({ title, content })   content: React 요소 또는 ({ close }) => 요소
 * openDialog({ label, content })  content: React 요소 또는 ({ close }) => 요소
 * showToast('메시지')
 * close()                         열려 있는 시트·다이얼로그를 닫는다.
 *
 * 시트·다이얼로그 안의 내용(메뉴, 제목, 버튼 등)은 쓰는 화면에서 content로 만들어 넘긴다.
 * 내용 안의 버튼에서 닫으려면 content를 함수로 넘겨 close를 받아 쓴다.
 */
export default function useOverlay() {
  const value = useContext(OverlayContext)
  if (!value) throw new Error('useOverlay는 OverlayProvider 안에서만 쓸 수 있어요.')
  return value
}
