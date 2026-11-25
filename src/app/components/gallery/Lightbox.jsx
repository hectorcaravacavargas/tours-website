import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

function ChevronIcon({ dir }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )
}

const navBtnCls = `w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center
                   bg-black/45 md:bg-white/10 hover:bg-white/25 border border-white/15 text-white
                   backdrop-blur-sm transition-colors duration-200 cursor-pointer
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-300`

/*
 * Full-screen photo viewer. items: [{ src, altKey }]
 * index is controlled by the parent; onIndexChange accepts a state updater.
 */
export function Lightbox({ items, index, onIndexChange, onClose }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const swipe = useRef(null) // { x, y } where the current touch started
  const swiped = useRef(false) // a swipe that ends on the backdrop must not also count as a tap
  const item = items[index]
  const total = items.length

  /* Scroll lock + initial focus; focus returns to the opener on close */
  useEffect(() => {
    const opener = document.activeElement
    const prevOverflow = document.body.style.overflow
    const prevOverscroll = document.documentElement.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none' // no pull-to-refresh behind the viewer
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      document.documentElement.style.overscrollBehavior = prevOverscroll
      opener?.focus?.()
    }
  }, [])

  /* Keyboard: Esc closes, arrows navigate, Tab stays inside the dialog */
  useEffect(() => {
    const go = (delta) => onIndexChange(i => (i + delta + total) % total)
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key === 'ArrowLeft') return go(-1)
      if (e.key === 'ArrowRight') return go(1)
      if (e.key === 'Tab') {
        const nodes = dialogRef.current.querySelectorAll('button')
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onIndexChange, total])

  const go = (delta) => onIndexChange(i => (i + delta + total) % total)

  /* Touch: swipe left/right for next/previous, swipe down to close */
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' || !e.isPrimary) return
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    const start = swipe.current
    swipe.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { swiped.current = true; go(dx < 0 ? 1 : -1) }
    else if (dy > 80 && dy > Math.abs(dx)) { swiped.current = true; onClose() }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('galleryPage.dialogLabel')}
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ touchAction: 'pinch-zoom' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { swipe.current = null }}
    >
      {/* Backdrop — tap to close */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={() => { if (swiped.current) swiped.current = false; else onClose() }}
        aria-hidden="true"
      />

      {/* Media */}
      <figure className="relative w-full flex flex-col items-center px-0 md:px-24 pointer-events-none">
        <img
          key={item.src}
          src={item.src}
          alt={t(item.altKey)}
          className="max-w-full max-h-[80svh] object-contain md:rounded-xl shadow-2xl pointer-events-auto select-none"
          draggable={false}
        />
        <figcaption className="mt-4 px-4 text-white/80 text-sm text-center" aria-live="polite">
          {t(item.altKey)}
          <span className="text-white/45"> · {index + 1} / {total}</span>
        </figcaption>
      </figure>

      {/* Controls */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t('galleryPage.close')}
        className={`absolute top-4 right-4 ${navBtnCls}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t('galleryPage.prev')}
            className={`absolute left-2 md:left-6 top-1/2 -translate-y-1/2 ${navBtnCls}`}
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t('galleryPage.next')}
            className={`absolute right-2 md:right-6 top-1/2 -translate-y-1/2 ${navBtnCls}`}
          >
            <ChevronIcon dir="right" />
          </button>
        </>
      )}
    </div>
  )
}
