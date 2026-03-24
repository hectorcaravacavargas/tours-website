import { AppProviders } from './providers/AppProviders'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'
import { Gallery } from './components/Gallery'
import { About } from './components/About'
import { Location } from './components/Location'
import { FAQ } from './components/FAQ'

function AppContent() {
  return (
    <div className="bg-forest-950 min-h-screen">
      <Navbar />
      <Hero />
      <Tours />
      <Gallery />
      <About />
      <Location />
      <FAQ />
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
