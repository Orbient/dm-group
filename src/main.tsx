import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// No StrictMode: its dev double-mount makes CircularGallery call loseContext() on the canvas it then reuses
createRoot(document.getElementById('root')!).render(<App />)
