import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { videoCabalgata, videoCabalgataPoster } from '../../../assets'

/* Featured video first. The thumbnail row appears once there are 2+ entries. */
const VIDEOS = [
  { src: videoCabalgata, poster: videoCabalgataPoster, titleKey: 'media.videoCabalgata' },
]

function PlayIcon() {
  return (
    <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-forest-700 shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="7 4 20 12 7 20 7 4" />
      </svg>
    </span>
  )
}

export function VideoSection() {
  const { t } = useTranslation()
  const [active, setActive] = useState(0)
  const videoRef = useRef(null)
  const playOnChange = useRef(false)
  const video = VIDEOS[active]

  /* After a thumbnail click the big player swaps source and starts playing */
  useEffect(() => {
    if (!playOnChange.current) return
    videoRef.current?.play().catch(() => {}) // the browser may refuse autoplay; controls stay usable
  }, [active])

  const select = (i) => {
    playOnChange.current = true
    setActive(i)
  }

  return (
    <section className="bg-white pt-32 pb-20 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="text-xs tracking-[0.18em] uppercase text-forest-600 font-medium
                           px-4 py-1.5 rounded-full border border-forest-200 bg-forest-50">
            {t('toursPage.badge')}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-14">
          <h1
            className="font-heading font-bold text-gray-900 leading-tight mb-4"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)' }}
          >
            {t('toursPage.videoTitle')}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            {t('toursPage.videoSubtitle')}
          </p>
          <div className="mx-auto mt-6 w-14 h-0.5 bg-gray-200 rounded-full" />
        </div>

        {/* Featured 16:9 player */}
        <div
          className="relative w-full rounded-[1.75rem] overflow-hidden
                     shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)]
                     ring-1 ring-black/6"
          style={{ paddingBottom: '56.25%' }}
        >
          <video
            key={video.src}
            ref={videoRef}
            src={video.src}
            poster={video.poster}
            title={t(video.titleKey)}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
        </div>

        {/* Thumbnails — click to play in the featured player */}
        {VIDEOS.length > 1 && (
          <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {VIDEOS.map((v, i) => (
              <li key={v.src}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-label={t('toursPage.playVideo', { title: t(v.titleKey) })}
                  aria-current={i === active}
                  className={`group relative block w-full aspect-video rounded-xl overflow-hidden cursor-pointer
                              ring-2 ring-offset-2 transition-all duration-200
                              ${i === active ? 'ring-forest-500' : 'ring-transparent hover:ring-forest-300'}`}
                >
                  <img src={v.poster} alt="" loading="lazy" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25
                                   group-hover:bg-black/10 transition-colors duration-200">
                    <PlayIcon />
                  </span>
                </button>
                <p className="mt-2 text-sm text-gray-600 truncate">{t(v.titleKey)}</p>
              </li>
            ))}
          </ul>
        )}

      </div>
    </section>
  )
}
