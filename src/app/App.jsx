import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'
import { Gallery } from './components/Gallery'
import { Location } from './components/Location'
import { FAQ } from './components/FAQ'
import { Footer, WhatsAppButton } from './components/Footer'
import { MobileBookingBar } from './components/MobileBookingBar'
import { ToursPage } from './pages/ToursPage'
import { GalleryPage } from './pages/GalleryPage'
import { ContactPage } from './pages/ContactPage'

function HomePage() {
  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (!id) return
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  return (
    <div className="bg-forest-950 min-h-screen">
      <Navbar />
      <Hero />
      <Tours />
      <Gallery />
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
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          {/* Old links (e.g. the removed /nosotros page) land on home instead of a blank page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <WhatsAppButton />
        <MobileBookingBar />
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
