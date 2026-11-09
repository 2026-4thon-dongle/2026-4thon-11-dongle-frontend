import { lazy } from 'react'
const NotificationPage = lazy(() => import('./NotificationPage.jsx'))
export default function NotificationRoute() { return <NotificationPage /> }
