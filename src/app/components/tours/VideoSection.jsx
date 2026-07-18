import { useTranslation } from 'react-i18next'

import { videoCabalgata as tourVideo, videoCabalgataPoster as tourVideoPoster } from '../../../assets'

export function VideoSection() {
  const { t } = useTranslation()

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

        {/* 16:9 video embed */}
        <div
          className="relative w-full rounded-[1.75rem] overflow-hidden
                     shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)]
                     ring-1 ring-black/6"
          style={{ paddingBottom: '56.25%' }}
        >
          <video
            src={tourVideo}
            poster={tourVideoPoster}
            title={t('toursPage.videoTitle')}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
        </div>

      </div>
    </section>
  )
}
