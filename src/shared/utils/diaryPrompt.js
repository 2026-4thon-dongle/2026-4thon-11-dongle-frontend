export function insertDiaryPrompt(content, prompt) {
  if (!prompt || content.split('\n')[0] === prompt) return content
  const next = `${prompt}\n\n${content}`
  if (next.length > 500) throw new Error('글감을 넣으면 500자를 넘어요. 내용을 조금 줄여주세요')
  return next
}
