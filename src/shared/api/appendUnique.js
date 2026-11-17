/**
 * "더 보기"로 받은 다음 페이지를 이어 붙인다. 그 사이 새 글이 올라와 페이지가 밀리면 같은 항목이 다시 오므로
 * id가 이미 있는 항목은 뺀다(먼저 받은 것을 남긴다).
 * @template {{id: string|number}} T
 * @param {T[]} list 지금까지 받은 목록
 * @param {T[]} items 새로 받은 페이지
 * @returns {T[]}
 */
export default function appendUnique(list, items) {
  const seen = new Set(list.map((item) => item.id))
  return [...list, ...items.filter((item) => !seen.has(item.id) && seen.add(item.id))]
}
