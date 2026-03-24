import { AppProviders } from './providers/AppProviders'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'
import { Gallery } from './components/Gallery'
import { About } from './components/About'
import { Location } from './components/Location'

function AppContent() {
  return (
    <div className="bg-forest-950 min-h-screen">
      <Navbar />
      <Hero />
      <Tours />
      <Gallery />
      <About />
      <Location />
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
