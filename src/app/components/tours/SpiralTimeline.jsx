import { useTranslation } from 'react-i18next'
import { heroPlaceholder as img } from '../../../assets'

/* ── Tour stops — replace src with real photos when available ──── */
const STOPS = [
  { src: img, titleKey: 'toursPage.stop1Title', descKey: 'toursPage.stop1Desc', num: '01' },
  { src: img, titleKey: 'toursPage.stop2Title', descKey: 'toursPage.stop2Desc', num: '02' },
  { src: img, titleKey: 'toursPage.stop3Title', descKey: 'toursPage.stop3Desc', num: '03' },
  { src: img, titleKey: 'toursPage.stop4Title', descKey: 'toursPage.stop4Desc', num: '04' },
  { src: img, titleKey: 'toursPage.stop5Title', descKey: 'toursPage.stop5Desc', num: '05' },
]

/*
 * ── Connector ──────────────────────────────────────────────────
 *
 * Desktop: S-curve aligned to column centers.
 *   In a 2-col grid the image centers sit at roughly x=25% and x=75%.
 *   Using viewBox 0 0 1000 120 → left center ≈ 250, right center ≈ 750.
 *
 *   imageLeft (after stop 0,2,4): bottom of LEFT image → top of RIGHT image
 *     path goes 250 → 750 (left to right)
 *   imageRight (after stop 1,3): bottom of RIGHT image → top of LEFT image
 *     path goes 750 → 250 (right to left)
 *
 * Mobile: diagonal S-curve zigzag across the full width.
 *   imageLeft → curve drifts right then back (top-left → bottom-right feel)
 *   imageRight → curve drifts left then back
 *
 * Negative vertical margin (-16px each side) makes the line visually
 * "exit" the bottom of one card and "enter" the top of the next.
 */
function Connector({ imageLeft }) {

  /* Desktop paths */
  const dDesk = imageLeft
    ? 'M 250 0 C 250 60, 750 60, 750 120'   /* left  → right */
    : 'M 750 0 C 750 60, 250 60, 250 120'   /* right → left  */

  /* Mobile paths — full-width gentle S zigzag */
  const dMob = imageLeft
    ? 'M 35 0 C 20 30, 80 30, 65 60'        /* top-left → bottom-right */
    : 'M 65 0 C 80 30, 20 30, 35 60'        /* top-right → bottom-left */

  return (
    <div>

      {/* ── Desktop S-curve ── */}
      <div className="hidden lg:block px-0">
        <svg
          viewBox="0 0 1000 120"
          className="w-full h-20"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d={dDesk}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="12 8"
          />
        </svg>
      </div>

      {/* ── Mobile zigzag ── */}
      <div className="flex justify-center lg:hidden py-2">
        <svg
          viewBox="0 0 100 60"
          className="w-40 h-16"
          fill="none"
        >
          <path
            d={dMob}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="8 5"
          />
        </svg>
      </div>

    </div>
  )
}

/* ── Single timeline stop ──────────────────────────────────────── */
function Stop({ stop, idx }) {
  const { t } = useTranslation()

  /*
   * imageLeft: idx 0,2,4 → image on left (desktop), always on top (mobile)
   * imageRight: idx 1,3  → image on right (desktop), always on top (mobile)
   */
  const imageLeft = idx % 2 === 0

  const imgBlock = (
    <div className="rounded-[1.75rem] overflow-hidden shadow-[0_10px_40px_-8px_rgba(0,0,0,0.14)]">
      <img
        src={stop.src}
        alt={t(stop.titleKey)}
        className="w-full h-64 lg:h-[26rem] object-cover
                   transition-transform duration-300 ease-out hover:scale-[1.04]"
      />
    </div>
  )

  const textBlock = (
    <div className="flex flex-col justify-center gap-4 py-2 lg:px-6">
      {/* Ghost number */}
      <span
        className="font-heading font-bold leading-none select-none -mb-2"
        style={{
          fontSize: 'clamp(4.5rem, 9vw, 6.5rem)',
          color: 'rgba(0,0,0,0.04)',
        }}
      >
        {stop.num}
      </span>

      {/* Stop label */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-px bg-forest-500/50 rounded-full" />
        <span className="text-forest-600/70 text-xs tracking-[0.18em] uppercase font-medium">
          Stop {stop.num}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-heading font-bold text-gray-900 leading-tight"
        style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}
      >
        {t(stop.titleKey)}
      </h3>

      {/* Description */}
      <p className="text-gray-500 leading-relaxed text-base md:text-[1.05rem]">
        {t(stop.descKey)}
      </p>

      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-forest-400/50"
            style={{ opacity: 1 - i * 0.28 }}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      {/*
       * Mobile:  image always order-1 (top), text always order-2 (below)
       * Desktop: imageLeft  → img left  (order-1), text right (order-2)
       *          imageRight → img right (lg:order-2), text left (lg:order-1)
       */}
      <div className={imageLeft ? 'order-1' : 'order-1 lg:order-2'}>
        {imgBlock}
      </div>
      <div className={imageLeft ? 'order-2' : 'order-2 lg:order-1'}>
        {textBlock}
      </div>
    </div>
  )
}

/* ── Main timeline component ───────────────────────────────────── */
export function SpiralTimeline() {
  const { t } = useTranslation()

  return (
    <section className="bg-white relative z-20 shadow-[0_14px_32px_-4px_rgba(0,0,0,0.10)] pb-20 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="font-heading font-bold text-gray-900 leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
          >
            {t('toursPage.timelineTitle')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            {t('toursPage.timelineSubtitle')}
          </p>
          <div className="mx-auto mt-6 w-14 h-0.5 bg-gray-200 rounded-full" />
        </div>

        {/* Stops + connectors
            Each stop shares a z-10 stacking context with its own connector.
            Because later DOM siblings with equal z-index paint on top,
            stop N+1 always covers stop N's connector — images stay above lines. */}
        {STOPS.map((stop, i) => (
          <div key={stop.num} className="relative z-10">
            <Stop stop={stop} idx={i} />
            {i < STOPS.length - 1 && (
              /*
               * z-index: -1 within the stop's stacking context (z-10) makes the
               * connector paint BEHIND the current stop's image (z=auto = 0).
               * The stop wrapper is transparent, so the line stays visible against
               * the white section background. The next stop (later in DOM, same z-10)
               * also paints above this connector.
               */
              <div style={{ position: 'relative', zIndex: -1 }}>
                <Connector imageLeft={i % 2 === 0} />
              </div>
            )}
          </div>
        ))}

      </div>
    </section>
  )
}
