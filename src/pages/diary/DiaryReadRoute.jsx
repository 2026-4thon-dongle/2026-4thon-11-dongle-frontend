import { lazy } from 'react'
const DiaryReadPage = lazy(() => import('./DiaryReadPage.jsx'))
export default function DiaryReadRoute() { return <DiaryReadPage /> }
