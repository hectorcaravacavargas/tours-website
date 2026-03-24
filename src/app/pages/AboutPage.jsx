import { useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { About } from '../components/About'
import { Footer } from '../components/Footer'

export function AboutPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <Navbar />
      <div
        className="bg-[#e8ebe5] min-h-screen"
        style={{ animation: 'fadeSlideUp 0.55s ease-out forwards', opacity: 0 }}
      >
        <div className="bg-forest-950 pt-32 pb-20" />
        <About />
        <Footer />
      </div>
    </>
  )
}
