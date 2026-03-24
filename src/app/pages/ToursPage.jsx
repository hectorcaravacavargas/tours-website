import { useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { VideoSection } from '../components/tours/VideoSection'
import { SpiralTimeline } from '../components/tours/SpiralTimeline'
import { WhatToBringSection } from '../components/tours/WhatToBringSection'

export function ToursPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      {/* Navbar outside the animated wrapper — position:fixed breaks inside transformed parents */}
      <Navbar />
      <div
        className="bg-[#e8ebe5] min-h-screen"
        style={{ animation: 'fadeSlideUp 0.55s ease-out forwards', opacity: 0 }}
      >
        <VideoSection />
        <SpiralTimeline />
        <WhatToBringSection />
        <Footer />
      </div>
    </>
  )
}
