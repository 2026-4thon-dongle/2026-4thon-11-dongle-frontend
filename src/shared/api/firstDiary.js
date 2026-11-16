import { isApiDemo } from './client.js'
import { createFirstOwnedDiary } from './ownedDiary.js'
export const isFirstDiaryDemo = isApiDemo
export const publishFirstDiary = (draft) => createFirstOwnedDiary(draft)
