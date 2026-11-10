import { useSyncExternalStore } from 'react'
import { getOwnedDiarySnapshot, subscribeOwnedDiaries } from '../api/ownedDiary.js'

export default function useOwnedDiaries() {
  return useSyncExternalStore(subscribeOwnedDiaries, getOwnedDiarySnapshot, getOwnedDiarySnapshot)
}
