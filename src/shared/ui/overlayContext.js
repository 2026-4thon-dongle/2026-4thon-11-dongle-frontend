import { createContext } from 'react'

// OverlayProvider가 값을 채우고, shared/hooks/useOverlay가 꺼내 쓴다.
export const OverlayContext = createContext(null)
