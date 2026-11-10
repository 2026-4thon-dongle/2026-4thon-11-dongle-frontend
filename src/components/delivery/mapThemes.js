import city from './assets/map/city.svg'
import sea from './assets/map/sea.svg'
import mountain from './assets/map/mountain.svg'
import field from './assets/map/field.svg'
import river from './assets/map/river.svg'

// 배송 지도 배경 5종(도시·바다·산·논밭·강가). 개발에서는 편지마다 하나를 골라 쓴다.
export const MAP_THEMES = [
  { id: 'city', name: '도시', src: city },
  { id: 'sea', name: '바다', src: sea },
  { id: 'mountain', name: '산', src: mountain },
  { id: 'field', name: '논밭', src: field },
  { id: 'river', name: '강가', src: river },
]

/**
 * 편지 번호로 배경을 하나 고른다. 같은 편지는 다시 열어도 같은 배경이 나온다.
 * @param {string} seed 편지 번호(letterId)
 */
export function pickMapTheme(seed = '') {
  const hash = [...String(seed)].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return MAP_THEMES[hash % MAP_THEMES.length]
}
