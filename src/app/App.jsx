import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'
import { Gallery } from './components/Gallery'
import { About } from './components/About'
import { Location } from './components/Location'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { ToursPage } from './pages/ToursPage'

function HomePage() {
  return (
    <div className="bg-forest-950 min-h-screen">
      <Navbar />
      <Hero />
      <Tours />
      <Gallery />
      <About />
      <Location />
      <FAQ />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<ToursPage />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
