import { useCallback, useEffect, useRef, useState } from 'react'
import { isApiDemo } from '../api/client.js'
import { getPrompt } from '../api/prompts.js'
export default function useDiaryPrompt(examples, enabled = true) {
  const [prompt, setPrompt] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(false)
  const current = useRef(null), pending = useRef(false), active = useRef(true)
  const next = useCallback(async () => {
    if (pending.current) return
    pending.current = true; setLoading(true); setError('')
    try {
      const choices = examples.map((text, id) => ({ text, id })).filter((item) => item.id !== current.current?.id)
      const data = isApiDemo ? choices[Math.floor(Math.random() * choices.length)] : await getPrompt(current.current?.id)
      if (active.current) { current.current = data; setPrompt(data) }
    } catch (err) { if (active.current) setError(err.message) }
    finally { pending.current = false; if (active.current) setLoading(false) }
  }, [examples])
  useEffect(() => { active.current = true; if (enabled) next(); return () => { active.current = false } }, [enabled, next])
  return { text: prompt?.text || (loading ? '글감을 불러오고 있어요' : '우리 동네의 하루를 들려주세요'), error, loading, next }
}
