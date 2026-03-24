import { AppProviders } from './providers/AppProviders'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'

function AppContent() {
  return (
    <div className="bg-forest-950 min-h-screen">
      <Navbar />
      <Hero />
      <Tours />
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
