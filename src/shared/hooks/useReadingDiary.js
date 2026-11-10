import { useSyncExternalStore } from 'react'
import { getReadingSnapshot, subscribeReading } from '../api/readingDiary.js'

// 홈·상세·알림이 신고·차단·읽음 상태를 함께 사용한다. 서버 연동 시 구독 경계를 교체한다.
export default function useReadingDiary() {
  return useSyncExternalStore(subscribeReading, getReadingSnapshot, getReadingSnapshot)
}
