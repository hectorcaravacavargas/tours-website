import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Lightbox } from '../components/gallery/Lightbox'
import {
  volcanArenalVista,
  grupoSenderoBosque,
  grupoCruceRioPiedras,
  cabalgataBosqueDosJinetes,
  caballoCruzandoRio,
  cruceRioCaballo,
  grupoCabalgataColinas,
  grupoJinetesRio,
  jineteCaballoBosque,
  jineteCruceRioPerfil,
  jineteSaludoBosque,
  tresJinetesOrillaRio,
  videoCabalgata,
  videoCabalgataPoster,
} from '../../assets'

/* Every tour photo. Order here = order in the lightbox. */
const PHOTOS = [
  { src: volcanArenalVista,         altKey: 'media.volcanArenalVista' },
  { src: grupoSenderoBosque,        altKey: 'media.grupoSenderoBosque' },
  { src: grupoCruceRioPiedras,      altKey: 'media.grupoCruceRioPiedras' },
  { src: caballoCruzandoRio,        altKey: 'media.caballoCruzandoRio' },
  { src: jineteCaballoBosque,       altKey: 'media.jineteCaballoBosque' },
  { src: jineteSaludoBosque,        altKey: 'media.jineteSaludoBosque' },
  { src: grupoJinetesRio,           altKey: 'media.grupoJinetesRio' },
  { src: tresJinetesOrillaRio,      altKey: 'media.tresJinetesOrillaRio' },
  { src: cabalgataBosqueDosJinetes, altKey: 'media.cabalgataBosqueDosJinetes' },
  { src: cruceRioCaballo,           altKey: 'media.cruceRioCaballo' },
  { src: grupoCabalgataColinas,     altKey: 'media.grupoCabalgataColinas' },
  { src: jineteCruceRioPerfil,      altKey: 'media.jineteCruceRioPerfil' },
]

/* Desktop rows (photo indexes; 'video' = the looping video tile).
   On mobile the rows dissolve (display: contents) into a 2-column grid. */
const ROWS = [
  [0, 1, 2, 3],
  ['video', 4, 5],
  [6, 7, 8],
  [9, 10, 11],
]

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Hovered tile grows, siblings shrink: flex-grow morph with a strong ease-in-out (on-screen movement) */
const tileCls = `group/tile relative block overflow-hidden rounded-2xl aspect-[4/3]
                 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]
                 md:aspect-auto md:h-full md:min-w-0 md:flex-1
                 md:transition-[flex-grow] md:duration-[450ms] md:ease-[cubic-bezier(0.77,0,0.175,1)]
                 motion-reduce:transition-none md:motion-reduce:transition-none
                 md:hover:grow-[2.6] md:focus-visible:grow-[2.6]`

function TileOverlay({ caption }) {
  return (
    <>
      {/* Dim the siblings while the row is hovered */}
      <span className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300
                       md:group-hover/row:opacity-25 md:group-hover/tile:opacity-0" />
      {/* Visual caption only — the image alt already names the tile */}
      <span aria-hidden="true" className="hidden md:block absolute inset-x-0 bottom-0 p-4 pt-10 text-left
                       bg-gradient-to-t from-black/60 to-transparent
                       opacity-0 translate-y-2 transition-[opacity,translate] duration-300 ease-out
                       group-hover/tile:opacity-100 group-hover/tile:translate-y-0 group-hover/tile:delay-150
                       motion-reduce:translate-y-0">
        <span className="text-white text-sm font-medium drop-shadow">{caption}</span>
      </span>
    </>
  )
}

export function GalleryPage() {
  const { t } = useTranslation()
  const [openIdx, setOpenIdx] = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      {/* Navbar and Lightbox stay outside the animated wrapper — position:fixed breaks inside transformed parents */}
      <Navbar />
      <div
        className="bg-[#e8ebe5] min-h-screen"
        style={{ animation: 'fadeSlideUp 0.55s ease-out forwards', opacity: 0 }}
      >
        <section className="bg-white pt-32 pb-24 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">

            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className="text-xs tracking-[0.18em] uppercase text-forest-600 font-medium
                               px-4 py-1.5 rounded-full border border-forest-200 bg-forest-50">
                {t('galleryPage.badge')}
              </span>
            </div>

            {/* Title */}
            <div className="text-center mb-14">
              <h1
                className="font-heading font-bold text-gray-900 leading-tight mb-4"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)' }}
              >
                {t('galleryPage.title')}
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
                {t('galleryPage.subtitle')}
              </p>
              <div className="mx-auto mt-6 w-14 h-0.5 bg-gray-200 rounded-full" />
            </div>

            {/* Rows */}
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4">
              {ROWS.map((row, r) => (
                <div key={r} className="group/row contents md:flex md:gap-4 md:h-[17rem] lg:h-80">
                  {row.map((idx) => {
                    if (idx === 'video') {
                      return (
                        <div key="video" className={`${tileCls} col-span-2`}>
                          <video
                            src={videoCabalgata}
                            poster={videoCabalgataPoster}
                            aria-label={t('media.videoCabalgata')}
                            className="w-full h-full object-cover"
                            autoPlay={!REDUCED_MOTION}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                          />
                          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full
                                           bg-black/45 backdrop-blur-sm px-2.5 py-1
                                           text-white text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-forest-300" />
                            {t('galleryPage.videoBadge')}
                          </span>
                          <TileOverlay caption={t('media.videoCabalgata')} />
                        </div>
                      )
                    }
                    const photo = PHOTOS[idx]
                    return (
                      <button
                        key={photo.src}
                        type="button"
                        onClick={() => setOpenIdx(idx)}
                        className={`${tileCls} cursor-zoom-in focus:outline-none focus-visible:ring-4 focus-visible:ring-forest-300`}
                      >
                        <img
                          src={photo.src}
                          alt={t(photo.altKey)}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <TileOverlay caption={t(photo.altKey)} />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

          </div>
        </section>
        <Footer />
      </div>

      {openIdx !== null && (
        <Lightbox
          items={PHOTOS}
          index={openIdx}
          onIndexChange={setOpenIdx}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </>
  )
}
