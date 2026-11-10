import { lazy } from 'react'
const HomePage = lazy(() => import('./HomePage.jsx'))
export default function HomeRoute() { return <HomePage /> }
