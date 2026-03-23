import { AppProviders } from './providers/AppProviders'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'

function AppContent() {
  return (
    <div className="bg-forest-950 min-h-screen">
      <Navbar />
      <Hero />
    </div>
  )
}

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  )
}

export default App
