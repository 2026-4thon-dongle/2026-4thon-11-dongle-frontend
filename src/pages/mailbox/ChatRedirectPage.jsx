import { Navigate, useParams } from 'react-router-dom'

/**
 * /mailbox/:chatId → /pen-pal/:conversationId. 알림(round_trip)의 target_id가 대화 id라서 /mailbox/chats/:대화id 로 들어오면
 * 같은 대화의 주고받은 편지(5-15)로 보낸다. 히스토리에는 남기지 않는다(replace).
 */
function ChatRedirectPage() {
  const { chatId } = useParams()
  return <Navigate to={`/pen-pal/${encodeURIComponent(chatId)}`} replace />
}

export default ChatRedirectPage
