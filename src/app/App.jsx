import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import SessionGate from '../shared/api/SessionGate.jsx'
import OverlayProvider from '../shared/ui/OverlayProvider.jsx'

function App() {
  return (
    <BrowserRouter>
      <OverlayProvider>
        <SessionGate><AppRoutes /></SessionGate>
      </OverlayProvider>
    </BrowserRouter>
  )
}

export default App
