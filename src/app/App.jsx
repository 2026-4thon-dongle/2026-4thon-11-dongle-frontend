import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import OverlayProvider from '../shared/ui/OverlayProvider.jsx'

function App() {
  return (
    <BrowserRouter>
      <OverlayProvider>
        <AppRoutes />
      </OverlayProvider>
    </BrowserRouter>
  )
}

export default App
